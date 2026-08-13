"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/require-owner";
import { nextOrder } from "./builder";

const nameSchema = z.string().trim().min(1).max(80);

export async function createRoutine(formData: FormData) {
  await requireOwner();
  const name = nameSchema.parse(formData.get("name"));
  const routine = await db.routine.create({ data: { name } });
  revalidatePath("/more/routines");
  redirect(`/more/routines/${routine.id}`);
}

export async function setActiveRoutine(formData: FormData) {
  await requireOwner();
  const id = z.string().min(1).parse(formData.get("id"));
  await db.$transaction([
    db.routine.updateMany({ data: { isActive: false } }),
    db.routine.update({ where: { id }, data: { isActive: true } }),
  ]);
  revalidatePath("/more/routines");
  revalidatePath("/");
}

export async function deleteRoutine(formData: FormData) {
  await requireOwner();
  const id = z.string().min(1).parse(formData.get("id"));
  await db.routine.delete({ where: { id } });
  revalidatePath("/more/routines");
  revalidatePath("/");
}

const daySchema = z.object({
  routineId: z.string().min(1),
  weekday: z.coerce.number().int().min(0).max(6),
  name: z.string().trim().min(1).max(60),
  dayType: z.enum(["STRENGTH", "CARDIO", "REST"]),
});

export async function addRoutineDay(formData: FormData) {
  await requireOwner();
  const d = daySchema.parse(Object.fromEntries(formData));
  await db.routineDay.create({ data: d });
  revalidatePath(`/more/routines/${d.routineId}`);
}

export async function deleteRoutineDay(formData: FormData) {
  await requireOwner();
  const id = z.string().min(1).parse(formData.get("id"));
  const day = await db.routineDay.delete({ where: { id } });
  revalidatePath(`/more/routines/${day.routineId}`);
}

const addExSchema = z.object({
  routineId: z.string().min(1),
  routineDayId: z.string().min(1),
  exerciseId: z.string().min(1),
  targetSets: z.coerce.number().int().min(1).max(20),
  targetReps: z.string().trim().min(1).max(20),
  restSeconds: z.coerce.number().int().min(0).max(600),
});

export async function addExerciseToDay(formData: FormData) {
  await requireOwner();
  const d = addExSchema.parse(Object.fromEntries(formData));
  const existing = await db.routineExercise.findMany({
    where: { routineDayId: d.routineDayId },
    select: { order: true, exerciseId: true },
  });
  // Chặn trùng bài trong cùng một ngày giáo án (SetLogger key theo exerciseId nên
  // trùng sẽ đè set của nhau, mất dữ liệu âm thầm) — im lặng bỏ qua, redirect như thành công.
  const isDuplicate = existing.some((e) => e.exerciseId === d.exerciseId);
  if (!isDuplicate) {
    await db.routineExercise.create({
      data: {
        routineDayId: d.routineDayId, exerciseId: d.exerciseId, targetSets: d.targetSets,
        targetReps: d.targetReps, restSeconds: d.restSeconds,
        order: nextOrder(existing.map((e) => e.order)),
      },
    });
  }
  revalidatePath(`/more/routines/${d.routineId}`);
  redirect(`/more/routines/${d.routineId}`);
}

export async function removeRoutineExercise(formData: FormData) {
  await requireOwner();
  const id = z.string().min(1).parse(formData.get("id"));
  const re = await db.routineExercise.delete({ where: { id }, include: { routineDay: true } });
  revalidatePath(`/more/routines/${re.routineDay.routineId}`);
}

export async function moveRoutineExercise(formData: FormData) {
  await requireOwner();
  const id = z.string().min(1).parse(formData.get("id"));
  const dir = z.enum(["up", "down"]).parse(formData.get("dir"));
  const re = await db.routineExercise.findUniqueOrThrow({ where: { id }, include: { routineDay: true } });
  const neighbor = await db.routineExercise.findFirst({
    where: { routineDayId: re.routineDayId, order: dir === "up" ? { lt: re.order } : { gt: re.order } },
    orderBy: { order: dir === "up" ? "desc" : "asc" },
  });
  if (neighbor) {
    await db.$transaction([
      db.routineExercise.update({ where: { id: re.id }, data: { order: neighbor.order } }),
      db.routineExercise.update({ where: { id: neighbor.id }, data: { order: re.order } }),
    ]);
  }
  revalidatePath(`/more/routines/${re.routineDay.routineId}`);
}

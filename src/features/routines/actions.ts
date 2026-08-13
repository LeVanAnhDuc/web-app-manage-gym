"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

const nameSchema = z.string().trim().min(1).max(80);

export async function createRoutine(formData: FormData) {
  const name = nameSchema.parse(formData.get("name"));
  const routine = await db.routine.create({ data: { name } });
  revalidatePath("/more/routines");
  redirect(`/more/routines/${routine.id}`);
}

export async function setActiveRoutine(formData: FormData) {
  const id = z.string().min(1).parse(formData.get("id"));
  await db.$transaction([
    db.routine.updateMany({ data: { isActive: false } }),
    db.routine.update({ where: { id }, data: { isActive: true } }),
  ]);
  revalidatePath("/more/routines");
  revalidatePath("/");
}

export async function deleteRoutine(formData: FormData) {
  const id = z.string().min(1).parse(formData.get("id"));
  await db.routine.delete({ where: { id } });
  revalidatePath("/more/routines");
  revalidatePath("/");
}

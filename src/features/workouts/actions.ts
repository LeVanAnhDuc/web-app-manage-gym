"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/require-owner";
import { isNewPR } from "./logic";
import { getHistoryMaxKg } from "./queries";

export async function startWorkout(formData: FormData) {
  await requireOwner();
  const routineDayId = z.string().min(1).nullable().parse(formData.get("routineDayId") || null);
  const session = await db.workoutSession.create({ data: { routineDayId } });
  redirect(`/workouts/${session.id}`);
}

const saveSetSchema = z.object({
  sessionId: z.string().min(1),
  exerciseId: z.string().min(1),
  setNumber: z.number().int().min(1).max(50),
  type: z.enum(["WARMUP", "NORMAL", "FAILURE"]),
  weightKg: z.number().min(0).max(1000).nullable(),
  reps: z.number().int().min(0).max(200).nullable(),
});
export type SaveSetInput = z.infer<typeof saveSetSchema>;

export async function saveSet(input: SaveSetInput): Promise<{ isPR: boolean }> {
  await requireOwner();
  const d = saveSetSchema.parse(input);
  const historyMax = await getHistoryMaxKg(d.exerciseId);
  await db.workoutSet.upsert({
    where: { sessionId_exerciseId_setNumber: { sessionId: d.sessionId, exerciseId: d.exerciseId, setNumber: d.setNumber } },
    update: { type: d.type, weightKg: d.weightKg, reps: d.reps, completedAt: new Date() },
    create: { ...d, completedAt: new Date() },
  });
  const pr = d.type !== "WARMUP" && d.weightKg != null && d.reps != null && isNewPR(d.weightKg, d.reps, historyMax);
  return { isPR: pr };
}

export async function finishWorkout(formData: FormData) {
  await requireOwner();
  const id = z.string().min(1).parse(formData.get("sessionId"));
  await db.workoutSession.update({ where: { id }, data: { status: "COMPLETED" } });
  revalidatePath("/");
  revalidatePath("/calendar");
  redirect(`/workouts/${id}`);
}

// Thêm bài ngoài kế hoạch giữa buổi tập: tạo set giữ chỗ (completedAt=null,
// totalVolumeKg bỏ qua) để bài xuất hiện trong SetLogger; tick set 1 sẽ upsert đè lên.
export async function addExerciseToSession(formData: FormData) {
  await requireOwner();
  const sessionId = z.string().min(1).parse(formData.get("sessionId"));
  const exerciseId = z.string().min(1).parse(formData.get("exerciseId"));
  await db.workoutSet.upsert({
    where: { sessionId_exerciseId_setNumber: { sessionId, exerciseId, setNumber: 1 } },
    update: {},
    create: { sessionId, exerciseId, setNumber: 1, weightKg: null, reps: null, completedAt: null },
  });
  revalidatePath(`/workouts/${sessionId}`);
  redirect(`/workouts/${sessionId}`);
}

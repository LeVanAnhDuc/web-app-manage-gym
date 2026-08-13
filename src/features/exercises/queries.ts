import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export function buildExerciseWhere(q?: string, muscle?: string, equipment?: string) {
  const where: Prisma.ExerciseWhereInput = {};
  if (q) where.name = { contains: q, mode: "insensitive" };
  if (muscle) where.primaryMuscles = { has: muscle };
  if (equipment) where.equipment = equipment;
  return where;
}

export async function searchExercises(q?: string, muscle?: string, equipment?: string) {
  return db.exercise.findMany({
    where: buildExerciseWhere(q, muscle, equipment),
    orderBy: { name: "asc" },
    take: 50,
  });
}

export const MUSCLE_LABELS: Record<string, string> = {
  chest: "Ngực", lats: "Xô", "middle back": "Lưng giữa", "lower back": "Lưng dưới",
  traps: "Cầu vai", shoulders: "Vai", biceps: "Tay trước", triceps: "Tay sau",
  forearms: "Cẳng tay", abdominals: "Bụng", quadriceps: "Đùi trước",
  hamstrings: "Đùi sau", glutes: "Mông", calves: "Bắp chân", adductors: "Khép háng",
  abductors: "Dạng háng", neck: "Cổ",
};
export const EQUIPMENT_OPTIONS = ["barbell", "dumbbell", "cable", "machine", "body only", "kettlebells", "bands"];
export function muscleLabel(m: string) { return MUSCLE_LABELS[m] ?? m; }

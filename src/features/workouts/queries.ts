import { db } from "@/lib/db";

export async function getSessionDetail(id: string) {
  return db.workoutSession.findUnique({
    where: { id },
    include: {
      sets: { orderBy: { setNumber: "asc" }, include: { exercise: true } },
      routineDay: { include: { exercises: { orderBy: { order: "asc" }, include: { exercise: true } } } },
    },
  });
}

export async function getPrevSets(exerciseId: string, excludeSessionId: string) {
  const last = await db.workoutSession.findFirst({
    where: { status: "COMPLETED", id: { not: excludeSessionId }, sets: { some: { exerciseId } } },
    orderBy: { date: "desc" },
    include: { sets: { where: { exerciseId }, orderBy: { setNumber: "asc" } } },
  });
  return last?.sets ?? [];
}

export async function getHistoryMaxKg(exerciseId: string) {
  const agg = await db.workoutSet.aggregate({
    where: { exerciseId, type: { not: "WARMUP" }, reps: { gte: 1 }, session: { status: "COMPLETED" } },
    _max: { weightKg: true },
  });
  return agg._max.weightKg;
}

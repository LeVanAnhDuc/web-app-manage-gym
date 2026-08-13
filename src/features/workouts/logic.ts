import type { SetType } from "@prisma/client";

export type LoggedSet = { type: SetType; weightKg: number | null; reps: number | null; completedAt: Date | null };

export function totalVolumeKg(sets: LoggedSet[]): number {
  return sets
    .filter((s) => s.completedAt && s.type !== "WARMUP" && s.weightKg != null && s.reps != null)
    .reduce((sum, s) => sum + (s.weightKg as number) * (s.reps as number), 0);
}

export function isNewPR(weightKg: number, reps: number, historyMaxKg: number | null): boolean {
  if (reps < 1) return false;
  return historyMaxKg == null ? weightKg > 0 : weightKg > historyMaxKg;
}

export type RawExercise = {
  id: string;
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string | null;
  level: string | null;
  instructions: string[];
  images: string[];
};

const IMAGE_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

export function toExerciseData(raw: RawExercise) {
  return {
    name: raw.name,
    primaryMuscles: raw.primaryMuscles ?? [],
    secondaryMuscles: raw.secondaryMuscles ?? [],
    equipment: raw.equipment ?? null,
    level: raw.level ?? null,
    instructions: raw.instructions ?? [],
    images: (raw.images ?? []).map((p) => IMAGE_BASE + p),
    isCustom: false,
  };
}

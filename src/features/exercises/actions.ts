import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export const createExerciseSchema = z.object({
  name: z.string().trim().min(1, "Tên bài tập không được để trống"),
  primaryMuscle: z.string().trim().min(1, "Chọn nhóm cơ chính"),
  equipment: z.string().trim(),
  instructions: z.string().trim(),
});

export async function createExercise(formData: FormData) {
  "use server";
  const parsed = createExerciseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`/exercises/new?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  const { name, primaryMuscle, equipment, instructions } = parsed.data;
  const ex = await db.exercise.create({
    data: {
      name,
      primaryMuscles: [primaryMuscle],
      equipment: equipment || null,
      instructions: instructions ? instructions.split("\n").filter(Boolean) : [],
      isCustom: true,
    },
  });
  revalidatePath("/exercises");
  redirect(`/exercises/${ex.id}`);
}

"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

const planSchema = z.object({
  id: z.string().min(1),
  targetCalories: z.coerce.number().int().min(0).max(10000),
  proteinG: z.coerce.number().int().min(0).max(1000),
  carbsG: z.coerce.number().int().min(0).max(2000),
  fatG: z.coerce.number().int().min(0).max(500),
});

export async function updateMealPlan(formData: FormData) {
  const { id, ...data } = planSchema.parse(Object.fromEntries(formData));
  await db.mealPlan.update({ where: { id }, data });
  revalidatePath("/nutrition");
  revalidatePath("/");
}

const mealSchema = z.object({
  mealPlanId: z.string().min(1),
  name: z.string().trim().min(1).max(60),
  description: z.string().trim().min(1).max(300),
  calories: z.coerce.number().int().min(0).max(5000).optional(),
});

export async function addMeal(formData: FormData) {
  const d = mealSchema.parse(Object.fromEntries(formData));
  const count = await db.meal.count({ where: { mealPlanId: d.mealPlanId } });
  await db.meal.create({ data: { ...d, calories: d.calories ?? null, order: count + 1 } });
  revalidatePath("/nutrition");
  revalidatePath("/");
}

export async function deleteMeal(formData: FormData) {
  const id = z.string().min(1).parse(formData.get("id"));
  await db.meal.delete({ where: { id } });
  revalidatePath("/nutrition");
  revalidatePath("/");
}

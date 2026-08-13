import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { toExerciseData, type RawExercise } from "../src/features/exercises/parse";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DATA_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";

async function main() {
  const count = await prisma.exercise.count({ where: { isCustom: false } });
  if (count === 0) {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`Tải exercises.json thất bại: HTTP ${res.status}`);
    const raw: RawExercise[] = await res.json();
    await prisma.exercise.createMany({ data: raw.map(toExerciseData) });
    console.log(`Đã seed ${raw.length} bài tập.`);
  } else {
    console.log(`Đã có ${count} bài tập — bỏ qua.`);
  }
  const defaults = [
    { dayType: "STRENGTH", targetCalories: 2800, proteinG: 180, carbsG: 320, fatG: 80 },
    { dayType: "CARDIO", targetCalories: 2300, proteinG: 170, carbsG: 220, fatG: 70 },
    { dayType: "REST", targetCalories: 2100, proteinG: 170, carbsG: 180, fatG: 70 },
  ] as const;
  for (const d of defaults) {
    await prisma.mealPlan.upsert({ where: { dayType: d.dayType }, update: {}, create: d });
  }
  console.log("Meal plan mặc định sẵn sàng.");
}

main().finally(() => prisma.$disconnect());

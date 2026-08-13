import { db } from "@/lib/db";
import { weekdayInTz } from "@/lib/date";
import type { DayType } from "@prisma/client";

export async function getTodayContext(now = new Date()) {
  const weekday = weekdayInTz(now);
  const routine = await db.routine.findFirst({
    where: { isActive: true },
    include: {
      days: {
        where: { weekday },
        include: { exercises: { orderBy: { order: "asc" }, include: { exercise: true } } },
      },
    },
  });
  const day = routine?.days[0] ?? null;
  const dayType: DayType = day?.dayType ?? "REST";
  const mealPlan = await db.mealPlan.findUnique({
    where: { dayType },
    include: { meals: { orderBy: { order: "asc" } } },
  });
  return { routine, day, dayType, mealPlan };
}

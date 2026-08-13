import Link from "next/link";
import { db } from "@/lib/db";
import { weekDates } from "@/lib/week";
import { weekdayInTz } from "@/lib/date";
import { WEEKDAY_LABELS, DAY_TYPE_LABELS } from "@/features/routines/builder";

const DOT = { STRENGTH: "bg-brand", CARDIO: "bg-cardio", REST: "bg-line" } as const;

export default async function CalendarPage() {
  const now = new Date();
  const days = weekDates(now);
  const routine = await db.routine.findFirst({ where: { isActive: true }, include: { days: true } });
  const sessions = await db.workoutSession.findMany({
    where: { date: { gte: days[0], lt: new Date(days[6].getTime() + 86_400_000) } },
    orderBy: { date: "asc" },
  });
  const todayWd = weekdayInTz(now);
  return (
    <main className="p-5">
      <h1 className="font-display text-3xl font-bold uppercase">Lịch tuần</h1>
      <ul className="mt-4 space-y-2.5">
        {days.map((d) => {
          const wd = d.getUTCDay();
          const plan = routine?.days.find((rd) => rd.weekday === wd);
          const dayType = plan?.dayType ?? "REST";
          const session = sessions.find((s) => weekdayInTz(s.date) === wd && s.status === "COMPLETED");
          const isToday = wd === todayWd;
          return (
            <li key={d.toISOString()}
              className={`flex items-center gap-3 rounded-xl border bg-panel p-3.5 ${isToday ? "border-brand" : "border-line"}`}>
              <span className={`size-3 shrink-0 rounded-full ${DOT[dayType]}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {WEEKDAY_LABELS[wd]} <span className="font-normal text-muted">· {d.getUTCDate()}/{d.getUTCMonth() + 1}</span>
                </p>
                <p className="text-xs text-muted">{plan ? `${plan.name} · ${DAY_TYPE_LABELS[dayType]}` : "Nghỉ"}</p>
              </div>
              {session ? (
                <Link href={`/workouts/${session.id}`} className="rounded-lg bg-ok px-2.5 py-1.5 text-xs font-bold text-white">✓ Xem lại</Link>
              ) : (
                isToday && plan && <span className="text-xs font-semibold text-brand">Hôm nay</span>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}

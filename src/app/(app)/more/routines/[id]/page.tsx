import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { addRoutineDay, deleteRoutineDay, removeRoutineExercise, moveRoutineExercise } from "@/features/routines/actions";
import { WEEKDAY_LABELS, DAY_TYPE_LABELS } from "@/features/routines/builder";

const DAY_COLOR = { STRENGTH: "bg-brand", CARDIO: "bg-cardio", REST: "bg-line" } as const;

export default async function RoutineBuilder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const routine = await db.routine.findUnique({
    where: { id },
    include: { days: { orderBy: { weekday: "asc" }, include: { exercises: { orderBy: { order: "asc" }, include: { exercise: true } } } } },
  });
  if (!routine) notFound();
  const input = "rounded-xl border border-line bg-panel px-3 py-2.5 text-sm";
  return (
    <main className="p-5">
      <h1 className="font-display text-3xl font-bold uppercase">{routine.name}</h1>
      <div className="mt-4 space-y-4">
        {routine.days.map((day) => (
          <section key={day.id} className="overflow-hidden rounded-xl border border-line bg-panel">
            <header className="flex items-center gap-2 border-b border-line p-3">
              <span className={`size-3 rounded-full ${DAY_COLOR[day.dayType]}`} />
              <p className="flex-1 text-sm font-semibold">
                {WEEKDAY_LABELS[day.weekday]} — {day.name}
                <span className="ml-1 text-xs font-normal text-muted">({DAY_TYPE_LABELS[day.dayType]})</span>
              </p>
              <form action={deleteRoutineDay}>
                <input type="hidden" name="id" value={day.id} />
                <button className="text-xs font-semibold text-brand">Xóa ngày</button>
              </form>
            </header>
            <ul className="divide-y divide-line px-3">
              {day.exercises.map((re) => (
                <li key={re.id} className="flex items-center gap-2 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{re.exercise.name}</p>
                    <p className="text-xs text-muted">{re.targetSets}×{re.targetReps} · nghỉ {re.restSeconds}s</p>
                  </div>
                  <form action={moveRoutineExercise}><input type="hidden" name="id" value={re.id} /><input type="hidden" name="dir" value="up" /><button className="px-1.5 text-muted">↑</button></form>
                  <form action={moveRoutineExercise}><input type="hidden" name="id" value={re.id} /><input type="hidden" name="dir" value="down" /><button className="px-1.5 text-muted">↓</button></form>
                  <form action={removeRoutineExercise}><input type="hidden" name="id" value={re.id} /><button className="px-1.5 text-brand">✕</button></form>
                </li>
              ))}
            </ul>
            <Link href={`/more/routines/${routine.id}/add/${day.id}`}
              className="block border-t border-line p-3 text-center text-xs font-semibold text-muted">+ Thêm bài tập</Link>
          </section>
        ))}
      </div>
      <form action={addRoutineDay} className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-dashed border-line p-3">
        <input type="hidden" name="routineId" value={routine.id} />
        <select name="weekday" className={input} defaultValue="1">
          {WEEKDAY_LABELS.map((l, i) => <option key={i} value={i}>{l}</option>)}
        </select>
        <select name="dayType" className={input} defaultValue="STRENGTH">
          {Object.entries(DAY_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input name="name" required placeholder="Tên ngày (vd. Push A)" className={`${input} col-span-2`} />
        <button className="col-span-2 rounded-xl bg-brand py-2.5 font-display font-bold uppercase text-white">Thêm ngày</button>
      </form>
    </main>
  );
}

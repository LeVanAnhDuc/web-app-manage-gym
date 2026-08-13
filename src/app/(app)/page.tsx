import { getTodayContext } from "@/features/dashboard/queries";
import { formatDateVi } from "@/lib/date";
import { DAY_TYPE_LABELS } from "@/features/routines/builder";
import { startWorkout } from "@/features/workouts/actions";
import Link from "next/link";

const BANNER = {
  STRENGTH: { rail: "bg-brand", plate: "bg-brand" },
  CARDIO: { rail: "bg-cardio", plate: "bg-cardio" },
  REST: { rail: "bg-line", plate: "bg-panel2" },
} as const;

export default async function TodayPage() {
  const { routine, day, dayType, mealPlan } = await getTodayContext();
  const b = BANNER[dayType];
  return (
    <main className="p-5">
      <p className="text-xs font-medium text-muted">{formatDateVi(new Date())}</p>
      <h1 className="font-display text-3xl font-bold uppercase">Hôm nay</h1>

      <div className="relative mt-4 flex items-center gap-3.5 overflow-hidden rounded-xl border border-line bg-panel p-4 pl-5">
        <span className={`absolute inset-y-0 left-0 w-1.5 ${b.rail}`} />
        <span className={`grid size-11 place-items-center rounded-full border-2 border-line ${b.plate}`}>
          <span className="size-3 rounded-full bg-bg" />
        </span>
        <div>
          <p className="font-display text-xl font-bold uppercase">{day ? `${day.name}` : "Ngày nghỉ"}</p>
          <p className="text-xs text-muted">
            {DAY_TYPE_LABELS[dayType]}{routine ? ` · ${routine.name}` : " · Chưa có giáo án active"}
          </p>
        </div>
      </div>

      {day && day.exercises.length > 0 && (
        <section className="mt-4 rounded-xl border border-line bg-panel p-4">
          <h2 className="flex justify-between font-display text-sm font-semibold uppercase tracking-widest text-muted">
            Buổi tập <span className="font-sans text-[11px] font-normal normal-case">{day.exercises.length} bài</span>
          </h2>
          <ul className="divide-y divide-line">
            {day.exercises.map((re) => (
              <li key={re.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-semibold">{re.exercise.name}</p>
                  <p className="text-[11px] text-muted">{re.exercise.primaryMuscles.join(", ")}</p>
                </div>
                <span className="font-display text-lg font-semibold">{re.targetSets}×{re.targetReps}</span>
              </li>
            ))}
          </ul>
          <form action={startWorkout}>
            <input type="hidden" name="routineDayId" value={day.id} />
            <button className="mt-3 w-full rounded-xl bg-brand py-3.5 font-display text-lg font-bold uppercase tracking-widest text-white">
              Bắt đầu tập
            </button>
          </form>
        </section>
      )}
      {!day && (
        <p className="mt-4 rounded-xl border border-dashed border-line p-4 text-center text-sm text-muted">
          Hôm nay không có lịch tập. Nghỉ ngơi cho cơ phục hồi, hoặc <Link href="/more/routines" className="font-semibold text-brand">thêm ngày vào giáo án</Link>.
        </p>
      )}

      {mealPlan && (
        <section className="mt-4 rounded-xl border border-line bg-panel p-4">
          <h2 className="flex justify-between font-display text-sm font-semibold uppercase tracking-widest text-muted">
            Dinh dưỡng <span className="font-sans text-[11px] font-normal normal-case">kế hoạch {DAY_TYPE_LABELS[dayType].toLowerCase()}</span>
          </h2>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
            {[[mealPlan.targetCalories, "kcal"], [mealPlan.proteinG, "protein g"], [mealPlan.carbsG, "carb g"], [mealPlan.fatG, "fat g"]].map(([v, l]) => (
              <div key={l} className="rounded-lg bg-panel2 py-2.5">
                <p className="font-display text-xl font-bold">{v}</p>
                <p className="text-[9px] uppercase tracking-wider text-muted">{l}</p>
              </div>
            ))}
          </div>
          <ul className="mt-1 divide-y divide-line">
            {mealPlan.meals.map((m) => (
              <li key={m.id} className="flex justify-between gap-3 py-2.5 text-[13px]">
                <span className="shrink-0 font-semibold">{m.name}</span>
                <span className="text-right text-muted">{m.description}{m.calories != null ? ` · ~${m.calories} kcal` : ""}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

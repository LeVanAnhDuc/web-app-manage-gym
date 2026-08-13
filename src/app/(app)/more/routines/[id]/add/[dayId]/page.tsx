import { searchExercises, muscleLabel } from "@/features/exercises/queries";
import { addExerciseToDay } from "@/features/routines/actions";

export default async function AddExercisePage({ params, searchParams }: {
  params: Promise<{ id: string; dayId: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { id, dayId } = await params;
  const { q } = await searchParams;
  const exercises = q ? await searchExercises(q) : [];
  const input = "rounded-lg border border-line bg-panel2 px-2 py-1.5 text-sm";
  return (
    <main className="p-5">
      <h1 className="font-display text-2xl font-bold uppercase">Thêm bài tập</h1>
      <form className="mt-3">
        <input name="q" defaultValue={q} autoFocus placeholder="Tìm theo tên…"
          className="w-full rounded-xl border border-line bg-panel px-4 py-3 text-sm" />
      </form>
      <ul className="mt-4 space-y-3">
        {exercises.map((ex) => (
          <li key={ex.id} className="rounded-xl border border-line bg-panel p-3">
            <p className="text-sm font-semibold">{ex.name}</p>
            <p className="text-xs text-muted">{ex.primaryMuscles.map(muscleLabel).join(", ")}</p>
            <form action={addExerciseToDay} className="mt-2 flex items-center gap-2">
              <input type="hidden" name="routineId" value={id} />
              <input type="hidden" name="routineDayId" value={dayId} />
              <input type="hidden" name="exerciseId" value={ex.id} />
              <input name="targetSets" type="number" defaultValue={3} min={1} className={`${input} w-16`} aria-label="Số set" />
              <span className="text-xs text-muted">set ×</span>
              <input name="targetReps" defaultValue="8-12" className={`${input} w-20`} aria-label="Rep mục tiêu" />
              <input name="restSeconds" type="number" defaultValue={90} step={15} className={`${input} w-20`} aria-label="Nghỉ (giây)" />
              <button className="ml-auto rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white">Thêm</button>
            </form>
          </li>
        ))}
        {q && exercises.length === 0 && <li className="py-6 text-center text-sm text-muted">Không có kết quả cho "{q}".</li>}
      </ul>
    </main>
  );
}

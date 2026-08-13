import { searchExercises, muscleLabel } from "@/features/exercises/queries";
import { addExerciseToSession } from "@/features/workouts/actions";

export default async function AddToSessionPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { id } = await params;
  const { q } = await searchParams;
  const exercises = q ? await searchExercises(q) : [];
  return (
    <main className="p-5">
      <h1 className="font-display text-2xl font-bold uppercase">Thêm bài ngoài kế hoạch</h1>
      <form className="mt-3">
        <input name="q" defaultValue={q} autoFocus placeholder="Tìm theo tên…"
          className="w-full rounded-xl border border-line bg-panel px-4 py-3 text-sm" />
      </form>
      <ul className="mt-4 divide-y divide-line">
        {exercises.map((ex) => (
          <li key={ex.id} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{ex.name}</p>
              <p className="text-xs text-muted">{ex.primaryMuscles.map(muscleLabel).join(", ")}</p>
            </div>
            <form action={addExerciseToSession}>
              <input type="hidden" name="sessionId" value={id} />
              <input type="hidden" name="exerciseId" value={ex.id} />
              <button className="rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white">Thêm</button>
            </form>
          </li>
        ))}
        {q && exercises.length === 0 && <li className="py-6 text-center text-sm text-muted">Không có kết quả cho "{q}".</li>}
      </ul>
    </main>
  );
}

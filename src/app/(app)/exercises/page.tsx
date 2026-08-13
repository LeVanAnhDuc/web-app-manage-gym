import Link from "next/link";
import { searchExercises, MUSCLE_LABELS, EQUIPMENT_OPTIONS, muscleLabel } from "@/features/exercises/queries";

export default async function ExercisesPage({ searchParams }: { searchParams: Promise<{ q?: string; muscle?: string; equipment?: string }> }) {
  const { q, muscle, equipment } = await searchParams;
  const exercises = await searchExercises(q, muscle, equipment);
  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold ${active ? "border-brand bg-brand text-white" : "border-line bg-panel text-muted"}`;
  const link = (p: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries({ q, muscle, equipment, ...p })) if (v) sp.set(k, v);
    return `/exercises?${sp}`;
  };
  return (
    <main className="p-5">
      <h1 className="font-display text-3xl font-bold uppercase">Bài tập</h1>
      <form className="mt-3">
        {muscle && <input type="hidden" name="muscle" value={muscle} />}
        {equipment && <input type="hidden" name="equipment" value={equipment} />}
        <input name="q" defaultValue={q} placeholder="Tìm theo tên… (vd. bench press)"
          className="w-full rounded-xl border border-line bg-panel px-4 py-3 text-sm" />
      </form>
      <p className="mt-4 mb-2 font-display text-xs font-semibold uppercase tracking-widest text-muted">Nhóm cơ</p>
      <div className="flex gap-2 overflow-x-auto">
        <Link className={chip(!muscle)} href={link({ muscle: undefined })}>Tất cả</Link>
        {Object.keys(MUSCLE_LABELS).map((m) => (
          <Link key={m} className={chip(muscle === m)} href={link({ muscle: m })}>{muscleLabel(m)}</Link>
        ))}
      </div>
      <p className="mt-3 mb-2 font-display text-xs font-semibold uppercase tracking-widest text-muted">Dụng cụ</p>
      <div className="flex gap-2 overflow-x-auto">
        <Link className={chip(!equipment)} href={link({ equipment: undefined })}>Tất cả</Link>
        {EQUIPMENT_OPTIONS.map((e) => (
          <Link key={e} className={chip(equipment === e)} href={link({ equipment: e })}>{e}</Link>
        ))}
      </div>
      <ul className="mt-4 divide-y divide-line">
        {exercises.map((ex) => (
          <li key={ex.id}>
            <Link href={`/exercises/${ex.id}`} className="flex items-center gap-3 py-3">
              <div className="grid size-13 shrink-0 place-items-center rounded-xl border border-line bg-panel2 font-display font-bold text-muted">
                {ex.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{ex.name}</p>
                <p className="text-[11px] text-muted">
                  {ex.primaryMuscles.map(muscleLabel).join(", ")}{ex.equipment ? ` · ${ex.equipment}` : ""}
                </p>
              </div>
              <span className="text-muted">›</span>
            </Link>
          </li>
        ))}
        {exercises.length === 0 && <li className="py-8 text-center text-sm text-muted">Không tìm thấy bài tập nào — thử từ khóa khác.</li>}
      </ul>
      <Link href="/exercises/new" className="mt-3 block rounded-xl border border-dashed border-line py-3 text-center text-sm font-semibold text-muted">
        + Tạo bài tập tùy chỉnh
      </Link>
    </main>
  );
}

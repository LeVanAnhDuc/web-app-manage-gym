import { createExercise } from "@/features/exercises/actions";
import { MUSCLE_LABELS, EQUIPMENT_OPTIONS, muscleLabel } from "@/features/exercises/queries";

export default async function NewExercisePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const input = "w-full rounded-xl border border-line bg-panel px-4 py-3 text-sm";
  return (
    <main className="p-5">
      <h1 className="font-display text-3xl font-bold uppercase">Bài tập tùy chỉnh</h1>
      {error && <p className="mt-2 rounded-lg bg-brand/10 px-3 py-2 text-sm text-brand">{error}</p>}
      <form action={createExercise} className="mt-4 flex flex-col gap-3">
        <input name="name" placeholder="Tên bài (tiếng Anh, vd. Cable Fly)" className={input} />
        <select name="primaryMuscle" className={input} defaultValue="">
          <option value="" disabled>Nhóm cơ chính</option>
          {Object.keys(MUSCLE_LABELS).map((m) => <option key={m} value={m}>{muscleLabel(m)}</option>)}
        </select>
        <select name="equipment" className={input} defaultValue="">
          <option value="">Dụng cụ (tùy chọn)</option>
          {EQUIPMENT_OPTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <textarea name="instructions" rows={4} placeholder="Hướng dẫn — mỗi bước một dòng" className={input} />
        <button className="rounded-xl bg-brand py-3 font-display text-lg font-bold uppercase tracking-widest text-white">Lưu bài tập</button>
      </form>
    </main>
  );
}

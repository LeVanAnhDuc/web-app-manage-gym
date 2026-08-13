import Link from "next/link";
import { db } from "@/lib/db";
import { createRoutine, setActiveRoutine, deleteRoutine } from "@/features/routines/actions";

export default async function RoutinesPage() {
  const routines = await db.routine.findMany({ include: { days: true }, orderBy: { name: "asc" } });
  return (
    <main className="p-5">
      <h1 className="font-display text-3xl font-bold uppercase">Giáo án</h1>
      <ul className="mt-4 space-y-3">
        {routines.map((r) => (
          <li key={r.id} className={`rounded-xl border bg-panel p-4 ${r.isActive ? "border-brand" : "border-line"}`}>
            <div className="flex items-center justify-between gap-2">
              <Link href={`/more/routines/${r.id}`} className="min-w-0">
                <p className="truncate font-semibold">{r.name}</p>
                <p className="text-xs text-muted">{r.days.length} ngày/tuần{r.isActive ? " · Đang dùng" : ""}</p>
              </Link>
              <div className="flex shrink-0 gap-2">
                {!r.isActive && (
                  <form action={setActiveRoutine}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold">Kích hoạt</button>
                  </form>
                )}
                <form action={deleteRoutine}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-brand">Xóa</button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <form action={createRoutine} className="mt-4 flex gap-2">
        <input name="name" required placeholder="Tên giáo án mới (vd. PPL 6 ngày)"
          className="flex-1 rounded-xl border border-line bg-panel px-4 py-3 text-sm" />
        <button className="rounded-xl bg-brand px-4 font-display font-bold uppercase text-white">Tạo</button>
      </form>
    </main>
  );
}

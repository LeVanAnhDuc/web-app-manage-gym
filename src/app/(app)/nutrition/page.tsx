import Link from "next/link";
import { db } from "@/lib/db";
import { kcalFromMacros, macroPercents } from "@/features/nutrition/macros";
import { updateMealPlan, addMeal, deleteMeal } from "@/features/nutrition/actions";
import { DAY_TYPE_LABELS } from "@/features/routines/builder";
import type { DayType } from "@prisma/client";

export default async function NutritionPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const dayType: DayType = type === "CARDIO" || type === "REST" ? type : "STRENGTH";
  const plan = await db.mealPlan.findUniqueOrThrow({
    where: { dayType },
    include: { meals: { orderBy: { order: "asc" } } },
  });
  const pct = macroPercents(plan.proteinG, plan.carbsG, plan.fatG);
  const input = "w-full rounded-lg border border-line bg-panel2 px-2 py-2 text-center font-display text-lg font-bold";
  const segColors: Record<DayType, string> = { STRENGTH: "border-brand", CARDIO: "border-cardio", REST: "border-line" };
  return (
    <main className="p-5">
      <h1 className="font-display text-3xl font-bold uppercase">Dinh dưỡng</h1>
      <p className="mt-1 text-xs text-muted">Kế hoạch ăn tự áp dụng theo loại ngày trong lịch tập</p>
      <div className="mt-4 flex gap-2">
        {(Object.keys(DAY_TYPE_LABELS) as DayType[]).map((t) => (
          <Link key={t} href={`/nutrition?type=${t}`}
            className={`flex-1 rounded-xl border-2 bg-panel py-2.5 text-center font-display text-sm font-bold uppercase tracking-wider ${dayType === t ? segColors[t] : "border-transparent text-muted"}`}>
            {DAY_TYPE_LABELS[t]}
          </Link>
        ))}
      </div>
      <section className="mt-4 rounded-xl border border-line bg-panel p-4">
        <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted">Mục tiêu {DAY_TYPE_LABELS[dayType].toLowerCase()}</h2>
        <form action={updateMealPlan} className="mt-3">
          <input type="hidden" name="id" value={plan.id} />
          <div className="grid grid-cols-4 gap-2">
            <label className="text-center text-[10px] uppercase text-muted">Kcal<input name="targetCalories" type="number" defaultValue={plan.targetCalories} className={input} /></label>
            <label className="text-center text-[10px] uppercase text-muted">Protein<input name="proteinG" type="number" defaultValue={plan.proteinG} className={input} /></label>
            <label className="text-center text-[10px] uppercase text-muted">Carb<input name="carbsG" type="number" defaultValue={plan.carbsG} className={input} /></label>
            <label className="text-center text-[10px] uppercase text-muted">Fat<input name="fatG" type="number" defaultValue={plan.fatG} className={input} /></label>
          </div>
          <div className="mt-3 flex h-2.5 overflow-hidden rounded-full">
            <div style={{ width: `${pct.p}%` }} className="bg-ink" />
            <div style={{ width: `${pct.c}%` }} className="bg-cardio" />
            <div style={{ width: `${pct.f}%` }} className="bg-gold" />
          </div>
          <p className="mt-1 text-[11px] text-muted">Từ macro: ~{kcalFromMacros(plan.proteinG, plan.carbsG, plan.fatG)} kcal</p>
          <button className="mt-3 w-full rounded-xl border border-line py-2 text-sm font-semibold">Lưu mục tiêu</button>
        </form>
      </section>
      <section className="mt-4 rounded-xl border border-line bg-panel p-4">
        <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted">Thực đơn mẫu</h2>
        <ul className="mt-1 divide-y divide-line">
          {plan.meals.map((m) => (
            <li key={m.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{m.name}</p>
                <p className="text-xs text-muted">{m.description}</p>
              </div>
              {m.calories != null && <span className="font-display font-semibold text-muted">{m.calories}</span>}
              <form action={deleteMeal}><input type="hidden" name="id" value={m.id} /><button className="text-brand">✕</button></form>
            </li>
          ))}
          {plan.meals.length === 0 && <li className="py-5 text-center text-sm text-muted">Chưa có bữa nào — thêm bữa đầu tiên bên dưới.</li>}
        </ul>
        <form action={addMeal} className="mt-2 grid grid-cols-[1fr_auto] gap-2">
          <input type="hidden" name="mealPlanId" value={plan.id} />
          <input name="name" required placeholder="Tên bữa (vd. Bữa sáng)" className="rounded-lg border border-line bg-panel2 px-3 py-2 text-sm" />
          <input name="calories" type="number" placeholder="kcal" className="w-20 rounded-lg border border-line bg-panel2 px-2 py-2 text-sm" />
          <input name="description" required placeholder="Món ăn (vd. Yến mạch, 3 trứng, chuối)" className="col-span-2 rounded-lg border border-line bg-panel2 px-3 py-2 text-sm" />
          <button className="col-span-2 rounded-lg bg-brand py-2 text-sm font-bold text-white">+ Thêm bữa</button>
        </form>
      </section>
      <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
        Ngày nào lịch tập là "{DAY_TYPE_LABELS[dayType]}", trang Hôm nay sẽ tự hiển thị kế hoạch này.
      </p>
    </main>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import { saveSet } from "./actions";
import { enqueuePending, loadPending, storePending } from "./pending";
import { RestTimer } from "./rest-timer";

export type ExercisePlan = {
  exerciseId: string;
  name: string;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  prev: { setNumber: number; weightKg: number | null; reps: number | null }[];
  logged: { setNumber: number; type: "WARMUP" | "NORMAL" | "FAILURE"; weightKg: number | null; reps: number | null }[];
};

type SetKind = "WARMUP" | "NORMAL" | "FAILURE";
type RowState = { type: SetKind; weight: string; reps: string; done: boolean; isPR: boolean; pendingSync: boolean };

const NEXT_KIND: Record<SetKind, SetKind> = { NORMAL: "WARMUP", WARMUP: "FAILURE", FAILURE: "NORMAL" };

function initRows(plan: ExercisePlan): RowState[] {
  const n = Math.max(plan.targetSets, ...plan.logged.map((l) => l.setNumber), 0);
  return Array.from({ length: n }, (_, i) => {
    const logged = plan.logged.find((l) => l.setNumber === i + 1);
    return {
      type: logged?.type ?? "NORMAL",
      weight: logged?.weightKg != null ? String(logged.weightKg) : "",
      reps: logged?.reps != null ? String(logged.reps) : "",
      done: !!logged, isPR: false, pendingSync: false,
    };
  });
}

export function SetLogger({ sessionId, plans }: { sessionId: string; plans: ExercisePlan[] }) {
  const [rowsByEx, setRowsByEx] = useState<Record<string, RowState[]>>(
    () => Object.fromEntries(plans.map((p) => [p.exerciseId, initRows(p)]))
  );
  const [rest, setRest] = useState<{ seconds: number; runId: number; label: string } | null>(null);

  function update(exId: string, idx: number, patch: Partial<RowState>) {
    setRowsByEx((prev) => ({ ...prev, [exId]: prev[exId].map((r, i) => (i === idx ? { ...r, ...patch } : r)) }));
  }

  async function tick(plan: ExercisePlan, idx: number) {
    const row = rowsByEx[plan.exerciseId][idx];
    const weightKg = row.weight === "" ? null : Number(row.weight.replace(",", "."));
    const reps = row.reps === "" ? null : Number(row.reps);
    if ((weightKg !== null && Number.isNaN(weightKg)) || (reps !== null && Number.isNaN(reps))) return;
    update(plan.exerciseId, idx, { done: true, pendingSync: true });
    setRest({ seconds: plan.restSeconds, runId: Date.now(), label: plan.name });
    const input = { sessionId, exerciseId: plan.exerciseId, setNumber: idx + 1, type: row.type, weightKg, reps };
    try {
      const { isPR } = await saveSet(input);
      update(plan.exerciseId, idx, { pendingSync: false, isPR });
    } catch {
      storePending(enqueuePending(loadPending(), input));
      update(plan.exerciseId, idx, { pendingSync: true });
    }
  }

  const flushingRef = useRef(false);
  useEffect(() => {
    async function flush() {
      if (flushingRef.current) return;
      flushingRef.current = true;
      try {
        const queue = loadPending();
        if (queue.length === 0) return;
        const succeeded: typeof queue = [];
        for (const item of queue) {
          try { await saveSet(item); succeeded.push(item); } catch { /* vẫn pending, giữ trong queue */ }
        }
        if (succeeded.length === 0) return;
        // Merge với queue sống hiện tại (không ghi lại snapshot cũ) để không đè mất
        // item mới do tick() enqueue trong lúc flush này đang chạy.
        const live = loadPending();
        const next = live.filter(
          (l) => !succeeded.some((s) => s.sessionId === l.sessionId && s.exerciseId === l.exerciseId && s.setNumber === l.setNumber)
        );
        storePending(next);
        setRowsByEx((prev) => {
          const copy = { ...prev };
          for (const s of succeeded) {
            const rows = copy[s.exerciseId];
            const idx = s.setNumber - 1;
            if (rows?.[idx]) copy[s.exerciseId] = rows.map((r, i) => (i === idx ? { ...r, pendingSync: false } : r));
          }
          return copy;
        });
      } finally {
        flushingRef.current = false;
      }
    }
    const t = setInterval(flush, 15000);
    window.addEventListener("online", flush);
    return () => { clearInterval(t); window.removeEventListener("online", flush); };
  }, [sessionId]);

  function addSet(exId: string) {
    setRowsByEx((prev) => ({ ...prev, [exId]: [...prev[exId], { type: "NORMAL", weight: "", reps: "", done: false, isPR: false, pendingSync: false }] }));
  }

  const cell = "w-16 rounded-lg border border-line bg-panel2 py-2 text-center font-display text-lg font-semibold";
  return (
    <div className="space-y-3 p-4">
      {plans.map((plan) => (
        <section key={plan.exerciseId} className="rounded-xl border border-line bg-panel p-3.5">
          <header className="flex items-baseline justify-between">
            <p className="text-sm font-bold">{plan.name}</p>
            <p className="text-[11px] text-muted">
              {plan.prev.length > 0
                ? `Buổi trước: ${plan.prev[0].weightKg ?? "-"} kg × ${plan.prev[0].reps ?? "-"}`
                : `Mục tiêu ${plan.targetSets}×${plan.targetReps}`}
            </p>
          </header>
          <table className="mt-2 w-full text-center text-sm">
            <thead>
              <tr className="border-b border-line font-display text-[11px] uppercase tracking-widest text-muted">
                <th className="py-1.5">Set</th><th>Trước</th><th>Kg</th><th>Rep</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rowsByEx[plan.exerciseId].map((row, i) => {
                const prev = plan.prev.find((p) => p.setNumber === i + 1);
                return (
                  <tr key={i} className={`border-b border-line last:border-0 ${row.type === "WARMUP" ? "opacity-60" : ""}`}>
                    <td className="py-1.5">
                      <button onClick={() => update(plan.exerciseId, i, { type: NEXT_KIND[row.type] })}
                        aria-label={`Đổi loại set ${i + 1}`}
                        className={`font-display font-bold ${row.type === "WARMUP" ? "text-gold" : row.type === "FAILURE" ? "text-brand" : "text-muted"}`}>
                        {row.type === "WARMUP" ? "W" : row.type === "FAILURE" ? "F" : i + 1}
                      </button>
                    </td>
                    <td className="text-xs text-muted/70">{prev ? `${prev.weightKg ?? "-"}×${prev.reps ?? "-"}` : "—"}</td>
                    <td className="py-1.5">
                      <input inputMode="decimal" value={row.weight} aria-label={`Kg set ${i + 1}`}
                        onChange={(e) => update(plan.exerciseId, i, { weight: e.target.value })} className={cell} />
                    </td>
                    <td>
                      <input inputMode="numeric" value={row.reps} aria-label={`Rep set ${i + 1}`}
                        onChange={(e) => update(plan.exerciseId, i, { reps: e.target.value })} className={cell} />
                    </td>
                    <td>
                      <button onClick={() => tick(plan, i)} aria-label={`Hoàn thành set ${i + 1}`}
                        className={`grid size-8 place-items-center rounded-lg border font-bold ${
                          row.isPR ? "border-gold bg-gold text-white"
                          : row.done ? "border-ok bg-ok text-white"
                          : "border-line text-transparent"}`}>
                        {row.isPR ? "PR" : "✓"}
                      </button>
                      {row.pendingSync && <p className="text-[9px] text-gold">chưa đồng bộ</p>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button onClick={() => addSet(plan.exerciseId)}
            className="mt-2 w-full rounded-lg border border-dashed border-line py-2 text-xs font-semibold text-muted">
            + Thêm set
          </button>
        </section>
      ))}
      {rest && <RestTimer key={rest.runId} seconds={rest.seconds} label={rest.label} onClose={() => setRest(null)} />}
    </div>
  );
}

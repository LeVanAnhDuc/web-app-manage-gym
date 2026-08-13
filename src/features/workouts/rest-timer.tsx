"use client";
import { useEffect, useState } from "react";

export function RestTimer({ seconds, label, onClose }: { seconds: number; label: string; onClose: () => void }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) { navigator.vibrate?.(400); onClose(); return; }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onClose]);
  const mm = Math.floor(left / 60), ss = String(left % 60).padStart(2, "0");
  const R = 26, C = 2 * Math.PI * R;
  const progress = seconds > 0 ? left / seconds : 0; // 1 → 0
  return (
    <div className="fixed inset-x-0 bottom-16 z-20 mx-auto flex max-w-lg items-center gap-3 border-t border-line bg-panel px-5 py-3">
      <div className="relative size-14">
        <svg width="56" height="56" viewBox="0 0 58 58" className="-rotate-90">
          <circle cx="29" cy="29" r={R} fill="none" strokeWidth="5" className="stroke-line" />
          <circle cx="29" cy="29" r={R} fill="none" strokeWidth="5" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - progress)} className="stroke-gold" />
        </svg>
        <span className="absolute inset-0 grid place-items-center">
          <span className="block size-3 rounded-full border-2 border-line bg-bg" />
        </span>
      </div>
      <div className="flex-1">
        <p className="font-display text-3xl font-bold">{mm}:{ss}</p>
        <p className="text-[11px] text-muted">Nghỉ giữa set · {label}</p>
      </div>
      <button onClick={() => setLeft((l) => l + 30)} className="rounded-lg border border-line bg-panel2 px-3.5 py-2.5 text-xs font-semibold">+30s</button>
      <button onClick={onClose} className="rounded-lg px-3 py-2.5 text-xs font-semibold text-muted">Bỏ qua</button>
    </div>
  );
}

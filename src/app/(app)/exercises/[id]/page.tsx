import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { muscleLabel } from "@/features/exercises/queries";

export default async function ExerciseDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ex = await db.exercise.findUnique({ where: { id } });
  if (!ex) notFound();
  return (
    <main className="p-5">
      <h1 className="font-display text-2xl font-bold uppercase">{ex.name}</h1>
      <p className="mt-1 text-xs text-muted">
        {ex.primaryMuscles.map(muscleLabel).join(", ")}
        {ex.equipment ? ` · ${ex.equipment}` : ""}{ex.level ? ` · ${ex.level}` : ""}
      </p>
      <div className="mt-4 flex gap-3 overflow-x-auto">
        {ex.images.map((src) => (
          <Image key={src} src={src} alt={ex.name} width={280} height={190}
            className="rounded-xl border border-line bg-panel object-cover" />
        ))}
      </div>
      <h2 className="mt-5 font-display text-sm font-semibold uppercase tracking-widest text-muted">Hướng dẫn</h2>
      <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
        {ex.instructions.map((step, i) => <li key={i}>{step}</li>)}
      </ol>
    </main>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionDetail, getPrevSets } from "@/features/workouts/queries";
import { totalVolumeKg } from "@/features/workouts/logic";
import { finishWorkout } from "@/features/workouts/actions";
import { SetLogger, type ExercisePlan } from "@/features/workouts/set-logger";

export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionDetail(id);
  if (!session) notFound();

  const planned = session.routineDay?.exercises ?? [];
  const toLogged = (exerciseId: string) =>
    session.sets
      .filter((s) => s.exerciseId === exerciseId && s.completedAt)
      .map((s) => ({ setNumber: s.setNumber, type: s.type, weightKg: s.weightKg, reps: s.reps }));
  const toPrev = async (exerciseId: string) =>
    (await getPrevSets(exerciseId, id)).map((s) => ({ setNumber: s.setNumber, weightKg: s.weightKg, reps: s.reps }));

  const planExercises: ExercisePlan[] = await Promise.all(
    planned.map(async (re) => ({
      exerciseId: re.exerciseId,
      name: re.exercise.name,
      targetSets: re.targetSets,
      targetReps: re.targetReps,
      restSeconds: re.restSeconds,
      prev: await toPrev(re.exerciseId),
      logged: toLogged(re.exerciseId),
    }))
  );
  // Bài thêm ngoài kế hoạch = có set trong session nhưng không thuộc routineDay
  const plannedIds = new Set(planned.map((re) => re.exerciseId));
  const extraIds = [...new Set(session.sets.filter((s) => !plannedIds.has(s.exerciseId)).map((s) => s.exerciseId))];
  const extraPlans: ExercisePlan[] = await Promise.all(
    extraIds.map(async (exerciseId) => ({
      exerciseId,
      name: session.sets.find((s) => s.exerciseId === exerciseId)!.exercise.name,
      targetSets: 3,
      targetReps: "8-12",
      restSeconds: 90,
      prev: await toPrev(exerciseId),
      logged: toLogged(exerciseId),
    }))
  );
  const plans = [...planExercises, ...extraPlans];

  if (session.status === "COMPLETED") {
    const volume = totalVolumeKg(session.sets);
    const doneSets = session.sets.filter((s) => s.completedAt).length;
    const lastDone = session.sets.reduce<Date | null>(
      (acc, s) => (s.completedAt && (!acc || s.completedAt > acc) ? s.completedAt : acc), null);
    const durationMin = lastDone ? Math.max(1, Math.round((lastDone.getTime() - session.date.getTime()) / 60000)) : 0;
    return (
      <main className="p-5">
        <h1 className="font-display text-3xl font-bold uppercase">{session.routineDay?.name ?? "Buổi tập"}</h1>
        <p className="mt-1 text-xs text-muted">{session.date.toLocaleDateString("vi-VN")} · Đã hoàn thành</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-line bg-panel p-4">
            <p className="font-display text-3xl font-bold">{volume.toLocaleString("vi-VN")}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted">Volume (kg)</p>
          </div>
          <div className="rounded-xl border border-line bg-panel p-4">
            <p className="font-display text-3xl font-bold">{doneSets}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted">Set</p>
          </div>
          <div className="rounded-xl border border-line bg-panel p-4">
            <p className="font-display text-3xl font-bold">{durationMin}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted">Phút</p>
          </div>
        </div>
        <ul className="mt-4 space-y-3">
          {plans.map((p) => (
            <li key={p.exerciseId} className="rounded-xl border border-line bg-panel p-4">
              <p className="text-sm font-semibold">{p.name}</p>
              <p className="mt-1 text-xs text-muted">
                {p.logged.map((s) => `${s.weightKg ?? 0}×${s.reps ?? 0}`).join(" · ") || "Không có set"}
              </p>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  return (
    <main className="pb-5">
      <header className="flex items-center justify-between border-b border-line p-4">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase">{session.routineDay?.name ?? "Tập tự do"}</h1>
          <p className="text-[11px] text-muted">{planned.length} bài theo kế hoạch</p>
        </div>
      </header>
      <SetLogger sessionId={id} plans={plans} />
      <div className="px-4">
        <Link href={`/workouts/${id}/add`}
          className="block rounded-xl border border-dashed border-line py-3 text-center text-xs font-semibold text-muted">
          + Thêm bài ngoài kế hoạch
        </Link>
      </div>
      <form action={finishWorkout} className="px-4">
        <input type="hidden" name="sessionId" value={id} />
        <button className="mt-2 w-full rounded-xl border border-brand py-3.5 font-display text-lg font-bold uppercase tracking-widest text-brand">
          Hoàn thành buổi tập
        </button>
      </form>
    </main>
  );
}

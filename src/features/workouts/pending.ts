import type { SaveSetInput } from "./actions";

const KEY = "gym.pending-sets";

export function enqueuePending(queue: SaveSetInput[], item: SaveSetInput): SaveSetInput[] {
  return [
    ...queue.filter((q) => !(q.sessionId === item.sessionId && q.exerciseId === item.exerciseId && q.setNumber === item.setNumber)),
    item,
  ];
}

export function loadPending(): SaveSetInput[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

export function storePending(queue: SaveSetInput[]) {
  localStorage.setItem(KEY, JSON.stringify(queue));
}

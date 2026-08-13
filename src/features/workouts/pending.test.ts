import { describe, expect, it } from "vitest";
import { enqueuePending } from "./pending";
import type { SaveSetInput } from "./actions";

const item = (setNumber: number, weightKg = 80): SaveSetInput =>
  ({ sessionId: "s1", exerciseId: "e1", setNumber, type: "NORMAL", weightKg, reps: 10 });

describe("enqueuePending", () => {
  it("thêm item mới", () => expect(enqueuePending([], item(1))).toHaveLength(1));
  it("ghi đè item cùng (session, exercise, setNumber)", () => {
    const q = enqueuePending([item(1, 80)], item(1, 85));
    expect(q).toHaveLength(1);
    expect(q[0].weightKg).toBe(85);
  });
  it("giữ item khác set", () => expect(enqueuePending([item(1)], item(2))).toHaveLength(2));
});

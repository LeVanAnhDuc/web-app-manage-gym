import { describe, expect, it } from "vitest";
import { totalVolumeKg, isNewPR } from "./logic";

const done = new Date();
describe("totalVolumeKg", () => {
  it("cộng weight×reps của set đã hoàn thành, bỏ warm-up", () => {
    expect(totalVolumeKg([
      { type: "WARMUP", weightKg: 20, reps: 12, completedAt: done },
      { type: "NORMAL", weightKg: 80, reps: 10, completedAt: done },
      { type: "FAILURE", weightKg: 80, reps: 8, completedAt: done },
      { type: "NORMAL", weightKg: 80, reps: 10, completedAt: null },
    ])).toBe(1440);
  });
  it("0 khi không có set", () => expect(totalVolumeKg([])).toBe(0));
});

describe("isNewPR", () => {
  it("true khi vượt max cũ", () => expect(isNewPR(85, 5, 80)).toBe(true));
  it("false khi bằng max cũ", () => expect(isNewPR(80, 5, 80)).toBe(false));
  it("false khi reps < 1", () => expect(isNewPR(100, 0, 80)).toBe(false));
  it("true khi chưa có lịch sử và weight > 0", () => expect(isNewPR(60, 8, null)).toBe(true));
});

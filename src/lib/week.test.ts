import { describe, expect, it } from "vitest";
import { weekDates } from "./week";

describe("weekDates", () => {
  it("trả 7 ngày bắt đầu Thứ 2", () => {
    // 2026-08-13 (giờ VN) là Thứ 5 → tuần bắt đầu 2026-08-10 (Thứ 2)
    const days = weekDates(new Date("2026-08-13T03:00:00Z"));
    expect(days).toHaveLength(7);
    expect(days[0].toISOString().slice(0, 10)).toBe("2026-08-10");
    expect(days[6].toISOString().slice(0, 10)).toBe("2026-08-16");
  });
});

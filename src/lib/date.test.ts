import { describe, expect, it } from "vitest";
import { weekdayInTz } from "./date";

describe("weekdayInTz", () => {
  // 2026-08-12T18:00Z = 2026-08-13 01:00 giờ VN (Thứ 5 = 4)
  it("dùng giờ VN, không dùng UTC", () => {
    expect(weekdayInTz(new Date("2026-08-12T18:00:00Z"))).toBe(4);
  });
  it("chủ nhật = 0", () => {
    expect(weekdayInTz(new Date("2026-08-16T03:00:00Z"))).toBe(0);
  });
});

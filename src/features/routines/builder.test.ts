import { describe, expect, it } from "vitest";
import { nextOrder } from "./builder";

describe("nextOrder", () => {
  it("trả 1 khi chưa có bài nào", () => expect(nextOrder([])).toBe(1));
  it("trả max+1", () => expect(nextOrder([1, 2, 5])).toBe(6));
});

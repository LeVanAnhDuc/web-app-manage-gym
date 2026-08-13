import { describe, expect, it } from "vitest";
import { kcalFromMacros, macroPercents } from "./macros";

describe("macros", () => {
  it("kcal = 4p + 4c + 9f", () => expect(kcalFromMacros(180, 320, 80)).toBe(2720));
  it("phần trăm cộng lại 100", () => {
    const { p, c, f } = macroPercents(180, 320, 80);
    expect(Math.round(p + c + f)).toBe(100);
  });
  it("về 0 khi toàn 0", () => expect(macroPercents(0, 0, 0)).toEqual({ p: 0, c: 0, f: 0 }));
});

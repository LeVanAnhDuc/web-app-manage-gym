import { describe, expect, it } from "vitest";
import { buildExerciseWhere } from "./queries";

describe("buildExerciseWhere", () => {
  it("rỗng khi không có filter", () => {
    expect(buildExerciseWhere(undefined, undefined, undefined)).toEqual({});
  });
  it("gộp đủ 3 điều kiện", () => {
    expect(buildExerciseWhere("bench", "chest", "barbell")).toEqual({
      name: { contains: "bench", mode: "insensitive" },
      primaryMuscles: { has: "chest" },
      equipment: "barbell",
    });
  });
});

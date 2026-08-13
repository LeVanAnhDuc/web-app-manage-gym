import { describe, expect, it } from "vitest";
import { createExerciseSchema } from "./actions";

describe("createExerciseSchema", () => {
  it("chấp nhận input hợp lệ", () => {
    const r = createExerciseSchema.safeParse({ name: "My Cable Fly", primaryMuscle: "chest", equipment: "cable", instructions: "Kéo cáp từ ngoài vào giữa." });
    expect(r.success).toBe(true);
  });
  it("từ chối tên rỗng", () => {
    expect(createExerciseSchema.safeParse({ name: "", primaryMuscle: "chest", equipment: "", instructions: "" }).success).toBe(false);
  });
});

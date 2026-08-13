import { describe, expect, it } from "vitest";
import { toExerciseData, type RawExercise } from "./parse";

const raw: RawExercise = {
  id: "Barbell_Bench_Press",
  name: "Barbell Bench Press",
  primaryMuscles: ["chest"],
  secondaryMuscles: ["triceps", "shoulders"],
  equipment: "barbell",
  level: "intermediate",
  instructions: ["Lie on the bench.", "Press the bar up."],
  images: ["Barbell_Bench_Press/0.jpg", "Barbell_Bench_Press/1.jpg"],
};

describe("toExerciseData", () => {
  it("map đúng field và tạo URL ảnh tuyệt đối", () => {
    const data = toExerciseData(raw);
    expect(data.name).toBe("Barbell Bench Press");
    expect(data.primaryMuscles).toEqual(["chest"]);
    expect(data.images[0]).toBe(
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press/0.jpg"
    );
    expect(data.isCustom).toBe(false);
  });
  it("chịu được field null/thiếu", () => {
    const data = toExerciseData({ ...raw, equipment: null, images: undefined as unknown as string[] });
    expect(data.equipment).toBeNull();
    expect(data.images).toEqual([]);
  });
});

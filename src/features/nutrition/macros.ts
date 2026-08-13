export function kcalFromMacros(proteinG: number, carbsG: number, fatG: number): number {
  return proteinG * 4 + carbsG * 4 + fatG * 9;
}

export function macroPercents(proteinG: number, carbsG: number, fatG: number) {
  const total = kcalFromMacros(proteinG, carbsG, fatG);
  if (total === 0) return { p: 0, c: 0, f: 0 };
  return { p: (proteinG * 4 / total) * 100, c: (carbsG * 4 / total) * 100, f: (fatG * 9 / total) * 100 };
}

export function nextOrder(orders: number[]): number {
  return orders.length === 0 ? 1 : Math.max(...orders) + 1;
}
export const WEEKDAY_LABELS = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
export const DAY_TYPE_LABELS = { STRENGTH: "Tập tạ", CARDIO: "Cardio", REST: "Nghỉ" } as const;

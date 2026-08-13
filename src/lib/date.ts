const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function weekdayInTz(date: Date, timeZone = "Asia/Ho_Chi_Minh"): number {
  const name = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone }).format(date);
  return DAY_NAMES.indexOf(name);
}

export function formatDateVi(date: Date, timeZone = "Asia/Ho_Chi_Minh"): string {
  return new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "numeric", month: "long", timeZone }).format(date);
}

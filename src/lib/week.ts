import { weekdayInTz } from "./date";

const DAY_MS = 86_400_000;

/** 7 ngày Thứ 2 → CN của tuần chứa `now` (mốc ngày theo giờ VN, giá trị Date ở 00:00 UTC của ngày đó). */
export function weekDates(now: Date): Date[] {
  const wd = weekdayInTz(now); // 0=CN…6=T7
  const offsetToMonday = wd === 0 ? 6 : wd - 1;
  const vnDateStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(now); // YYYY-MM-DD
  const todayUtcMidnight = new Date(`${vnDateStr}T00:00:00Z`);
  const monday = new Date(todayUtcMidnight.getTime() - offsetToMonday * DAY_MS);
  return Array.from({ length: 7 }, (_, i) => new Date(monday.getTime() + i * DAY_MS));
}

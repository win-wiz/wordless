/**
 * 把 'YYYY-MM-DD'（UTC）格式化为英文展示日期。
 * style 控制 weekday/month 的长短形式（archive 用 short，其余用 long）。
 */
export function formatUtcDate(date: string, style: "long" | "short" = "long") {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: style,
    month: style,
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}

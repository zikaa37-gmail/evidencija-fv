export function buildMonthGrid(month: Date): (number | null)[] {
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const mondayBasedOffset = (firstDay.getDay() + 6) % 7;

  return [
    ...Array<null>(mondayBasedOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
}

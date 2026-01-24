import { DayStatus } from "@/src/types/habit";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat

export const formatDateKey = (date: Date): string => {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
};

export const getLastSevenDays = (): Omit<DayStatus, "completed">[] => {
  const days: Omit<DayStatus, "completed">[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    days.push({
      date: formatDateKey(date),
      dayLabel: DAY_LABELS[date.getDay()],
      dayIndex: date.getDay(), // 0 = Sunday, 6 = Saturday
      isToday: i === 0,
      isFuture: false,
    });
  }

  return days;
};

/**
 * Get the last N days that match the specified day indices.
 * For example, if allowedDays = [1,2,3,4,5] (weekdays), it will find
 * the last 7 weekdays going back in time.
 */
export const getLastNMatchingDays = (
  count: number,
  allowedDays: number[],
): Omit<DayStatus, "completed">[] => {
  const days: Omit<DayStatus, "completed">[] = [];
  const today = new Date();
  const todayKey = formatDateKey(today);

  let daysBack = 0;
  while (days.length < count) {
    const date = new Date(today);
    date.setDate(today.getDate() - daysBack);

    if (allowedDays.includes(date.getDay())) {
      days.unshift({
        date: formatDateKey(date),
        dayLabel: DAY_LABELS[date.getDay()],
        dayIndex: date.getDay(),
        isToday: formatDateKey(date) === todayKey,
        isFuture: false,
      });
    }

    daysBack++;
    // Safety limit to avoid infinite loop
    if (daysBack > 365) break;
  }

  return days;
};

/**
 * Get today + next N-1 matching days.
 * Today is always first (if it matches), followed by future days.
 * If today doesn't match, start from the next matching day.
 */
export const getTodayAndNextMatchingDays = (
  count: number,
  allowedDays: number[],
): Omit<DayStatus, "completed">[] => {
  const days: Omit<DayStatus, "completed">[] = [];
  const today = new Date();
  const todayKey = formatDateKey(today);

  let daysForward = 0;
  while (days.length < count) {
    const date = new Date(today);
    date.setDate(today.getDate() + daysForward);

    if (allowedDays.includes(date.getDay())) {
      const dateKey = formatDateKey(date);
      days.push({
        date: dateKey,
        dayLabel: DAY_LABELS[date.getDay()],
        dayIndex: date.getDay(),
        isToday: dateKey === todayKey,
        isFuture: dateKey > todayKey,
      });
    }

    daysForward++;
    // Safety limit to avoid infinite loop
    if (daysForward > 365) break;
  }

  return days;
};

export const getTodayKey = (): string => {
  return formatDateKey(new Date());
};

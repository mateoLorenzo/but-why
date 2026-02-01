import { DayStatus } from "@/src/types/habit";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_LABELS_SHORT_ES = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

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
  allowedDays: number[]
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
  allowedDays: number[]
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

/**
 * Get days centered on today: 3 past + today + 3 future.
 * All days must match the allowed frequency.
 * Returns 7 days total with today in the middle (index 3).
 */
export const getDaysCenteredOnToday = (
  allowedDays: number[]
): Omit<DayStatus, "completed">[] => {
  const today = new Date();
  const todayKey = formatDateKey(today);
  const todayMatchesFrequency = allowedDays.includes(today.getDay());

  // Get 3 past matching days (not including today)
  const pastDays: Omit<DayStatus, "completed">[] = [];
  let daysBack = 1;
  while (pastDays.length < 3) {
    const date = new Date(today);
    date.setDate(today.getDate() - daysBack);

    if (allowedDays.includes(date.getDay())) {
      pastDays.unshift({
        date: formatDateKey(date),
        dayLabel: DAY_LABELS[date.getDay()],
        dayIndex: date.getDay(),
        isToday: false,
        isFuture: false,
      });
    }

    daysBack++;
    if (daysBack > 365) break;
  }

  // If today matches frequency, use it as the center
  if (todayMatchesFrequency) {
    const todayDay: Omit<DayStatus, "completed"> = {
      date: todayKey,
      dayLabel: DAY_LABELS[today.getDay()],
      dayIndex: today.getDay(),
      isToday: true,
      isFuture: false,
    };

    // Get 3 future matching days (starting from tomorrow)
    const futureDays: Omit<DayStatus, "completed">[] = [];
    let daysForward = 1;
    while (futureDays.length < 3) {
      const date = new Date(today);
      date.setDate(today.getDate() + daysForward);

      if (allowedDays.includes(date.getDay())) {
        futureDays.push({
          date: formatDateKey(date),
          dayLabel: DAY_LABELS[date.getDay()],
          dayIndex: date.getDay(),
          isToday: false,
          isFuture: true,
        });
      }

      daysForward++;
      if (daysForward > 365) break;
    }

    return [...pastDays, todayDay, ...futureDays];
  }

  // If today doesn't match, find next matching day and use it as center
  // Then get 3 future days AFTER that center day
  let centerDaysForward = 1;
  while (centerDaysForward < 365) {
    const centerDate = new Date(today);
    centerDate.setDate(today.getDate() + centerDaysForward);

    if (allowedDays.includes(centerDate.getDay())) {
      const centerDateKey = formatDateKey(centerDate);
      const centerDay: Omit<DayStatus, "completed"> = {
        date: centerDateKey,
        dayLabel: DAY_LABELS[centerDate.getDay()],
        dayIndex: centerDate.getDay(),
        isToday: false,
        isFuture: true,
      };

      // Get 3 future days AFTER the center day
      const futureDays: Omit<DayStatus, "completed">[] = [];
      let daysAfterCenter = 1;
      while (futureDays.length < 3) {
        const date = new Date(centerDate);
        date.setDate(centerDate.getDate() + daysAfterCenter);

        if (allowedDays.includes(date.getDay())) {
          futureDays.push({
            date: formatDateKey(date),
            dayLabel: DAY_LABELS[date.getDay()],
            dayIndex: date.getDay(),
            isToday: false,
            isFuture: true,
          });
        }

        daysAfterCenter++;
        if (daysAfterCenter > 365) break;
      }

      return [...pastDays, centerDay, ...futureDays];
    }
    centerDaysForward++;
  }

  // Fallback (should never reach here)
  return pastDays;
};

export const getTodayKey = (): string => {
  return formatDateKey(new Date());
};

/**
 * Get all days in a specific month that match the allowed days.
 * Returns days up to today (not future days).
 */
export const getMatchingDaysForMonth = (
  year: number,
  month: number, // 0-indexed (0 = January)
  allowedDays: number[]
): Omit<DayStatus, "completed">[] => {
  const days: Omit<DayStatus, "completed">[] = [];
  const today = new Date();
  const todayKey = formatDateKey(today);

  // Get the number of days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = formatDateKey(date);

    // Don't include future days
    if (dateKey > todayKey) continue;

    if (allowedDays.includes(date.getDay())) {
      days.push({
        date: dateKey,
        dayLabel: DAY_LABELS[date.getDay()],
        dayIndex: date.getDay(),
        isToday: dateKey === todayKey,
        isFuture: false,
      });
    }
  }

  return days;
};

/**
 * Format month and year for display (e.g., "January 2026")
 */
export const formatMonthYear = (year: number, month: number): string => {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

/**
 * Get days centered on today for horizontal scrolling.
 * Returns days from the past and future with Spanish labels.
 */
export const getScrollableDays = (
  daysBefore: number = 14,
  daysAfter: number = 7
): {
  date: string;
  dayLabelShort: string;
  dayNumber: number;
  isToday: boolean;
  isFuture: boolean;
}[] => {
  const today = new Date();
  const todayKey = formatDateKey(today);

  const days = [];

  // Start from daysBefore days ago
  for (let i = -daysBefore; i <= daysAfter; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateKey = formatDateKey(date);

    days.push({
      date: dateKey,
      dayLabelShort: DAY_LABELS_SHORT_ES[date.getDay()],
      dayNumber: date.getDate(),
      isToday: dateKey === todayKey,
      isFuture: dateKey > todayKey,
    });
  }

  return days;
};

/**
 * Format date to Spanish short format (e.g., "28 ene")
 */
export const formatDateShortES = (dateKey: string): string => {
  const date = new Date(dateKey + "T12:00:00");
  const day = date.getDate();
  const months = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];
  const month = months[date.getMonth()];
  return `${day} ${month}`;
};

/**
 * Check if a date string is in the future
 */
export const isFutureDate = (dateKey: string): boolean => {
  return dateKey > formatDateKey(new Date());
};

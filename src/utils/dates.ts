import { DayStatus } from "@/src/types/habit";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat

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
      isToday: i === 0,
    });
  }

  return days;
};

export const getTodayKey = (): string => {
  return formatDateKey(new Date());
};

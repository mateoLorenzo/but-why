export interface Habit {
  id: string;
  name: string;
  color: string;
  icon: string;
  frequency: string; // "daily" | "weekdays" | "custom"
  days: number[]; // [0-6] representing Sun-Sat
  createdAt: Date;
}

export interface DayStatus {
  date: string; // YYYY-MM-DD
  completed: boolean;
  dayLabel: string; // M, T, W, T, F, S, S (English)
  dayIndex: number; // 0-6 (Sun-Sat)
  isToday: boolean;
  isFuture: boolean;
}

// Record of habitId -> { date -> completed }
export type CompletionRecord = Record<string, Record<string, boolean>>;

export interface HabitWithWeekStatus extends Habit {
  weekStatus: DayStatus[];
  currentStreak: number;
}

export interface HabitForDay extends Habit {
  completedOnDate: boolean;
  isScheduledForDate: boolean;
  currentStreak: number;
}

export interface StreakCache {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCalculatedDate: string;
}

export type DayType = 'past' | 'today' | 'future';

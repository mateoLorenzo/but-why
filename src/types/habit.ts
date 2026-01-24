export interface Habit {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface DayStatus {
  date: string; // YYYY-MM-DD
  completed: boolean;
  dayLabel: string; // M, T, W, T, F, S, S (English)
  isToday: boolean;
}

// Record of habitId -> { date -> completed }
export type CompletionRecord = Record<string, Record<string, boolean>>;

export interface HabitWithWeekStatus extends Habit {
  weekStatus: DayStatus[];
  currentStreak: number;
}

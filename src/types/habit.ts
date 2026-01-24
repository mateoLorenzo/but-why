export interface Habit {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface DayStatus {
  date: string; // YYYY-MM-DD
  completed: boolean;
  dayLabel: string; // L, M, X, J, V, S, D
  isToday: boolean;
}

export interface HabitWithWeekStatus extends Habit {
  weekStatus: DayStatus[];
  currentStreak: number;
}

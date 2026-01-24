import colors from "@/src/theme/colors";
import { HabitWithWeekStatus } from "@/src/types/habit";

export const mockHabits: HabitWithWeekStatus[] = [
  {
    id: "1",
    name: "Meditar",
    color: colors.primary[500],
    createdAt: new Date(),
    currentStreak: 5,
    weekStatus: [
      { date: "2026-01-19", dayLabel: "D", completed: true, isToday: false },
      { date: "2026-01-20", dayLabel: "L", completed: true, isToday: false },
      { date: "2026-01-21", dayLabel: "M", completed: true, isToday: false },
      { date: "2026-01-22", dayLabel: "X", completed: true, isToday: false },
      { date: "2026-01-23", dayLabel: "J", completed: true, isToday: false },
      { date: "2026-01-24", dayLabel: "V", completed: false, isToday: true },
      { date: "2026-01-25", dayLabel: "S", completed: false, isToday: false },
    ],
  },
  {
    id: "2",
    name: "Ejercicio",
    color: colors.success[600],
    createdAt: new Date(),
    currentStreak: 12,
    weekStatus: [
      { date: "2026-01-19", dayLabel: "D", completed: true, isToday: false },
      { date: "2026-01-20", dayLabel: "L", completed: true, isToday: false },
      { date: "2026-01-21", dayLabel: "M", completed: false, isToday: false },
      { date: "2026-01-22", dayLabel: "X", completed: true, isToday: false },
      { date: "2026-01-23", dayLabel: "J", completed: true, isToday: false },
      { date: "2026-01-24", dayLabel: "V", completed: false, isToday: true },
      { date: "2026-01-25", dayLabel: "S", completed: false, isToday: false },
    ],
  },
  {
    id: "3",
    name: "Leer 30 min",
    color: colors.warning[600],
    createdAt: new Date(),
    currentStreak: 3,
    weekStatus: [
      { date: "2026-01-19", dayLabel: "D", completed: false, isToday: false },
      { date: "2026-01-20", dayLabel: "L", completed: false, isToday: false },
      { date: "2026-01-21", dayLabel: "M", completed: true, isToday: false },
      { date: "2026-01-22", dayLabel: "X", completed: true, isToday: false },
      { date: "2026-01-23", dayLabel: "J", completed: true, isToday: false },
      { date: "2026-01-24", dayLabel: "V", completed: false, isToday: true },
      { date: "2026-01-25", dayLabel: "S", completed: false, isToday: false },
    ],
  },
  {
    id: "4",
    name: "Journaling",
    color: colors.info[600],
    createdAt: new Date(),
    currentStreak: 0,
    weekStatus: [
      { date: "2026-01-19", dayLabel: "D", completed: true, isToday: false },
      { date: "2026-01-20", dayLabel: "L", completed: false, isToday: false },
      { date: "2026-01-21", dayLabel: "M", completed: false, isToday: false },
      { date: "2026-01-22", dayLabel: "X", completed: true, isToday: false },
      { date: "2026-01-23", dayLabel: "J", completed: false, isToday: false },
      { date: "2026-01-24", dayLabel: "V", completed: false, isToday: true },
      { date: "2026-01-25", dayLabel: "S", completed: false, isToday: false },
    ],
  },
];

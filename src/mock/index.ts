import colors from "@/src/theme/colors";
import { CompletionRecord, Habit } from "@/src/types/habit";
import { getLastSevenDays } from "@/src/utils/dates";

export const mockHabits: Habit[] = [
  {
    id: "1",
    name: "Meditate",
    color: colors.primary[500],
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Exercise",
    color: colors.success[600],
    createdAt: new Date(),
  },
  {
    id: "3",
    name: "Read 30 min",
    color: colors.warning[600],
    createdAt: new Date(),
  },
  {
    id: "4",
    name: "Journaling",
    color: colors.info[600],
    createdAt: new Date(),
  },
];

// Generate some mock completions for the last 7 days
const generateMockCompletions = (): CompletionRecord => {
  const days = getLastSevenDays();
  const completions: CompletionRecord = {};

  mockHabits.forEach((habit) => {
    completions[habit.id] = {};
    days.forEach((day, index) => {
      // Random completions for past days, not completed for today
      if (!day.isToday) {
        completions[habit.id][day.date] = Math.random() > 0.4;
      }
    });
  });

  return completions;
};

export const mockCompletions = generateMockCompletions();

import { habitsStorage } from "@/src/storage/habits";
import {
  CompletionRecord,
  DayStatus,
  Habit,
  HabitWithWeekStatus,
  HabitForDay,
} from "@/src/types/habit";
import {
  getDaysCenteredOnToday,
  getLastNMatchingDays,
} from "@/src/utils/dates";
import { isHabitScheduledForDate } from "@/src/utils/habitFilters";
import { calculateCurrentStreak } from "@/src/utils/streakCalculator";
import { useCallback, useEffect, useMemo, useState } from "react";

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<CompletionRecord>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [loadedHabits, loadedCompletions] = await Promise.all([
        habitsStorage.getHabits(),
        habitsStorage.getCompletions(),
      ]);
      setHabits(loadedHabits);
      setCompletions(loadedCompletions);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Compute habits with week status
  const habitsWithStatus: HabitWithWeekStatus[] = useMemo(() => {
    return habits.map((habit) => {
      const habitCompletions = completions[habit.id] || {};

      // Get 3 past days + today + 3 future days (centered on today)
      const matchingDays = getDaysCenteredOnToday(habit.days);

      const weekStatus: DayStatus[] = matchingDays.map((day) => ({
        ...day,
        // Future days are always not completed
        completed: day.isFuture ? false : habitCompletions[day.date] || false,
      }));

      // Calculate streak: count consecutive completions going back from today
      // Get last 60 matching days to calculate streak properly
      const pastDays = getLastNMatchingDays(60, habit.days);
      let streak = 0;

      // pastDays is ordered [oldest, ..., newest(today)]
      // Iterate from newest to oldest
      for (let i = pastDays.length - 1; i >= 0; i--) {
        const day = pastDays[i];
        const isCompleted = habitCompletions[day.date] || false;

        if (day.isToday) {
          // Today: add to streak if completed, but don't break if not
          if (isCompleted) streak++;
        } else {
          // Past days: must be completed to continue streak
          if (isCompleted) {
            streak++;
          } else {
            // Found a gap, stop counting
            break;
          }
        }
      }

      return {
        ...habit,
        weekStatus,
        currentStreak: streak,
      };
    });
  }, [habits, completions]);

  // Add a new habit
  const addHabit = useCallback(async (habit: Omit<Habit, "id" | "createdAt">) => {
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    await habitsStorage.addHabit(newHabit);
    setHabits((prev) => [...prev, newHabit]);
    
    return newHabit;
  }, []);

  // Delete a habit
  const deleteHabit = useCallback(async (habitId: string) => {
    await habitsStorage.deleteHabit(habitId);
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    setCompletions((prev) => {
      const updated = { ...prev };
      delete updated[habitId];
      return updated;
    });
  }, []);

  // Toggle completion for a day
  const toggleCompletion = useCallback(async (habitId: string, date: string) => {
    const updated = await habitsStorage.toggleCompletion(habitId, date);
    setCompletions(updated);
  }, []);

  // Refresh data from storage
  const refresh = useCallback(async () => {
    const [loadedHabits, loadedCompletions] = await Promise.all([
      habitsStorage.getHabits(),
      habitsStorage.getCompletions(),
    ]);
    setHabits(loadedHabits);
    setCompletions(loadedCompletions);
  }, []);

  /**
   * Get habits for a specific date with completion status and streak information.
   *
   * @param dateString - Date in YYYY-MM-DD format
   * @returns Array of habits scheduled for this date with additional computed fields
   *
   * @example
   * const habitsForToday = getHabitsForDate('2026-02-01');
   * habitsForToday.forEach(habit => {
   *   console.log(`${habit.name}: ${habit.completedOnDate ? 'Done' : 'Not done'}`);
   *   console.log(`Current streak: ${habit.currentStreak}`);
   * });
   */
  const getHabitsForDate = useCallback(
    (dateString: string): HabitForDay[] => {
      // Validate YYYY-MM-DD format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        console.warn(`Invalid date format: ${dateString}. Expected YYYY-MM-DD.`);
        return [];
      }

      // Parse the date string
      const date = new Date(dateString + 'T12:00:00');

      // Validate date
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date string: ${dateString}`);
        return [];
      }

      // Map all habits to HabitForDay
      return habits
        .map((habit): HabitForDay => {
          const habitCompletions = completions[habit.id] || {};
          const isScheduledForDate = isHabitScheduledForDate(habit, date);
          const completedOnDate = habitCompletions[dateString] || false;
          const currentStreak = calculateCurrentStreak(
            habit.id,
            completions,
            habit.days
          );

          return {
            ...habit,
            isScheduledForDate,
            completedOnDate,
            currentStreak,
          };
        })
        .filter((habit) => habit.isScheduledForDate);
    },
    [habits, completions]
  );

  /**
   * Get the current streak for a specific habit.
   *
   * @param habitId - ID of the habit
   * @returns Current streak count, or 0 if habit not found
   *
   * @example
   * const streak = getStreakForHabit('habit123');
   * console.log(`Current streak: ${streak} days`);
   */
  const getStreakForHabit = useCallback(
    (habitId: string): number => {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) {
        console.warn(`Habit with id ${habitId} not found`);
        return 0;
      }
      return calculateCurrentStreak(habitId, completions, habit.days);
    },
    [habits, completions]
  );

  return {
    habits: habitsWithStatus,
    isLoading,
    addHabit,
    deleteHabit,
    toggleCompletion,
    refresh,
    getHabitsForDate,
    getStreakForHabit,
  };
};

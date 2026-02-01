import { habitsStorage } from "@/src/storage/habits";
import {
  CompletionRecord,
  DayStatus,
  Habit,
  HabitForDay,
  HabitWithWeekStatus,
} from "@/src/types/habit";
import {
  formatDateKey,
  getDaysCenteredOnToday,
  getLastNMatchingDays,
  isFutureDate,
} from "@/src/utils/dates";
import { useCallback, useEffect, useMemo, useState } from "react";

export const useHabits = (selectedDate?: string) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<CompletionRecord>({});
  const [isLoading, setIsLoading] = useState(true);

  const currentDate = selectedDate || formatDateKey(new Date());

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

  // Compute habits with week status (legacy, still used by HabitCard)
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

  // Compute habits for a specific day
  const habitsForDay: HabitForDay[] = useMemo(() => {
    const selectedDateObj = new Date(currentDate + "T12:00:00");
    const dayIndex = selectedDateObj.getDay(); // 0 = Sunday, 6 = Saturday
    const isFuture = isFutureDate(currentDate);

    return habits
      .map((habit) => {
        const habitCompletions = completions[habit.id] || {};
        const isScheduledForDay = habit.days.includes(dayIndex);
        const isCompletedForDay = isFuture
          ? false
          : habitCompletions[currentDate] || false;

        // Calculate streak
        const pastDays = getLastNMatchingDays(60, habit.days);
        let streak = 0;

        for (let i = pastDays.length - 1; i >= 0; i--) {
          const day = pastDays[i];
          const isCompleted = habitCompletions[day.date] || false;

          if (day.isToday) {
            if (isCompleted) streak++;
          } else {
            if (isCompleted) {
              streak++;
            } else {
              break;
            }
          }
        }

        return {
          ...habit,
          isCompletedForDay,
          isScheduledForDay,
          currentStreak: streak,
        };
      })
      .filter((habit) => habit.isScheduledForDay);
  }, [habits, completions, currentDate]);

  // Add a new habit
  const addHabit = useCallback(
    async (habit: Omit<Habit, "id" | "createdAt">) => {
      const newHabit: Habit = {
        ...habit,
        id: Date.now().toString(),
        createdAt: new Date(),
      };

      await habitsStorage.addHabit(newHabit);
      setHabits((prev) => [...prev, newHabit]);

      return newHabit;
    },
    []
  );

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
  const toggleCompletion = useCallback(
    async (habitId: string, date: string) => {
      const updated = await habitsStorage.toggleCompletion(habitId, date);
      setCompletions(updated);
    },
    []
  );

  // Refresh data from storage
  const refresh = useCallback(async () => {
    const [loadedHabits, loadedCompletions] = await Promise.all([
      habitsStorage.getHabits(),
      habitsStorage.getCompletions(),
    ]);
    setHabits(loadedHabits);
    setCompletions(loadedCompletions);
  }, []);

  return {
    habits: habitsWithStatus,
    habitsForDay,
    isLoading,
    addHabit,
    deleteHabit,
    toggleCompletion,
    refresh,
    selectedDate: currentDate,
  };
};

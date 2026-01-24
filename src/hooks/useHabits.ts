import { habitsStorage } from "@/src/storage/habits";
import {
  CompletionRecord,
  DayStatus,
  Habit,
  HabitWithWeekStatus,
} from "@/src/types/habit";
import { getTodayAndNextMatchingDays } from "@/src/utils/dates";
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

      // Get today + next 6 days that match this habit's frequency
      const matchingDays = getTodayAndNextMatchingDays(7, habit.days);

      const weekStatus: DayStatus[] = matchingDays.map((day) => ({
        ...day,
        // Future days are always not completed
        completed: day.isFuture ? false : habitCompletions[day.date] || false,
      }));

      // Calculate streak (count consecutive past completions)
      let streak = 0;
      // Only count today if completed
      if (weekStatus[0]?.isToday && weekStatus[0]?.completed) {
        streak = 1;
      }
      // For proper streak, we'd need to check past days - for now simplified

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

  return {
    habits: habitsWithStatus,
    isLoading,
    addHabit,
    deleteHabit,
    toggleCompletion,
    refresh,
  };
};

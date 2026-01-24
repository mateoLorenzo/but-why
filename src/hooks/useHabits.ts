import { habitsStorage } from "@/src/storage/habits";
import {
  CompletionRecord,
  DayStatus,
  Habit,
  HabitWithWeekStatus,
} from "@/src/types/habit";
import { getLastSevenDays } from "@/src/utils/dates";
import { useCallback, useEffect, useMemo, useState } from "react";

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<CompletionRecord>({});
  const [isLoading, setIsLoading] = useState(true);

  const weekDays = useMemo(() => getLastSevenDays(), []);

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

      const weekStatus: DayStatus[] = weekDays.map((day) => ({
        ...day,
        completed: habitCompletions[day.date] || false,
      }));

      // Calculate streak
      let streak = 0;
      for (let i = weekStatus.length - 1; i >= 0; i--) {
        if (weekStatus[i].completed) {
          streak++;
        } else if (!weekStatus[i].isToday) {
          break;
        }
      }

      return {
        ...habit,
        weekStatus,
        currentStreak: streak,
      };
    });
  }, [habits, completions, weekDays]);

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

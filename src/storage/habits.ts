import { CompletionRecord, Habit } from "@/src/types/habit";
import { createMMKV } from "react-native-mmkv";

const storage = createMMKV({ id: "but-why-storage" });

const HABITS_KEY = "habits";
const COMPLETIONS_KEY = "completions";

export const habitsStorage = {
  getHabits(): Habit[] {
    try {
      const data = storage.getString(HABITS_KEY);
      if (!data) return [];
      const habits = JSON.parse(data) as Habit[];
      return habits.map((h) => ({
        ...h,
        createdAt: new Date(h.createdAt),
      }));
    } catch (error) {
      console.error("Error loading habits:", error);
      return [];
    }
  },

  saveHabits(habits: Habit[]): void {
    try {
      storage.set(HABITS_KEY, JSON.stringify(habits));
    } catch (error) {
      console.error("Error saving habits:", error);
    }
  },

  addHabit(habit: Habit): void {
    const habits = this.getHabits();
    habits.push(habit);
    this.saveHabits(habits);
  },

  deleteHabit(habitId: string): void {
    const habits = this.getHabits();
    const filtered = habits.filter((h) => h.id !== habitId);
    this.saveHabits(filtered);

    const completions = this.getCompletions();
    delete completions[habitId];
    this.saveCompletions(completions);
  },

  getCompletions(): CompletionRecord {
    try {
      const data = storage.getString(COMPLETIONS_KEY);
      if (!data) return {};
      return JSON.parse(data) as CompletionRecord;
    } catch (error) {
      console.error("Error loading completions:", error);
      return {};
    }
  },

  saveCompletions(completions: CompletionRecord): void {
    try {
      storage.set(COMPLETIONS_KEY, JSON.stringify(completions));
    } catch (error) {
      console.error("Error saving completions:", error);
    }
  },

  toggleCompletion(habitId: string, date: string): CompletionRecord {
    const completions = this.getCompletions();

    if (!completions[habitId]) {
      completions[habitId] = {};
    }

    completions[habitId][date] = !completions[habitId][date];
    this.saveCompletions(completions);

    return completions;
  },

  clearAll(): void {
    try {
      storage.remove(HABITS_KEY);
      storage.remove(COMPLETIONS_KEY);
    } catch (error) {
      console.error("Error clearing data:", error);
    }
  },
};

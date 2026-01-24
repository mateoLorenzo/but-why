import AsyncStorage from "@react-native-async-storage/async-storage";
import { CompletionRecord, Habit } from "@/src/types/habit";

const HABITS_KEY = "@but_why/habits";
const COMPLETIONS_KEY = "@but_why/completions";

export const habitsStorage = {
  // Habits
  async getHabits(): Promise<Habit[]> {
    try {
      const data = await AsyncStorage.getItem(HABITS_KEY);
      if (!data) return [];
      const habits = JSON.parse(data) as Habit[];
      // Convert date strings back to Date objects
      return habits.map((h) => ({
        ...h,
        createdAt: new Date(h.createdAt),
      }));
    } catch (error) {
      console.error("Error loading habits:", error);
      return [];
    }
  },

  async saveHabits(habits: Habit[]): Promise<void> {
    try {
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    } catch (error) {
      console.error("Error saving habits:", error);
    }
  },

  async addHabit(habit: Habit): Promise<void> {
    const habits = await this.getHabits();
    habits.push(habit);
    await this.saveHabits(habits);
  },

  async deleteHabit(habitId: string): Promise<void> {
    const habits = await this.getHabits();
    const filtered = habits.filter((h) => h.id !== habitId);
    await this.saveHabits(filtered);
    
    // Also remove completions for this habit
    const completions = await this.getCompletions();
    delete completions[habitId];
    await this.saveCompletions(completions);
  },

  // Completions
  async getCompletions(): Promise<CompletionRecord> {
    try {
      const data = await AsyncStorage.getItem(COMPLETIONS_KEY);
      if (!data) return {};
      return JSON.parse(data) as CompletionRecord;
    } catch (error) {
      console.error("Error loading completions:", error);
      return {};
    }
  },

  async saveCompletions(completions: CompletionRecord): Promise<void> {
    try {
      await AsyncStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));
    } catch (error) {
      console.error("Error saving completions:", error);
    }
  },

  async toggleCompletion(
    habitId: string,
    date: string,
  ): Promise<CompletionRecord> {
    const completions = await this.getCompletions();
    
    if (!completions[habitId]) {
      completions[habitId] = {};
    }
    
    completions[habitId][date] = !completions[habitId][date];
    await this.saveCompletions(completions);
    
    return completions;
  },

  // Clear all data (for testing/reset)
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([HABITS_KEY, COMPLETIONS_KEY]);
    } catch (error) {
      console.error("Error clearing data:", error);
    }
  },
};

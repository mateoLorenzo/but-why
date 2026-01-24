import { HabitCard } from "@/src/components/habits/HabitCard";
import { mockCompletions, mockHabits } from "@/src/mock";
import colors from "@/src/theme/colors";
import { fonts } from "@/src/theme/fonts";
import {
  CompletionRecord,
  DayStatus,
  HabitWithWeekStatus,
} from "@/src/types/habit";
import { AppText as Text } from "@/src/ui/Text";
import { getLastSevenDays } from "@/src/utils/dates";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Home = () => {
  const insets = useSafeAreaInsets();
  const [completions, setCompletions] =
    useState<CompletionRecord>(mockCompletions);

  const weekDays = useMemo(() => getLastSevenDays(), []);

  const habitsWithStatus: HabitWithWeekStatus[] = useMemo(() => {
    return mockHabits.map((habit) => {
      const habitCompletions = completions[habit.id] || {};

      const weekStatus: DayStatus[] = weekDays.map((day) => ({
        ...day,
        completed: habitCompletions[day.date] || false,
      }));

      // Calculate streak (consecutive days completed ending today or yesterday)
      let streak = 0;
      for (let i = weekStatus.length - 1; i >= 0; i--) {
        if (weekStatus[i].completed) {
          streak++;
        } else if (!weekStatus[i].isToday) {
          // If it's not today and not completed, break the streak
          break;
        }
      }

      return {
        ...habit,
        weekStatus,
        currentStreak: streak,
      };
    });
  }, [completions, weekDays]);

  const handleToggleDay = (habitId: string, date: string) => {
    setCompletions((prev) => ({
      ...prev,
      [habitId]: {
        ...prev[habitId],
        [date]: !prev[habitId]?.[date],
      },
    }));
  };

  const handleAddHabit = () => {
    router.push("/create-habit");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View>
          <Text style={styles.title}>Keep going</Text>
          <Text style={styles.greeting}>Straight towards the mountains</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
          onPress={handleAddHabit}
        >
          <Ionicons name="add" size={24} color={colors.base.white} />
        </Pressable>
      </View>

      {/* Habits List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {habitsWithStatus.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="leaf-outline"
              size={48}
              color={colors.neutral[300]}
            />
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to create your first habit
            </Text>
          </View>
        ) : (
          <View style={styles.habitsList}>
            {habitsWithStatus.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggleDay={handleToggleDay}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: colors.base.white,
    shadowColor: colors.auxiliary[700],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  greeting: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.neutral[400],
    marginTop: 5,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.medium,
    color: colors.auxiliary[700],
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary[700],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  habitsList: {
    gap: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.neutral[500],
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.neutral[400],
    textAlign: "center",
  },
});

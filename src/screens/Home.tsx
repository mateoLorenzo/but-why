import { HabitCard } from "@/src/components/habits/HabitCard";
import { useHabits } from "@/src/hooks/useHabits";
import colors from "@/src/theme/colors";
import { fonts } from "@/src/theme/fonts";
import { AppText as Text } from "@/src/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Home = () => {
  const insets = useSafeAreaInsets();
  const { habits, isLoading, toggleCompletion, refresh } = useHabits();

  // Refresh habits when screen comes into focus (after creating a new habit)
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleToggleDay = async (habitId: string, date: string) => {
    await toggleCompletion(habitId, date);
  };

  const handleAddHabit = () => {
    router.push("/create-habit");
  };

  const handleEditHabit = (habitId: string) => {
    router.push(`/create-habit?id=${habitId}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.headerButtonPressed,
          ]}
          onPress={() => {
            // TODO: Open settings
          }}
        >
          <Ionicons name="settings-outline" size={24} color={colors.neutral[500]} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.title}>Keep going</Text>
          <Text style={styles.greeting}>The mountains are waiting</Text>
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
          habits.length === 0 && styles.scrollContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
          </View>
        ) : habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="list-outline"
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
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggleDay={handleToggleDay}
                onPress={() => handleEditHabit(habit.id)}
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
    paddingHorizontal: 16,
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
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  headerButtonPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.96 }],
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  greeting: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.neutral[400],
    marginTop: 2,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.semiBold,
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
  scrollContentEmpty: {
    flex: 1,
  },
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
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

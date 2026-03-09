import { AnimatedNumber } from "@/src/components/AnimatedNumber";
import colors from "@/src/theme/colors";
import { fonts } from "@/src/theme/fonts";
import { HabitWithWeekStatus } from "@/src/types/habit";
import { AppText as Text } from "@/src/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { DayIndicator } from "./DayIndicator";

interface HabitCardProps {
  habit: HabitWithWeekStatus;
  onToggleDay: (habitId: string, date: string) => void;
  onPress: () => void;
}

export const HabitCard = ({ habit, onToggleDay, onPress }: HabitCardProps) => {
  const scheduleText =
    habit.startTime && habit.endTime
      ? `${habit.startTime} - ${habit.endTime}`
      : habit.startTime
      ? `From ${habit.startTime}`
      : habit.endTime
      ? `Until ${habit.endTime}`
      : null;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { borderColor: `${habit.color}80` },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityLabel={habit.name}
      accessibilityRole="button"
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${habit.color}18` },
              ]}
            >
              <Ionicons
                name={habit.icon as keyof typeof Ionicons.glyphMap}
                size={18}
                color={habit.color}
              />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.habitName}>{habit.name}</Text>
              {scheduleText && (
                <Text style={styles.scheduleText}>{scheduleText}</Text>
              )}
            </View>
          </View>
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color={colors.text.secondary}
          />
        </View>

        <View style={styles.weekRow}>
          {habit.weekStatus.map((day) => (
            <DayIndicator
              key={day.date}
              dayLabel={day.dayLabel}
              completed={day.completed}
              isToday={day.isToday}
              isFuture={day.isFuture}
              accentColor={habit.color}
              onPress={() => onToggleDay(habit.id, day.date)}
            />
          ))}
        </View>

        {habit.currentStreak > 0 && (
          <View style={styles.streakContainer}>
            <View
              style={[
                styles.streakBadge,
                { backgroundColor: `${habit.color}18` },
              ]}
            >
              <Ionicons name="flame" size={14} color={habit.color} />
              <View style={styles.streakTextContainer}>
                <AnimatedNumber
                  value={habit.currentStreak}
                  style={[styles.streakText, { color: habit.color }]}
                />
                <Text style={[styles.streakText, { color: habit.color }]}>
                  {" "}
                  {habit.currentStreak === 1 ? "day" : "days"}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  headerTextContainer: {
    flex: 1,
    gap: 2,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  habitName: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: colors.text.primary,
  },
  scheduleText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.text.tertiary,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  streakContainer: {
    flexDirection: "row",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakText: {
    fontSize: 12,
    fontFamily: fonts.medium,
  },
});

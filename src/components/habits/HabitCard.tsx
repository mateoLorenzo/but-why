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
  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={[styles.accentBar, { backgroundColor: habit.color }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${habit.color}18` },
              ]}
            >
              <Text style={styles.iconEmoji}>{habit.icon}</Text>
            </View>
            <Text style={styles.habitName}>{habit.name}</Text>
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
              <Text style={[styles.streakText, { color: habit.color }]}>
                {habit.currentStreak}{" "}
                {habit.currentStreak === 1 ? "day" : "days"}
              </Text>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border.subtle,
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  accentBar: {
    width: 4,
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
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  iconEmoji: {
    fontSize: 18,
  },
  habitName: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: colors.text.primary,
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
  streakText: {
    fontSize: 12,
    fontFamily: fonts.medium,
  },
});

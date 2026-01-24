import colors from "@/src/theme/colors";
import { fonts } from "@/src/theme/fonts";
import { HabitWithWeekStatus } from "@/src/types/habit";
import { AppText as Text } from "@/src/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { DayIndicator } from "./DayIndicator";

interface HabitCardProps {
  habit: HabitWithWeekStatus;
}

export const HabitCard = ({ habit }: HabitCardProps) => {
  return (
    <View style={styles.container}>
      <View style={[styles.accentBar, { backgroundColor: habit.color }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.habitName}>{habit.name}</Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.neutral[400]}
          />
        </View>

        <View style={styles.weekRow}>
          {habit.weekStatus.map((day) => (
            <DayIndicator
              key={day.date}
              dayLabel={day.dayLabel}
              completed={day.completed}
              isToday={day.isToday}
              accentColor={habit.color}
            />
          ))}
        </View>

        {habit.currentStreak > 0 && (
          <View style={styles.streakContainer}>
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={14} color={colors.warning[600]} />
              <Text style={styles.streakText}>
                {habit.currentStreak}{" "}
                {habit.currentStreak === 1 ? "día" : "días"}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.base.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: colors.auxiliary[700],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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
  habitName: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: colors.auxiliary[700],
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
    backgroundColor: colors.warning[100],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.warning[700],
  },
});

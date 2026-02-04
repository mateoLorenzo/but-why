import colors from "@/src/theme/colors";
import { fonts } from "@/src/theme/fonts";
import { HabitForDay } from "@/src/types/habit";
import { AppText as Text } from "@/src/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface HabitDayCardProps {
  habit: HabitForDay;
  onToggle: () => void;
  onPress: () => void;
  isFutureDay: boolean;
}

export const HabitDayCard = ({
  habit,
  onToggle,
  onPress,
  isFutureDay,
}: HabitDayCardProps) => {
  const handleToggle = () => {
    if (isFutureDay) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  const scheduleText =
    habit.startTime && habit.endTime
      ? `${habit.startTime} - ${habit.endTime}`
      : habit.startTime
      ? habit.startTime
      : habit.endTime
      ? habit.endTime
      : null;

  const hasStreak = habit.currentStreak > 0;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { borderColor: `${habit.color}75` },
        isFutureDay && styles.containerDisabled,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      {/* Streak tag at top right */}
      {hasStreak && (
        <View
          style={[
            styles.streakTag,
            { backgroundColor: `${habit.color}20` },
          ]}
        >
          <Ionicons name="flame" size={10} color={habit.color} />
          <Text style={[styles.streakText, { color: habit.color }]}>
            {habit.currentStreak} day streak
          </Text>
        </View>
      )}

      <View style={styles.content}>
        {/* Left side: Icon + Name */}
        <View style={styles.leftSection}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${habit.color}18` },
            ]}
          >
            <Ionicons
              name={habit.icon as keyof typeof Ionicons.glyphMap}
              size={20}
              color={habit.color}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.habitName}>{habit.name}</Text>
            {scheduleText && (
              <Text style={styles.scheduleText}>{scheduleText}</Text>
            )}
          </View>
        </View>

        {/* Right side: Checkbox */}
        <Pressable
          onPress={handleToggle}
          disabled={isFutureDay}
          hitSlop={12}
          style={({ pressed }) => [
            styles.checkbox,
            habit.isCompletedForDay && {
              backgroundColor: habit.color,
              borderColor: habit.color,
            },
            isFutureDay && styles.checkboxDisabled,
            pressed && !isFutureDay && styles.checkboxPressed,
          ]}
        >
          {habit.isCompletedForDay && (
            <Ionicons name="checkmark" size={18} color={colors.base.white} />
          )}
          {isFutureDay && !habit.isCompletedForDay && (
            <Ionicons
              name="lock-closed"
              size={14}
              color={colors.text.disabled}
            />
          )}
        </Pressable>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: 10,
  },
  containerDisabled: {
    backgroundColor: colors.background.primary,
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  habitName: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.text.primary,
  },
  scheduleText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.text.tertiary,
  },
  streakTag: {
    position: "absolute",
    top: 0,
    right: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  streakText: {
    fontSize: 10,
    fontFamily: fonts.medium,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border.default,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  checkboxDisabled: {
    borderColor: colors.text.disabled,
    opacity: 0.5,
  },
  checkboxPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.9 }],
  },
});

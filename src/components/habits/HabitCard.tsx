/**
 * HabitCard Component (Redesigned)
 *
 * Simplified horizontal layout for displaying a single habit with completion toggle.
 * Used in the day-specific habit list view where each card represents one habit
 * for the selected date.
 *
 * New Layout:
 * [CircularCheckbox] [Habit Name (flex: 1)] [StreakBadge]
 *
 * Features:
 * - Circular checkbox for instant completion toggle
 * - Habit name with flexible width
 * - Streak badge showing current streak
 * - Press to edit habit details
 * - Future day protection (disabled checkbox)
 *
 * @example
 * <HabitCard
 *   habit={habitForDay}
 *   onToggleCompletion={() => toggleHabit(habitForDay.id, selectedDate)}
 *   onPress={() => editHabit(habitForDay.id)}
 *   disabled={isFutureDay}
 * />
 */

import React, { useRef, useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import { AppText as Text } from '@/src/ui/Text';
import { CircularCheckbox } from './CircularCheckbox';
import { StreakBadge } from './StreakBadge';
import { HabitForDay } from '@/src/types/habit';
import colors from '@/src/theme/colors';
import { typography } from '@/src/theme/fonts';
import { borderRadius, opacity, spacing, reanimatedConfig } from '@/src/theme/tokens';

interface HabitCardProps {
  habit: HabitForDay;
  onToggleCompletion: () => void;
  onPress?: () => void;
  disabled?: boolean;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onToggleCompletion,
  onPress,
  disabled = false,
}) => {
  const cardScale = useSharedValue(1);
  const prevCompleted = useRef(habit.completedOnDate);

  /**
   * Trigger pulse animation when habit is completed
   */
  useEffect(() => {
    // Only pulse when transitioning from uncompleted to completed
    if (habit.completedOnDate && !prevCompleted.current) {
      cardScale.value = withSequence(
        withTiming(1.015, { duration: 100 }),
        withSpring(1, { damping: 10, stiffness: 300 })
      );
    }
    prevCompleted.current = habit.completedOnDate;
  }, [habit.completedOnDate]);

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }],
    };
  });

  return (
    <Animated.View style={animatedCardStyle}>
      <Pressable
        style={({ pressed }) => [
          styles.container,
          pressed && styles.containerPressed,
        ]}
        onPress={onPress}
        disabled={!onPress}
      >
        {/* Circular checkbox for completion */}
        <CircularCheckbox
          checked={habit.completedOnDate}
          onToggle={onToggleCompletion}
          accentColor={habit.color}
          size="md"
          disabled={disabled}
        />

        {/* Habit name - takes up remaining space */}
        <View style={styles.nameContainer}>
          <Text style={styles.habitName} numberOfLines={1}>
            {habit.name}
          </Text>
        </View>

        {/* Streak badge - only shown if streak > 0 */}
        {habit.currentStreak > 0 && (
          <StreakBadge
            count={habit.currentStreak}
            variant="inline"
            size="sm"
          />
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  containerPressed: {
    opacity: opacity.pressed,
  },
  nameContainer: {
    flex: 1,
  },
  habitName: {
    ...typography.headline,
    color: colors.text.primary,
  },
});

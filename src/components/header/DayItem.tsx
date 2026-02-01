/**
 * DayItem Component
 *
 * Individual day button within the DayNavigator with press animation.
 * Displays day label (Spanish) and day number with highlighted states for today/selected.
 *
 * Features:
 * - Spanish day labels (D, L, M, X, J, V, S)
 * - Animated press feedback with Reanimated spring
 * - Haptic feedback on press
 * - Highlighted state for today or selected day
 * - Disabled appearance for future dates
 *
 * @example
 * <DayItem
 *   dayLabel="L"
 *   dayNumber={5}
 *   isToday={false}
 *   isSelected={true}
 *   isFuture={false}
 *   onPress={() => console.log('Day selected')}
 * />
 */

import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AppText as Text } from '@/src/ui/Text';
import colors from '@/src/theme/colors';
import { typography } from '@/src/theme/fonts';

export interface DayItemProps {
  dayLabel: string;                  // L, M, X, etc. (Spanish)
  dayNumber: number;                 // 1-31
  isToday: boolean;
  isSelected: boolean;
  isFuture: boolean;
  onPress: () => void;
}

/**
 * Spring animation configuration for press feedback
 * Creates bouncy, responsive feel on interaction
 */
const springConfig: WithSpringConfig = {
  damping: 12,
  stiffness: 200,
  mass: 0.8,
};

export const DayItem: React.FC<DayItemProps> = ({
  dayLabel,
  dayNumber,
  isToday,
  isSelected,
  isFuture,
  onPress,
}) => {
  // Shared value for press animation
  const scale = useSharedValue(1);

  // Determine if this day should be highlighted
  const isHighlighted = isToday || isSelected;

  /**
   * Animated style for press feedback
   * Scales down to 0.92 on press, springs back to 1
   */
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  /**
   * Handle press with haptic feedback
   * Provides tactile confirmation of interaction
   */
  const handlePress = async () => {
    if (isFuture) return;

    // Trigger light haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Call the onPress callback
    onPress();
  };

  /**
   * Handle press in - start press animation
   */
  const handlePressIn = () => {
    if (!isFuture) {
      scale.value = withSpring(0.92, springConfig);
    }
  };

  /**
   * Handle press out - reset animation
   */
  const handlePressOut = () => {
    if (!isFuture) {
      scale.value = withSpring(1, springConfig);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isFuture}
      style={[styles.container, isFuture && styles.containerFuture]}
    >
      <Animated.View
        style={[
          styles.content,
          isHighlighted && styles.contentHighlighted,
          animatedStyle,
        ]}
      >
        {/* Day label (L, M, X, etc.) */}
        <Text
          style={[
            styles.dayLabel,
            isHighlighted && styles.dayLabelHighlighted,
          ]}
        >
          {dayLabel}
        </Text>

        {/* Day number (1-31) */}
        <Text
          style={[
            styles.dayNumber,
            isHighlighted && styles.dayNumberHighlighted,
          ]}
        >
          {dayNumber}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    // Wrapper for pressable area
  },
  containerFuture: {
    opacity: 0.35,
  },
  content: {
    width: 44,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    backgroundColor: 'transparent',
  },
  contentHighlighted: {
    backgroundColor: colors.accent.primary,
  },
  dayLabel: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
    fontFamily: typography.footnote.fontFamily,
    color: colors.text.secondary,
  },
  dayLabelHighlighted: {
    color: colors.text.primary,
  },
  dayNumber: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0,
    fontFamily: typography.body.fontFamily,
    color: colors.text.primary,
  },
  dayNumberHighlighted: {
    color: colors.text.primary,
    fontWeight: '600',
  },
});

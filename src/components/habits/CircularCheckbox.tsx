/**
 * CircularCheckbox Component
 *
 * Animated circular checkbox for habit completion tracking.
 * Features smooth animations and haptic feedback for excellent user experience.
 *
 * Features:
 * - Three sizes: sm (24px), md (32px), lg (40px)
 * - Smooth spring animations on state change
 * - Haptic feedback (success notification when checked)
 * - Checkmark icon when checked, lock icon when disabled
 * - Customizable accent color
 * - Future date protection with disabled state
 *
 * Animation sequence on check:
 * 1. Scale bounce: 1 -> 1.15 -> 1 (spring)
 * 2. Fill animation: transparent -> accent color (spring)
 * 3. Checkmark: scale from 0.3 -> 1.1 -> 1, fade in (spring)
 * 4. Haptic: success notification
 *
 * @example
 * <CircularCheckbox
 *   checked={false}
 *   onToggle={() => handleToggle()}
 *   accentColor="#3B82F6"
 *   size="md"
 *   disabled={false}
 * />
 */

import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/src/theme/colors';
import { reanimatedConfig } from '@/src/theme/tokens';

export interface CircularCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  accentColor?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

/**
 * Size configuration for different checkbox sizes
 */
const SIZE_CONFIG = {
  sm: {
    diameter: 24,
    borderWidth: 2,
    iconSize: 14,
  },
  md: {
    diameter: 32,
    borderWidth: 2.5,
    iconSize: 18,
  },
  lg: {
    diameter: 40,
    borderWidth: 3,
    iconSize: 22,
  },
} as const;

export const CircularCheckbox: React.FC<CircularCheckboxProps> = ({
  checked,
  onToggle,
  accentColor = colors.accent.primary,
  size = 'md',
  disabled = false,
}) => {
  // Shared values for animations
  const scale = useSharedValue(1);
  const fillProgress = useSharedValue(checked ? 1 : 0);
  const checkScale = useSharedValue(checked ? 1 : 0.3);
  const checkOpacity = useSharedValue(checked ? 1 : 0);

  // Get size configuration
  const sizeConfig = SIZE_CONFIG[size];

  /**
   * Update animations when checked state changes
   */
  useEffect(() => {
    if (checked) {
      // Bounce animation sequence
      scale.value = withSpring(1.15, reanimatedConfig.spring.completion, (finished) => {
        if (finished) {
          scale.value = withSpring(1, reanimatedConfig.spring.completion);
        }
      });

      // Fill the circle
      fillProgress.value = withSpring(1, reanimatedConfig.spring.completion);

      // Animate checkmark
      checkScale.value = withSpring(1.1, reanimatedConfig.spring.completion, (finished) => {
        if (finished) {
          checkScale.value = withSpring(1, reanimatedConfig.spring.completion);
        }
      });
      checkOpacity.value = withTiming(1, reanimatedConfig.timing.fast);
    } else {
      // Reset animations
      scale.value = withSpring(1, reanimatedConfig.spring.completion);
      fillProgress.value = withSpring(0, reanimatedConfig.spring.completion);
      checkScale.value = withSpring(0.3, reanimatedConfig.spring.completion);
      checkOpacity.value = withTiming(0, reanimatedConfig.timing.fast);
    }
  }, [checked]);

  /**
   * Container animated style - handles bounce on check
   */
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  /**
   * Fill animated style - handles background color fill
   */
  const fillAnimatedStyle = useAnimatedStyle(() => {
    const bgColor = interpolateColor(
      fillProgress.value,
      [0, 1],
      ['transparent', accentColor],
    );
    const borderColorValue = interpolateColor(
      fillProgress.value,
      [0, 1],
      [colors.border.default, accentColor],
    );
    return {
      backgroundColor: bgColor,
      borderColor: borderColorValue,
    };
  });

  /**
   * Checkmark animated style - handles scale and opacity
   */
  const checkmarkAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: checkScale.value }],
      opacity: checkOpacity.value,
    };
  });

  /**
   * Handle toggle with haptic feedback
   */
  const handlePress = async () => {
    if (disabled) return;

    // Trigger success haptic when checking (not when unchecking)
    if (!checked) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Call the toggle callback
    onToggle();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={[styles.pressable, disabled && styles.pressableDisabled]}
      hitSlop={8}
    >
      <Animated.View
        style={[
          styles.container,
          {
            width: sizeConfig.diameter,
            height: sizeConfig.diameter,
            borderRadius: sizeConfig.diameter / 2,
            borderWidth: sizeConfig.borderWidth,
          },
          fillAnimatedStyle,
          containerAnimatedStyle,
        ]}
      >
        {checked && !disabled && (
          <Animated.View style={checkmarkAnimatedStyle}>
            <Ionicons
              name="checkmark"
              size={sizeConfig.iconSize}
              color={colors.text.primary}
            />
          </Animated.View>
        )}

        {disabled && (
          <Ionicons
            name="lock-closed"
            size={sizeConfig.iconSize - 2}
            color={colors.text.tertiary}
          />
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    // Wrapper for touch area
  },
  pressableDisabled: {
    opacity: 0.35,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

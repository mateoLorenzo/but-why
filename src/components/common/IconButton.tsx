/**
 * IconButton Component
 *
 * A reusable icon button component for header actions and interactive elements.
 *
 * Features:
 * - Three variants: default (dark bg), primary (blue bg), ghost (transparent)
 * - Three sizes: sm (32x32), md (40x40), lg (48x48)
 * - Press animation with scale effect
 * - Haptic feedback on press
 * - Accessibility compliant with minimum 44x44 touch targets
 * - Uses Ionicons from @expo/vector-icons
 *
 * @example
 * <IconButton
 *   icon="add"
 *   onPress={() => console.log('pressed')}
 *   variant="primary"
 *   size="md"
 *   accessibilityLabel="Add new item"
 * />
 */

import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import colors from '../../theme/colors';

export interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: 'default' | 'primary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  backgroundColor?: string;
  disabled?: boolean;
  accessibilityLabel: string;
  testID?: string;
}

/**
 * Size configuration for icon buttons
 * Ensures proper touch targets and visual consistency
 */
const SIZE_CONFIG = {
  sm: {
    iconSize: 18,
    touchTarget: 32,
    padding: 7, // (32 - 18) / 2
  },
  md: {
    iconSize: 22,
    touchTarget: 40,
    padding: 9, // (40 - 22) / 2
  },
  lg: {
    iconSize: 26,
    touchTarget: 48,
    padding: 11, // (48 - 26) / 2
  },
} as const;

/**
 * Variant color configuration
 * Defines background and icon colors for each variant
 */
const VARIANT_CONFIG = {
  default: {
    backgroundColor: colors.background.secondary,
    iconColor: colors.text.primary,
  },
  primary: {
    backgroundColor: colors.accent.primary,
    iconColor: colors.text.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    iconColor: colors.text.secondary,
  },
} as const;

/**
 * Spring animation configuration for smooth press feedback
 */
const springConfig: WithSpringConfig = {
  damping: 12,
  stiffness: 200,
  mass: 0.3,
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  variant = 'default',
  size = 'md',
  color,
  backgroundColor,
  disabled = false,
  accessibilityLabel,
  testID,
}) => {
  // Shared value for press animation
  const scale = useSharedValue(1);

  // Get size configuration
  const sizeConfig = SIZE_CONFIG[size];

  // Get variant configuration
  const variantConfig = VARIANT_CONFIG[variant];

  // Use custom colors if provided, otherwise use variant defaults
  const finalBackgroundColor = backgroundColor || variantConfig.backgroundColor;
  const finalIconColor = color || variantConfig.iconColor;

  /**
   * Animated style for press feedback
   * Scales down to 0.9 on press for tactile feel
   */
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  /**
   * Handle press with haptic feedback
   * Provides physical feedback for better user experience
   */
  const handlePress = async () => {
    if (disabled) return;

    // Trigger haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Call the onPress callback
    onPress();
  };

  /**
   * Handle press in - start press animation
   */
  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.9, springConfig);
    }
  };

  /**
   * Handle press out - reset animation
   */
  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1, springConfig);
    }
  };

  /**
   * Generate dynamic styles based on size and variant
   */
  const buttonStyle: ViewStyle = {
    width: sizeConfig.touchTarget,
    height: sizeConfig.touchTarget,
    borderRadius: sizeConfig.touchTarget / 2, // Fully rounded
    backgroundColor: finalBackgroundColor,
    padding: sizeConfig.padding,
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      testID={testID}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={[styles.container, disabled && styles.disabled]}
      // Ensure minimum 44x44 touch target for accessibility
      hitSlop={{
        top: Math.max(0, (44 - sizeConfig.touchTarget) / 2),
        bottom: Math.max(0, (44 - sizeConfig.touchTarget) / 2),
        left: Math.max(0, (44 - sizeConfig.touchTarget) / 2),
        right: Math.max(0, (44 - sizeConfig.touchTarget) / 2),
      }}
    >
      <Animated.View style={[styles.button, buttonStyle, animatedStyle]}>
        <Ionicons
          name={icon}
          size={sizeConfig.iconSize}
          color={finalIconColor}
        />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    // Container to handle touch feedback
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});

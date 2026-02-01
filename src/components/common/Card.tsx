/**
 * Base Card Component
 *
 * A reusable card component with dark theme styling, subtle borders,
 * and optional press handling with smooth animations.
 *
 * Features:
 * - Three variants: elevated (with shadow), outlined (transparent), and filled (solid)
 * - Smooth press animations using Reanimated
 * - Consistent spacing and border radius
 * - Accessibility support with proper touch targets
 *
 * @example
 * <Card variant="elevated" onPress={() => console.log('pressed')}>
 *   <Text>Card Content</Text>
 * </Card>
 */

import React from 'react';
import { Pressable, StyleProp, ViewStyle, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from 'react-native-reanimated';
import colors from '../../theme/colors';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Spring animation configuration for smooth, natural-feeling animations
 */
const springConfig: WithSpringConfig = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  onPress,
  disabled = false,
  style,
  testID,
}) => {
  // Shared values for press animation
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  /**
   * Animated style for press feedback
   * Applies subtle scale and opacity changes on press
   */
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  /**
   * Handle press in - start press animation
   */
  const handlePressIn = () => {
    if (!disabled && onPress) {
      scale.value = withSpring(0.98, springConfig);
      opacity.value = withSpring(0.9, springConfig);
    }
  };

  /**
   * Handle press out - reset animation
   */
  const handlePressOut = () => {
    if (!disabled && onPress) {
      scale.value = withSpring(1, springConfig);
      opacity.value = withSpring(1, springConfig);
    }
  };

  /**
   * Get variant-specific styles based on the variant prop
   */
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return styles.elevated;
      case 'outlined':
        return styles.outlined;
      case 'filled':
        return styles.filled;
      default:
        return styles.elevated;
    }
  };

  // If card is interactive (has onPress), wrap in Pressable
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        testID={testID}
        accessible={true}
        accessibilityRole="button"
        style={[styles.container, disabled && styles.disabled]}
      >
        <Animated.View
          style={[
            styles.base,
            getVariantStyle(),
            animatedStyle,
            style,
          ]}
        >
          {children}
        </Animated.View>
      </Pressable>
    );
  }

  // Static card without press handling
  return (
    <View
      testID={testID}
      style={[styles.container]}
    >
      <View
        style={[
          styles.base,
          getVariantStyle(),
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Ensure touch target is properly sized
    width: '100%',
  },
  base: {
    borderRadius: 12,
    padding: 16,
  },
  elevated: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 4,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  filled: {
    backgroundColor: colors.background.secondary,
    borderWidth: 0,
  },
  disabled: {
    opacity: 0.5,
  },
});

/**
 * useCompletionAnimation Hook
 *
 * Consolidates all completion animation logic for habit checkboxes.
 * This hook manages the complex multi-stage animation sequence that occurs
 * when a user completes a habit, including scale bounce, fill animation,
 * checkmark reveal, and particle effects.
 *
 * Animation Sequence:
 * 1. Container bounce: 1 -> 1.15 -> 1 (spring)
 * 2. Fill progress: transparent -> accent color (interpolated)
 * 3. Checkmark scale: 0.3 -> 1.1 -> 1 with fade in
 * 4. Particle burst: 8 particles radiating outward
 * 5. Haptic feedback: success notification on complete
 *
 * @example
 * const {
 *   containerStyle,
 *   fillStyle,
 *   checkStyle,
 *   showParticles,
 *   triggerComplete,
 *   triggerUncomplete,
 *   setCheckedState,
 * } = useCompletionAnimation({ accentColor: '#3B82F6' });
 *
 * // Trigger completion animation
 * triggerComplete();
 *
 * // Or set state without animation
 * setCheckedState(true);
 */

import { useSharedValue, useAnimatedStyle, withSequence, withSpring, withTiming, interpolateColor, withDelay, cancelAnimation } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useCallback, useState, useEffect } from 'react';
import { reanimatedConfig } from '../../theme/tokens';
import colors from '../../theme/colors';

interface UseCompletionAnimationOptions {
  accentColor: string;
}

export function useCompletionAnimation({ accentColor }: UseCompletionAnimationOptions) {
  const [showParticles, setShowParticles] = useState(false);

  // Shared values for animations
  const scale = useSharedValue(1);
  const fillProgress = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0.3);

  /**
   * Cleanup animations on unmount to prevent memory leaks
   */
  useEffect(() => {
    return () => {
      cancelAnimation(scale);
      cancelAnimation(fillProgress);
      cancelAnimation(checkOpacity);
      cancelAnimation(checkScale);
    };
  }, []);

  /**
   * Animated style for the container - handles bounce effect
   */
  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  /**
   * Animated style for the fill - handles background color interpolation
   */
  const fillStyle = useAnimatedStyle(() => {
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
   * Animated style for the checkmark - handles scale and opacity
   */
  const checkStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: checkScale.value }],
      opacity: checkOpacity.value,
    };
  });

  /**
   * Trigger complete animation sequence
   * Includes haptic feedback and particle effect
   *
   * Animation Timeline:
   * - Phase 1: Scale bounce (0-200ms)
   * - Phase 2: Fill animation (starts immediately, overlaps)
   * - Phase 3: Checkmark appear (delayed 100ms)
   * - Phase 4: Particles (show for 500ms total)
   */
  const triggerComplete = useCallback(() => {
    // Haptic feedback (don't await, let animation start immediately)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Phase 1: Scale bounce (0-200ms)
    scale.value = withSequence(
      withTiming(1.15, { duration: 100 }),
      withSpring(1, reanimatedConfig.spring.completion)
    );

    // Phase 2: Fill animation (starts immediately, overlaps)
    fillProgress.value = withSpring(1, reanimatedConfig.spring.completion);

    // Phase 3: Checkmark appear (delayed 100ms)
    checkOpacity.value = withDelay(
      100,
      withTiming(1, { duration: 150 })
    );
    checkScale.value = withDelay(
      100,
      withSequence(
        withSpring(1.1, { damping: 8, stiffness: 300 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      )
    );

    // Phase 4: Particles (show for 500ms total)
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 500);
  }, [accentColor]);

  /**
   * Trigger uncomplete animation sequence
   * Reverses the completion animation
   */
  const triggerUncomplete = useCallback(async () => {
    // Light haptic for unchecking
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Reset animations
    scale.value = withSpring(1, reanimatedConfig.spring.completion);
    fillProgress.value = withSpring(0, reanimatedConfig.spring.completion);
    checkScale.value = withSpring(0.3, reanimatedConfig.spring.completion);
    checkOpacity.value = withTiming(0, { duration: 100 });
  }, []);

  /**
   * Set checked state immediately without animation
   * Useful for initial state or when loading from storage
   *
   * @param checked - Whether the checkbox should be checked
   */
  const setCheckedState = useCallback((checked: boolean) => {
    scale.value = 1;
    fillProgress.value = checked ? 1 : 0;
    checkScale.value = checked ? 1 : 0.3;
    checkOpacity.value = checked ? 1 : 0;
  }, []);

  return {
    containerStyle,
    fillStyle,
    checkStyle,
    showParticles,
    triggerComplete,
    triggerUncomplete,
    setCheckedState,
  };
}

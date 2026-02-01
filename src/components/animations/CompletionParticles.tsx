/**
 * CompletionParticles Component
 *
 * Renders a burst of 8 particles that radiate outward from the center
 * when a habit is completed. Creates a satisfying visual celebration
 * of the completion action.
 *
 * Animation Details:
 * - 8 particles arranged in a circle (45° apart)
 * - Each particle bursts outward 30-50px
 * - Stagger delay of 20ms between particles
 * - Fade out over 250-400ms
 * - Uses Reanimated for 60fps performance
 *
 * @example
 * <CompletionParticles
 *   trigger={showParticles}
 *   color="#3B82F6"
 *   onComplete={() => setShowParticles(false)}
 * />
 */

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { reanimatedConfig } from '@/src/theme/tokens';

interface CompletionParticlesProps {
  trigger: boolean;
  color: string;
  onComplete?: () => void;
}

const PARTICLE_COUNT = 8;
const PARTICLE_SIZE = 4;
const BURST_DISTANCE = 40;
const STAGGER_DELAY = reanimatedConfig.stagger.particle;
const ANIMATION_DURATION = 300;

/**
 * Single particle component that animates outward from center
 */
const Particle: React.FC<{
  angle: number;
  color: string;
  trigger: boolean;
  delay: number;
}> = ({ angle, color, trigger, delay }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    if (trigger) {
      // Calculate target position based on angle
      const radians = (angle * Math.PI) / 180;
      const targetX = Math.cos(radians) * BURST_DISTANCE;
      const targetY = Math.sin(radians) * BURST_DISTANCE;

      // Animate outward
      translateX.value = withDelay(
        delay,
        withTiming(targetX, { duration: ANIMATION_DURATION })
      );
      translateY.value = withDelay(
        delay,
        withTiming(targetY, { duration: ANIMATION_DURATION })
      );

      // Fade in then out
      opacity.value = withDelay(
        delay,
        withTiming(1, { duration: 100 }, (finished) => {
          if (finished) {
            opacity.value = withTiming(0, { duration: 250 });
          }
        })
      );

      // Scale up
      scale.value = withDelay(
        delay,
        withTiming(1, { duration: 200 })
      );
    } else {
      // Reset
      translateX.value = 0;
      translateY.value = 0;
      opacity.value = 0;
      scale.value = 0.5;
    }
  }, [trigger, angle, delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: color,
          width: PARTICLE_SIZE,
          height: PARTICLE_SIZE,
          borderRadius: PARTICLE_SIZE / 2,
        },
        animatedStyle,
      ]}
    />
  );
};

/**
 * Container component that manages all particles
 */
export const CompletionParticles: React.FC<CompletionParticlesProps> = ({
  trigger,
  color,
  onComplete,
}) => {
  useEffect(() => {
    if (trigger && onComplete) {
      // Call onComplete after animation finishes (500ms total as per spec)
      const timeout = setTimeout(() => {
        onComplete();
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [trigger, onComplete]);

  // Generate angles for particles (evenly distributed in a circle)
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (360 / PARTICLE_COUNT) * i;
    const delay = i * STAGGER_DELAY;
    return { angle, delay, key: i };
  });

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map(({ angle, delay, key }) => (
        <Particle
          key={key}
          angle={angle}
          color={color}
          trigger={trigger}
          delay={delay}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
  },
});

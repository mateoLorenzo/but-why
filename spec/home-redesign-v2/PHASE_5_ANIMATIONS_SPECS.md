# Phase 5: Animation and Polish Specifications

## Overview

This phase implements premium, satisfying animations throughout the app using react-native-reanimated v4.1.1 (already installed). The goal is to create a professional, motivating user experience without being childish or excessive.

---

## 5.1 Dependencies Confirmation

**Already installed (no new packages needed):**
- `react-native-reanimated`: ^4.1.1
- `react-native-gesture-handler`: ^2.28.0
- `expo-haptics`: (for tactile feedback)

---

## 5.2 Animation Tokens

**File:** `src/theme/tokens.ts` (additions)

```typescript
export const reanimatedConfig = {
  // Spring configurations
  spring: {
    gentle: { damping: 20, stiffness: 150, mass: 1 },
    bouncy: { damping: 10, stiffness: 200, mass: 0.8 },
    stiff: { damping: 25, stiffness: 300, mass: 1 },
    completion: { damping: 12, stiffness: 200, mass: 0.8 },
    navigation: { damping: 15, stiffness: 150, mass: 1 },
  },

  // Timing configurations (in milliseconds)
  timing: {
    fast: { duration: 150 },
    normal: { duration: 200 },
    slow: { duration: 300 },
    emphasize: { duration: 400 },
  },

  // Stagger delays for sequential animations
  stagger: {
    card: 50,      // Between habit cards
    particle: 20,  // Between confetti particles
    day: 30,       // Between day items
  },
} as const;

export type SpringConfig = typeof reanimatedConfig.spring[keyof typeof reanimatedConfig.spring];
export type TimingConfig = typeof reanimatedConfig.timing[keyof typeof reanimatedConfig.timing];
```

---

## 5.3 Habit Completion Animation

### Animation Sequence (Total: ~500ms)

This is the core "satisfying" animation when a user marks a habit complete.

```
Timeline:
0ms      100ms     200ms     300ms     400ms     500ms
|---------|---------|---------|---------|---------|
[=== SCALE BOUNCE ===]
     [===== FILL ANIMATION =====]
          [===== CHECKMARK APPEAR =====]
                    [===== PARTICLE BURST =====]
[HAPTIC]
```

### Phase 1: Scale Bounce (0-200ms)

```typescript
// In CircularCheckbox.tsx
const scale = useSharedValue(1);

const triggerBounce = () => {
  scale.value = withSequence(
    withTiming(1.15, { duration: 100 }),
    withSpring(1, { damping: 10, stiffness: 300 })
  );
};

const animatedContainerStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));
```

### Phase 2: Fill Animation (50-250ms)

```typescript
const fillProgress = useSharedValue(0);
const backgroundColor = useSharedValue('transparent');

const triggerFill = (accentColor: string) => {
  fillProgress.value = withSpring(1, {
    damping: 12,
    stiffness: 200,
    mass: 0.8,
  });
  backgroundColor.value = withTiming(accentColor, { duration: 200 });
};

const animatedFillStyle = useAnimatedStyle(() => ({
  backgroundColor: backgroundColor.value,
  transform: [{ scale: fillProgress.value }],
}));
```

### Phase 3: Checkmark Appear (100-350ms)

```typescript
const checkOpacity = useSharedValue(0);
const checkScale = useSharedValue(0.3);

const triggerCheckmark = () => {
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
};

const animatedCheckStyle = useAnimatedStyle(() => ({
  opacity: checkOpacity.value,
  transform: [{ scale: checkScale.value }],
}));
```

### Phase 4: Particle Burst (200-500ms)

**File:** `src/components/animations/CompletionParticles.tsx`

Create 8 particles that burst outward from the checkbox center:

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { View, StyleSheet } from 'react-native';

interface Particle {
  x: Animated.SharedValue<number>;
  y: Animated.SharedValue<number>;
  opacity: Animated.SharedValue<number>;
  scale: Animated.SharedValue<number>;
}

const NUM_PARTICLES = 8;
const PARTICLE_SIZE = 6;
const BURST_DISTANCE = 35;

export function CompletionParticles({
  trigger,
  color,
  onComplete
}: {
  trigger: boolean;
  color: string;
  onComplete?: () => void;
}) {
  const particles: Particle[] = useMemo(() =>
    Array(NUM_PARTICLES).fill(null).map(() => ({
      x: useSharedValue(0),
      y: useSharedValue(0),
      opacity: useSharedValue(0),
      scale: useSharedValue(0),
    })),
  []);

  useEffect(() => {
    if (trigger) {
      particles.forEach((particle, i) => {
        const angle = (i / NUM_PARTICLES) * Math.PI * 2;
        const delay = i * 20; // Stagger

        // Reset
        particle.x.value = 0;
        particle.y.value = 0;
        particle.opacity.value = 0;
        particle.scale.value = 0;

        // Animate outward
        particle.x.value = withDelay(
          delay,
          withSpring(Math.cos(angle) * BURST_DISTANCE, { damping: 15 })
        );
        particle.y.value = withDelay(
          delay,
          withSpring(Math.sin(angle) * BURST_DISTANCE, { damping: 15 })
        );
        particle.opacity.value = withDelay(delay, withTiming(1, { duration: 100 }));
        particle.scale.value = withDelay(
          delay,
          withSequence(
            withSpring(1.2, { damping: 10 }),
            withSpring(0.8, { damping: 12 })
          )
        );

        // Fade out
        particle.opacity.value = withDelay(
          delay + 250,
          withTiming(0, { duration: 150 }, (finished) => {
            if (finished && i === NUM_PARTICLES - 1 && onComplete) {
              runOnJS(onComplete)();
            }
          })
        );
      });
    }
  }, [trigger]);

  return (
    <View style={styles.particleContainer} pointerEvents="none">
      {particles.map((particle, i) => (
        <AnimatedParticle key={i} particle={particle} color={color} />
      ))}
    </View>
  );
}

function AnimatedParticle({ particle, color }: { particle: Particle; color: string }) {
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: particle.x.value },
      { translateY: particle.y.value },
      { scale: particle.scale.value },
    ],
    opacity: particle.opacity.value,
  }));

  return (
    <Animated.View style={[styles.particle, { backgroundColor: color }, style]} />
  );
}

const styles = StyleSheet.create({
  particleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    width: PARTICLE_SIZE,
    height: PARTICLE_SIZE,
    borderRadius: PARTICLE_SIZE / 2,
  },
});
```

### Card Pulse Effect

When habit is completed, the parent HabitCard should have a subtle pulse:

```typescript
// In HabitCard.tsx
const cardScale = useSharedValue(1);

const handleCompletion = () => {
  cardScale.value = withSequence(
    withTiming(1.015, { duration: 100 }),
    withSpring(1, { damping: 10, stiffness: 300 })
  );
};

const animatedCardStyle = useAnimatedStyle(() => ({
  transform: [{ scale: cardScale.value }],
}));
```

### Haptic Feedback

```typescript
import * as Haptics from 'expo-haptics';

// On completion
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// On uncompletion
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
```

---

## 5.4 useCompletionAnimation Hook

**File:** `src/hooks/animations/useCompletionAnimation.ts`

Consolidate all completion animation logic:

```typescript
import { useSharedValue, useAnimatedStyle, withSequence, withSpring, withTiming, withDelay } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import { reanimatedConfig } from '../../theme/tokens';

interface UseCompletionAnimationOptions {
  accentColor: string;
}

export function useCompletionAnimation({ accentColor }: UseCompletionAnimationOptions) {
  const [showParticles, setShowParticles] = useState(false);

  // Shared values
  const scale = useSharedValue(1);
  const fillProgress = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0.3);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    backgroundColor: fillProgress.value === 1 ? accentColor : 'transparent',
    transform: [{ scale: fillProgress.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }],
  }));

  // Trigger completion animation
  const triggerComplete = useCallback(() => {
    // Haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Scale bounce
    scale.value = withSequence(
      withTiming(1.15, { duration: 100 }),
      withSpring(1, reanimatedConfig.spring.bouncy)
    );

    // Fill
    fillProgress.value = withSpring(1, reanimatedConfig.spring.completion);

    // Checkmark
    checkOpacity.value = withDelay(100, withTiming(1, { duration: 150 }));
    checkScale.value = withDelay(
      100,
      withSequence(
        withSpring(1.1, { damping: 8 }),
        withSpring(1, { damping: 12 })
      )
    );

    // Particles
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 500);
  }, [accentColor]);

  // Trigger uncomplete animation
  const triggerUncomplete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    fillProgress.value = withTiming(0, reanimatedConfig.timing.fast);
    checkOpacity.value = withTiming(0, reanimatedConfig.timing.fast);
    checkScale.value = withTiming(0.3, reanimatedConfig.timing.fast);
  }, []);

  // Set initial state (for mounting with checked=true)
  const setCheckedState = useCallback((checked: boolean) => {
    fillProgress.value = checked ? 1 : 0;
    checkOpacity.value = checked ? 1 : 0;
    checkScale.value = checked ? 1 : 0.3;
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
```

---

## 5.5 Day Navigation Animations

### Day Selection Indicator

Animated pill that slides between selected days:

```typescript
// In DayNavigator.tsx
const indicatorX = useSharedValue(0);
const DAY_WIDTH = 44;
const DAY_GAP = 8;

// When selected index changes
useEffect(() => {
  const targetX = selectedIndex * (DAY_WIDTH + DAY_GAP);
  indicatorX.value = withSpring(targetX, reanimatedConfig.spring.navigation);
}, [selectedIndex]);

const indicatorStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: indicatorX.value }],
}));

// Render animated indicator behind day items
<Animated.View style={[styles.selectionIndicator, indicatorStyle]} />
```

### Today Pulse Animation (Subtle)

```typescript
// Subtle breathing animation for "today" indicator
const todayScale = useSharedValue(1);

useEffect(() => {
  todayScale.value = withRepeat(
    withSequence(
      withTiming(1.05, { duration: 1500 }),
      withTiming(1, { duration: 1500 })
    ),
    -1, // infinite
    true // reverse
  );
}, []);
```

---

## 5.6 Day Transition Animation

When navigating between days, habits should slide/fade:

```typescript
// In Home.tsx
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  Layout,
} from 'react-native-reanimated';

// Wrap FlashList items with entering/exiting animations
const renderItem = useCallback(({ item, index }: { item: HabitForDay; index: number }) => (
  <Animated.View
    entering={FadeIn.delay(index * 50).duration(200)}
    layout={Layout.springify().damping(15)}
  >
    <HabitCard
      habit={item}
      onToggleCompletion={() => handleToggle(item.id)}
      disabled={isFutureDay}
    />
  </Animated.View>
), [handleToggle, isFutureDay]);
```

---

## 5.7 Locked Future Day Animation

### Shake on Tap

When user taps a locked future day checkbox:

```typescript
const shakeX = useSharedValue(0);

const handleLockedTap = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

  shakeX.value = withSequence(
    withTiming(-4, { duration: 40 }),
    withTiming(4, { duration: 40 }),
    withTiming(-4, { duration: 40 }),
    withTiming(4, { duration: 40 }),
    withTiming(0, { duration: 40 })
  );
};

const shakeStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: shakeX.value }],
}));
```

### Lock Icon Appearance

```typescript
const lockScale = useSharedValue(0.5);
const lockOpacity = useSharedValue(0);

useEffect(() => {
  if (isLocked) {
    lockScale.value = withSpring(1, { damping: 12 });
    lockOpacity.value = withTiming(1, { duration: 200 });
  }
}, [isLocked]);
```

---

## 5.8 Gesture-Based Day Swiping (Optional Enhancement)

Allow horizontal swipe to navigate days:

```typescript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const translateX = useSharedValue(0);
const SWIPE_THRESHOLD = 50;

const panGesture = Gesture.Pan()
  .onUpdate((e) => {
    translateX.value = e.translationX * 0.3; // Resistance
  })
  .onEnd((e) => {
    if (e.translationX < -SWIPE_THRESHOLD) {
      runOnJS(goToNextDay)();
    } else if (e.translationX > SWIPE_THRESHOLD) {
      runOnJS(goToPreviousDay)();
    }
    translateX.value = withSpring(0);
  });

const gestureStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: translateX.value }],
}));
```

---

## 5.9 Performance Best Practices

### 1. Use worklets for animation callbacks

```typescript
'worklet';
// Animation logic runs on UI thread
```

### 2. Memoize animated components

```typescript
const AnimatedHabitCard = React.memo(({ habit, ...props }) => {
  // Component with animations
});
```

### 3. Cancel animations on unmount

```typescript
useEffect(() => {
  return () => {
    cancelAnimation(scale);
    cancelAnimation(fillProgress);
  };
}, []);
```

### 4. Use Layout animations sparingly

FlashList handles its own recycling, so avoid per-item layout animations that could conflict.

### 5. Particle cleanup

Ensure particle state is reset after animation completes.

---

## 5.10 Implementation Checklist

### Animation Tokens
- [ ] Add `reanimatedConfig` to `tokens.ts`
- [ ] Export spring and timing types

### Completion Animation
- [ ] Create `useCompletionAnimation` hook
- [ ] Implement scale bounce effect
- [ ] Implement fill animation
- [ ] Implement checkmark animation
- [ ] Create `CompletionParticles` component
- [ ] Add card pulse effect to HabitCard
- [ ] Add haptic feedback

### Day Navigation
- [ ] Add selection indicator animation
- [ ] Add today pulse animation (subtle)
- [ ] Implement staggered day item animations

### Day Transitions
- [ ] Add entering/exiting animations for habit list
- [ ] Test with FlashList recycling

### Locked State
- [ ] Add shake animation on locked tap
- [ ] Add lock icon appearance animation
- [ ] Add warning haptic feedback

### Polish
- [ ] Test all animations on physical device
- [ ] Verify 60fps performance
- [ ] Remove any jank or stuttering
- [ ] Test with large habit lists (20+ items)

---

## Acceptance Criteria

Phase 5 is complete when:

1. Checking a habit triggers satisfying multi-phase animation
2. Particle burst appears and fades naturally
3. Card has subtle pulse on completion
4. Haptic feedback on check/uncheck
5. Day selection has smooth indicator transition
6. Habit list animates when changing days
7. Future days shake when tapped
8. All animations run at 60fps
9. No memory leaks from animation state
10. Premium, professional feel throughout

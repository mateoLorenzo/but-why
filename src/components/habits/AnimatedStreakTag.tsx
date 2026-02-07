import { fonts } from "@/src/theme/fonts";
import { AppText as Text } from "@/src/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface AnimatedStreakTagProps {
  streak: number;
  color: string;
}

const SLIDE_DISTANCE = 20;
const PHASE_DURATION = 250;
const MOTIVATIONAL_PAUSE = 2000;

const TIMING_CONFIG = {
  duration: PHASE_DURATION,
  easing: Easing.out(Easing.cubic),
};

const MOTIVATIONAL_MESSAGES = [
  "Great work!",
  "Keep it up!",
  "Well done!",
  "Nice streak!",
];

const getRandomMessage = () =>
  MOTIVATIONAL_MESSAGES[
    Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)
  ];

const formatStreak = (n: number) => `${n} day streak`;

export const AnimatedStreakTag = ({
  streak,
  color,
}: AnimatedStreakTagProps) => {
  const previousStreak = useRef(streak);

  const [texts, setTexts] = useState({
    current: formatStreak(streak),
    motivational: getRandomMessage(),
    next: formatStreak(streak),
  });

  // Layer 1: Current streak (visible by default)
  const l1Opacity = useSharedValue(1);
  const l1TranslateY = useSharedValue(0);

  // Layer 2: Motivational message (hidden by default)
  const l2Opacity = useSharedValue(0);
  const l2TranslateY = useSharedValue(-SLIDE_DISTANCE);

  // Layer 3: New streak (hidden by default)
  const l3Opacity = useSharedValue(0);
  const l3TranslateY = useSharedValue(-SLIDE_DISTANCE);

  const cancelAll = useCallback(() => {
    cancelAnimation(l1Opacity);
    cancelAnimation(l1TranslateY);
    cancelAnimation(l2Opacity);
    cancelAnimation(l2TranslateY);
    cancelAnimation(l3Opacity);
    cancelAnimation(l3TranslateY);
  }, [l1Opacity, l1TranslateY, l2Opacity, l2TranslateY, l3Opacity, l3TranslateY]);

  const resetToIdle = useCallback((newStreak: number) => {
    const text = formatStreak(newStreak);
    setTexts({ current: text, motivational: getRandomMessage(), next: text });
  }, []);

  useEffect(() => {
    if (previousStreak.current === streak) return;

    const increased = streak > previousStreak.current;
    const oldStreak = previousStreak.current;
    previousStreak.current = streak;

    cancelAll();

    if (increased) {
      const msg = getRandomMessage();

      setTexts({
        current: formatStreak(oldStreak),
        motivational: msg,
        next: formatStreak(streak),
      });

      // Reset all layers to start positions
      l1Opacity.value = 1;
      l1TranslateY.value = 0;
      l2Opacity.value = 0;
      l2TranslateY.value = -SLIDE_DISTANCE;
      l3Opacity.value = 0;
      l3TranslateY.value = -SLIDE_DISTANCE;

      // Phase 1: Current slides DOWN + fades out
      l1Opacity.value = withTiming(0, TIMING_CONFIG);
      l1TranslateY.value = withTiming(SLIDE_DISTANCE, TIMING_CONFIG);

      // Motivational: fades in from above, pauses, then slides DOWN + fades out
      l2Opacity.value = withSequence(
        withTiming(1, TIMING_CONFIG),
        withDelay(MOTIVATIONAL_PAUSE, withTiming(0, TIMING_CONFIG))
      );
      l2TranslateY.value = withSequence(
        withTiming(0, TIMING_CONFIG),
        withDelay(MOTIVATIONAL_PAUSE, withTiming(SLIDE_DISTANCE, TIMING_CONFIG))
      );

      // Phase 3: New streak slides in from above (after phase1 + pause)
      const phase3Delay = PHASE_DURATION + MOTIVATIONAL_PAUSE;
      l3Opacity.value = withDelay(phase3Delay, withTiming(1, TIMING_CONFIG));
      l3TranslateY.value = withDelay(
        phase3Delay,
        withTiming(0, TIMING_CONFIG, (finished) => {
          if (finished) {
            runOnJS(resetToIdle)(streak);
          }
        })
      );
    } else {
      // Decrease: simple slide without motivational message
      setTexts({
        current: formatStreak(oldStreak),
        motivational: "",
        next: formatStreak(streak),
      });

      // Hide motivational
      l2Opacity.value = 0;
      l2TranslateY.value = -SLIDE_DISTANCE;

      // Reset layers 1 and 3
      l1Opacity.value = 1;
      l1TranslateY.value = 0;
      l3Opacity.value = 0;
      l3TranslateY.value = SLIDE_DISTANCE;

      // Current slides UP, new slides in from BELOW
      l1Opacity.value = withTiming(0, TIMING_CONFIG);
      l1TranslateY.value = withTiming(-SLIDE_DISTANCE, TIMING_CONFIG);
      l3Opacity.value = withTiming(1, TIMING_CONFIG);
      l3TranslateY.value = withTiming(0, TIMING_CONFIG, (finished) => {
        if (finished) {
          runOnJS(resetToIdle)(streak);
        }
      });
    }
  }, [streak]);

  const l1Style = useAnimatedStyle(() => ({
    opacity: l1Opacity.value,
    transform: [{ translateY: l1TranslateY.value }],
  }));

  const l2Style = useAnimatedStyle(() => ({
    opacity: l2Opacity.value,
    transform: [{ translateY: l2TranslateY.value }],
  }));

  const l3Style = useAnimatedStyle(() => ({
    opacity: l3Opacity.value,
    transform: [{ translateY: l3TranslateY.value }],
  }));

  const textStyle = [styles.text, { color }];

  return (
    <View style={styles.container}>
      {/* Layer 1: Current streak */}
      <Animated.View style={[styles.row, l1Style]}>
        <Ionicons name="flame" size={10} color={color} />
        <Text style={textStyle}>{texts.current}</Text>
      </Animated.View>

      {/* Layer 2: Motivational message (centered) */}
      <Animated.View style={[styles.centered, l2Style]}>
        <Text style={[styles.motivationalText, { color }]}>
          {texts.motivational}
        </Text>
      </Animated.View>

      {/* Layer 3: New streak */}
      <Animated.View style={[styles.row, styles.absolute, l3Style]}>
        <Ionicons name="flame" size={10} color={color} />
        <Text style={textStyle}>{texts.next}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  centered: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  absolute: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  text: {
    fontSize: 10,
    fontFamily: fonts.medium,
  },
  motivationalText: {
    fontSize: 10,
    fontFamily: fonts.semiBold,
  },
});

export default AnimatedStreakTag;

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
  withTiming,
} from "react-native-reanimated";

interface AnimatedStreakTagProps {
  streak: number;
  color: string;
  selectedDate: string;
}

const SLIDE_DISTANCE = 12;
const PHASE_DURATION = 250;

const TIMING_CONFIG = {
  duration: PHASE_DURATION,
  easing: Easing.out(Easing.cubic),
};

export const AnimatedStreakTag = ({
  streak,
  color,
  selectedDate,
}: AnimatedStreakTagProps) => {
  const previousStreak = useRef(streak);
  const previousDate = useRef(selectedDate);

  const [numbers, setNumbers] = useState({
    current: String(streak),
    next: String(streak),
  });

  const suffix = streak === 1 ? " day streak" : " day streak";

  // Current number (visible by default)
  const currentOpacity = useSharedValue(1);
  const currentTranslateY = useSharedValue(0);

  // Next number (hidden by default)
  const nextOpacity = useSharedValue(0);
  const nextTranslateY = useSharedValue(-SLIDE_DISTANCE);

  const cancelAll = useCallback(() => {
    cancelAnimation(currentOpacity);
    cancelAnimation(currentTranslateY);
    cancelAnimation(nextOpacity);
    cancelAnimation(nextTranslateY);
  }, [currentOpacity, currentTranslateY, nextOpacity, nextTranslateY]);

  const resetToIdle = useCallback((newStreak: number) => {
    const text = String(newStreak);
    setNumbers({ current: text, next: text });
  }, []);

  useEffect(() => {
    const dateChanged = previousDate.current !== selectedDate;
    previousDate.current = selectedDate;

    if (previousStreak.current === streak) return;

    const increased = streak > previousStreak.current;
    previousStreak.current = streak;

    cancelAll();

    // Date navigation: update immediately without animation
    if (dateChanged) {
      currentOpacity.value = 1;
      currentTranslateY.value = 0;
      nextOpacity.value = 0;
      resetToIdle(streak);
      return;
    }

    setNumbers({
      current: numbers.current,
      next: String(streak),
    });

    // Reset positions
    currentOpacity.value = 1;
    currentTranslateY.value = 0;
    nextOpacity.value = 0;
    nextTranslateY.value = increased ? -SLIDE_DISTANCE : SLIDE_DISTANCE;

    // Current number slides out
    currentOpacity.value = withTiming(0, TIMING_CONFIG);
    currentTranslateY.value = withTiming(
      increased ? SLIDE_DISTANCE : -SLIDE_DISTANCE,
      TIMING_CONFIG,
    );

    // Next number slides in
    nextOpacity.value = withTiming(1, TIMING_CONFIG);
    nextTranslateY.value = withTiming(0, TIMING_CONFIG, (finished) => {
      if (finished) {
        runOnJS(resetToIdle)(streak);
      }
    });
  }, [streak, selectedDate]);

  const currentStyle = useAnimatedStyle(() => ({
    opacity: currentOpacity.value,
    transform: [{ translateY: currentTranslateY.value }],
  }));

  const nextStyle = useAnimatedStyle(() => ({
    opacity: nextOpacity.value,
    transform: [{ translateY: nextTranslateY.value }],
  }));

  const textStyle = [styles.text, { color }];

  return (
    <View style={styles.row}>
      <Ionicons name="flame" size={10} color={color} />
      <View style={styles.numberContainer}>
        <Animated.View style={currentStyle}>
          <Text style={textStyle}>{numbers.current}</Text>
        </Animated.View>
        <Animated.View style={[styles.numberAbsolute, nextStyle]}>
          <Text style={textStyle}>{numbers.next}</Text>
        </Animated.View>
      </View>
      <Text style={textStyle}>{suffix}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    overflow: "hidden",
  },
  numberContainer: {
    overflow: "hidden",
  },
  numberAbsolute: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  text: {
    fontSize: 10,
    fontFamily: fonts.medium,
  },
});

export default AnimatedStreakTag;

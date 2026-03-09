import { AppText as Text } from "@/src/ui/Text";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, type TextStyle } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface AnimatedNumberProps {
  value: number;
  style?: TextStyle | TextStyle[];
}

const SLIDE_DISTANCE = 20;
const ANIMATION_DURATION = 250;
const TIMING_CONFIG = {
  duration: ANIMATION_DURATION,
  easing: Easing.out(Easing.cubic),
};

export const AnimatedNumber = ({ value, style }: AnimatedNumberProps) => {
  const [displayedValues, setDisplayedValues] = useState({
    outgoing: value,
    incoming: value,
  });

  const previousValue = useRef(value);

  const outgoingOpacity = useSharedValue(1);
  const outgoingTranslateY = useSharedValue(0);
  const incomingOpacity = useSharedValue(0);
  const incomingTranslateY = useSharedValue(0);

  const onAnimationComplete = (newValue: number) => {
    setDisplayedValues({ outgoing: newValue, incoming: newValue });
  };

  useEffect(() => {
    if (previousValue.current === value) return;

    const isIncreasing = value > previousValue.current;

    setDisplayedValues({
      outgoing: previousValue.current,
      incoming: value,
    });

    // Reset positions before starting new animation
    outgoingOpacity.value = 1;
    outgoingTranslateY.value = 0;
    incomingOpacity.value = 0;
    incomingTranslateY.value = isIncreasing ? -SLIDE_DISTANCE : SLIDE_DISTANCE;

    // Animate outgoing number away
    outgoingOpacity.value = withTiming(0, TIMING_CONFIG);
    outgoingTranslateY.value = withTiming(
      isIncreasing ? SLIDE_DISTANCE : -SLIDE_DISTANCE,
      TIMING_CONFIG
    );

    // Animate incoming number into place
    incomingOpacity.value = withTiming(1, TIMING_CONFIG);
    incomingTranslateY.value = withTiming(0, TIMING_CONFIG, (finished) => {
      if (finished) {
        runOnJS(onAnimationComplete)(value);
      }
    });

    previousValue.current = value;
  }, [value]);

  const outgoingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: outgoingOpacity.value,
    transform: [{ translateY: outgoingTranslateY.value }],
  }));

  const incomingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: incomingOpacity.value,
    transform: [{ translateY: incomingTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.numberContainer, outgoingAnimatedStyle]}>
        <Text style={style}>{displayedValues.outgoing}</Text>
      </Animated.View>
      <Animated.View
        style={[
          styles.numberContainer,
          styles.absolutePosition,
          incomingAnimatedStyle,
        ]}
      >
        <Text style={style}>{displayedValues.incoming}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  numberContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  absolutePosition: {
    position: "absolute",
  },
});

export default AnimatedNumber;

import colors from "@/src/theme/colors";
import { typography } from "@/src/theme/fonts";
import { animation, opacity, spacing, reanimatedConfig } from "@/src/theme/tokens";
import { AppText as Text } from "@/src/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from "react-native-reanimated";

interface DayIndicatorProps {
  dayLabel: string;
  completed: boolean;
  isToday: boolean;
  isFuture: boolean;
  accentColor: string;
  onPress: () => void;
}

export const DayIndicator = ({
  dayLabel,
  completed,
  isToday,
  isFuture,
  accentColor,
  onPress,
}: DayIndicatorProps) => {
  const shakeX = useSharedValue(0);

  const handlePress = () => {
    if (isFuture) {
      // Shake animation for locked future days
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      shakeX.value = withSequence(
        withTiming(-4, { duration: 40 }),
        withTiming(4, { duration: 40 }),
        withTiming(-4, { duration: 40 }),
        withTiming(4, { duration: 40 }),
        withTiming(0, { duration: 40 })
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeX.value }],
    };
  });

  return (
    <View style={[styles.container, isFuture && styles.containerFuture]}>
      <Text
        style={[
          styles.dayLabel,
          isToday && [styles.dayLabelToday, { color: accentColor }],
          isFuture && styles.dayLabelFuture,
        ]}
      >
        {dayLabel}
      </Text>
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={handlePress}
          disabled={false}
          hitSlop={isToday ? { top: 15, bottom: 15, left: 15, right: 15 } : 8}
          style={({ pressed }) => [
            styles.circle,
            isToday && [styles.circleToday, { borderColor: accentColor }],
            completed && {
              backgroundColor: accentColor,
              borderColor: accentColor,
            },
            isFuture && styles.circleFuture,
            pressed && !isFuture && styles.circlePressed,
          ]}
        >
          {completed && (
            <Ionicons name="checkmark" size={14} color={colors.base.white} />
          )}
          {isFuture && (
            <Ionicons name="lock-closed" size={12} color={colors.neutral[500]} />
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: spacing.sm,
  },
  containerFuture: {
    opacity: 0.35,
  },
  dayLabel: {
    ...typography.caption2Medium,
    color: colors.neutral[400],
  },
  dayLabelToday: {
    ...typography.caption2Medium,
  },
  dayLabelFuture: {
    color: colors.neutral[500],
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.neutral[600],
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  circleToday: {
    borderWidth: 2,
  },
  circleFuture: {
    borderColor: colors.neutral[700],
    borderStyle: "dashed",
  },
  circlePressed: {
    opacity: opacity.pressed,
    transform: [{ scale: animation.pressScale.strong }],
  },
});

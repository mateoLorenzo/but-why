import colors from "@/src/theme/colors";
import { fonts } from "@/src/theme/fonts";
import { AppText as Text } from "@/src/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

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
  const handlePress = () => {
    if (isFuture) return; // Don't allow interaction with future days
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

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
      <Pressable
        onPress={handlePress}
        disabled={isFuture}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 6,
  },
  containerFuture: {
    opacity: 0.5,
  },
  dayLabel: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.neutral[400],
  },
  dayLabelToday: {
    fontFamily: fonts.semiBold,
  },
  dayLabelFuture: {
    color: colors.neutral[500],
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  circleToday: {
    borderWidth: 2,
  },
  circleFuture: {
    borderColor: colors.neutral[500],
    borderStyle: "dashed",
  },
  circlePressed: {
    opacity: 0.7,
    transform: [{ scale: 0.92 }],
  },
});

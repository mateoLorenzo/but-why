import colors from "@/src/theme/colors";
import { fonts } from "@/src/theme/fonts";
import { AppText as Text } from "@/src/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

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
    if (isFuture) return;

    if (completed) {
      Alert.alert(
        "Unmark habit?",
        "Are you sure you want to unmark this day as completed?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Unmark",
            style: "destructive",
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onPress();
            },
          },
        ]
      );
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
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
          <Ionicons name="lock-closed" size={12} color={colors.text.tertiary} />
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
    color: colors.text.secondary,
  },
  dayLabelToday: {
    fontFamily: fonts.semiBold,
  },
  dayLabelFuture: {
    color: colors.text.tertiary,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  circleToday: {
    borderWidth: 2,
  },
  circleFuture: {
    borderColor: colors.text.tertiary,
    borderStyle: "dashed",
  },
  circlePressed: {
    opacity: 0.7,
    transform: [{ scale: 0.92 }],
  },
});

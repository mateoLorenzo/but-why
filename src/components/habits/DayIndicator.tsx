import colors from "@/src/theme/colors";
import { fonts } from "@/src/theme/fonts";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText as Text } from "@/src/ui/Text";

interface DayIndicatorProps {
  dayLabel: string;
  completed: boolean;
  isToday: boolean;
  accentColor: string;
  onPress: () => void;
}

export const DayIndicator = ({
  dayLabel,
  completed,
  isToday,
  accentColor,
  onPress,
}: DayIndicatorProps) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.dayLabel,
          isToday && [styles.dayLabelToday, { color: accentColor }],
        ]}
      >
        {dayLabel}
      </Text>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.circle,
          isToday && [styles.circleToday, { borderColor: accentColor }],
          completed && {
            backgroundColor: accentColor,
            borderColor: accentColor,
          },
          pressed && styles.circlePressed,
        ]}
      >
        {completed && (
          <Ionicons name="checkmark" size={14} color={colors.base.white} />
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
  dayLabel: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.neutral[400],
    textTransform: "uppercase",
  },
  dayLabelToday: {
    fontFamily: fonts.semiBold,
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
  circlePressed: {
    opacity: 0.7,
    transform: [{ scale: 0.92 }],
  },
});

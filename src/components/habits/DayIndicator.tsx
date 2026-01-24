import colors from "@/src/theme/colors";
import { fonts } from "@/src/theme/fonts";
import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText as Text } from "@/src/ui/Text";
import { Ionicons } from "@expo/vector-icons";

interface DayIndicatorProps {
  dayLabel: string;
  completed: boolean;
  isToday: boolean;
  accentColor: string;
}

export const DayIndicator = ({
  dayLabel,
  completed,
  isToday,
  accentColor,
}: DayIndicatorProps) => {
  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.dayLabel,
          isToday && styles.dayLabelToday,
        ]}
      >
        {dayLabel}
      </Text>
      <View
        style={[
          styles.circle,
          isToday && styles.circleToday,
          completed && { backgroundColor: accentColor, borderColor: accentColor },
        ]}
      >
        {completed && (
          <Ionicons name="checkmark" size={14} color={colors.base.white} />
        )}
      </View>
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
    textTransform: "lowercase",
  },
  dayLabelToday: {
    color: colors.primary[600],
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
    borderColor: colors.primary[500],
    borderWidth: 2,
  },
});

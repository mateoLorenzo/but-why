/**
 * EmptyState Component
 *
 * Displays a friendly message when no habits are scheduled for the selected date.
 * Provides visual feedback and guidance to the user.
 *
 * @example
 * <EmptyState selectedDate="2026-02-05" />
 */

import colors from "@/src/theme/colors";
import { typography } from "@/src/theme/fonts";
import { borderRadius, spacing } from "@/src/theme/tokens";
import { AppText as Text } from "@/src/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

export interface EmptyStateProps {
  selectedDate: string;
}

/**
 * Formats date string to readable format
 * @param dateString - YYYY-MM-DD format
 * @returns Readable date string
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString + "T12:00:00");
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const dateOnly = new Date(date);
  dateOnly.setHours(12, 0, 0, 0);

  const todayOnly = new Date(today);
  todayOnly.setHours(12, 0, 0, 0);

  const diffTime = dateOnly.getTime() - todayOnly.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "today";
  } else if (diffDays === 1) {
    return "tomorrow";
  } else if (diffDays === -1) {
    return "yesterday";
  }

  // Format as "Mon, Feb 3"
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
};

export const EmptyState: React.FC<EmptyStateProps> = ({ selectedDate }) => {
  const formattedDate = formatDate(selectedDate);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons
          name="calendar-outline"
          size={48}
          color={colors.text.tertiary}
        />
      </View>
      <Text style={styles.title}>No habits scheduled</Text>
      <Text style={styles.subtitle}>
        You don&apos;t have any habits scheduled for {formattedDate}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxxl,
    gap: spacing.md,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.title3,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.callout,
    color: colors.text.secondary,
    textAlign: "center",
    maxWidth: 280,
  },
});

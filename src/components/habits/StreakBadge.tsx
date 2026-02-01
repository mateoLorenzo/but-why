/**
 * StreakBadge Component
 *
 * Displays streak count with fire emoji in two different visual styles.
 * Used to show habit completion streaks in an engaging, visual way.
 *
 * Variants:
 * - inline: Simple text with fire emoji, used in card footers
 * - badge: Pill-shaped badge with background, used for emphasis
 *
 * Sizes:
 * - sm: Smaller text (12px), compact spacing
 * - md: Regular text (13px), standard spacing
 *
 * @example
 * // Inline variant
 * <StreakBadge count={7} variant="inline" size="sm" />
 * // Displays: "🔥 7"
 *
 * @example
 * // Badge variant with custom color
 * <StreakBadge
 *   count={14}
 *   variant="badge"
 *   size="md"
 *   accentColor="#10B981"
 * />
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText as Text } from '@/src/ui/Text';
import colors from '@/src/theme/colors';
import { typography } from '@/src/theme/fonts';

export interface StreakBadgeProps {
  count: number;
  accentColor?: string;
  variant?: 'inline' | 'badge';
  size?: 'sm' | 'md';
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  count,
  accentColor = colors.accent.primary,
  variant = 'inline',
  size = 'md',
}) => {
  // Don't render if count is 0
  if (count === 0) {
    return null;
  }

  // Size configuration
  const fontSize = size === 'sm' ? 12 : 13;
  const lineHeight = size === 'sm' ? 16 : 18;

  if (variant === 'inline') {
    return (
      <Text
        style={[
          styles.inlineText,
          {
            fontSize,
            lineHeight,
          },
        ]}
      >
        🔥 {count}
      </Text>
    );
  }

  // Badge variant
  return (
    <View
      style={[
        styles.badgeContainer,
        {
          backgroundColor: `${accentColor}18`, // 18 = ~9% opacity in hex
        },
      ]}
    >
      <Text style={styles.badgeEmoji}>🔥</Text>
      <Text
        style={[
          styles.badgeText,
          {
            color: accentColor,
            fontSize,
            lineHeight,
          },
        ]}
      >
        {count}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  inlineText: {
    fontFamily: typography.footnote.fontFamily,
    color: colors.text.secondary,
    letterSpacing: 0,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeEmoji: {
    fontSize: 12,
    lineHeight: 16,
  },
  badgeText: {
    fontFamily: typography.footnoteMedium.fontFamily,
    letterSpacing: 0,
  },
});

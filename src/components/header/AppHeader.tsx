/**
 * AppHeader Component
 *
 * Main header container with flexible slot-based layout.
 * Supports left/right actions, center content, or title display.
 *
 * Features:
 * - SafeArea aware with automatic top padding
 * - Three-column flex layout (left/center/right)
 * - Optional bottom border
 * - Customizable content via slots
 *
 * @example
 * // With action buttons and center content
 * <AppHeader
 *   leftAction={<IconButton icon="settings-outline" onPress={...} />}
 *   centerContent={<DayNavigator selectedDate={...} onDateSelect={...} />}
 *   rightAction={<IconButton icon="add" onPress={...} variant="primary" />}
 *   showBorder={true}
 * />
 *
 * @example
 * // With title only
 * <AppHeader
 *   title="My Habits"
 *   showBorder={true}
 * />
 */

import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText as Text } from '@/src/ui/Text';
import colors from '@/src/theme/colors';
import { typography } from '@/src/theme/fonts';

export interface AppHeaderProps {
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  centerContent?: React.ReactNode;
  title?: string;
  showBorder?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  leftAction,
  rightAction,
  centerContent,
  title,
  showBorder = false,
  style,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top },
        showBorder && styles.containerWithBorder,
        style,
      ]}
    >
      {/* Content row with fixed height */}
      <View style={styles.contentRow}>
        {/* Left action slot */}
        <View style={styles.leftSlot}>
          {leftAction}
        </View>

        {/* Center content or title */}
        <View style={styles.centerSlot}>
          {centerContent ? (
            centerContent
          ) : title ? (
            <Text style={styles.title}>{title}</Text>
          ) : null}
        </View>

        {/* Right action slot */}
        <View style={styles.rightSlot}>
          {rightAction}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
  },
  contentRow: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  containerWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  leftSlot: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  rightSlot: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  title: {
    ...typography.headline,
    color: colors.text.primary,
  },
});

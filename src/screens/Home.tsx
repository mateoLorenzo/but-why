/**
 * Home Screen (Redesigned)
 *
 * Main screen showing habits for the selected date.
 * Features day navigation and per-day habit completion tracking.
 *
 * New Features:
 * - Day navigator for selecting dates
 * - Shows only habits scheduled for selected date
 * - Simplified horizontal habit cards
 * - Future day protection (disabled checkboxes)
 * - Empty state when no habits scheduled
 */

import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HabitCard } from '@/src/components/habits/HabitCard';
import { EmptyState } from '@/src/components/habits/EmptyState';
import { AppHeader, DayNavigator } from '@/src/components/header';
import { IconButton } from '@/src/components/common/IconButton';
import { useHabits } from '@/src/hooks/useHabits';
import { useDayNavigation } from '@/src/hooks/useDayNavigation';
import { HabitForDay } from '@/src/types/habit';
import colors from '@/src/theme/colors';
import { spacing, reanimatedConfig } from '@/src/theme/tokens';

const Home = () => {
  const insets = useSafeAreaInsets();
  const { isLoading, toggleCompletion, refresh, getHabitsForDate } = useHabits();
  const { selectedDate, setSelectedDate, isFutureDay } = useDayNavigation();

  // Refresh habits when screen comes into focus (after creating a new habit)
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  // Get habits for the selected date
  const habitsForDate = useMemo(
    () => getHabitsForDate(selectedDate),
    [getHabitsForDate, selectedDate]
  );

  // Check if selected date is in the future
  const isFuture = useMemo(
    () => isFutureDay(selectedDate),
    [isFutureDay, selectedDate]
  );

  /**
   * Handle habit completion toggle
   */
  const handleToggleCompletion = useCallback(
    async (habitId: string) => {
      await toggleCompletion(habitId, selectedDate);
    },
    [toggleCompletion, selectedDate]
  );

  /**
   * Navigate to create habit screen
   */
  const handleAddHabit = useCallback(() => {
    router.push('/create-habit');
  }, []);

  /**
   * Navigate to edit habit screen
   */
  const handleEditHabit = useCallback((habitId: string) => {
    router.push(`/create-habit?id=${habitId}`);
  }, []);

  /**
   * Navigate to settings screen
   */
  const handleOpenSettings = useCallback(() => {
    router.push('/settings');
  }, []);

  /**
   * Render individual habit card with staggered entry animation
   */
  const renderHabitItem = useCallback(
    ({ item, index }: { item: HabitForDay; index: number }) => (
      <Animated.View
        entering={FadeIn.delay(index * reanimatedConfig.stagger.card).duration(200)}
        layout={Layout.springify().damping(15)}
      >
        <HabitCard
          habit={item}
          onToggleCompletion={() => handleToggleCompletion(item.id)}
          onPress={() => handleEditHabit(item.id)}
          disabled={isFuture}
        />
      </Animated.View>
    ),
    [handleToggleCompletion, handleEditHabit, isFuture]
  );

  /**
   * Render empty state when no habits scheduled
   */
  const renderEmptyComponent = useCallback(
    () => <EmptyState selectedDate={selectedDate} />,
    [selectedDate]
  );

  /**
   * Render list header for spacing
   */
  const renderListHeader = useCallback(
    () => <View style={styles.listHeader} />,
    []
  );

  /**
   * Render list footer for bottom spacing
   */
  const renderListFooter = useCallback(
    () => <View style={{ height: insets.bottom + 24 }} />,
    [insets.bottom]
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header with day navigator */}
      <AppHeader
        leftAction={
          <IconButton
            icon="settings-outline"
            onPress={handleOpenSettings}
            variant="ghost"
            size="md"
            accessibilityLabel="Open settings"
          />
        }
        centerContent={
          <DayNavigator
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        }
        rightAction={
          <IconButton
            icon="add"
            onPress={handleAddHabit}
            variant="primary"
            size="md"
            accessibilityLabel="Add new habit"
          />
        }
        showBorder={true}
      />

      {/* Habits List */}
      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
        </View>
      ) : (
        <FlashList
          data={habitsForDate}
          renderItem={renderHabitItem}
          // @ts-ignore - estimatedItemSize exists in FlashList v2
          estimatedItemSize={72}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={renderListFooter}
          ListEmptyComponent={renderEmptyComponent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  listHeader: {
    height: spacing.lg,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxxxl + spacing.lg,
  },
});

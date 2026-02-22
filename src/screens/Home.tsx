import { HabitDayCard } from "@/src/components/habits/HabitDayCard";
import {
  WeekDaySelector,
  HEADER_HORIZONTAL_PADDING,
} from "@/src/components/WeekDaySelector";
import { useHabits } from "@/src/hooks/useHabits";
import colors from "@/src/theme/colors";
import { fonts } from "@/src/theme/fonts";
import { HabitForDay } from "@/src/types/habit";
import { AppText as Text } from "@/src/ui/Text";
import {
  formatDateKey,
  formatDateShort,
  isFutureDate,
} from "@/src/utils/dates";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Home = () => {
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));

  const { habitsForDay, isLoading, toggleCompletion, refresh, getProgressForDate } =
    useHabits(selectedDate);

  const isFuture = isFutureDate(selectedDate);
  const headerDateLabel = formatDateShort(selectedDate);

  // Refresh habits when screen comes into focus (after creating a new habit)
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleToggleHabit = useCallback(
    async (habitId: string) => {
      await toggleCompletion(habitId, selectedDate);
    },
    [toggleCompletion, selectedDate]
  );

  const handleAddHabit = () => {
    router.push("/create-habit");
  };

  const handleEditHabit = (habitId: string) => {
    router.push(`/create-habit?id=${habitId}`);
  };

  const handleOpenSettings = () => {
    router.push("/settings");
  };

  const renderHabitItem = useCallback(
    ({ item }: { item: HabitForDay }) => (
      <HabitDayCard
        habit={item}
        onToggle={() => handleToggleHabit(item.id)}
        onPress={() => handleEditHabit(item.id)}
        isFutureDay={isFuture}
        selectedDate={selectedDate}
      />
    ),
    [handleToggleHabit, isFuture]
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="calendar-outline"
        size={48}
        color={colors.text.tertiary}
      />
      <Text style={styles.emptyTitle}>
        {isFuture ? "No habits scheduled" : "No habits for this day"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {isFuture
          ? "You don't have habits for this day"
          : "Tap + to create a habit"}
      </Text>
    </View>
  );

  const renderListHeader = () => <View style={styles.listHeader} />;

  const renderListFooter = () => (
    <View style={{ height: insets.bottom + 24 }} />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.headerButtonPressed,
          ]}
          onPress={handleOpenSettings}
          accessibilityLabel="Open settings"
          accessibilityRole="button"
        >
          <Ionicons name="menu" size={26} color={colors.text.primary} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerDate}>{headerDateLabel}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.headerButtonPressed,
          ]}
          onPress={handleAddHabit}
          accessibilityLabel="Create new habit"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={28} color={colors.text.primary} />
        </Pressable>
      </View>

      {/* Week Day Selector */}
      <WeekDaySelector
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        getProgressForDate={getProgressForDate}
      />

      {/* Habits List */}
      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : (
        <FlashList
          data={habitsForDay}
          renderItem={renderHabitItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={renderListFooter}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flashListContent}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: HEADER_HORIZONTAL_PADDING,
    paddingBottom: 4,
    backgroundColor: colors.background.primary,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtonPressed: {
    opacity: 0.6,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerDate: {
    fontSize: 22,
    fontFamily: fonts.semiBold,
    color: colors.text.primary,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  progressText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.text.secondary,
  },
  progressBar: {
    width: 100,
    height: 4,
    backgroundColor: colors.background.elevated,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  flashListContent: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  listHeader: {
    height: 12,
  },
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: fonts.medium,
    color: colors.text.secondary,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text.tertiary,
    textAlign: "center",
  },
});

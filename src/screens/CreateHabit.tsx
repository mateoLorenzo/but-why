import { habitsStorage } from "@/src/storage/habits";
import colors from "@/src/theme/colors";
import { fonts } from "@/src/theme/fonts";
import { CompletionRecord, Habit } from "@/src/types/habit";
import { AppText as Text } from "@/src/ui/Text";
import { formatMonthYear, getMatchingDaysForMonth } from "@/src/utils/dates";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import EmojiPicker, { type EmojiType } from "rn-emoji-keyboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HABIT_COLORS = [
  "#3B82F6",
  "#22C55E",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
];

const PRESET_EMOJIS = [
  "💪",
  "📚",
  "💧",
  "🧘",
  "🏃",
  "😴",
  "🥗",
  "✍️",
  "💊",
  "🦷",
  "💰",
];

const DEFAULT_EMOJI = "💪";

const FREQUENCY_OPTIONS = [
  { id: "daily", label: "Every day", days: [0, 1, 2, 3, 4, 5, 6] },
  { id: "weekdays", label: "Weekdays", days: [1, 2, 3, 4, 5] },
  // { id: "weekends", label: "Weekends", days: [0, 6] },
  { id: "custom", label: "Custom", days: [] },
];

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const CreateHabit = () => {
  const { id: habitId } = useLocalSearchParams<{ id?: string }>();
  const isEditMode = !!habitId;

  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
  const [selectedEmoji, setSelectedEmoji] = useState(DEFAULT_EMOJI);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState("daily");
  const [customDays, setCustomDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [existingHabit, setExistingHabit] = useState<Habit | null>(null);
  const [completions, setCompletions] = useState<CompletionRecord>({});
  const [historyMonth, setHistoryMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const { top } = useSafeAreaInsets();

  // Load existing habit data when editing
  useEffect(() => {
    if (habitId) {
      const loadHabit = async () => {
        const [habits, allCompletions] = await Promise.all([
          habitsStorage.getHabits(),
          habitsStorage.getCompletions(),
        ]);
        const habit = habits.find((h) => h.id === habitId);
        if (habit) {
          setExistingHabit(habit);
          setName(habit.name);
          // Find matching color or use first as default
          const matchingColor = HABIT_COLORS.find((c) => c === habit.color);
          if (matchingColor) setSelectedColor(matchingColor);
          setSelectedEmoji(habit.icon || DEFAULT_EMOJI);
          setSelectedFrequency(habit.frequency);
          setCustomDays(habit.days);
          setCompletions(allCompletions);
        }
      };
      loadHabit();
    }
  }, [habitId]);

  // Get the current active days based on frequency selection
  const activeDays = useMemo(() => {
    if (selectedFrequency === "custom") {
      return customDays;
    }
    return (
      FREQUENCY_OPTIONS.find((f) => f.id === selectedFrequency)?.days || []
    );
  }, [selectedFrequency, customDays]);

  // Get the days for the selected month that match the habit's frequency
  const historyDays = useMemo(() => {
    if (!isEditMode || activeDays.length === 0) return [];
    return getMatchingDaysForMonth(
      historyMonth.year,
      historyMonth.month,
      activeDays
    );
  }, [isEditMode, activeDays, historyMonth]);

  // Check if we can navigate to next month (can't go beyond current month)
  const canGoToNextMonth = useMemo(() => {
    const now = new Date();
    return (
      historyMonth.year < now.getFullYear() ||
      (historyMonth.year === now.getFullYear() &&
        historyMonth.month < now.getMonth())
    );
  }, [historyMonth]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setHistoryMonth((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  // Navigate to next month
  const goToNextMonth = () => {
    if (!canGoToNextMonth) return;
    setHistoryMonth((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  // Get completions for this habit
  const habitCompletions = useMemo(() => {
    if (!habitId) return {};
    return completions[habitId] || {};
  }, [habitId, completions]);

  // Toggle completion for a specific day in the history
  const handleToggleHistoryDay = async (date: string) => {
    if (!habitId) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updatedCompletions = await habitsStorage.toggleCompletion(
      habitId,
      date
    );
    setCompletions(updatedCompletions);
  };

  const handleClose = () => {
    router.back();
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    const days =
      selectedFrequency === "custom"
        ? customDays
        : FREQUENCY_OPTIONS.find((f) => f.id === selectedFrequency)?.days || [];

    if (isEditMode && existingHabit) {
      // Update existing habit
      const habits = await habitsStorage.getHabits();
      const updatedHabits = habits.map((habit) =>
        habit.id === habitId
          ? {
              ...habit,
              name: name.trim(),
              color: selectedColor,
              icon: selectedEmoji,
              frequency: selectedFrequency,
              days,
            }
          : habit
      );
      await habitsStorage.saveHabits(updatedHabits);
    } else {
      // Create new habit
      await habitsStorage.addHabit({
        id: Date.now().toString(),
        name: name.trim(),
        color: selectedColor,
        icon: selectedEmoji,
        frequency: selectedFrequency,
        days,
        createdAt: new Date(),
      });
    }

    router.back();
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Delete Habit",
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (habitId) {
              await habitsStorage.deleteHabit(habitId);
              router.back();
            }
          },
        },
      ]
    );
  };

  const toggleCustomDay = (dayIndex: number) => {
    setCustomDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  const isFormValid = name.trim().length > 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS === "ios" ? 12 : top + 8 },
        ]}
      >
        <Pressable
          onPress={handleClose}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.headerButtonText}>Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>
          {isEditMode ? "Edit Habit" : "New Habit"}
        </Text>
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [
            styles.headerButton,
            !isFormValid && styles.headerButtonDisabled,
            pressed && isFormValid && styles.pressed,
          ]}
          disabled={!isFormValid}
        >
          <Text
            style={[
              styles.headerButtonText,
              styles.headerButtonPrimary,
              !isFormValid && styles.headerButtonTextDisabled,
            ]}
          >
            {isEditMode ? "Save" : "Create"}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Preview */}
        <View style={styles.previewContainer}>
          <View
            style={[
              styles.previewIcon,
              { backgroundColor: `${selectedColor}18` },
            ]}
          >
            <Text style={styles.previewEmoji}>{selectedEmoji}</Text>
          </View>
          <Text style={styles.previewName}>{name || "Habit name"}</Text>
        </View>

        {/* Name Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Meditate, Exercise, Read..."
            placeholderTextColor={colors.text.tertiary}
            value={name}
            onChangeText={setName}
            // autoFocus
          />
        </View>

        {/* Emoji Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Icon</Text>
          <View style={styles.emojiGrid}>
            {PRESET_EMOJIS.map((emoji) => (
              <Pressable
                key={emoji}
                style={({ pressed }) => [
                  styles.emojiOption,
                  selectedEmoji === emoji && {
                    backgroundColor: `${selectedColor}18`,
                    borderColor: selectedColor,
                  },
                  pressed && styles.pressed,
                ]}
                onPress={() => setSelectedEmoji(emoji)}
              >
                <Text style={styles.emojiOptionText}>{emoji}</Text>
              </Pressable>
            ))}
            {/* Custom emoji picker button */}
            <Pressable
              style={({ pressed }) => [
                styles.emojiOption,
                !PRESET_EMOJIS.includes(selectedEmoji) && {
                  backgroundColor: `${selectedColor}18`,
                  borderColor: selectedColor,
                },
                pressed && styles.pressed,
              ]}
              onPress={() => setIsEmojiPickerOpen(true)}
            >
              {PRESET_EMOJIS.includes(selectedEmoji) ? (
                <Ionicons
                  name="add"
                  size={24}
                  color={colors.text.tertiary}
                />
              ) : (
                <Text style={styles.emojiOptionText}>{selectedEmoji}</Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* Color Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color</Text>
          <View style={styles.colorRow}>
            {HABIT_COLORS.map((color, index) => (
              <Pressable
                key={`color-${index}`}
                style={({ pressed }) => [
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorOptionSelected,
                  pressed && styles.pressed,
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={colors.base.white}
                  />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Frequency Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequency</Text>
          <View style={styles.frequencyOptions}>
            {FREQUENCY_OPTIONS.map((option, index) => (
              <Pressable
                key={option.id}
                style={({ pressed }) => [
                  styles.frequencyOption,
                  selectedFrequency === option.id && {
                    backgroundColor: `${selectedColor}18`,
                    borderColor: selectedColor,
                  },
                  pressed && styles.pressed,
                  index !== 1 && { flex: 1 },
                ]}
                onPress={() => setSelectedFrequency(option.id)}
              >
                <Text
                  style={[
                    styles.frequencyOptionText,
                    selectedFrequency === option.id && { color: selectedColor },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Custom Days */}
          {selectedFrequency === "custom" && (
            <View style={styles.customDaysContainer}>
              {DAY_LABELS.map((label, index) => (
                <Pressable
                  key={index}
                  style={({ pressed }) => [
                    styles.dayOption,
                    customDays.includes(index) && {
                      backgroundColor: selectedColor,
                      borderColor: selectedColor,
                    },
                    pressed && styles.pressed,
                  ]}
                  onPress={() => toggleCustomDay(index)}
                >
                  <Text
                    style={[
                      styles.dayOptionText,
                      customDays.includes(index) &&
                        styles.dayOptionTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* History Section (only in edit mode) */}
        {isEditMode && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>History</Text>

            {/* Month Navigation */}
            <View style={styles.monthNavigation}>
              <Pressable
                onPress={goToPreviousMonth}
                style={({ pressed }) => [
                  styles.monthNavButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="chevron-back"
                  size={22}
                  color={colors.text.secondary}
                />
              </Pressable>

              <Text style={styles.monthLabel}>
                {formatMonthYear(historyMonth.year, historyMonth.month)}
              </Text>

              <Pressable
                onPress={goToNextMonth}
                style={({ pressed }) => [
                  styles.monthNavButton,
                  !canGoToNextMonth && styles.monthNavButtonDisabled,
                  pressed && canGoToNextMonth && styles.pressed,
                ]}
                disabled={!canGoToNextMonth}
              >
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={
                    canGoToNextMonth
                      ? colors.text.secondary
                      : colors.text.disabled
                  }
                />
              </Pressable>
            </View>

            {/* Days Grid */}
            <View style={styles.historyContainer}>
              {historyDays.length > 0 ? (
                historyDays.map((day, index) => {
                  const isCompleted = habitCompletions[day.date] || false;
                  return (
                    <Pressable
                      key={`${day.date}-${index}`}
                      style={({ pressed }) => [
                        styles.historyDay,
                        isCompleted && {
                          backgroundColor: `${selectedColor}18`,
                          borderColor: selectedColor,
                        },
                        pressed && styles.pressed,
                      ]}
                      onPress={() => handleToggleHistoryDay(day.date)}
                    >
                      <Text
                        style={[
                          styles.historyDayLabel,
                          isCompleted && { color: selectedColor },
                        ]}
                      >
                        {day.dayLabel}
                      </Text>
                      <Text
                        style={[
                          styles.historyDayNumber,
                          isCompleted && { color: selectedColor },
                        ]}
                      >
                        {new Date(day.date + "T12:00:00").getDate()}
                      </Text>
                      {isCompleted && (
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color={selectedColor}
                          style={styles.historyCheckIcon}
                        />
                      )}
                      {day.isToday && (
                        <View
                          style={[
                            styles.todayIndicator,
                            { backgroundColor: selectedColor },
                          ]}
                        />
                      )}
                    </Pressable>
                  );
                })
              ) : (
                <Text style={styles.noHistoryText}>
                  No matching days this month
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Delete Button (only in edit mode) */}
        {isEditMode && (
          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.deleteButtonPressed,
            ]}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={colors.danger[600]}
            />
            <Text style={styles.deleteButtonText}>Delete Habit</Text>
          </Pressable>
        )}
      </ScrollView>

      <EmojiPicker
        open={isEmojiPickerOpen}
        onClose={() => setIsEmojiPickerOpen(false)}
        onEmojiSelected={(emoji: EmojiType) => {
          setSelectedEmoji(emoji.emoji);
        }}
        theme={{
          backdrop: colors.background.primary + "cc",
          knob: colors.text.tertiary,
          container: colors.background.secondary,
          header: colors.text.primary,
          category: {
            icon: colors.text.tertiary,
            iconActive: selectedColor,
            container: colors.background.secondary,
            containerActive: `${selectedColor}18`,
          },
          search: {
            background: colors.background.elevated,
            placeholder: colors.text.tertiary,
            text: colors.text.primary,
            icon: colors.text.tertiary,
          },
        }}
      />
    </View>
  );
};

export default CreateHabit;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingBottom: 20,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 60,
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  headerButtonText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text.secondary,
  },
  headerButtonPrimary: {
    color: colors.accent.primary,
    fontFamily: fonts.semiBold,
    textAlign: "right",
  },
  headerButtonTextDisabled: {
    color: colors.text.tertiary,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 24,
  },
  previewContainer: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    gap: 12,
  },
  previewIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  previewEmoji: {
    fontSize: 36,
  },
  previewName: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: colors.text.primary,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  emojiOption: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.secondary,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
  },
  emojiOptionText: {
    fontSize: 22,
  },
  colorRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: colors.base.white,
    shadowColor: colors.base.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    // // width: 44,
    // height: 44,
  },
  frequencyOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  frequencyOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.background.secondary,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    // flex: 1,
    alignItems: "center",
  },
  frequencyOptionText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.text.secondary,
  },
  customDaysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  dayOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.secondary,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
  },
  dayOptionText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.text.secondary,
  },
  dayOptionTextSelected: {
    color: colors.base.white,
  },
  monthNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  monthNavButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  monthNavButtonDisabled: {
    opacity: 0.4,
  },
  monthLabel: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.text.primary,
  },
  historyContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    minHeight: 80,
  },
  noHistoryText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text.tertiary,
    textAlign: "center",
    width: "100%",
    paddingVertical: 20,
  },
  historyDay: {
    width: 44,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
    backgroundColor: colors.background.elevated,
    position: "relative",
  },
  historyDayLabel: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  historyDayNumber: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.text.primary,
  },
  historyCheckIcon: {
    position: "absolute",
    top: -6,
    right: -6,
  },
  todayIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    marginTop: 8,
    backgroundColor: colors.danger[100],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.danger[200],
  },
  deleteButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  deleteButtonText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.danger[600],
  },
});

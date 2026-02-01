import { habitsStorage } from "@/src/storage/habits";
import colors from "@/src/theme/colors";
import { fonts } from "@/src/theme/fonts";
import { CompletionRecord, Habit } from "@/src/types/habit";
import { AppText as Text } from "@/src/ui/Text";
import { formatMonthYear, getMatchingDaysForMonth } from "@/src/utils/dates";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HABIT_COLORS = [
  "#3B82F6",
  "#22C55E",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
];

// Main preset icons (2 rows of 6)
const PRESET_ICONS = [
  "barbell-outline",
  "book-outline",
  "water-outline",
  "leaf-outline",
  "walk-outline",
  "bed-outline",
  "nutrition-outline",
  "pencil-outline",
  "medical-outline",
  "happy-outline",
  "wallet-outline",
] as const;

// Extended icons for the modal
const EXTENDED_ICONS = [
  // Fitness & Health
  "fitness-outline",
  "bicycle-outline",
  "football-outline",
  "basketball-outline",
  "tennisball-outline",
  "golf-outline",
  "body-outline",
  "heart-outline",
  "pulse-outline",
  "bandage-outline",
  // Mind & Wellness
  "brain-outline",
  "eye-outline",
  "ear-outline",
  "rose-outline",
  "sunny-outline",
  "moon-outline",
  "cloudy-night-outline",
  "sparkles-outline",
  // Productivity & Work
  "laptop-outline",
  "desktop-outline",
  "code-slash-outline",
  "terminal-outline",
  "briefcase-outline",
  "clipboard-outline",
  "document-text-outline",
  "mail-outline",
  "calendar-outline",
  "time-outline",
  "alarm-outline",
  "hourglass-outline",
  // Learning & Creativity
  "school-outline",
  "library-outline",
  "language-outline",
  "musical-notes-outline",
  "musical-note-outline",
  "mic-outline",
  "headset-outline",
  "camera-outline",
  "color-palette-outline",
  "brush-outline",
  // Social & Communication
  "people-outline",
  "person-outline",
  "call-outline",
  "chatbubble-outline",
  "hand-left-outline",
  "thumbs-up-outline",
  // Home & Life
  "home-outline",
  "bed-outline",
  "cafe-outline",
  "restaurant-outline",
  "wine-outline",
  "beer-outline",
  "pizza-outline",
  "fast-food-outline",
  "ice-cream-outline",
  "fish-outline",
  "paw-outline",
  "car-outline",
  "airplane-outline",
  "globe-outline",
  "map-outline",
  // Finance & Shopping
  "cash-outline",
  "card-outline",
  "cart-outline",
  "pricetag-outline",
  "gift-outline",
  // Nature & Environment
  "flower-outline",
  "earth-outline",
  "rainy-outline",
  "snow-outline",
  "thermometer-outline",
  "bonfire-outline",
  // Tech & Tools
  "settings-outline",
  "construct-outline",
  "hammer-outline",
  "bulb-outline",
  "flash-outline",
  "battery-charging-outline",
  "wifi-outline",
  "bluetooth-outline",
  // Misc
  "star-outline",
  "trophy-outline",
  "medal-outline",
  "ribbon-outline",
  "flag-outline",
  "rocket-outline",
  "planet-outline",
  "infinite-outline",
  "shield-checkmark-outline",
  "checkmark-circle-outline",
] as const;

const DEFAULT_ICON = "barbell-outline";

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
  const [selectedIcon, setSelectedIcon] = useState(DEFAULT_ICON);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState("daily");
  const [customDays, setCustomDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [existingHabit, setExistingHabit] = useState<Habit | null>(null);
  const [completions, setCompletions] = useState<CompletionRecord>({});
  const [historyMonth, setHistoryMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const { top, bottom } = useSafeAreaInsets();

  // Helper to format time as HH:mm
  const formatTime = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Helper to parse HH:mm string to Date
  const parseTimeString = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

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
          setSelectedIcon(habit.icon || DEFAULT_ICON);
          setSelectedFrequency(habit.frequency);
          setCustomDays(habit.days);
          setCompletions(allCompletions);
          if (habit.startTime) setStartTime(parseTimeString(habit.startTime));
          if (habit.endTime) setEndTime(parseTimeString(habit.endTime));
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
              icon: selectedIcon,
              frequency: selectedFrequency,
              days,
              startTime: startTime ? formatTime(startTime) : undefined,
              endTime: endTime ? formatTime(endTime) : undefined,
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
        icon: selectedIcon,
        frequency: selectedFrequency,
        days,
        createdAt: new Date(),
        startTime: startTime ? formatTime(startTime) : undefined,
        endTime: endTime ? formatTime(endTime) : undefined,
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
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottom },
        ]}
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
            <Ionicons
              name={selectedIcon as keyof typeof Ionicons.glyphMap}
              size={36}
              color={selectedColor}
            />
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

        {/* Icon Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Icon</Text>
          <View style={styles.iconGrid}>
            {PRESET_ICONS.map((icon) => {
              const isSelected = selectedIcon === icon;
              return (
                <Pressable
                  key={icon}
                  style={({ pressed }) => [
                    styles.iconOption,
                    isSelected && {
                      backgroundColor: selectedColor,
                      borderColor: selectedColor,
                    },
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Ionicons
                    name={icon as keyof typeof Ionicons.glyphMap}
                    size={24}
                    color={
                      isSelected ? colors.base.white : colors.text.tertiary
                    }
                  />
                </Pressable>
              );
            })}
            {/* More icons button */}
            <Pressable
              style={({ pressed }) => [
                styles.iconOption,
                !PRESET_ICONS.includes(
                  selectedIcon as (typeof PRESET_ICONS)[number]
                ) && {
                  backgroundColor: selectedColor,
                  borderColor: selectedColor,
                },
                pressed && styles.pressed,
              ]}
              onPress={() => setIsIconPickerOpen(true)}
            >
              {PRESET_ICONS.includes(
                selectedIcon as (typeof PRESET_ICONS)[number]
              ) ? (
                <Ionicons
                  name="ellipsis-horizontal"
                  size={24}
                  color={colors.text.tertiary}
                />
              ) : (
                <Ionicons
                  name={selectedIcon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={colors.base.white}
                />
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

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule (optional)</Text>
          <View style={styles.timeRow}>
            <Pressable
              style={({ pressed }) => [
                styles.timeButton,
                startTime && {
                  backgroundColor: `${selectedColor}18`,
                  borderColor: selectedColor,
                },
                pressed && styles.pressed,
              ]}
              onPress={() => setShowStartPicker(true)}
            >
              <Ionicons
                name="time-outline"
                size={18}
                color={startTime ? selectedColor : colors.text.tertiary}
              />
              <Text
                style={[
                  styles.timeButtonText,
                  startTime && { color: selectedColor },
                ]}
              >
                {startTime ? formatTime(startTime) : "Start time"}
              </Text>
            </Pressable>

            <Text style={styles.timeSeparator}>—</Text>

            <Pressable
              style={({ pressed }) => [
                styles.timeButton,
                endTime && {
                  backgroundColor: `${selectedColor}18`,
                  borderColor: selectedColor,
                },
                pressed && styles.pressed,
              ]}
              onPress={() => setShowEndPicker(true)}
            >
              <Ionicons
                name="time-outline"
                size={18}
                color={endTime ? selectedColor : colors.text.tertiary}
              />
              <Text
                style={[
                  styles.timeButtonText,
                  endTime && { color: selectedColor },
                ]}
              >
                {endTime ? formatTime(endTime) : "End time"}
              </Text>
            </Pressable>
          </View>

          {(startTime || endTime) && (
            <Pressable
              style={({ pressed }) => [
                styles.clearTimeButton,
                pressed && styles.pressed,
              ]}
              onPress={() => {
                setStartTime(null);
                setEndTime(null);
              }}
            >
              <Ionicons
                name="close-circle-outline"
                size={16}
                color={colors.text.tertiary}
              />
              <Text style={styles.clearTimeText}>Clear schedule</Text>
            </Pressable>
          )}
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={startTime || new Date()}
            mode="time"
            is24Hour={true}
            display="spinner"
            onChange={(event, date) => {
              setShowStartPicker(false);
              if (event.type === "set" && date) {
                setStartTime(date);
              }
            }}
            themeVariant="dark"
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endTime || new Date()}
            mode="time"
            is24Hour={true}
            display="spinner"
            onChange={(event, date) => {
              setShowEndPicker(false);
              if (event.type === "set" && date) {
                setEndTime(date);
              }
            }}
            themeVariant="dark"
          />
        )}

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

      {/* Icon Picker Modal */}
      <Modal
        visible={isIconPickerOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsIconPickerOpen(false)}
      >
        <View style={[styles.modalContainer, { paddingBottom: bottom }]}>
          <View style={[styles.modalHeader, { paddingTop: top + 16 }]}>
            <Text style={styles.modalTitle}>Choose Icon</Text>
            <Pressable
              onPress={() => setIsIconPickerOpen(false)}
              style={({ pressed }) => [
                styles.modalCloseButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </Pressable>
          </View>
          <FlatList
            data={EXTENDED_ICONS}
            numColumns={6}
            keyExtractor={(item) => item}
            contentContainerStyle={[
              styles.modalIconGrid,
              { paddingBottom: 20 },
            ]}
            renderItem={({ item: icon }) => {
              const isSelected = selectedIcon === icon;
              return (
                <Pressable
                  style={({ pressed }) => [
                    styles.modalIconOption,
                    isSelected && {
                      backgroundColor: selectedColor,
                      borderColor: selectedColor,
                    },
                    pressed && styles.pressed,
                  ]}
                  onPress={() => {
                    setSelectedIcon(icon);
                    setIsIconPickerOpen(false);
                  }}
                >
                  <Ionicons
                    name={icon as keyof typeof Ionicons.glyphMap}
                    size={28}
                    color={
                      isSelected ? colors.base.white : colors.text.tertiary
                    }
                  />
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>
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
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  iconOption: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.secondary,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.text.primary,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalIconGrid: {
    padding: 16,
    gap: 12,
  },
  modalIconOption: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: "16.666%",
    margin: 4,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.secondary,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
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
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  timeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.border.subtle,
  },
  timeButtonText: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.text.tertiary,
  },
  timeSeparator: {
    fontSize: 16,
    color: colors.text.tertiary,
  },
  clearTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  clearTimeText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.text.tertiary,
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

import { habitsStorage } from "@/src/storage/habits";
import colors from "@/src/theme/colors";
import { fonts } from "@/src/theme/fonts";
import { Habit } from "@/src/types/habit";
import { AppText as Text } from "@/src/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HABIT_COLORS = [
  colors.primary[500],
  colors.success[600],
  colors.warning[600],
  colors.info[600],
  colors.danger[600],
  colors.auxiliary[500],
];

const HABIT_ICONS = [
  "sunny-outline",
  "fitness-outline",
  "book-outline",
  "water-outline",
  "leaf-outline",
  "heart-outline",
  "musical-notes-outline",
  "code-slash-outline",
  "language-outline",
  "bed-outline",
  "walk-outline",
  "bicycle-outline",
] as const;

type HabitIcon = (typeof HABIT_ICONS)[number];

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
  const [selectedIcon, setSelectedIcon] = useState<HabitIcon>(HABIT_ICONS[0]);
  const [selectedFrequency, setSelectedFrequency] = useState("daily");
  const [customDays, setCustomDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [existingHabit, setExistingHabit] = useState<Habit | null>(null);
  const { top } = useSafeAreaInsets();

  // Load existing habit data when editing
  useEffect(() => {
    if (habitId) {
      const loadHabit = async () => {
        const habits = await habitsStorage.getHabits();
        const habit = habits.find((h) => h.id === habitId);
        if (habit) {
          setExistingHabit(habit);
          setName(habit.name);
          // Find matching color or use first as default
          const matchingColor = HABIT_COLORS.find((c) => c === habit.color);
          if (matchingColor) setSelectedColor(matchingColor);
          setSelectedIcon(habit.icon as HabitIcon);
          setSelectedFrequency(habit.frequency);
          setCustomDays(habit.days);
        }
      };
      loadHabit();
    }
  }, [habitId]);

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
            }
          : habit,
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
      ],
    );
  };

  const toggleCustomDay = (dayIndex: number) => {
    setCustomDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex].sort(),
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
            <Ionicons name={selectedIcon} size={32} color={selectedColor} />
          </View>
          <Text style={styles.previewName}>{name || "Habit name"}</Text>
        </View>

        {/* Name Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Meditate, Exercise, Read..."
            placeholderTextColor={colors.neutral[400]}
            value={name}
            onChangeText={setName}
            // autoFocus
          />
        </View>

        {/* Icon Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Icon</Text>
          <View style={styles.iconGrid}>
            {HABIT_ICONS.map((icon) => (
              <Pressable
                key={icon}
                style={({ pressed }) => [
                  styles.iconOption,
                  selectedIcon === icon && {
                    backgroundColor: `${selectedColor}18`,
                    borderColor: selectedColor,
                  },
                  pressed && styles.pressed,
                ]}
                onPress={() => setSelectedIcon(icon)}
              >
                <Ionicons
                  name={icon}
                  size={24}
                  color={
                    selectedIcon === icon ? selectedColor : colors.neutral[500]
                  }
                />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Color Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color</Text>
          <View style={styles.colorRow}>
            {HABIT_COLORS.map((color) => (
              <Pressable
                key={color}
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
    </View>
  );
};

export default CreateHabit;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
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
    backgroundColor: colors.base.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
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
    color: colors.neutral[500],
  },
  headerButtonPrimary: {
    color: colors.primary[500],
    fontFamily: fonts.semiBold,
    textAlign: "right",
  },
  headerButtonTextDisabled: {
    color: colors.neutral[400],
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: colors.auxiliary[700],
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
    backgroundColor: colors.base.white,
    borderRadius: 16,
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
    color: colors.auxiliary[700],
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.neutral[500],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: colors.base.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.auxiliary[700],
    borderWidth: 1,
    borderColor: colors.neutral[200],
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
    backgroundColor: colors.base.white,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
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
    backgroundColor: colors.base.white,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    // flex: 1,
    alignItems: "center",
  },
  frequencyOptionText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.neutral[600],
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
    backgroundColor: colors.base.white,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
  },
  dayOptionText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.neutral[500],
  },
  dayOptionTextSelected: {
    color: colors.base.white,
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

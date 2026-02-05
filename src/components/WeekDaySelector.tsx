import colors from "@/src/theme/colors";
import { fonts } from "@/src/theme/fonts";
import { getScrollableDays } from "@/src/utils/dates";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useMemo } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { AppText as Text } from "../ui/Text";

interface WeekDaySelectorProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const DAYS_BEFORE = 30;
const DAYS_AFTER = 5;
const VISIBLE_DAYS = 7;
const GAP = 4;
const SCROLL_DURATION = 350;
const SCREEN_WIDTH = Dimensions.get("window").width;

// Calculate width so days + gaps fit in screen width
const DAY_ITEM_WIDTH = Math.floor(
  (SCREEN_WIDTH - (VISIBLE_DAYS - 1) * GAP) / VISIBLE_DAYS
);

// Calculate remaining space and distribute as padding to center days
const TOTAL_DAYS_WIDTH = VISIBLE_DAYS * DAY_ITEM_WIDTH + (VISIBLE_DAYS - 1) * GAP;
export const DAYS_HORIZONTAL_PADDING = Math.floor((SCREEN_WIDTH - TOTAL_DAYS_WIDTH) / 2);

// Header padding so icon centers align with day centers (44 = button width)
export const HEADER_HORIZONTAL_PADDING = DAYS_HORIZONTAL_PADDING + DAY_ITEM_WIDTH / 2 - 22;

// Position selected day as 2nd from right (1 day to the right)
const DAYS_TO_RIGHT = 1;
const SLOT_WIDTH = DAY_ITEM_WIDTH + GAP;

export const WeekDaySelector = ({
  selectedDate,
  onSelectDate,
}: WeekDaySelectorProps) => {
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(0);
  const isAnimating = useSharedValue(false);

  const days = useMemo(() => getScrollableDays(DAYS_BEFORE, DAYS_AFTER), []);

  // Track manual scroll to keep scrollX in sync
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (!isAnimating.value) {
        scrollX.value = event.contentOffset.x;
      }
    },
  });

  // Animate scroll when scrollX changes
  useDerivedValue(() => {
    scrollTo(scrollViewRef, scrollX.value, 0, false);
  });

  const scrollToDate = useCallback(
    (date: string, animated: boolean) => {
      const dayIndex = days.findIndex((d) => d.date === date);
      if (dayIndex === -1) return;

      // Position where we want the selected day within the visible 6 days
      // With DAYS_TO_RIGHT = 1, selected day will be at position 4 (penultimate)
      const targetPosition = VISIBLE_DAYS - DAYS_TO_RIGHT - 1;

      // Calculate first visible day index
      let firstVisibleIndex = dayIndex - targetPosition;

      // Clamp to valid range to ensure exactly 6 days are visible
      const maxFirstIndex = days.length - VISIBLE_DAYS;
      firstVisibleIndex = Math.max(
        0,
        Math.min(firstVisibleIndex, maxFirstIndex)
      );

      // Scroll position aligned to show exactly 6 complete days
      const targetX = firstVisibleIndex * SLOT_WIDTH;

      if (animated) {
        isAnimating.value = true;
        scrollX.value = withTiming(
          targetX,
          {
            duration: SCROLL_DURATION,
            easing: Easing.out(Easing.cubic),
          },
          () => {
            isAnimating.value = false;
          }
        );
      } else {
        scrollX.value = targetX;
      }
    },
    [days, scrollX, isAnimating]
  );

  // Scroll to selected date on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToDate(selectedDate, false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectDay = (date: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectDate(date);
    scrollToDate(date, true);
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        bounces={true}
        alwaysBounceHorizontal={true}
        overScrollMode="always"
      >
        {days.map((day) => {
          const isSelected = day.date === selectedDate;
          const isFutureStyle = day.isFuture && !isSelected;

          return (
            <Pressable
              key={day.date}
              onPress={() => handleSelectDay(day.date)}
              style={({ pressed }) => [
                styles.dayItem,
                isSelected && styles.dayItemSelected,
                pressed && styles.dayItemPressed,
              ]}
            >
              <Text
                style={[
                  styles.dayLabel,
                  isSelected && styles.dayLabelSelected,
                  day.isToday && !isSelected && styles.dayLabelToday,
                  isFutureStyle && styles.dayLabelDisabled,
                ]}
              >
                {day.dayLabelShort}
              </Text>

              <Text
                style={[
                  styles.dayNumber,
                  isSelected && styles.dayNumberSelected,
                  day.isToday && !isSelected && styles.dayNumberToday,
                  isFutureStyle && styles.dayNumberDisabled,
                ]}
              >
                {day.dayNumber}
              </Text>
            </Pressable>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  scrollContent: {
    gap: GAP,
    paddingHorizontal: DAYS_HORIZONTAL_PADDING,
  },
  dayItem: {
    alignItems: "center",
    width: DAY_ITEM_WIDTH,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  dayItemSelected: {
    backgroundColor: colors.accent.primaryMuted,
    borderWidth: 1,
    borderColor: colors.accent.primary,
  },
  dayItemPressed: {
    opacity: 0.7,
  },
  dayLabel: {
    fontSize: 10,
    fontFamily: fonts.medium,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  dayLabelSelected: {
    color: colors.base.white,
    fontFamily: fonts.medium,
  },
  dayLabelToday: {
    color: colors.accent.primary,
  },
  dayLabelDisabled: {
    color: colors.text.disabled,
  },
  dayNumber: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.text.secondary,
  },
  dayNumberSelected: {
    color: colors.base.white,
  },
  dayNumberToday: {
    color: colors.accent.primary,
  },
  dayNumberDisabled: {
    color: colors.text.disabled,
  },
});

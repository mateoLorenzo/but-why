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
const PADDING_HORIZONTAL = 16;
const SCROLL_DURATION = 350;
const SCREEN_WIDTH = Dimensions.get("window").width;

const DAY_ITEM_WIDTH = Math.floor(
  (SCREEN_WIDTH - (VISIBLE_DAYS - 1) * GAP - 2 * PADDING_HORIZONTAL) /
    VISIBLE_DAYS
);

// Position selected day as 2nd from right (1 day to the right)
const DAYS_TO_RIGHT = 1;

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

      // Calculate day position
      const dayPosition =
        dayIndex * (DAY_ITEM_WIDTH + GAP) + PADDING_HORIZONTAL;

      // Position the selected day with DAYS_TO_RIGHT days to its right
      // targetX = dayPosition - (screenWidth - space for days on right - padding)
      const spaceForRightDays =
        (DAYS_TO_RIGHT + 1) * (DAY_ITEM_WIDTH + GAP) + PADDING_HORIZONTAL;
      const targetX = Math.max(
        0,
        dayPosition - SCREEN_WIDTH + spaceForRightDays
      );

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
        snapToInterval={DAY_ITEM_WIDTH + GAP}
        decelerationRate="fast"
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
    paddingHorizontal: 16,
    gap: GAP,
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
    fontSize: 13,
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

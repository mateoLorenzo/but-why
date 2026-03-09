import colors from "@/src/theme/colors";
import { fonts } from "@/src/theme/fonts";
import { getScrollableDays } from "@/src/utils/dates";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  scrollTo,
  useAnimatedProps,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { AppText as Text } from "../ui/Text";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedText = Animated.createAnimatedComponent(Text);

interface WeekDaySelectorProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  getProgressForDate?: (date: string) => number;
}

// Progress circle dimensions
const CIRCLE_SIZE = 32;
const STROKE_WIDTH = 2.5;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface ProgressCircleProps {
  progress: number;
  isSelected: boolean;
  isToday: boolean;
  isFuture: boolean;
}

const PROGRESS_ANIMATION_DURATION = 400;

const ProgressCircle = ({
  progress,
  isSelected,
  isToday,
  isFuture,
}: ProgressCircleProps) => {
  const animatedProgress = useSharedValue(progress);

  // Animate progress changes
  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: PROGRESS_ANIMATION_DURATION,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - animatedProgress.value),
  }));

  // Determine colors based on state
  const baseColor = isFuture
    ? colors.border.subtle
    : isSelected
      ? `${colors.accent.primary}50`
      : isToday
        ? `${colors.accent.primary}30`
        : colors.border.subtle;

  const progressColor = colors.accent.primary;

  return (
    <Svg
      width={CIRCLE_SIZE}
      height={CIRCLE_SIZE}
      style={{ transform: [{ scaleX: -1 }] }}
    >
      {/* Background circle */}
      <Circle
        cx={CIRCLE_SIZE / 2}
        cy={CIRCLE_SIZE / 2}
        r={RADIUS}
        stroke={baseColor}
        strokeWidth={STROKE_WIDTH}
        fill="transparent"
      />
      {/* Progress circle */}
      <AnimatedCircle
        cx={CIRCLE_SIZE / 2}
        cy={CIRCLE_SIZE / 2}
        r={RADIUS}
        stroke={progressColor}
        strokeWidth={STROKE_WIDTH}
        fill="transparent"
        strokeDasharray={CIRCUMFERENCE}
        animatedProps={animatedProps}
        strokeLinecap="round"
        rotation="-90"
        origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
      />
    </Svg>
  );
};

// Animation constants for completion celebration
const COMPLETION_ANIMATION_DURATION = 300;
const COMPLETION_CHECK_DISPLAY_TIME = 1500;
const SLIDE_DISTANCE = 10;

interface AnimatedDayNumberProps {
  dayNumber: number;
  progress: number;
  isSelected: boolean;
  isToday: boolean;
  isFuture: boolean;
  textStyle: any[];
}

const AnimatedDayNumber = ({
  dayNumber,
  progress,
  isSelected,
  isToday,
  isFuture,
  textStyle,
}: AnimatedDayNumberProps) => {
  const prevProgress = useRef(progress);
  const showCheck = useSharedValue(0); // 0 = show number, 1 = show check
  const numberOpacity = useSharedValue(1);
  const numberTranslateY = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const checkTranslateY = useSharedValue(-SLIDE_DISTANCE);

  useEffect(() => {
    const wasCompleted = prevProgress.current === 1;
    const isNowCompleted = progress === 1;

    // Only animate when transitioning TO 100% (not when loading or already at 100%)
    if (!wasCompleted && isNowCompleted) {
      const animConfig = {
        duration: COMPLETION_ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
      };

      // Phase 1: Number exits down, Check enters from top
      // Phase 2 (after display time): Check exits down, Number enters from top

      // Number: fade out -> wait for check to exit -> fade in
      numberOpacity.value = withSequence(
        withTiming(0, animConfig),
        withDelay(
          COMPLETION_CHECK_DISPLAY_TIME + COMPLETION_ANIMATION_DURATION,
          withTiming(1, animConfig)
        )
      );

      // Number Y: slide down -> wait for check to exit -> reset to top -> slide to center
      numberTranslateY.value = withSequence(
        withTiming(SLIDE_DISTANCE, animConfig),
        withDelay(
          COMPLETION_CHECK_DISPLAY_TIME + COMPLETION_ANIMATION_DURATION,
          withTiming(-SLIDE_DISTANCE, { duration: 0 })
        ),
        withTiming(0, animConfig)
      );

      // Check: wait -> fade in -> wait -> fade out
      checkOpacity.value = withSequence(
        withDelay(COMPLETION_ANIMATION_DURATION / 2, withTiming(1, animConfig)),
        withDelay(COMPLETION_CHECK_DISPLAY_TIME, withTiming(0, animConfig))
      );

      // Check Y: reset to top -> slide to center -> wait -> slide down
      checkTranslateY.value = withSequence(
        withTiming(-SLIDE_DISTANCE, { duration: 0 }),
        withDelay(COMPLETION_ANIMATION_DURATION / 2, withTiming(0, animConfig)),
        withDelay(
          COMPLETION_CHECK_DISPLAY_TIME,
          withTiming(SLIDE_DISTANCE, animConfig)
        )
      );
    }

    prevProgress.current = progress;
  }, [progress]);

  const numberAnimatedStyle = useAnimatedStyle(() => ({
    opacity: numberOpacity.value,
    transform: [{ translateY: numberTranslateY.value }],
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ translateY: checkTranslateY.value }],
  }));

  const checkColor = isSelected
    ? colors.base.white
    : isToday
    ? colors.accent.primary
    : colors.accent.primary;

  return (
    <>
      <AnimatedText
        style={[...textStyle, styles.dayNumberAnimated, numberAnimatedStyle]}
      >
        {dayNumber}
      </AnimatedText>
      <Animated.View style={[styles.checkIcon, checkAnimatedStyle]}>
        <Ionicons name="checkmark" size={16} color={checkColor} />
      </Animated.View>
    </>
  );
};

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
const TOTAL_DAYS_WIDTH =
  VISIBLE_DAYS * DAY_ITEM_WIDTH + (VISIBLE_DAYS - 1) * GAP;
export const DAYS_HORIZONTAL_PADDING = Math.floor(
  (SCREEN_WIDTH - TOTAL_DAYS_WIDTH) / 2
);

// Header padding so icon centers align with day centers (44 = button width)
export const HEADER_HORIZONTAL_PADDING =
  DAYS_HORIZONTAL_PADDING + DAY_ITEM_WIDTH / 2 - 22;

// Position selected day as 2nd from right (1 day to the right)
const DAYS_TO_RIGHT = 1;
const SLOT_WIDTH = DAY_ITEM_WIDTH + GAP;

export const WeekDaySelector = ({
  selectedDate,
  onSelectDate,
  getProgressForDate,
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
          const progress = getProgressForDate
            ? getProgressForDate(day.date)
            : 0;

          return (
            <Pressable
              key={day.date}
              onPress={() => handleSelectDay(day.date)}
              style={({ pressed }) => [
                styles.dayItem,
                isSelected && styles.dayItemSelected,
                pressed && styles.dayItemPressed,
              ]}
              accessibilityLabel={`${day.dayLabelShort} ${day.dayNumber}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <View style={styles.dayLabelContainer}>
                {day.isToday && <View style={styles.todayIndicator} />}
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
              </View>

              <View style={styles.dayNumberContainer}>
                <ProgressCircle
                  progress={progress}
                  isSelected={isSelected}
                  isToday={day.isToday}
                  isFuture={day.isFuture}
                />
                <AnimatedDayNumber
                  dayNumber={day.dayNumber}
                  progress={progress}
                  isSelected={isSelected}
                  isToday={day.isToday}
                  isFuture={day.isFuture}
                  textStyle={[
                    styles.dayNumber,
                    isSelected && styles.dayNumberSelected,
                    day.isToday && !isSelected && styles.dayNumberToday,
                    isFutureStyle && styles.dayNumberDisabled,
                    progress === 1 && !isSelected && styles.dayNumberCompleted,
                  ]}
                />
              </View>
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
  dayLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  todayIndicator: {
    position: "absolute",
    left: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent.primary,
  },
  dayLabel: {
    fontSize: 10,
    fontFamily: fonts.medium,
    color: colors.text.secondary,
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
  dayNumberContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumber: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.text.secondary,
  },
  dayNumberAnimated: {
    position: "absolute",
  },
  checkIcon: {
    position: "absolute",
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
  dayNumberCompleted: {
    color: colors.text.secondary,
  },
});

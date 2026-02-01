/**
 * DayNavigator Component
 *
 * Horizontal scrollable day selector that displays 15 days (7 past + today + 7 future).
 * Allows users to navigate between dates to view habits for different days.
 *
 * Features:
 * - Spanish day labels (D, L, M, X, J, V, S)
 * - Auto-scrolls to center (today) on mount
 * - Highlights selected date
 * - Future dates appear with reduced opacity
 * - Smooth horizontal scrolling
 *
 * @example
 * <DayNavigator
 *   selectedDate="2026-02-01"
 *   onDateSelect={(date) => console.log('Selected:', date)}
 *   accentColor="#3B82F6"
 * />
 */

import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { DayItem } from './DayItem';
import colors from '@/src/theme/colors';

export interface DayNavigatorProps {
  selectedDate: string;              // YYYY-MM-DD
  onDateSelect: (date: string) => void;
  accentColor?: string;
}

/**
 * Spanish day labels
 * Index 0 = Sunday (D), 1 = Monday (L), etc.
 */
const SPANISH_DAY_LABELS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

/**
 * Formats a date to YYYY-MM-DD string
 * @param date - JavaScript Date object
 * @returns Date string in YYYY-MM-DD format
 */
const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Generates an array of 15 days centered on today
 * @returns Array of date objects with metadata
 */
const generateDays = () => {
  const today = new Date();
  today.setHours(12, 0, 0, 0); // Normalize to noon to avoid timezone issues

  const days = [];

  // Generate 7 past days + today + 7 future days
  for (let i = -7; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dateString = formatDateString(date);
    const dayOfWeek = date.getDay(); // 0-6 (Sun-Sat)
    const dayNumber = date.getDate();
    const dayLabel = SPANISH_DAY_LABELS[dayOfWeek];

    const isToday = i === 0;
    const isFuture = i > 0;

    days.push({
      dateString,
      dayLabel,
      dayNumber,
      isToday,
      isFuture,
    });
  }

  return days;
};

export const DayNavigator: React.FC<DayNavigatorProps> = ({
  selectedDate,
  onDateSelect,
  accentColor = colors.accent.primary,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const days = generateDays();

  /**
   * Auto-scroll to center (today) on mount
   * Centers the today item in the visible area
   */
  useEffect(() => {
    // Find today's index (should be at index 7)
    const todayIndex = days.findIndex(day => day.isToday);

    if (todayIndex !== -1 && scrollViewRef.current) {
      // Calculate scroll position to center today
      // Each day item is 44px wide, plus some padding
      const itemWidth = 44;
      const gap = 8; // Gap between items
      const scrollPosition = todayIndex * (itemWidth + gap) - 100; // Offset to center

      // Use setTimeout to ensure ScrollView is fully mounted
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: Math.max(0, scrollPosition),
          animated: true,
        });
      }, 100);
    }
  }, []);

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scrollView}
    >
      {days.map((day) => {
        const isSelected = day.dateString === selectedDate;

        return (
          <View key={day.dateString} style={styles.dayItemWrapper}>
            <DayItem
              dayLabel={day.dayLabel}
              dayNumber={day.dayNumber}
              isToday={day.isToday}
              isSelected={isSelected}
              isFuture={day.isFuture}
              onPress={() => onDateSelect(day.dateString)}
            />
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    height: 56,
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 8,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayItemWrapper: {
    // Wrapper for consistent spacing
  },
});

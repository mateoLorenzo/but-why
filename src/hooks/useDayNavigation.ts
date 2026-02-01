/**
 * useDayNavigation Hook
 *
 * Manages the selected date state for day-based habit navigation.
 * Provides utilities to determine if a date is in the future.
 *
 * Features:
 * - Maintains selected date in YYYY-MM-DD format
 * - Initializes to today's date
 * - Provides helper to check if a date is in the future
 * - Date comparison ignores time component
 *
 * @example
 * const { selectedDate, setSelectedDate, isFutureDay } = useDayNavigation();
 *
 * // Check if selected date is in the future
 * const disabled = isFutureDay(selectedDate);
 *
 * // Change selected date
 * setSelectedDate('2026-02-05');
 */

import { useState, useCallback } from 'react';

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
 * Gets today's date as a YYYY-MM-DD string
 * Normalized to noon to avoid timezone issues
 */
const getTodayString = (): string => {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return formatDateString(today);
};

export const useDayNavigation = () => {
  // Initialize with today's date
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());

  /**
   * Checks if a given date is in the future
   * Compares dates at midnight to ignore time component
   *
   * @param dateString - Date in YYYY-MM-DD format
   * @returns true if the date is in the future, false otherwise
   */
  const isFutureDay = useCallback((dateString: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const compareDate = new Date(dateString + 'T12:00:00');
    compareDate.setHours(0, 0, 0, 0);

    return compareDate > today;
  }, []);

  return {
    selectedDate,
    setSelectedDate,
    isFutureDay,
  };
};

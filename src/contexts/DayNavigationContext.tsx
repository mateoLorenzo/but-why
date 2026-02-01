import React, { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';
import { formatDateKey } from '@/src/utils/dates';

/**
 * State representing the currently selected day and its properties.
 */
interface DayNavigationState {
  selectedDate: string;        // Format: 'YYYY-MM-DD'
  isToday: boolean;
  isPastDay: boolean;
  isFutureDay: boolean;
}

/**
 * Actions available for navigating between days.
 */
interface DayNavigationActions {
  setSelectedDate: (date: string) => void;
  goToToday: () => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
}

/**
 * Combined context value with state and actions.
 */
interface DayNavigationContextValue extends DayNavigationState, DayNavigationActions {}

const DayNavigationContext = createContext<DayNavigationContextValue | undefined>(undefined);

interface DayNavigationProviderProps {
  children: ReactNode;
}

/**
 * Validates that a date string is in YYYY-MM-DD format and is a valid date.
 *
 * @param dateString - Date string to validate
 * @returns true if valid, false otherwise
 */
function isValidDateString(dateString: string): boolean {
  // Check format: YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }

  // Check if it's a valid date
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return false;
  }

  // Verify the date string matches the parsed date
  // This catches invalid dates like '2026-02-30'
  const formatted = formatDateKey(date);
  return formatted === dateString;
}

/**
 * Provider component for day navigation state.
 *
 * Manages the currently selected date and provides navigation functions.
 * Automatically computes derived state (isToday, isPastDay, isFutureDay).
 *
 * @example
 * function App() {
 *   return (
 *     <DayNavigationProvider>
 *       <HomeScreen />
 *     </DayNavigationProvider>
 *   );
 * }
 */
export function DayNavigationProvider({ children }: DayNavigationProviderProps) {
  // Initialize to today's date
  const [selectedDate, setSelectedDateInternal] = useState<string>(() => formatDateKey(new Date()));

  /**
   * Set the selected date with validation.
   *
   * @param date - Date string in YYYY-MM-DD format
   */
  const setSelectedDate = useCallback((date: string) => {
    if (!isValidDateString(date)) {
      console.warn(`Invalid date format: ${date}. Expected YYYY-MM-DD.`);
      return;
    }
    setSelectedDateInternal(date);
  }, []);

  /**
   * Navigate to today's date.
   */
  const goToToday = useCallback(() => {
    const today = formatDateKey(new Date());
    setSelectedDateInternal(today);
  }, []);

  /**
   * Navigate to the previous day.
   */
  const goToPreviousDay = useCallback(() => {
    const currentDate = new Date(selectedDate + 'T12:00:00');
    currentDate.setDate(currentDate.getDate() - 1);
    const previousDay = formatDateKey(currentDate);
    setSelectedDateInternal(previousDay);
  }, [selectedDate]);

  /**
   * Navigate to the next day.
   */
  const goToNextDay = useCallback(() => {
    const currentDate = new Date(selectedDate + 'T12:00:00');
    currentDate.setDate(currentDate.getDate() + 1);
    const nextDay = formatDateKey(currentDate);
    setSelectedDateInternal(nextDay);
  }, [selectedDate]);

  /**
   * Compute derived state properties.
   */
  const { isToday, isPastDay, isFutureDay } = useMemo(() => {
    const today = formatDateKey(new Date());

    return {
      isToday: selectedDate === today,
      isPastDay: selectedDate < today,
      isFutureDay: selectedDate > today,
    };
  }, [selectedDate]);

  const contextValue: DayNavigationContextValue = useMemo(
    () => ({
      selectedDate,
      isToday,
      isPastDay,
      isFutureDay,
      setSelectedDate,
      goToToday,
      goToPreviousDay,
      goToNextDay,
    }),
    [selectedDate, isToday, isPastDay, isFutureDay, setSelectedDate, goToToday, goToPreviousDay, goToNextDay]
  );

  return (
    <DayNavigationContext.Provider value={contextValue}>
      {children}
    </DayNavigationContext.Provider>
  );
}

/**
 * Hook to access day navigation state and actions.
 *
 * @throws Error if used outside of DayNavigationProvider
 * @returns DayNavigationContextValue with current state and navigation actions
 *
 * @example
 * function HabitList() {
 *   const { selectedDate, isToday, goToToday } = useDayNavigation();
 *
 *   return (
 *     <View>
 *       <Text>Viewing: {selectedDate}</Text>
 *       {!isToday && <Button onPress={goToToday}>Go to Today</Button>}
 *     </View>
 *   );
 * }
 */
export function useDayNavigation(): DayNavigationContextValue {
  const context = useContext(DayNavigationContext);

  if (context === undefined) {
    throw new Error('useDayNavigation must be used within a DayNavigationProvider');
  }

  return context;
}

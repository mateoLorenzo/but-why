# Phase 3: State Management Specifications

## Overview

This phase introduces day-based navigation state management, allowing users to view habits for any selected date while maintaining the existing AsyncStorage persistence layer.

---

## 3.1 DayNavigationContext

**File:** `src/contexts/DayNavigationContext.tsx`

### Interface Definition

```typescript
import { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';

// Types
interface DayNavigationState {
  selectedDate: string;        // Format: 'YYYY-MM-DD'
  isToday: boolean;
  isPastDay: boolean;
  isFutureDay: boolean;
}

interface DayNavigationActions {
  setSelectedDate: (date: string) => void;
  goToToday: () => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
}

interface DayNavigationContextValue extends DayNavigationState, DayNavigationActions {}

// Context
const DayNavigationContext = createContext<DayNavigationContextValue | null>(null);

// Hook
export function useDayNavigation(): DayNavigationContextValue {
  const context = useContext(DayNavigationContext);
  if (!context) {
    throw new Error('useDayNavigation must be used within DayNavigationProvider');
  }
  return context;
}
```

### Provider Implementation

```typescript
interface DayNavigationProviderProps {
  children: ReactNode;
}

export function DayNavigationProvider({ children }: DayNavigationProviderProps) {
  const [selectedDate, setSelectedDateState] = useState<string>(() => {
    return formatDateKey(new Date()); // Initialize to today
  });

  const dayClassification = useMemo(() => {
    const today = formatDateKey(new Date());
    return {
      isToday: selectedDate === today,
      isPastDay: selectedDate < today,
      isFutureDay: selectedDate > today,
    };
  }, [selectedDate]);

  const setSelectedDate = useCallback((date: string) => {
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      console.warn('Invalid date format. Expected YYYY-MM-DD');
      return;
    }
    setSelectedDateState(date);
  }, []);

  const goToToday = useCallback(() => {
    setSelectedDateState(formatDateKey(new Date()));
  }, []);

  const goToPreviousDay = useCallback(() => {
    const current = new Date(selectedDate + 'T12:00:00');
    current.setDate(current.getDate() - 1);
    setSelectedDateState(formatDateKey(current));
  }, [selectedDate]);

  const goToNextDay = useCallback(() => {
    const current = new Date(selectedDate + 'T12:00:00');
    current.setDate(current.getDate() + 1);
    setSelectedDateState(formatDateKey(current));
  }, [selectedDate]);

  const value = useMemo(() => ({
    selectedDate,
    ...dayClassification,
    setSelectedDate,
    goToToday,
    goToPreviousDay,
    goToNextDay,
  }), [selectedDate, dayClassification, setSelectedDate, goToToday, goToPreviousDay, goToNextDay]);

  return (
    <DayNavigationContext.Provider value={value}>
      {children}
    </DayNavigationContext.Provider>
  );
}
```

### Integration Point

Add provider to `app/_layout.tsx`:

```typescript
export default function RootLayout() {
  return (
    <DayNavigationProvider>
      <Stack>
        {/* existing routes */}
      </Stack>
    </DayNavigationProvider>
  );
}
```

---

## 3.2 Enhanced useHabits Hook

**File:** `src/hooks/useHabits.ts`

### New Interface Additions

```typescript
// New types to add to src/types/habit.ts
interface HabitForDay extends Habit {
  completedOnDate: boolean;
  isScheduledForDate: boolean;
  currentStreak: number;
}

interface StreakCache {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCalculatedDate: string;
}

// Enhanced hook return type
interface UseHabitsReturn {
  // Existing
  habits: HabitWithWeekStatus[];
  isLoading: boolean;
  error: Error | null;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => Promise<Habit>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  toggleCompletion: (habitId: string, date: string) => Promise<void>;
  refresh: () => Promise<void>;

  // New additions
  getHabitsForDate: (date: string) => HabitForDay[];
  getStreakForHabit: (habitId: string) => number;
}
```

### getHabitsForDate Implementation

```typescript
const getHabitsForDate = useCallback((date: string): HabitForDay[] => {
  const dateObj = new Date(date + 'T12:00:00');
  const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday

  return habits
    .filter(habit => {
      // Check if habit is scheduled for this day of week
      return habit.days.includes(dayOfWeek);
    })
    .map(habit => ({
      ...habit,
      completedOnDate: completions[habit.id]?.[date] ?? false,
      isScheduledForDate: true,
      currentStreak: calculateStreakForHabit(habit.id, completions, habit.days, date),
    }));
}, [habits, completions]);
```

---

## 3.3 Utility Functions

### habitFilters.ts

**File:** `src/utils/habitFilters.ts`

```typescript
import { Habit } from '../types/habit';

/**
 * Checks if a habit is scheduled for a specific date based on its frequency settings
 */
export function isHabitScheduledForDate(habit: Habit, date: Date): boolean {
  const dayOfWeek = date.getDay(); // 0-6 (Sunday-Saturday)
  return habit.days.includes(dayOfWeek);
}

/**
 * Determines day type for UI rendering and interaction permissions
 */
export type DayType = 'past' | 'today' | 'future';

export function classifyDay(dateString: string): DayType {
  const today = formatDateKey(new Date());

  if (dateString < today) return 'past';
  if (dateString === today) return 'today';
  return 'future';
}

/**
 * Permissions for interacting with habits on different day types
 */
export interface DayPermissions {
  canView: boolean;
  canMarkComplete: boolean;
  canMarkIncomplete: boolean;
  visualState: 'normal' | 'locked' | 'historical';
  opacity: number;
}

export function getDayPermissions(dateString: string): DayPermissions {
  const dayType = classifyDay(dateString);

  switch (dayType) {
    case 'past':
      return {
        canView: true,
        canMarkComplete: true,      // Allow editing past days
        canMarkIncomplete: true,
        visualState: 'historical',
        opacity: 1,
      };
    case 'today':
      return {
        canView: true,
        canMarkComplete: true,
        canMarkIncomplete: true,
        visualState: 'normal',
        opacity: 1,
      };
    case 'future':
      return {
        canView: true,
        canMarkComplete: false,
        canMarkIncomplete: false,
        visualState: 'locked',
        opacity: 0.35,
      };
  }
}
```

### streakCalculator.ts

**File:** `src/utils/streakCalculator.ts`

```typescript
import { formatDateKey } from './dates';

type CompletionRecord = Record<string, Record<string, boolean>>;

interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}

/**
 * Calculates streak for a specific habit
 *
 * @param habitId - The habit to calculate streak for
 * @param completions - All completion records
 * @param allowedDays - Days of week when habit is scheduled (0-6)
 * @param referenceDate - Date to calculate streak from (defaults to today)
 * @param maxLookback - Maximum days to look back (defaults to 365)
 */
export function calculateStreak(
  habitId: string,
  completions: CompletionRecord,
  allowedDays: number[],
  referenceDate: string = formatDateKey(new Date()),
  maxLookback: number = 365
): StreakResult {
  const habitCompletions = completions[habitId] || {};

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let streakBroken = false;

  const today = formatDateKey(new Date());
  let date = new Date(referenceDate + 'T12:00:00');

  for (let i = 0; i < maxLookback; i++) {
    const dateKey = formatDateKey(date);
    const dayOfWeek = date.getDay();

    // Only count days when habit is scheduled
    if (allowedDays.includes(dayOfWeek)) {
      const isCompleted = habitCompletions[dateKey] ?? false;

      if (isCompleted) {
        tempStreak++;
        if (!streakBroken) {
          currentStreak = tempStreak;
        }
      } else {
        // Today doesn't break streak if not completed yet
        if (dateKey !== today) {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 0;
          streakBroken = true;
        }
      }
    }

    date.setDate(date.getDate() - 1);
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  return { currentStreak, longestStreak };
}

/**
 * Simple current streak calculation for display
 */
export function calculateCurrentStreak(
  habitId: string,
  completions: CompletionRecord,
  allowedDays: number[]
): number {
  return calculateStreak(habitId, completions, allowedDays).currentStreak;
}
```

---

## 3.4 Type Definitions Update

**File:** `src/types/habit.ts`

Add these new types to the existing file:

```typescript
// Existing types remain unchanged...

// New additions:

/**
 * Habit with completion status for a specific date
 */
export interface HabitForDay extends Habit {
  /** Whether the habit was completed on the selected date */
  completedOnDate: boolean;
  /** Whether the habit is scheduled for the selected date (based on frequency) */
  isScheduledForDate: boolean;
  /** Current streak count */
  currentStreak: number;
}

/**
 * Cached streak information for performance
 */
export interface StreakCache {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  /** Date when streak was last calculated (YYYY-MM-DD) */
  lastCalculatedDate: string;
}

/**
 * App-wide settings stored in AsyncStorage
 */
export interface AppSettings {
  /** Last viewed date for restoring state */
  lastViewedDate: string;
  /** Default view mode */
  defaultView: 'today' | 'week';
  /** Whether haptic feedback is enabled */
  hapticFeedbackEnabled: boolean;
}

/**
 * Day classification for UI logic
 */
export type DayType = 'past' | 'today' | 'future';
```

---

## 3.5 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        App Layout                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              DayNavigationProvider                          ││
│  │  ┌─────────────────────────────────────────────────────────┐││
│  │  │                   Home Screen                           │││
│  │  │                                                         │││
│  │  │  ┌─────────────┐    ┌─────────────────────────────────┐│││
│  │  │  │DayNavigator │    │         useHabits()             ││││
│  │  │  │             │    │  ┌───────────────────────────┐  ││││
│  │  │  │ useDayNav() │───▶│  │ getHabitsForDate(date)   │  ││││
│  │  │  │             │    │  │                           │  ││││
│  │  │  │selectedDate │    │  │ Returns: HabitForDay[]    │  ││││
│  │  │  └─────────────┘    │  └───────────────────────────┘  ││││
│  │  │                      │                                 ││││
│  │  │                      │  ┌───────────────────────────┐  ││││
│  │  │                      │  │   AsyncStorage            │  ││││
│  │  │                      │  │   @but_why/habits         │  ││││
│  │  │                      │  │   @but_why/completions    │  ││││
│  │  │                      │  └───────────────────────────┘  ││││
│  │  │                      └─────────────────────────────────┘│││
│  │  │                                                         │││
│  │  │  ┌─────────────────────────────────────────────────────┐│││
│  │  │  │              HabitCard (for each habit)             ││││
│  │  │  │  - Receives: HabitForDay                            ││││
│  │  │  │  - Shows: completedOnDate, currentStreak            ││││
│  │  │  │  - Respects: getDayPermissions(selectedDate)        ││││
│  │  │  └─────────────────────────────────────────────────────┘│││
│  │  └─────────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## 3.6 Implementation Checklist

### Context Setup
- [ ] Create `src/contexts/DayNavigationContext.tsx`
- [ ] Add `DayNavigationProvider` to `app/_layout.tsx`
- [ ] Create `useDayNavigation` hook export

### Hook Enhancements
- [ ] Add `getHabitsForDate` method to `useHabits`
- [ ] Add `getStreakForHabit` method to `useHabits`
- [ ] Update hook return type definition

### Utility Functions
- [ ] Create `src/utils/habitFilters.ts`
- [ ] Create `src/utils/streakCalculator.ts`
- [ ] Add unit tests for streak calculation

### Type Updates
- [ ] Add `HabitForDay` interface
- [ ] Add `StreakCache` interface
- [ ] Add `AppSettings` interface
- [ ] Add `DayType` type

---

## Acceptance Criteria

Phase 3 is complete when:

1. `DayNavigationContext` is created and integrated into app layout
2. `useDayNavigation` hook works correctly (test by logging selectedDate changes)
3. `getHabitsForDate` correctly filters habits for any given date
4. Streak calculation returns accurate counts
5. Day permissions correctly identify past/today/future
6. All new types are properly exported
7. No TypeScript errors in the codebase
8. Unit tests pass for utility functions

import { Habit } from '@/src/types/habit';
import { formatDateKey } from '@/src/utils/dates';

/**
 * Check if a habit is scheduled for a specific date.
 *
 * @param habit - The habit to check
 * @param date - The date to check (Date object)
 * @returns true if the habit is scheduled for this day of the week
 *
 * @example
 * const habit = { days: [1, 2, 3, 4, 5] }; // Weekdays
 * const monday = new Date('2026-02-02'); // Monday
 * isHabitScheduledForDate(habit, monday); // true
 */
export function isHabitScheduledForDate(habit: Habit, date: Date): boolean {
  const dayOfWeek = date.getDay(); // 0-6 (Sunday-Saturday)
  return habit.days.includes(dayOfWeek);
}

export type DayType = 'past' | 'today' | 'future';

/**
 * Classify a date string as past, today, or future.
 *
 * @param dateString - Date in YYYY-MM-DD format
 * @returns 'past' | 'today' | 'future'
 *
 * @example
 * classifyDay('2026-02-01'); // 'today' (if today is Feb 1)
 * classifyDay('2026-01-31'); // 'past'
 * classifyDay('2026-02-02'); // 'future'
 */
export function classifyDay(dateString: string): DayType {
  const today = formatDateKey(new Date());

  if (dateString === today) {
    return 'today';
  } else if (dateString < today) {
    return 'past';
  } else {
    return 'future';
  }
}

export interface DayPermissions {
  canView: boolean;
  canMarkComplete: boolean;
  canMarkIncomplete: boolean;
  visualState: 'normal' | 'locked' | 'historical';
  opacity: number;
}

/**
 * Get permissions and visual state for a given date.
 *
 * Past days: Can edit completions, shown with historical visual state
 * Today: Full permissions, normal visual state
 * Future days: View only, locked visual state, reduced opacity
 *
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Permissions object with interaction rules and visual properties
 *
 * @example
 * const permissions = getDayPermissions('2026-02-01');
 * if (permissions.canMarkComplete) {
 *   // Allow user to mark as complete
 * }
 */
export function getDayPermissions(dateString: string): DayPermissions {
  const dayType = classifyDay(dateString);

  switch (dayType) {
    case 'past':
      return {
        canView: true,
        canMarkComplete: true,
        canMarkIncomplete: true,
        visualState: 'historical',
        opacity: 1.0,
      };

    case 'today':
      return {
        canView: true,
        canMarkComplete: true,
        canMarkIncomplete: true,
        visualState: 'normal',
        opacity: 1.0,
      };

    case 'future':
      return {
        canView: true,
        canMarkComplete: false,
        canMarkIncomplete: false,
        visualState: 'locked',
        opacity: 0.35,
      };

    default:
      // Fallback - should never reach here
      return {
        canView: true,
        canMarkComplete: false,
        canMarkIncomplete: false,
        visualState: 'locked',
        opacity: 0.35,
      };
  }
}

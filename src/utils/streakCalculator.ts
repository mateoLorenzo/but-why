import { CompletionRecord } from '@/src/types/habit';
import { formatDateKey } from '@/src/utils/dates';

/**
 * Result of streak calculation containing current and longest streaks.
 */
export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}

/**
 * Calculate both current and longest streak for a habit.
 *
 * Algorithm:
 * - Start from the reference date (or today) and work backwards
 * - Count consecutive completions on scheduled days only
 * - Today doesn't break the streak if incomplete (grace period)
 * - Past days must be completed to continue the streak
 * - Track the longest streak found during the scan
 *
 * @param habitId - ID of the habit to calculate streaks for
 * @param completions - Full completion record (habitId -> date -> completed)
 * @param allowedDays - Days of week this habit is scheduled (0-6, Sunday-Saturday)
 * @param referenceDate - Date to calculate from (defaults to today in YYYY-MM-DD format)
 * @param maxLookback - Maximum days to look back (default: 365)
 * @returns Object containing currentStreak and longestStreak
 *
 * @example
 * const completions = {
 *   'habit1': {
 *     '2026-01-30': true,
 *     '2026-01-31': true,
 *     '2026-02-01': true,
 *   }
 * };
 * const result = calculateStreak('habit1', completions, [1,2,3,4,5]);
 * console.log(result.currentStreak); // 3
 */
export function calculateStreak(
  habitId: string,
  completions: CompletionRecord,
  allowedDays: number[],
  referenceDate?: string,
  maxLookback: number = 365,
): StreakResult {
  // Get habit's completion record
  const habitCompletions = completions[habitId] || {};

  // Use provided reference date or today
  const referenceDateKey = referenceDate || formatDateKey(new Date());
  const referenceDateObj = new Date(referenceDateKey + 'T12:00:00');

  // Validate reference date
  if (isNaN(referenceDateObj.getTime())) {
    console.warn(`Invalid reference date: ${referenceDateKey}`);
    return { currentStreak: 0, longestStreak: 0 };
  }

  const today = formatDateKey(new Date());
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let streakBroken = false;

  // Iterate backwards from reference date
  for (let i = 0; i < maxLookback; i++) {
    const date = new Date(referenceDateObj);
    date.setDate(referenceDateObj.getDate() - i);

    const dayOfWeek = date.getDay();
    const dateKey = formatDateKey(date);

    // Skip days that don't match the habit's schedule
    if (!allowedDays.includes(dayOfWeek)) {
      continue;
    }

    const isCompleted = habitCompletions[dateKey] || false;
    const isReferenceDay = (dateKey === referenceDateKey);

    if (isCompleted) {
      tempStreak++;
      if (!streakBroken) {
        currentStreak = tempStreak;
      }
    } else {
      // Only break streak for past days (not the reference day if it's today)
      if (!isReferenceDay || dateKey !== today) {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
        streakBroken = true;
      }
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);
  return { currentStreak, longestStreak };
}

/**
 * Calculate only the current streak (convenience function).
 *
 * @param habitId - ID of the habit
 * @param completions - Full completion record
 * @param allowedDays - Days of week this habit is scheduled (0-6)
 * @returns Current streak count
 *
 * @example
 * const streak = calculateCurrentStreak('habit1', completions, [1,2,3,4,5]);
 * console.log(`Current streak: ${streak} days`);
 */
export function calculateCurrentStreak(
  habitId: string,
  completions: CompletionRecord,
  allowedDays: number[],
): number {
  return calculateStreak(habitId, completions, allowedDays).currentStreak;
}

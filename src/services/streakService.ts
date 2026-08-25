import { parseISO, subDays, format, differenceInCalendarDays } from 'date-fns';
import { Problem, Streak } from '../types';
import { INITIAL_MOCK_STREAK } from '../lib/mockData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const STREAK_STORAGE_KEY = 'codetracker_streak';

export const streakService = {
  /**
   * Calculates current streak and longest streak from problem solve dates
   */
  calculateStreakFromProblems(problems: Problem[]): { currentStreak: number; longestStreak: number } {
    if (!problems || problems.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Get unique sorted dates in descending order (newest first)
    const uniqueDates = Array.from(new Set(problems.map((p) => p.solved_date)))
      .sort((a, b) => b.localeCompare(a));

    if (uniqueDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    // Current streak check
    let currentStreak = 0;
    const mostRecentDate = uniqueDates[0];

    // If solved today or yesterday, streak is active
    if (mostRecentDate === todayStr || mostRecentDate === yesterdayStr) {
      let expectedDate = parseISO(mostRecentDate);
      for (const dStr of uniqueDates) {
        const currentDate = parseISO(dStr);
        const diff = differenceInCalendarDays(expectedDate, currentDate);
        if (diff === 0) {
          currentStreak++;
          expectedDate = subDays(expectedDate, 1);
        } else if (diff > 0) {
          break;
        }
      }
    }

    // Longest streak calculation across all historical dates
    const sortedAscDates = [...uniqueDates].sort((a, b) => a.localeCompare(b));
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const dStr of sortedAscDates) {
      const curDate = parseISO(dStr);
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const diff = differenceInCalendarDays(curDate, prevDate);
        if (diff === 1) {
          tempStreak++;
        } else if (diff > 1) {
          tempStreak = 1;
        }
      }
      prevDate = curDate;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }

    longestStreak = Math.max(longestStreak, currentStreak);
    return { currentStreak, longestStreak };
  },

  /**
   * Get user streak
   */
  async getStreak(userId?: string, problems?: Problem[]): Promise<Streak> {
    if (problems && problems.length > 0) {
      const { currentStreak, longestStreak } = this.calculateStreakFromProblems(problems);
      return {
        user_id: userId || 'mock-user-123',
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_active_date: problems[0]?.solved_date || format(new Date(), 'yyyy-MM-dd'),
      };
    }

    if (isSupabaseConfigured() && supabase && userId && !userId.startsWith('mock-')) {
      const { data } = await supabase.from('streaks').select('*').eq('user_id', userId).single();
      if (data) return data as Streak;
    }

    const local = localStorage.getItem(STREAK_STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return INITIAL_MOCK_STREAK;
      }
    }

    return INITIAL_MOCK_STREAK;
  },

  /**
   * Update streak locally or remotely
   */
  async saveStreak(streak: Streak) {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streak));
    if (isSupabaseConfigured() && supabase && streak.user_id && !streak.user_id.startsWith('mock-')) {
      await supabase.from('streaks').upsert(streak);
    }
  },
};

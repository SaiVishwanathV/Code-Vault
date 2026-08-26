import { parseISO, subDays, format, differenceInCalendarDays } from 'date-fns';
import { Problem, Streak } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export const streakService = {
  /**
   * Calculates current streak and longest streak from problem solve dates
   * Strictly counts consecutive calendar days (YYYY-MM-DD)
   */
  calculateStreakFromProblems(problems: Problem[]): { currentStreak: number; longestStreak: number } {
    if (!problems || problems.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Sanitize dates to strict YYYY-MM-DD
    const rawDates = problems
      .map((p) => (p.solved_date ? p.solved_date.split('T')[0].trim() : ''))
      .filter((d) => Boolean(d) && /^\d{4}-\d{2}-\d{2}$/.test(d));

    const uniqueDates = Array.from(new Set(rawDates)).sort((a, b) => b.localeCompare(a));
    if (uniqueDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    let currentStreak = 0;
    const mostRecentDate = uniqueDates[0];

    // If solved today or yesterday, streak is currently active
    if (mostRecentDate === todayStr || mostRecentDate === yesterdayStr) {
      let expectedDate = parseISO(mostRecentDate);
      for (const dStr of uniqueDates) {
        const currentDate = parseISO(dStr);
        const diff = differenceInCalendarDays(expectedDate, currentDate);
        if (diff === 0) {
          currentStreak++;
          expectedDate = subDays(expectedDate, 1);
        } else {
          break;
        }
      }
    }

    // Calculate longest continuous streak in history
    const sortedAsc = [...uniqueDates].sort((a, b) => a.localeCompare(b));
    let longestStreak = 0;
    let running = 0;
    let prevDate: Date | null = null;

    for (const dStr of sortedAsc) {
      const curDate = parseISO(dStr);
      if (!prevDate) {
        running = 1;
      } else {
        const diff = differenceInCalendarDays(curDate, prevDate);
        if (diff === 1) {
          running++;
        } else if (diff > 1) {
          running = 1;
        }
      }
      prevDate = curDate;
      if (running > longestStreak) {
        longestStreak = running;
      }
    }

    longestStreak = Math.max(longestStreak, currentStreak);
    return { currentStreak, longestStreak };
  },

  /**
   * Get user streak from problems and persist to Supabase
   */
  async getStreak(userId?: string, problems?: Problem[]): Promise<Streak> {
    if (problems && problems.length > 0) {
      const { currentStreak, longestStreak } = this.calculateStreakFromProblems(problems);
      const computed: Streak = {
        user_id: userId || '',
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_active_date: problems[0]?.solved_date?.split('T')[0] || format(new Date(), 'yyyy-MM-dd'),
      };

      if (isSupabaseConfigured() && supabase && userId && !userId.startsWith('mock-')) {
        try {
          await supabase.from('streaks').upsert(
            {
              user_id: userId,
              current_streak: currentStreak,
              longest_streak: longestStreak,
              last_active_date: computed.last_active_date,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );
        } catch (err) {
          console.error('Failed to sync streak to Supabase:', err);
        }
      }

      return computed;
    }

    if (isSupabaseConfigured() && supabase && userId && !userId.startsWith('mock-')) {
      try {
        const { data, error } = await supabase
          .from('streaks')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data) {
          return data as Streak;
        }
      } catch (err) {
        console.error('Failed to fetch streak from Supabase:', err);
      }
    }

    return {
      user_id: userId || '',
      current_streak: 0,
      longest_streak: 0,
    };
  },

  /**
   * Save or update streak in Supabase
   */
  async saveStreak(streak: Streak) {
    if (isSupabaseConfigured() && supabase && streak.user_id && !streak.user_id.startsWith('mock-')) {
      try {
        await supabase.from('streaks').upsert(
          {
            user_id: streak.user_id,
            current_streak: streak.current_streak,
            longest_streak: streak.longest_streak,
            last_active_date: streak.last_active_date,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      } catch (err) {
        console.error('Error saving streak to Supabase:', err);
      }
    }
  },
};

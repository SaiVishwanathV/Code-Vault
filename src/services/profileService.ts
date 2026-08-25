import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { INITIAL_MOCK_PROFILE } from '../lib/mockData';
import { LeaderboardEntry, LeaderboardFilter, Profile } from '../types';

const PROFILE_STORAGE_KEY = 'codevault_current_user';
const LEADERBOARD_CACHE_KEY = 'codevault_leaderboard_cache';

export const profileService = {
  /**
   * Get user profile details
   */
  async getProfile(userId?: string): Promise<Profile> {
    if (isSupabaseConfigured() && supabase && userId && !userId.startsWith('mock-')) {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (!error && data) return data as Profile;
    }

    const local = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return INITIAL_MOCK_PROFILE;
      }
    }
    return INITIAL_MOCK_PROFILE;
  },

  /**
   * Update profile
   */
  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const timestamp = new Date().toISOString();

    if (isSupabaseConfigured() && supabase && userId && !userId.startsWith('mock-')) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: timestamp })
        .eq('id', userId)
        .select()
        .single();

      if (!error && data) {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data));
        return data as Profile;
      }
    }

    const current = await this.getProfile(userId);
    const updated: Profile = {
      ...current,
      ...updates,
      updated_at: timestamp,
    };
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  /**
   * Get dynamic global leaderboard from Supabase with real user data
   */
  async getLeaderboard(filter: LeaderboardFilter = 'global', currentUserId?: string): Promise<LeaderboardEntry[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        // 1. Fetch real registered profiles
        const { data: profiles, error: profError } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, role, status, created_at')
          .eq('status', 'active');

        if (!profError && profiles && profiles.length > 0) {
          // 2. Fetch problems and streaks for aggregation
          const [{ data: problems }, { data: streaks }] = await Promise.all([
            supabase.from('problems').select('user_id, difficulty, solved_date'),
            supabase.from('streaks').select('user_id, current_streak, longest_streak'),
          ]);

          const problemsList = problems || [];
          const streaksList = streaks || [];

          // Map user metrics
          const leaderboard: LeaderboardEntry[] = profiles.map((p) => {
            const userProblems = problemsList.filter((prob) => prob.user_id === p.id);
            const userStreak = streaksList.find((s) => s.user_id === p.id);

            const easy = userProblems.filter((prob) => prob.difficulty === 'Easy').length;
            const med = userProblems.filter((prob) => prob.difficulty === 'Medium').length;
            const hard = userProblems.filter((prob) => prob.difficulty === 'Hard').length;

            return {
              rank: 1,
              id: p.id,
              full_name: p.full_name || 'Coder',
              username: p.username,
              avatar_url: p.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`,
              total_solved: userProblems.length,
              easy_count: easy,
              medium_count: med,
              hard_count: hard,
              current_streak: userStreak?.current_streak || 0,
              longest_streak: userStreak?.longest_streak || 0,
              role: p.role,
              status: p.status,
              created_at: p.created_at,
            };
          });

          // Sort by total problems solved descending, then current streak
          let sorted = leaderboard.sort((a, b) => {
            if (b.total_solved !== a.total_solved) {
              return b.total_solved - a.total_solved;
            }
            return b.current_streak - a.current_streak;
          });

          if (filter === 'friends' && currentUserId) {
            sorted = sorted.filter((u) => u.id === currentUserId);
          }

          return sorted.map((entry, idx) => ({
            ...entry,
            rank: idx + 1,
          }));
        }
      } catch (err) {
        console.error('Failed to load real leaderboard:', err);
      }
    }

    // Local persistent state for offline / demo mode
    const rawCache = localStorage.getItem(LEADERBOARD_CACHE_KEY);
    let list: LeaderboardEntry[] = rawCache ? JSON.parse(rawCache) : [];

    if (list.length === 0) {
      const currentUser = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (currentUser) {
        try {
          const u: Profile = JSON.parse(currentUser);
          list = [
            {
              rank: 1,
              id: u.id,
              full_name: u.full_name || 'Active Coder',
              username: u.username,
              avatar_url: u.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`,
              total_solved: 0,
              easy_count: 0,
              medium_count: 0,
              hard_count: 0,
              current_streak: 0,
              longest_streak: 0,
              role: u.role,
              status: u.status,
            },
          ];
        } catch {
          // ignore
        }
      }
    }

    return list.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));
  },
};

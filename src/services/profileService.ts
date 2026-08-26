import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { INITIAL_MOCK_PROFILE } from '../lib/mockData';
import { LeaderboardEntry, LeaderboardFilter, Profile } from '../types';

export const profileService = {
  /**
   * Get user profile details with automatic row healing & local caching
   */
  async getProfile(userId?: string): Promise<Profile> {
    if (!userId) {
      return INITIAL_MOCK_PROFILE;
    }

    const cacheKey = `codevault_profile_${userId}`;

    if (isSupabaseConfigured() && supabase && !userId.startsWith('mock-')) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (!error && data) {
          localStorage.setItem(cacheKey, JSON.stringify(data));
          return data as Profile;
        }

        // If profile row doesn't exist in Supabase yet, heal/create it automatically
        if (!data) {
          const { data: authData } = await supabase.auth.getUser();
          const authUser = authData?.user;
          if (authUser && authUser.id === userId) {
            const rawUsername =
              authUser.user_metadata?.username ||
              authUser.email?.split('@')[0] ||
              `coder_${userId.substring(0, 6)}`;
            const rawFullName =
              authUser.user_metadata?.full_name ||
              authUser.email?.split('@')[0] ||
              'Coder';
            const role =
              authUser.email?.toLowerCase() === 'code.v4ult@gmail.com' ||
              authUser.email?.toLowerCase() === 'admin@codevault.dev'
                ? 'admin'
                : 'user';

            const newProfile: Profile = {
              id: userId,
              email: authUser.email || '',
              username: rawUsername.toLowerCase(),
              full_name: rawFullName,
              avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${rawUsername}`,
              target_goal: 500,
              role,
              status: 'active',
              created_at: new Date().toISOString(),
              last_login: new Date().toISOString(),
            };

            const { data: inserted, error: insertErr } = await supabase
              .from('profiles')
              .upsert(newProfile)
              .select()
              .single();

            if (!insertErr && inserted) {
              localStorage.setItem(cacheKey, JSON.stringify(inserted));
              return inserted as Profile;
            }
          }
        }
      } catch (err) {
        console.error('Error fetching profile from Supabase:', err);
      }
    }

    // Check cached profile for this specific user ID
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.id === userId) return parsed;
      } catch {
        // ignore
      }
    }

    // Default real profile skeleton for this user
    return {
      id: userId,
      email: '',
      username: `user_${userId.substring(0, 6)}`,
      full_name: 'CodeVault Coder',
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`,
      target_goal: 500,
      role: 'user',
      status: 'active',
    };
  },

  /**
   * Update profile
   */
  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const timestamp = new Date().toISOString();
    const cacheKey = `codevault_profile_${userId}`;

    if (isSupabaseConfigured() && supabase && userId && !userId.startsWith('mock-')) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update({ ...updates, updated_at: timestamp })
          .eq('id', userId)
          .select()
          .single();

        if (!error && data) {
          localStorage.setItem(cacheKey, JSON.stringify(data));
          return data as Profile;
        }
      } catch (err) {
        console.error('Error updating profile on Supabase:', err);
      }
    }

    const current = await this.getProfile(userId);
    const updated: Profile = {
      ...current,
      ...updates,
      updated_at: timestamp,
    };
    localStorage.setItem(cacheKey, JSON.stringify(updated));
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

    return [];
  },
};

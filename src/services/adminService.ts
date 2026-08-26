import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { AdminStats, ChatRoom, LeaderboardEntry, Profile } from '../types';
import { chatService } from './chatService';

export const adminService = {
  /**
   * Fetch aggregated platform statistics strictly from real database records
   */
  async getAdminStats(): Promise<AdminStats> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        const [
          { count: userCount },
          { count: activeCount },
          { count: probCount },
          { count: newUsersCount },
          { count: roomCount },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('problems').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', oneWeekAgo),
          supabase.from('chat_rooms').select('*', { count: 'exact', head: true }),
        ]);

        return {
          totalUsers: userCount || 0,
          activeUsers: activeCount || 0,
          totalProblemsSolved: probCount || 0,
          newUsersThisWeek: newUsersCount || 0,
          activeRooms: roomCount || 0,
        };
      } catch (err) {
        console.error('Error fetching admin telemetry:', err);
      }
    }

    return {
      totalUsers: 0,
      activeUsers: 0,
      totalProblemsSolved: 0,
      newUsersThisWeek: 0,
      activeRooms: 0,
    };
  },

  /**
   * Fetch all registered user accounts from Supabase
   */
  async getAllUsers(): Promise<LeaderboardEntry[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const [{ data: profiles, error: profError }, { data: problems }, { data: streaks }] = await Promise.all([
          supabase
            .from('profiles')
            .select(`
              id,
              full_name,
              username,
              avatar_url,
              email,
              role,
              status,
              created_at
            `)
            .order('created_at', { ascending: false }),
          supabase.from('problems').select('user_id, difficulty'),
          supabase.from('streaks').select('user_id, current_streak, longest_streak'),
        ]);

        if (!profError && profiles) {
          const problemsList = problems || [];
          const streaksList = streaks || [];

          return profiles.map((p, idx) => {
            const userProblems = problemsList.filter((prob) => prob.user_id === p.id);
            const userStreak = streaksList.find((s) => s.user_id === p.id);

            const easy = userProblems.filter((prob) => prob.difficulty === 'Easy').length;
            const med = userProblems.filter((prob) => prob.difficulty === 'Medium').length;
            const hard = userProblems.filter((prob) => prob.difficulty === 'Hard').length;

            return {
              rank: idx + 1,
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
              role: (p.role as 'user' | 'admin') || 'user',
              status: (p.status as 'active' | 'suspended') || 'active',
              created_at: p.created_at,
            };
          });
        }
      } catch (err) {
        console.error('Failed to fetch users in adminService:', err);
      }
    }
    return [];
  },

  /**
   * Suspend or Reactivate a user account in Supabase
   */
  async updateUserStatus(userId: string, status: 'active' | 'suspended'): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        // 1. Try secure RPC function
        const { error: rpcError } = await supabase.rpc('admin_update_user_status', {
          target_user_id: userId,
          new_status: status,
        });

        if (rpcError) {
          // 2. Direct table update fallback
          const { error: tableError } = await supabase
            .from('profiles')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', userId);

          if (tableError) {
            throw new Error(tableError.message || 'Failed to update user status in database');
          }
        }

        // Invalidate cached profile if present
        localStorage.removeItem(`codevault_profile_${userId}`);
      } catch (err: any) {
        throw new Error(err.message || 'Failed to update user account status.');
      }
    }
  },

  /**
   * Promote or Demote user to Admin in Supabase
   */
  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        // 1. Try secure RPC function
        const { error: rpcError } = await supabase.rpc('admin_update_user_role', {
          target_user_id: userId,
          new_role: role,
        });

        if (rpcError) {
          // 2. Direct table update fallback
          const { error: tableError } = await supabase
            .from('profiles')
            .update({ role, updated_at: new Date().toISOString() })
            .eq('id', userId);

          if (tableError) {
            throw new Error(tableError.message || 'Failed to update user role in database');
          }
        }

        // Invalidate cached profile if present
        localStorage.removeItem(`codevault_profile_${userId}`);
      } catch (err: any) {
        throw new Error(err.message || 'Failed to update user role.');
      }
    }
  },

  /**
   * Delete a user profile and auth account completely from Supabase
   */
  async deleteUser(userId: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        // 1. Try secure RPC function
        const { error: rpcError } = await supabase.rpc('admin_delete_user', {
          target_user_id: userId,
        });

        if (rpcError) {
          // 2. Direct table deletion fallback
          const { error: tableError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

          if (tableError) {
            throw new Error(tableError.message || 'Failed to delete user profile from database');
          }
        }

        // Clean local cache
        localStorage.removeItem(`codevault_profile_${userId}`);
        localStorage.removeItem(`codevault_problems_${userId}`);
      } catch (err: any) {
        throw new Error(err.message || 'Failed to delete user.');
      }
    }
  },

  /**
   * Get all community rooms for moderation
   */
  async getAllRooms(): Promise<ChatRoom[]> {
    return chatService.getRooms();
  },

  /**
   * Delete a community chat room
   */
  async deleteRoom(roomId: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('chat_rooms').delete().eq('id', roomId);
      if (error) {
        throw new Error(error.message || 'Failed to delete chat room.');
      }
    }
    await chatService.leaveRoom(roomId, 'admin');
  },
};

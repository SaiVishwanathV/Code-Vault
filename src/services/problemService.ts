import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Problem } from '../types';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getUserProblemsCacheKey(userId?: string): string {
  return userId ? `codevault_problems_${userId}` : 'codevault_problems_guest';
}

function getCachedProblems(userId?: string): Problem[] {
  const key = getUserProblemsCacheKey(userId);
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function setCachedProblems(userId: string | undefined, problems: Problem[]) {
  const key = getUserProblemsCacheKey(userId);
  localStorage.setItem(key, JSON.stringify(problems));
}

export const problemService = {
  /**
   * Get all problems for current user from Supabase
   */
  async getProblems(userId?: string): Promise<Problem[]> {
    if (!userId) return [];

    if (isSupabaseConfigured() && supabase && !userId.startsWith('mock-')) {
      try {
        const { data, error } = await supabase
          .from('problems')
          .select('*')
          .eq('user_id', userId)
          .order('solved_date', { ascending: false });

        if (!error && data) {
          setCachedProblems(userId, data as Problem[]);
          return data as Problem[];
        }
        if (error) {
          console.error('Supabase getProblems error:', error);
        }
      } catch (err) {
        console.error('Error fetching problems from Supabase:', err);
      }
    }

    return getCachedProblems(userId);
  },

  /**
   * Add a new problem to Supabase
   */
  async addProblem(problem: Omit<Problem, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Problem> {
    const newProblem: Problem = {
      ...problem,
      id: problem.id && problem.id.includes('-') && problem.id.length >= 32 ? problem.id : generateUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase && newProblem.user_id && !newProblem.user_id.startsWith('mock-')) {
      try {
        const { data, error } = await supabase
          .from('problems')
          .insert([newProblem])
          .select()
          .single();

        if (!error && data) {
          const cached = getCachedProblems(newProblem.user_id);
          setCachedProblems(newProblem.user_id, [data as Problem, ...cached]);
          return data as Problem;
        }
        if (error) {
          console.error('Supabase addProblem error:', error);
        }
      } catch (err) {
        console.error('Error adding problem to Supabase:', err);
      }
    }

    const cached = getCachedProblems(newProblem.user_id);
    const updated = [newProblem, ...cached];
    setCachedProblems(newProblem.user_id, updated);
    return newProblem;
  },

  /**
   * Update an existing problem in Supabase
   */
  async updateProblem(id: string, updates: Partial<Problem>): Promise<Problem> {
    const timestamp = new Date().toISOString();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('problems')
          .update({ ...updates, updated_at: timestamp })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          const userId = data.user_id || updates.user_id;
          if (userId) {
            const cached = getCachedProblems(userId);
            const updated = cached.map((p) => (p.id === id ? (data as Problem) : p));
            setCachedProblems(userId, updated);
          }
          return data as Problem;
        }
      } catch (err) {
        console.error('Error updating problem in Supabase:', err);
      }
    }

    const userId = updates.user_id;
    const cached = getCachedProblems(userId);
    const index = cached.findIndex((p) => p.id === id);
    if (index !== -1) {
      cached[index] = {
        ...cached[index],
        ...updates,
        updated_at: timestamp,
      };
      setCachedProblems(userId, cached);
      return cached[index];
    }

    return {
      id,
      user_id: userId || '',
      problem_id: 'LC-1',
      problem_name: 'Problem',
      platform: 'LeetCode',
      difficulty: 'Medium',
      topic: 'Arrays',
      solved_date: new Date().toISOString().split('T')[0],
      time_taken: 15,
      favorite: false,
      revision_needed: false,
      revision_count: 0,
      ...updates,
      updated_at: timestamp,
    };
  },

  /**
   * Delete a problem by ID from Supabase
   */
  async deleteProblem(id: string, userId?: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase && userId && !userId.startsWith('mock-')) {
      try {
        await supabase.from('problems').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting problem from Supabase:', err);
      }
    }

    if (userId) {
      const cached = getCachedProblems(userId);
      const filtered = cached.filter((p) => p.id !== id);
      setCachedProblems(userId, filtered);
    }
    return true;
  },

  /**
   * Toggle favorite status in Supabase
   */
  async toggleFavorite(id: string, currentStatus: boolean, userId?: string): Promise<boolean> {
    const updatedStatus = !currentStatus;
    await this.updateProblem(id, { favorite: updatedStatus, user_id: userId });
    return updatedStatus;
  },

  /**
   * Toggle revision needed status in Supabase
   */
  async toggleRevision(id: string, currentStatus: boolean, userId?: string): Promise<boolean> {
    const updatedStatus = !currentStatus;
    await this.updateProblem(id, {
      revision_needed: updatedStatus,
      revision_date: updatedStatus ? new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] : undefined,
      user_id: userId,
    });
    return updatedStatus;
  },

  /**
   * Mark a problem as revised in Supabase
   */
  async markRevised(id: string, nextRevisionDate?: string, userId?: string): Promise<Problem> {
    const cached = getCachedProblems(userId);
    const current = cached.find((p) => p.id === id);
    const count = (current?.revision_count ?? 0) + 1;

    return await this.updateProblem(id, {
      revision_count: count,
      last_revised_at: new Date().toISOString().split('T')[0],
      revision_date: nextRevisionDate || undefined,
      revision_needed: Boolean(nextRevisionDate),
      user_id: userId,
    });
  },

  /**
   * Bulk insert problems from CSV import into Supabase
   */
  async bulkAddProblems(problems: Partial<Problem>[], userId?: string): Promise<number> {
    let count = 0;
    for (const p of problems) {
      if (!p.problem_name) continue;
      await this.addProblem({
        user_id: userId || '',
        problem_id: p.problem_id || `ID-${Math.floor(Math.random() * 9000 + 1000)}`,
        problem_name: p.problem_name,
        platform: p.platform || 'LeetCode',
        difficulty: p.difficulty || 'Medium',
        topic: p.topic || 'Arrays',
        problem_link: p.problem_link || '',
        notes: p.notes || '',
        solved_date: p.solved_date || new Date().toISOString().split('T')[0],
        time_taken: p.time_taken || 15,
        favorite: p.favorite || false,
        revision_needed: p.revision_needed || false,
      });
      count++;
    }
    return count;
  },
};

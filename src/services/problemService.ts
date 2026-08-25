import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { INITIAL_MOCK_PROBLEMS } from '../lib/mockData';
import { Problem } from '../types';

const PROBLEMS_STORAGE_KEY = 'codevault_problems_list';

function getLocalProblems(): Problem[] {
  const data = localStorage.getItem(PROBLEMS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(PROBLEMS_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_PROBLEMS));
    return INITIAL_MOCK_PROBLEMS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_MOCK_PROBLEMS;
  }
}

function saveLocalProblems(problems: Problem[]) {
  localStorage.setItem(PROBLEMS_STORAGE_KEY, JSON.stringify(problems));
}

export const problemService = {
  /**
   * Get all problems for current user
   */
  async getProblems(userId?: string): Promise<Problem[]> {
    if (isSupabaseConfigured() && supabase && userId && !userId.startsWith('mock-')) {
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .eq('user_id', userId)
        .order('solved_date', { ascending: false });

      if (error) {
        console.error('Supabase getProblems error:', error);
        return getLocalProblems();
      }
      return (data as Problem[]) || [];
    }

    return getLocalProblems();
  },

  /**
   * Add a new problem (No solution link)
   */
  async addProblem(problem: Omit<Problem, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<Problem> {
    const newProblem: Problem = {
      ...problem,
      id: problem.id || `prob_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase && newProblem.user_id && !newProblem.user_id.startsWith('mock-')) {
      const { data, error } = await supabase
        .from('problems')
        .insert([newProblem])
        .select()
        .single();

      if (!error && data) {
        return data as Problem;
      }
    }

    const local = getLocalProblems();
    const updated = [newProblem, ...local];
    saveLocalProblems(updated);
    return newProblem;
  },

  /**
   * Update an existing problem
   */
  async updateProblem(id: string, updates: Partial<Problem>): Promise<Problem> {
    const timestamp = new Date().toISOString();

    if (isSupabaseConfigured() && supabase && updates.user_id && !updates.user_id.startsWith('mock-')) {
      const { data, error } = await supabase
        .from('problems')
        .update({ ...updates, updated_at: timestamp })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return data as Problem;
      }
    }

    const local = getLocalProblems();
    const index = local.findIndex((p) => p.id === id);
    if (index !== -1) {
      local[index] = {
        ...local[index],
        ...updates,
        updated_at: timestamp,
      };
      saveLocalProblems(local);
      return local[index];
    }
    throw new Error('Problem not found');
  },

  /**
   * Delete a problem by ID
   */
  async deleteProblem(id: string, userId?: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase && userId && !userId.startsWith('mock-')) {
      await supabase.from('problems').delete().eq('id', id);
    }

    const local = getLocalProblems();
    const filtered = local.filter((p) => p.id !== id);
    saveLocalProblems(filtered);
    return true;
  },

  /**
   * Toggle favorite status
   */
  async toggleFavorite(id: string, currentStatus: boolean, userId?: string): Promise<boolean> {
    const updatedStatus = !currentStatus;
    await this.updateProblem(id, { favorite: updatedStatus, user_id: userId });
    return updatedStatus;
  },

  /**
   * Toggle revision needed status
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
   * Mark a problem as revised
   */
  async markRevised(id: string, nextRevisionDate?: string, userId?: string): Promise<Problem> {
    const local = getLocalProblems();
    const current = local.find((p) => p.id === id);
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
   * Bulk insert problems from CSV import
   */
  async bulkAddProblems(problems: Partial<Problem>[], userId?: string): Promise<number> {
    let count = 0;
    for (const p of problems) {
      if (!p.problem_name) continue;
      await this.addProblem({
        user_id: userId || 'mock-user-123',
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
        revision_date: p.revision_date,
      });
      count++;
    }
    return count;
  },
};

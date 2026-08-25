import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Announcement } from '../types';

const ANNOUNCEMENTS_KEY = 'codevault_announcements';

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: '🏆 Weekly DSA Grand Contest #42 Announcement',
    content: 'The 42nd CodeVault Weekly DSA sprint goes live this Saturday at 8:00 PM IST. 4 algorithmic challenges (1 Easy, 2 Medium, 1 Hard).',
    category: 'contest',
    priority: 'high',
    is_active: true,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: 'ann-2',
    title: '🚀 SDE Placement Drive Cheat Sheets Updated',
    content: 'Top 75 High-Frequency interview patterns for Google, Amazon, and Microsoft have been updated in the community study rooms.',
    category: 'placement',
    priority: 'normal',
    is_active: true,
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
];

function getStoredAnnouncements(): Announcement[] {
  const raw = localStorage.getItem(ANNOUNCEMENTS_KEY);
  if (!raw) {
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(INITIAL_ANNOUNCEMENTS));
    return INITIAL_ANNOUNCEMENTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_ANNOUNCEMENTS;
  }
}

function saveStoredAnnouncements(list: Announcement[]) {
  localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(list));
}

export const announcementService = {
  /**
   * Get active announcements for user dashboard
   */
  async getActiveAnnouncements(): Promise<Announcement[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch announcements from Supabase:', error);
        return getStoredAnnouncements().filter((a) => a.is_active);
      }
      return data as Announcement[];
    }
    return getStoredAnnouncements().filter((a) => a.is_active);
  },

  /**
   * Get all announcements for Admin
   */
  async getAllAnnouncements(): Promise<Announcement[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) return data as Announcement[];
    }
    return getStoredAnnouncements();
  },

  /**
   * Create new announcement (Admin only)
   */
  async createAnnouncement(
    title: string,
    content: string,
    category: Announcement['category'] = 'general',
    priority: Announcement['priority'] = 'normal',
    userId?: string
  ): Promise<Announcement> {
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      category,
      priority,
      is_active: true,
      created_by: userId,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('announcements')
        .insert({
          title: newAnn.title,
          content: newAnn.content,
          category: newAnn.category,
          priority: newAnn.priority,
          is_active: true,
          created_by: userId,
        })
        .select()
        .single();

      if (!error && data) return data as Announcement;
    }

    const all = getStoredAnnouncements();
    const updated = [newAnn, ...all];
    saveStoredAnnouncements(updated);
    return newAnn;
  },

  /**
   * Toggle announcement active status
   */
  async toggleAnnouncement(id: string, is_active: boolean): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('announcements').update({ is_active }).eq('id', id);
    }
    const all = getStoredAnnouncements();
    const updated = all.map((a) => (a.id === id ? { ...a, is_active } : a));
    saveStoredAnnouncements(updated);
  },

  /**
   * Delete announcement
   */
  async deleteAnnouncement(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('announcements').delete().eq('id', id);
    }
    const all = getStoredAnnouncements();
    const updated = all.filter((a) => a.id !== id);
    saveStoredAnnouncements(updated);
  },
};

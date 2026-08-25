export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Platform =
  | 'LeetCode'
  | 'Codeforces'
  | 'HackerRank'
  | 'GFG'
  | 'CodeChef'
  | 'AtCoder'
  | 'Striver SDE'
  | 'Other';

export interface Problem {
  id: string;
  user_id?: string;
  problem_id: string; // e.g. "LC-1", "CF-158A"
  problem_name: string;
  platform: Platform;
  difficulty: Difficulty;
  topic: string;
  problem_link?: string;
  notes?: string; // Central place for approaches, complexities, code snippets
  solved_date: string; // YYYY-MM-DD
  time_taken?: number; // in minutes
  favorite: boolean;
  revision_needed: boolean;
  revision_date?: string; // YYYY-MM-DD
  revision_count?: number;
  last_revised_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  email: string;
  college?: string;
  branch?: string;
  graduation_year?: number;
  bio?: string;
  avatar_url?: string;
  target_goal?: number;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Streak {
  id?: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date?: string;
  updated_at?: string;
}

export interface HistoryRecord {
  id: string;
  user_id: string;
  problem_ref?: string;
  problem_name?: string;
  difficulty?: Difficulty;
  platform?: Platform;
  solved_date: string;
  created_at?: string;
}

export interface Achievement {
  id: string;
  user_id?: string;
  badge_key: string;
  badge_name: string;
  description: string;
  icon: string;
  category: 'consistency' | 'count' | 'difficulty' | 'streak' | 'special';
  unlocked: boolean;
  unlocked_at?: string;
  progress: number;
  target: number;
}

export type LeaderboardFilter = 'global' | 'friends' | 'weekly' | 'monthly';

export interface LeaderboardEntry {
  rank: number;
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  total_solved: number;
  easy_count: number;
  medium_count: number;
  hard_count: number;
  current_streak: number;
  longest_streak: number;
  role?: 'user' | 'admin';
  status?: 'active' | 'suspended';
  created_at?: string;
  is_friend?: boolean;
  weekly_solved?: number;
  monthly_solved?: number;
}

export interface FilterOptions {
  search: string;
  difficulty: Difficulty | 'All';
  platform: Platform | 'All';
  topic: string | 'All';
  favoriteOnly: boolean;
  revisionOnly: boolean;
  startDate?: string;
  endDate?: string;
}

export interface SortOption {
  field: 'solved_date' | 'problem_name' | 'difficulty' | 'time_taken';
  order: 'asc' | 'desc';
}

export interface Quote {
  quote: string;
  author: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'contest' | 'placement' | 'notice' | 'general';
  priority: 'normal' | 'high' | 'urgent';
  is_active: boolean;
  created_by?: string;
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalProblemsSolved: number;
  newUsersThisWeek: number;
  activeRooms: number;
}

/* ========================================================================= */
/* COMMUNITY CHATROOMS INTERFACES */
/* ========================================================================= */

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  is_private: boolean;
  max_members?: number;
  created_by?: string;
  member_count: number;
  created_at: string;
  pinned_message_id?: string;
  invited_usernames?: string[];
  last_message?: string;
  last_activity?: string;
  category?: 'algorithms' | 'interview' | 'daily' | 'study_group' | 'topic' | 'general';
}

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  content: string;
  created_at: string;
  is_pinned?: boolean;
  reply_to?: {
    id: string;
    username: string;
    content: string;
  };
  shared_problem?: {
    problem_id: string;
    problem_name: string;
    platform: Platform;
    difficulty: Difficulty;
    link?: string;
  };
  reactions?: Record<string, string[]>; // emoji -> array of userIds
}

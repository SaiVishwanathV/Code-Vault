import { Achievement, ChatRoom, Platform, Difficulty } from '../types';

export const PLATFORMS: Platform[] = [
  'LeetCode',
  'Codeforces',
  'HackerRank',
  'GFG',
  'CodeChef',
  'AtCoder',
  'Striver SDE',
  'Other',
];

export const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];

export const TOPICS: string[] = [
  'Arrays',
  'Strings',
  'Linked List',
  'Stack',
  'Queue',
  'Two Pointers',
  'Sliding Window',
  'Binary Search',
  'Trees',
  'Binary Search Tree',
  'Heap / Priority Queue',
  'Graph',
  'Breadth-First Search',
  'Depth-First Search',
  'Backtracking',
  'Dynamic Programming',
  'Greedy',
  'Trie',
  'Bit Manipulation',
  'Math / Number Theory',
  'Matrix',
  'Design',
];

export const DIFFICULTY_COLORS: Record<
  Difficulty,
  { bg: string; text: string; border: string; badge: string; ring: string }
> = {
  Easy: {
    bg: 'bg-[#F2F7F4] dark:bg-[#142318]',
    text: 'text-[#4F7A5A] dark:text-[#68D391]',
    border: 'border-[#D4E5D8] dark:border-[#24432C]',
    badge: 'bg-[#F2F7F4] text-[#4F7A5A] border-[#D4E5D8] dark:bg-[#142318] dark:text-[#68D391] dark:border-[#24432C]',
    ring: 'ring-[#4F7A5A]/30',
  },
  Medium: {
    bg: 'bg-[#FFF8EC] dark:bg-[#2A2010]',
    text: 'text-[#C0841D] dark:text-[#ECC94B]',
    border: 'border-[#F8E0B0] dark:border-[#4D3815]',
    badge: 'bg-[#FFF8EC] text-[#C0841D] border-[#F8E0B0] dark:bg-[#2A2010] dark:text-[#ECC94B] dark:border-[#4D3815]',
    ring: 'ring-[#C0841D]/30',
  },
  Hard: {
    bg: 'bg-[#FDF2F3] dark:bg-[#2E1416]',
    text: 'text-[#C54A53] dark:text-[#FEB2B2]',
    border: 'border-[#F8D2D5] dark:border-[#521C20]',
    badge: 'bg-[#FDF2F3] text-[#C54A53] border-[#F8D2D5] dark:bg-[#2E1416] dark:text-[#FEB2B2] dark:border-[#521C20]',
    ring: 'ring-[#C54A53]/30',
  },
};

export const PLATFORM_BADGES: Record<Platform, { badge: string; dot: string }> = {
  LeetCode: { badge: 'bg-[#FAF3E5] text-[#8A6008] border-[#ECD8AF] dark:bg-[#2A2315] dark:text-[#E9B949]', dot: 'bg-[#E9B949]' },
  Codeforces: { badge: 'bg-[#EEF4FB] text-[#1E4A7D] border-[#C5DCF5] dark:bg-[#152333] dark:text-[#90CDF4]', dot: 'bg-[#3182CE]' },
  HackerRank: { badge: 'bg-[#EBF5EE] text-[#225732] border-[#C1E5C9] dark:bg-[#14281A] dark:text-[#68D391]', dot: 'bg-[#38A169]' },
  GFG: { badge: 'bg-[#EDF7ED] text-[#1E5624] border-[#C3E8C6] dark:bg-[#152B18] dark:text-[#68D391]', dot: 'bg-[#2F855A]' },
  CodeChef: { badge: 'bg-[#F9F3EA] text-[#694411] border-[#E8D4BB] dark:bg-[#2B1F11] dark:text-[#ECC94B]', dot: 'bg-[#B7791F]' },
  AtCoder: { badge: 'bg-[#F5EDFA] text-[#552175] border-[#DEC5F0] dark:bg-[#271533] dark:text-[#D6BCFA]', dot: 'bg-[#805AD5]' },
  'Striver SDE': { badge: 'bg-[#FCEEED] text-[#822421] border-[#F5C6C3] dark:bg-[#331513] dark:text-[#FEB2B2]', dot: 'bg-[#E53E3E]' },
  Other: { badge: 'bg-[#F1F3F5] text-[#424A53] border-[#D3D8DE] dark:bg-[#21262D] dark:text-[#A0AEC0]', dot: 'bg-[#718096]' },
};

export const PLATFORM_COLORS = PLATFORM_BADGES;

export const BADGE_DEFINITIONS: Omit<Achievement, 'unlocked' | 'unlocked_at' | 'progress'>[] = [
  // Consistency & Streaks
  {
    id: 'streak_3',
    badge_key: 'streak_3',
    badge_name: '3-Day Spark',
    description: 'Maintained an active coding streak for 3 consecutive days',
    icon: 'Flame',
    category: 'consistency',
    target: 3,
  },
  {
    id: 'streak_7',
    badge_key: 'streak_7',
    badge_name: '7-Day Momentum',
    description: 'Maintained a 7-day continuous daily coding streak',
    icon: 'Flame',
    category: 'consistency',
    target: 7,
  },
  {
    id: 'streak_30',
    badge_key: 'streak_30',
    badge_name: '30-Day Discipline',
    description: 'Conquered a full 30-day streak without breaking consistency',
    icon: 'Rocket',
    category: 'consistency',
    target: 30,
  },
  {
    id: 'streak_100',
    badge_key: 'streak_100',
    badge_name: '100-Day Mastery',
    description: 'Epic 100-day daily problem solving streak!',
    icon: 'Infinity',
    category: 'consistency',
    target: 100,
  },

  // Problems Solved Milestones
  {
    id: 'first_problem',
    badge_key: 'first_problem',
    badge_name: 'First Step',
    description: 'Solved your very first DSA problem in CodeVault',
    icon: 'Sparkles',
    category: 'count',
    target: 1,
  },
  {
    id: 'solved_25',
    badge_key: 'solved_25',
    badge_name: 'Quarter Century',
    description: 'Solved 25 DSA problems across platforms',
    icon: 'Award',
    category: 'count',
    target: 25,
  },
  {
    id: 'solved_50',
    badge_key: 'solved_50',
    badge_name: 'Half Century',
    description: 'Solved 50 total problems across all topics',
    icon: 'Award',
    category: 'count',
    target: 50,
  },
  {
    id: 'solved_100',
    badge_key: 'solved_100',
    badge_name: '100 Problems Solved',
    description: 'Achieved the 100 solved problems milestone',
    icon: 'Trophy',
    category: 'count',
    target: 100,
  },
  {
    id: 'solved_250',
    badge_key: 'solved_250',
    badge_name: '250 Problems Solved',
    description: 'Conquered 250 problems across algorithms and data structures',
    icon: 'Crown',
    category: 'count',
    target: 250,
  },
  {
    id: 'solved_500',
    badge_key: 'solved_500',
    badge_name: '500 Problems Solved',
    description: 'Reached the elite titan milestone of 500 solved problems!',
    icon: 'ShieldAlert',
    category: 'count',
    target: 500,
  },

  // Difficulty Tiers
  {
    id: 'easy_10',
    badge_key: 'easy_10',
    badge_name: '10 Easy Problems',
    description: 'Solved 10 Easy difficulty foundational problems',
    icon: 'CheckCircle2',
    category: 'difficulty',
    target: 10,
  },
  {
    id: 'med_25',
    badge_key: 'med_25',
    badge_name: '25 Medium Problems',
    description: 'Solved 25 Medium difficulty interview-level problems',
    icon: 'Zap',
    category: 'difficulty',
    target: 25,
  },
  {
    id: 'med_50',
    badge_key: 'med_50',
    badge_name: '50 Medium Problems',
    description: 'Solved 50 Medium difficulty interview problems',
    icon: 'Zap',
    category: 'difficulty',
    target: 50,
  },
  {
    id: 'hard_10',
    badge_key: 'hard_10',
    badge_name: '10 Hard Problems',
    description: 'Conquered 10 Hard competitive programming challenges',
    icon: 'Flame',
    category: 'difficulty',
    target: 10,
  },
  {
    id: 'hard_25',
    badge_key: 'hard_25',
    badge_name: '25 Hard Problems',
    description: 'Conquered 25 Hard competitive programming challenges',
    icon: 'Crown',
    category: 'difficulty',
    target: 25,
  },

  // Special Milestones
  {
    id: 'multi_platform',
    badge_key: 'multi_platform',
    badge_name: 'Platform Polymath',
    description: 'Solved problems on 3 or more distinct coding platforms',
    icon: 'Layers',
    category: 'special',
    target: 3,
  },
  {
    id: 'revision_champion',
    badge_key: 'revision_champion',
    badge_name: 'Retention Champion',
    description: 'Revised 5 or more problems via Spaced Repetition queue',
    icon: 'RefreshCw',
    category: 'special',
    target: 5,
  },
];

export const INITIAL_CHAT_ROOMS: ChatRoom[] = [];

export const EDUCATIONAL_QUOTES: { quote: string; author: string }[] = [
  {
    quote: 'First, solve the problem. Then, write the code.',
    author: 'John Johnson',
  },
  {
    quote: 'Simplicity is prerequisite for reliability.',
    author: 'Edsger W. Dijkstra',
  },
  {
    quote: 'Premature optimization is the root of all evil.',
    author: 'Donald Knuth',
  },
  {
    quote: 'Continuous effort – not strength or intelligence – is the key to unlocking our potential.',
    author: 'Winston Churchill',
  },
  {
    quote: 'An algorithm must be seen to be believed.',
    author: 'Donald Knuth',
  },
];

export const DAILY_QUOTES = EDUCATIONAL_QUOTES;

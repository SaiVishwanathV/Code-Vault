# 🚀 CodeTracker Pro

**CodeTracker Pro** is a modern, production-grade DSA (Data Structures & Algorithms) Problem Tracker and interview preparation platform built with **React (Vite) + Tailwind CSS + Supabase (PostgreSQL + Email OTP Authentication)**.

Designed with the aesthetics of **GitHub + LeetCode + Notion**, CodeTracker Pro enables software engineers to track problem-solving across platforms (LeetCode, Codeforces, HackerRank, GFG, CodeChef, Striver SDE, AtCoder), manage markdown notes, maintain coding streaks, view analytics, and master spaced repetition.

---

## 🌟 Key Features

- 🔐 **Supabase Email OTP Authentication**: 6-digit OTP delivery with 30s resend countdown timer and paste support, password resets, and session management.
- ⚡ **Instant Guest / Demo Mode**: Explore the full platform with rich realistic DSA mock data even before configuring Supabase credentials.
- 📊 **Comprehensive Analytics**: Recharts-powered Difficulty Donut charts (Easy/Med/Hard), Platform breakdown, Topic mastery, and Monthly trends.
- 🔥 **Daily Coding Streaks & Heatmaps**: GitHub-style 365-day contribution heatmap with click-to-view date logs and streak counters.
- 🔁 **Spaced Repetition & Revision**: Queue challenging problems, schedule review dates, and track revision counters.
- 📝 **Markdown Notes & Code Snippets**: Live split-view markdown editor with syntax highlighting, template generator, and copy actions.
- 🔍 **Spotlight Global Search (`⌘K` / `Ctrl+K`)**: Instant search across problem titles, IDs (e.g. `LC-1`, `CF-158A`), topics, platforms, and personal notes.
- 🏆 **Gamified Milestones & Badges**: Unlock 11 tiered badges (50/100/250/500 Solved, 7/30/100-Day Streaks) with confetti celebration.
- 🥇 **Global Leaderboard**: Podium view (#1, #2, #3) and ranked coder table with Easy/Med/Hard breakdown.
- 📂 **CSV Import & Export**: One-click full backup to CSV or bulk import from spreadsheets with sample template support.
- 🌓 **Modern Minimal UI**: Glassmorphic dark and light theme toggle with smooth animations, custom scrollbars, and floating "+" problem adder.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Glassmorphism, CSS Modules
- **Routing**: React Router v6
- **Database & Auth**: Supabase PostgreSQL + Supabase Auth (Email OTP)
- **Visuals & Charts**: Recharts, Lucide Icons, Framer Motion, Canvas Confetti
- **Forms & Validation**: React Hook Form, Date-fns

---

## 📁 Project Structure

```
├── .env.example               # Environment variables template
├── index.html                 # HTML template with Google Fonts (Plus Jakarta Sans)
├── package.json               # Dependencies and scripts
├── tailwind.config.js         # Tailwind configuration & design tokens
├── vite.config.ts             # Vite configuration
├── supabase/
│   ├── schema.sql             # PostgreSQL schema with RLS policies, tables & triggers
│   └── seed.sql               # Sample seed dataset
└── src/
    ├── types/                 # TypeScript interfaces
    ├── lib/
    │   ├── supabase.ts        # Supabase client wrapper
    │   ├── constants.ts       # Platforms, topics, badge definitions, quotes
    │   ├── mockData.ts        # Pre-populated realistic problem records
    │   └── utils.ts           # Date formatters, CSV parser, confetti, heatmap generator
    ├── context/
    │   ├── AuthContext.tsx    # Auth session, Email OTP & profile state
    │   ├── ThemeContext.tsx   # Dark/Light theme toggle
    │   └── ToastContext.tsx   # Animated toast notifications
    ├── services/
    │   ├── authService.ts     # Supabase authentication services
    │   ├── problemService.ts  # CRUD & CSV operations
    │   ├── profileService.ts  # User profile & leaderboard
    │   ├── streakService.ts   # Dynamic streak computation
    │   └── achievementService.ts # Badge unlocking logic
    ├── components/            # Reusable UI components
    │   ├── common/            # Navbar, Sidebar, Footer, Modal, Badges, Search
    │   ├── auth/              # Login, Register, OTP Verification, Reset Password
    │   ├── problems/          # Add/Edit Modal, Table, Filters, CSV, Detail
    │   ├── dashboard/         # StatCards, StreakBanner, GoalCard, Charts
    │   ├── history/           # HeatmapCalendar, TimelineView, MonthlyCalendar
    │   ├── analytics/         # Recharts Donut, Bar, and Area charts
    │   ├── revision/          # Revision cards with spaced repetition actions
    │   ├── notes/             # Markdown live split editor
    │   ├── achievements/      # Gamified badge cards
    │   └── leaderboard/       # Global leaderboard table & podium
    └── pages/                 # Full view pages
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase (Optional for full backend, Demo mode works out of the box)

1. Create a free project at [Supabase](https://supabase.com).
2. Go to **SQL Editor** in Supabase and run the script located in `supabase/schema.sql`.
3. Go to **Project Settings -> API** and copy your `Project URL` and `anon public key`.
4. Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

5. In **Authentication -> Providers -> Email**, ensure Email provider is enabled. (For 6-digit OTP code verification, enable *Confirm email* or *Email OTP* in Supabase Auth settings).

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production

```bash
npm run build
```

---

## 🔒 Database & Row Level Security (RLS)

All tables (`profiles`, `problems`, `streaks`, `history`, `achievements`) are secured with Row Level Security (RLS) policies:
- Users can only read, insert, update, and delete their own problem records.
- Public profiles and streaks are accessible in read-only mode for the global leaderboard.
- Triggers automatically initialize profiles and streak records on `auth.users` signup.

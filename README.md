# 🚀 CodeVault – Coders Space

**CodeVault** is a modern, production-grade DSA (Data Structures & Algorithms) Problem Tracker, interview preparation platform, and peer learning community built with **React (Vite) + Tailwind CSS + Supabase (PostgreSQL + Realtime WebSockets + Custom SMTP OTP Authentication)**, deployed live on **Firebase Hosting**.

🌐 **Live Application**: [https://c0dev4ult.web.app](https://c0dev4ult.web.app)

---

## 🌟 Key Features

### 🔐 1. Authentication & Security
- **Supabase Email OTP Authentication**: 6-digit verification codes sent via custom Gmail SMTP (`code.v4ult@gmail.com`) with 30-second resend countdown timer and automatic profile creation.
- **Row Level Security (RLS)**: Fine-grained PostgreSQL security policies ensuring users can only access their own private problems, notes, and study rooms.
- **Session Management**: Persistent JWT sessions with safe sign-out and password reset flows.

### 💬 2. Community & In-App Private Study Rooms
- **Open Public Discussion Rooms**: Real-time collaborative channels for daily challenge discussions and mock interviews.
- **100% In-App Direct Private Room Invitations**: Room creators invite registered peers by selecting usernames directly from a live user search.
- **Live In-App Invitation Cards**: Invited users receive instant **"📬 Room Invitations"** on their Community page with 1-click **"Enter Room"** (with celebratory confetti 🎉) or decline options.
- **Real-Time WebSocket Sync**: Instant bidirectional chat messaging with continuous background fallback syncing across all devices and browser tabs.
- **Interactive Chat Features**: Message pinning, emoji reactions, problem sharing, and reply threads.

### 📊 3. DSA Problem Tracking & Spaced Repetition
- **Multi-Platform Tracking**: Catalog problems across LeetCode, Codeforces, HackerRank, GeeksforGeeks, CodeChef, Striver SDE Sheet, and AtCoder.
- **Spaced Repetition & Revision Queue**: Automatically flag tricky edge cases to the retention queue, schedule review dates, and track revision counters.
- **GitHub-Style 365-Day Contribution Heatmap**: Interactive heatmap with daily activity logs, streak tracking, and today's ring highlight.
- **Dynamic Monthly Calendar View**: Day-by-day problem log with progressive daily unlocking — past days show activity, today shows an active CTA, and future days show a locked upcoming state that opens each day automatically.
- **Interactive Analytics**: Difficulty breakdown donut charts (Easy/Medium/Hard), platform distribution, and topic mastery.
- **Spotlight Search (`⌘K` / `Ctrl+K`)**: Instant modal search across problem titles, IDs (e.g. `LC-1`, `CF-158A`), topics, platforms, and personal notes.
- **Notion-Style Markdown Notes**: Live split-view markdown editor with syntax highlighting and code copy actions.

### 🛡️ 4. Admin Workspace & Platform Telemetry
- **Role-Based Access Control**: Strict access restricted exclusively to administrator accounts (`code.v4ult@gmail.com`).
- **Live Database Telemetry**: Real-time platform KPI metrics directly querying PostgreSQL (`totalUsers`, `activeUsers`, `totalProblemsSolved`, `newUsersThisWeek`, `activeRooms`).
- **Global Broadcast Announcements**: Create, activate, and deactivate platform-wide announcement banners for all users.
- **User & Content Moderation**: Manage user accounts and active community rooms.

### 🏆 5. Gamification & Leaderboard
- **Dynamic Leaderboard**: Real-time global ranking powered by verified Supabase problem solve counts and streaks with logged-in user highlighted (`YOU`).
- **Milestone Badges**: Unlock 11 tiered achievement badges (50/100/250/500 Solved, 7/30/100-Day Streaks) with confetti celebration.
- **CSV Data Portability**: 1-click CSV backup export and bulk spreadsheet import.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18, TypeScript, Vite |
| **Styling & Theme** | Tailwind CSS, Warm Educational Palette, Dark & Light Mode |
| **Routing** | React Router v6 |
| **Backend & Database** | Supabase (PostgreSQL, Realtime WebSockets, Storage) |
| **Authentication** | Supabase Auth (Custom Google App Password SMTP Email OTP) |
| **Hosting & Deployment** | Firebase Hosting (`c0dev4ult.web.app`) |
| **Icons & Visuals** | Lucide React, Framer Motion, Recharts, Canvas Confetti |

---

## 📁 Project Structure

```
├── .env                       # Local environment variables
├── .env.example               # Environment variables template
├── firebase.json              # Firebase Hosting configuration & SPA rewrites
├── index.html                 # HTML template with Google Fonts (Plus Jakarta Sans)
├── package.json               # Dependencies and scripts
├── tailwind.config.js         # Tailwind configuration & design tokens
├── vite.config.ts             # Vite configuration
├── supabase/
│   ├── schema.sql             # Full PostgreSQL schema with RLS policies, tables & triggers
│   └── seed.sql               # Database seed scripts
└── src/
    ├── types/                 # TypeScript interfaces (Problem, ChatRoom, Profile, etc.)
    ├── lib/
    │   ├── supabase.ts        # Supabase client initialization
    │   ├── constants.ts       # Platforms, topics, badge definitions
    │   └── utils.ts           # Date formatters, CSV parser, confetti, heatmap generator
    ├── context/
    │   ├── AuthContext.tsx    # Auth session, Email OTP, and profile state
    │   ├── ThemeContext.tsx   # Dark/Light theme toggle
    │   └── ToastContext.tsx   # Animated toast notifications
    ├── services/
    │   ├── authService.ts     # Supabase OTP authentication
    │   ├── chatService.ts     # Real-time chat & in-app direct invitations
    │   ├── adminService.ts    # Platform telemetry & admin controls
    │   ├── problemService.ts  # Problem CRUD & CSV operations
    │   ├── profileService.ts  # User profiles & dynamic leaderboard
    │   ├── streakService.ts   # Streak calculations
    │   └── achievementService.ts # Badge unlocking logic
    ├── components/            # Reusable modular UI components
    │   ├── common/            # Navbar, Sidebar, Footer, SearchModal, ThemeToggle
    │   ├── auth/              # LoginModal, RegisterModal, OtpModal, ForgotPasswordModal
    │   ├── community/         # ChatWindow, RoomList, CreateRoomModal
    │   ├── problems/          # AddEditModal, ProblemTable, ProblemDetailModal, CsvModal
    │   ├── dashboard/         # StatCards, StreakBanner, GoalCard, Charts
    │   ├── history/           # HeatmapCalendar, TimelineView, MonthlyCalendarView (with progressive daily unlock)
    │   ├── analytics/         # Recharts Donut & Trend charts
    │   ├── revision/          # Spaced repetition cards
    │   ├── notes/             # Markdown live split editor
    │   ├── achievements/      # Badge achievement cards
    │   └── admin/             # Telemetry cards & announcement manager
    └── pages/                 # Full view application pages
```

---

## 🚀 Local Development Setup

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/SaiVishwanathV/Code-Vault.git
cd Code-Vault
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build & Deploy to Firebase

```bash
npm run build
firebase deploy
```

---

## 🔒 Database & Row Level Security (RLS)

All tables (`profiles`, `problems`, `chat_rooms`, `chat_messages`, `streaks`, `announcements`) are protected with strict Row Level Security (RLS) policies:
- Users can strictly create, view, modify, and delete only their own problem records and notes.
- Private community rooms are strictly visible only to the room creator and directly invited users who have joined.
- Real-time messages are broadcast via Supabase Realtime publication.
- Platform telemetry queries are restricted to authorized administrators.

---

## 📞 Help & Support

Need help, found a bug, or have a suggestion?
- **Email**: [code.v4ult@gmail.com](mailto:code.v4ult@gmail.com)
- **Phone / WhatsApp**: [+91 9440773606](https://wa.me/919440773606)

---

## 📋 Changelog

### v1.1 (Latest)
- 🗓️ **Dynamic Monthly Calendar**: Progressive day-by-day unlocking system — starts from launch day (Aug 26, 2026), unlocks daily going forward. Future days show a locked state that opens automatically each calendar day.
- 🔥 **Revamped Heatmap**: New intensity palette (Emerald → Gold), today's golden ring highlight, and live problem breakdown on click.
- 🎨 **Settings Page Fix**: Interface Appearance theme cards now render their own fixed background colors (light card stays cream, dark card stays obsidian) so text is always clearly readable regardless of the active theme.
- 🔗 **Username Login**: Secure `get_email_by_username` RPC bypasses RLS for unauthenticated lookups.
- 🔑 **Password Reset**: Redirects to deployed domain (`https://c0dev4ult.web.app/reset-password`) — no longer opens `localhost`.
- 📌 **Pinned Messages Persist**: Community room pinned messages now survive page refresh via dual Supabase sync (chat_messages + chat_rooms).
- 👥 **Room Invitations Backend**: `acceptRoomInvite`, `declineRoomInvite`, and `getAvailableUsers` fully connected to Supabase.

---

## 👤 Author & Maintainer

© 2026 **CodeVault** • Designed & Maintained by **Sai Vishwanath V**

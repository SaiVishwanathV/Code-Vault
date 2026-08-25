import React from 'react';
import { BookOpen, Code2, Heart, Github, Linkedin, Mail, Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE] dark:bg-[#1E222B] text-[#B0831E] dark:text-[#E9B949] text-xs font-bold shadow-subtle">
          <Sparkles className="w-3.5 h-3.5" />
          <span>About CodeVault – Coders Space</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#1A202C] dark:text-white tracking-tight">
          Your Personal DSA Learning Workspace
        </h1>
        <p className="text-xs sm:text-sm text-[#718096] dark:text-[#A0AEC0] max-w-xl mx-auto leading-relaxed">
          CodeVault – Coders Space was built to replace cluttered spreadsheets and fragmented browser tabs with an elegant, distraction-free educational workspace for coding interview preparation.
        </p>
      </div>

      {/* 1. Mission Section */}
      <div className="p-6 sm:p-8 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card space-y-3">
        <h2 className="text-base font-bold text-[#1A202C] dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#E9B949]" /> Our Mission
        </h2>
        <p className="text-xs sm:text-sm text-[#4A5568] dark:text-[#CBD5E0] leading-relaxed">
          Consistent problem solving requires three things: <strong>clarity of notes</strong>, <strong>spaced repetition</strong>, and <strong>accountability</strong>. CodeVault unifies multi-platform tracking (LeetCode, Codeforces, HackerRank, GFG, CodeChef) with Notion-style personal markdown notes and GitHub-style 365-day heatmaps so students never lose track of an algorithmic pattern.
        </p>
      </div>

      {/* 2. Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE] dark:bg-[#16181D] space-y-2">
          <div className="w-8 h-8 rounded-lg bg-[#E9B949] text-[#1A202C] flex items-center justify-center font-bold text-xs">
            1
          </div>
          <h3 className="font-bold text-xs text-[#1A202C] dark:text-white">Minimal & Clean</h3>
          <p className="text-[11px] text-[#718096] dark:text-[#A0AEC0] leading-relaxed">
            No gaming neon lights, pop-ups, or clutter. Built with generous whitespace and high-contrast typography.
          </p>
        </div>

        <div className="p-5 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE] dark:bg-[#16181D] space-y-2">
          <div className="w-8 h-8 rounded-lg bg-[#4F7A5A] text-white flex items-center justify-center font-bold text-xs">
            2
          </div>
          <h3 className="font-bold text-xs text-[#1A202C] dark:text-white">Spaced Repetition</h3>
          <p className="text-[11px] text-[#718096] dark:text-[#A0AEC0] leading-relaxed">
            Flag tricky edge cases to the revision queue. Never forget a solution before an interview round.
          </p>
        </div>

        <div className="p-5 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE] dark:bg-[#16181D] space-y-2">
          <div className="w-8 h-8 rounded-lg bg-[#3182CE] text-white flex items-center justify-center font-bold text-xs">
            3
          </div>
          <h3 className="font-bold text-xs text-[#1A202C] dark:text-white">Community & Study Rooms</h3>
          <p className="text-[11px] text-[#718096] dark:text-[#A0AEC0] leading-relaxed">
            Real-time chatrooms for daily challenges, mock interviews, and private study groups.
          </p>
        </div>
      </div>

      {/* 3. Tech Stack */}
      <div className="p-6 sm:p-8 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card space-y-4">
        <h2 className="text-base font-bold text-[#1A202C] dark:text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-[#E9B949]" /> Technology Stack
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE]/50 dark:bg-[#16181D]">
            <span className="font-bold text-[#1A202C] dark:text-white block">React + Vite</span>
            <span className="text-[10px] text-[#718096]">Fast client bundle</span>
          </div>
          <div className="p-3 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE]/50 dark:bg-[#16181D]">
            <span className="font-bold text-[#1A202C] dark:text-white block">Tailwind CSS</span>
            <span className="text-[10px] text-[#718096]">Warm white palette</span>
          </div>
          <div className="p-3 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE]/50 dark:bg-[#16181D]">
            <span className="font-bold text-[#1A202C] dark:text-white block">Supabase</span>
            <span className="text-[10px] text-[#718096]">PostgreSQL + OTP Auth</span>
          </div>
          <div className="p-3 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE]/50 dark:bg-[#16181D]">
            <span className="font-bold text-[#1A202C] dark:text-white block">Recharts</span>
            <span className="text-[10px] text-[#718096]">Minimal analytics</span>
          </div>
        </div>
      </div>

      {/* 4. Creator & Contact */}
      <div className="p-6 sm:p-8 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE] dark:bg-[#1E222B] shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-sm font-bold text-[#1A202C] dark:text-white">
            Built for Software Engineering Aspirants
          </h3>
          <p className="text-xs text-[#718096] dark:text-[#A0AEC0]">
            Crafted with care to help engineers crack their dream placements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#16181D] hover:bg-[#FFF9EE] text-[#2D3748] dark:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Github className="w-4 h-4" /> GitHub
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#16181D] hover:bg-[#FFF9EE] text-[#2D3748] dark:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Linkedin className="w-4 h-4 text-[#3182CE]" /> LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
};

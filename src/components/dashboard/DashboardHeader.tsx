import React from 'react';
import { Flame, Quote as QuoteIcon, Sparkles } from 'lucide-react';
import { DAILY_QUOTES } from '../../lib/constants';
import { Streak } from '../../types';

interface DashboardHeaderProps {
  fullName?: string;
  streak: Streak;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ fullName, streak }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = fullName?.split(' ')[0] || 'Vishwa';
  const quote = DAILY_QUOTES[0];

  return (
    <div className="p-6 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-gradient-to-r from-[#FFF9EE] via-[#FFFDF8] to-[#FFF9EE] dark:from-[#1E222B] dark:via-[#16181D] dark:to-[#1E222B] shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A202C] dark:text-white tracking-tight">
            {getGreeting()}, {firstName} 👋
          </h1>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEF6E9] text-[#8C5D0B] border border-[#F8E0B0]">
            <Flame className="w-3.5 h-3.5 fill-[#E9B949] text-[#E9B949]" />
            {streak.current_streak} Day Streak
          </span>
        </div>
        <p className="text-xs text-[#718096] dark:text-[#A0AEC0] max-w-xl">
          Welcome to your minimal DSA command center. Stay disciplined with spaced repetition and continuous practice.
        </p>
      </div>

      {/* Quote of the Day */}
      <div className="p-3.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-white/80 dark:bg-[#16181D]/80 max-w-xs text-xs shadow-subtle">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#B0831E] dark:text-[#E9B949] mb-1">
          <QuoteIcon className="w-3 h-3" /> Quote of the Day
        </div>
        <p className="italic text-[#2D3748] dark:text-[#E2E8F0] leading-snug">
          &quot;{quote.quote}&quot;
        </p>
        <span className="text-[10px] font-semibold text-[#718096] block mt-1">
          — {quote.author}
        </span>
      </div>
    </div>
  );
};

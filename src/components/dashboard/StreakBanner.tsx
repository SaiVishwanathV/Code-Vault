import React from 'react';
import { Flame, Trophy, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Streak } from '../../types';
import { format, isToday, parseISO } from 'date-fns';

interface StreakBannerProps {
  streak: Streak;
  onAddProblemClick: () => void;
}

export const StreakBanner: React.FC<StreakBannerProps> = ({ streak, onAddProblemClick }) => {
  const solvedToday = streak.last_active_date ? streak.last_active_date === format(new Date(), 'yyyy-MM-dd') : false;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-indigo-950/30 p-5 sm:p-6 shadow-sm">
      {/* Background glow circle */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 animate-bounce-subtle shrink-0">
            <Flame className="w-8 h-8 fill-amber-100" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {streak.current_streak} Day Coding Streak!
              </h3>
              {solvedToday && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" /> Solved Today
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              {solvedToday
                ? 'Streak maintained for today! Keep up the momentum for tomorrow.'
                : 'Solve at least 1 problem today to keep your streak alive and growing.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-amber-500/20 pt-3 sm:pt-0">
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Longest Streak
            </span>
            <span className="text-base font-extrabold text-slate-800 dark:text-slate-200 inline-flex items-center gap-1">
              <Trophy className="w-4 h-4 text-amber-500" /> {streak.longest_streak} Days
            </span>
          </div>

          {!solvedToday && (
            <button
              onClick={onAddProblemClick}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/25 transition-all flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" /> Solve Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

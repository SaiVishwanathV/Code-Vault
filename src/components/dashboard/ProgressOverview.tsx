import React from 'react';
import { Code2, Flame, Trophy, RefreshCw } from 'lucide-react';
import { Problem, Streak } from '../../types';
import { isToday, parseISO } from 'date-fns';

interface ProgressOverviewProps {
  problems: Problem[];
  streak: Streak;
}

export const ProgressOverview: React.FC<ProgressOverviewProps> = ({ problems, streak }) => {
  const totalSolved = problems.length;
  const revisionDueCount = problems.filter((p) => p.revision_needed).length;

  const cards = [
    {
      title: 'Total Problems Solved',
      value: totalSolved,
      subtitle: 'Conquered across platforms',
      icon: Code2,
      accent: 'text-[#B0831E] bg-[#FEF6E9] border-[#F8E0B0]',
    },
    {
      title: 'Current Streak',
      value: `${streak.current_streak} Days`,
      subtitle: 'Consecutive daily coding',
      icon: Flame,
      accent: 'text-[#C0841D] bg-[#FEF6E9] border-[#F8E0B0]',
    },
    {
      title: 'Longest Streak',
      value: `${streak.longest_streak} Days`,
      subtitle: 'Personal discipline record',
      icon: Trophy,
      accent: 'text-[#4F7A5A] bg-[#EBF3ED] border-[#C7DFC9]',
    },
    {
      title: 'Revision Due Today',
      value: `${revisionDueCount} Queue`,
      subtitle: 'Spaced repetition queue',
      icon: RefreshCw,
      accent: 'text-[#C54A53] bg-[#FDF0F0] border-[#F5C2C4]',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE] dark:bg-[#1E222B] shadow-card flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#718096] dark:text-[#A0AEC0]">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl border ${card.accent}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl font-black text-[#1A202C] dark:text-white tracking-tight">
                {card.value}
              </div>
              <span className="text-[11px] text-[#718096] dark:text-[#A0AEC0] mt-0.5 block">
                {card.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

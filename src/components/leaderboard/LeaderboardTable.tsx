import React from 'react';
import { Flame, Crown, Medal } from 'lucide-react';
import { LeaderboardEntry } from '../../types';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  entries,
  currentUserId,
}) => {
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="w-7 h-7 rounded-full bg-[#E9B949] text-[#1A202C] font-black text-xs flex items-center justify-center shadow-sm">
            <Crown className="w-4 h-4" />
          </span>
        );
      case 2:
        return (
          <span className="w-7 h-7 rounded-full bg-[#CBD5E0] text-[#1A202C] font-black text-xs flex items-center justify-center shadow-sm">
            <Medal className="w-4 h-4" />
          </span>
        );
      case 3:
        return (
          <span className="w-7 h-7 rounded-full bg-[#B7791F] text-white font-black text-xs flex items-center justify-center shadow-sm">
            <Medal className="w-4 h-4" />
          </span>
        );
      default:
        return (
          <span className="w-7 h-7 rounded-full bg-[#FFF9EE] dark:bg-[#1E222B] text-[#718096] dark:text-[#A0AEC0] font-bold text-xs flex items-center justify-center border border-[#EFE6D5] dark:border-[#2C323F]">
            {rank}
          </span>
        );
    }
  };

  return (
    <div className="rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE]/70 dark:bg-[#16181D]/60 text-[11px] font-bold uppercase tracking-wider text-[#718096] dark:text-[#A0AEC0]">
              <th className="py-3.5 px-4 w-16 text-center">Rank</th>
              <th className="py-3.5 px-4">Coder</th>
              <th className="py-3.5 px-4 text-center">Total Solved</th>
              <th className="py-3.5 px-4 text-center">Breakdown (E / M / H)</th>
              <th className="py-3.5 px-4 text-right">Streak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFE6D5]/60 dark:divide-[#2C323F]/80 text-xs">
            {entries.map((entry) => {
              const isCurrentUser =
                entry.id === currentUserId ||
                entry.username === 'vishwa_codes' ||
                entry.full_name.includes('(You)');

              return (
                <tr
                  key={entry.id}
                  className={`transition-colors ${
                    isCurrentUser
                      ? 'bg-[#FFF9EE] dark:bg-[#252B37] font-semibold border-l-4 border-l-[#E9B949]'
                      : 'hover:bg-[#FFF9EE]/40 dark:hover:bg-[#252B37]/30'
                  }`}
                >
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex justify-center">{getRankBadge(entry.rank)}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={entry.avatar_url}
                        alt={entry.full_name}
                        className="w-9 h-9 rounded-xl object-cover border border-[#EFE6D5] dark:border-[#2C323F] shrink-0"
                      />
                      <div>
                        <div className="font-bold text-[#1A202C] dark:text-white flex items-center gap-1.5">
                          {entry.full_name}
                          {isCurrentUser && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#E9B949] text-[#1A202C] font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#718096] dark:text-[#A0AEC0] font-mono">
                          @{entry.username}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="text-sm font-black text-[#1A202C] dark:text-[#E9B949]">
                      {entry.total_solved}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 font-mono text-[11px]">
                      <span className="text-[#4F7A5A] font-bold">{entry.easy_count}</span>
                      <span className="text-[#A0AEC0]">/</span>
                      <span className="text-[#C0841D] font-bold">{entry.medium_count}</span>
                      <span className="text-[#A0AEC0]">/</span>
                      <span className="text-[#C54A53] font-bold">{entry.hard_count}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1 text-[#C0841D] font-bold">
                      <Flame className="w-4 h-4 fill-[#E9B949] text-[#E9B949]" />
                      <span>{entry.current_streak}d</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

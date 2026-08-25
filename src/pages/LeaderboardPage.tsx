import React, { useState, useEffect } from 'react';
import { Crown, Trophy, Medal, Flame, Search, Users, Globe, Calendar } from 'lucide-react';
import { LeaderboardEntry, LeaderboardFilter } from '../types';
import { profileService } from '../services/profileService';
import { useAuth } from '../context/AuthContext';

export const LeaderboardPage: React.FC = () => {
  const [filter, setFilter] = useState<LeaderboardFilter>('global');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, profile } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const data = await profileService.getLeaderboard(filter, user?.id);
        setEntries(data);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [filter, user?.id]);

  const filteredEntries = entries.filter((e) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return e.full_name.toLowerCase().includes(q) || e.username.toLowerCase().includes(q);
  });

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A202C] dark:text-white tracking-tight flex items-center gap-2.5">
            <Crown className="w-7 h-7 text-[#E9B949]" />
            Global DSA Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] dark:text-[#A0AEC0] mt-1">
            Real-time rankings based on total DSA problems conquered and active streaks.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#A0AEC0]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coder by name or username..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] text-xs text-[#1A202C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E9B949] shadow-subtle"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#EFE6D5] dark:border-[#2C323F] pb-3">
        {[
          { id: 'global', label: 'Global Ranking', icon: Globe },
          { id: 'friends', label: 'My Ranking', icon: Users },
          { id: 'weekly', label: 'Weekly Top Solvers', icon: Calendar },
          { id: 'monthly', label: 'Monthly Champions', icon: Trophy },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as LeaderboardFilter)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-[#E9B949] text-[#1A202C] font-bold shadow-sm'
                  : 'bg-white dark:bg-[#1E222B] border border-[#EFE6D5] dark:border-[#2C323F] text-[#4A5568] dark:text-[#A0AEC0] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE]/70 dark:bg-[#16181D]/60 text-[11px] font-bold uppercase tracking-wider text-[#718096] dark:text-[#A0AEC0]">
                <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                <th className="py-3.5 px-4">Coder</th>
                <th className="py-3.5 px-4 text-center">Total Solved</th>
                <th className="py-3.5 px-4 text-center">Breakdown (E / M / H)</th>
                <th className="py-3.5 px-4 text-right">Current Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE6D5]/60 dark:divide-[#2C323F]/80 text-xs">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-[#718096]">
                    No coders found matching your search.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const isCurrentUser =
                    Boolean(user?.id && entry.id === user.id) ||
                    Boolean(profile?.username && entry.username.toLowerCase() === profile.username.toLowerCase());

                  return (
                    <tr
                      key={entry.id}
                      className={`transition-colors ${
                        isCurrentUser
                          ? 'bg-[#FFF9EE] dark:bg-[#252B37] font-bold border-l-4 border-l-[#E9B949]'
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

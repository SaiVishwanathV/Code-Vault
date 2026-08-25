import React from 'react';
import { Search, Filter, Star, RefreshCw, X } from 'lucide-react';
import { Difficulty, FilterOptions, Platform } from '../../types';
import { DIFFICULTIES, PLATFORMS, TOPICS } from '../../lib/constants';

interface ProblemFiltersProps {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
  onReset: () => void;
  totalCount: number;
  filteredCount: number;
}

export const ProblemFilters: React.FC<ProblemFiltersProps> = ({
  filters,
  onChange,
  onReset,
  totalCount,
  filteredCount,
}) => {
  const isFiltered =
    filters.search !== '' ||
    filters.difficulty !== 'All' ||
    filters.platform !== 'All' ||
    filters.topic !== 'All' ||
    filters.favoriteOnly ||
    filters.revisionOnly;

  return (
    <div className="p-4 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card space-y-3.5">
      {/* Top Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#A0AEC0]" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search problems by name, ID, topic, or notes..."
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-[#1A202C] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: '' })}
              className="absolute right-2.5 top-2.5 text-[#A0AEC0] hover:text-[#1A202C]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange({ ...filters, favoriteOnly: !filters.favoriteOnly })}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              filters.favoriteOnly
                ? 'border-[#F8E0B0] bg-[#FEF6E9] text-[#E9B949] shadow-sm'
                : 'border-[#EFE6D5] dark:border-[#2C323F] text-[#718096] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37]'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${filters.favoriteOnly ? 'fill-[#E9B949]' : ''}`} />
            <span>Favorites</span>
          </button>

          <button
            onClick={() => onChange({ ...filters, revisionOnly: !filters.revisionOnly })}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              filters.revisionOnly
                ? 'border-[#F8E0B0] bg-[#FEF6E9] text-[#C0841D] shadow-sm'
                : 'border-[#EFE6D5] dark:border-[#2C323F] text-[#718096] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37]'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Revision Queue</span>
          </button>
        </div>
      </div>

      {/* Filter Dropdowns & Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#EFE6D5]/60 dark:border-[#2C323F]/80">
        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty Filter */}
          <div className="flex items-center rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE] dark:bg-[#16181D] p-0.5 text-xs">
            <button
              onClick={() => onChange({ ...filters, difficulty: 'All' })}
              className={`px-2.5 py-1 rounded-lg transition-colors font-semibold ${
                filters.difficulty === 'All'
                  ? 'bg-[#E9B949] text-[#1A202C] font-bold shadow-sm'
                  : 'text-[#718096] dark:text-[#A0AEC0] hover:text-[#1A202C]'
              }`}
            >
              All Diff
            </button>
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => onChange({ ...filters, difficulty: d })}
                className={`px-2.5 py-1 rounded-lg transition-colors font-semibold ${
                  filters.difficulty === d
                    ? 'bg-[#E9B949] text-[#1A202C] font-bold shadow-sm'
                    : 'text-[#718096] dark:text-[#A0AEC0] hover:text-[#1A202C]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Platform Select */}
          <select
            value={filters.platform}
            onChange={(e) => onChange({ ...filters, platform: e.target.value as any })}
            className="px-3 py-1.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE] dark:bg-[#16181D] text-[#2D3748] dark:text-[#E2E8F0] text-xs focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
          >
            <option value="All">All Platforms</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Topic Select */}
          <select
            value={filters.topic}
            onChange={(e) => onChange({ ...filters, topic: e.target.value })}
            className="px-3 py-1.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE] dark:bg-[#16181D] text-[#2D3748] dark:text-[#E2E8F0] text-xs focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
          >
            <option value="All">All Topics</option>
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Counter & Reset */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-[#718096]">
            Showing <strong className="text-[#1A202C] dark:text-white">{filteredCount}</strong> of {totalCount}
          </span>
          {isFiltered && (
            <button
              onClick={onReset}
              className="text-[#B0831E] dark:text-[#E9B949] hover:underline font-semibold inline-flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

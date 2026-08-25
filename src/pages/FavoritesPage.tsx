import React from 'react';
import { Star, FileText, Calendar, ArrowRight } from 'lucide-react';
import { Problem } from '../types';
import { DifficultyBadge, PlatformBadge, TopicBadge } from '../components/common/Badge';
import { formatDate } from '../lib/utils';
import { EmptyState } from '../components/common/EmptyState';

interface FavoritesPageProps {
  problems: Problem[];
  onSelectProblem: (problem: Problem) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onNavigateToProblems?: () => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  problems,
  onSelectProblem,
  onToggleFavorite,
  onNavigateToProblems,
}) => {
  const favoriteProblems = problems.filter((p) => p.favorite);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A202C] dark:text-white tracking-tight flex items-center gap-2.5">
            <Star className="w-6 h-6 text-[#E9B949] fill-[#E9B949]" />
            Starred Favorite Problems
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] dark:text-[#A0AEC0] mt-1">
            Quick-access bookmark list for your most important algorithmic templates and core patterns.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-xl bg-[#FFF3D6] dark:bg-[#2C210C] text-[#B0831E] dark:text-[#E9B949] border border-[#F8E0B0] dark:border-[#5C4212] text-xs font-bold self-start sm:self-auto">
          {favoriteProblems.length} Starred Problems
        </span>
      </div>

      {favoriteProblems.length === 0 ? (
        <EmptyState
          icon={<Star className="w-7 h-7 text-[#E9B949]" />}
          title="No Starred Problems Yet"
          description="Click the star icon next to any problem in your catalog to bookmark it here for quick revision."
          actionText="Browse Problems"
          onAction={onNavigateToProblems}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {favoriteProblems.map((prob) => (
            <div
              key={prob.id}
              onClick={() => onSelectProblem(prob)}
              className="p-5 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] hover:border-[#E9B949] shadow-card transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Header row: ID, badges, favorite star */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-[#718096]">
                      {prob.problem_id}
                    </span>
                    <PlatformBadge platform={prob.platform} />
                    <DifficultyBadge difficulty={prob.difficulty} />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(prob.id, prob.favorite);
                    }}
                    className="p-1 rounded-lg text-[#E9B949] hover:text-[#A0AEC0] transition-colors"
                    title="Remove from favorites"
                  >
                    <Star className="w-4 h-4 fill-[#E9B949]" />
                  </button>
                </div>

                {/* Problem title */}
                <h3 className="text-base font-bold text-[#1A202C] dark:text-white group-hover:text-[#B0831E] transition-colors">
                  {prob.problem_name}
                </h3>

                {/* Topic & Solved Date */}
                <div className="flex items-center gap-2 mt-2">
                  <TopicBadge topic={prob.topic} />
                  <span className="text-xs text-[#718096] flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {formatDate(prob.solved_date, 'MMM dd')}
                  </span>
                </div>
              </div>

              {/* Action Button: Open Problem only */}
              <div className="pt-3.5 mt-3.5 border-t border-[#EFE6D5] dark:border-[#2C323F] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#B0831E] dark:text-[#E9B949] group-hover:underline flex items-center gap-1">
                  Open Problem <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px] text-[#A0AEC0]">Click to view details & notes</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { RefreshCw, CheckCircle2, Bookmark, Calendar } from 'lucide-react';
import { Problem } from '../types';
import { RevisionCard } from '../components/revision/RevisionCard';
import { EmptyState } from '../components/common/EmptyState';

interface RevisionPageProps {
  problems: Problem[];
  onMarkRevised: (id: string, nextDate?: string) => Promise<void>;
  onSelectProblem: (problem: Problem) => void;
  onToggleRevision?: (id: string, current: boolean) => Promise<void>;
  onNavigateToProblems?: () => void;
}

export const RevisionPage: React.FC<RevisionPageProps> = ({
  problems,
  onMarkRevised,
  onSelectProblem,
  onNavigateToProblems,
}) => {
  const revisionProblems = problems.filter((p) => p.revision_needed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A202C] dark:text-white tracking-tight flex items-center gap-2.5">
            <RefreshCw className="w-7 h-7 text-[#E9B949]" />
            Spaced Repetition & Revision Queue
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] dark:text-[#A0AEC0] mt-1">
            Review tricky concepts, edge cases, and high-frequency interview patterns before your technical rounds.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3.5 py-1.5 rounded-xl bg-[#FEF6E9] dark:bg-[#2C210C] text-[#8C5D0B] dark:text-[#E9B949] border border-[#F8E0B0] dark:border-[#5C4212] text-xs font-bold">
            {revisionProblems.length} Problem{revisionProblems.length !== 1 ? 's' : ''} in Queue
          </span>
        </div>
      </div>

      {/* Grid of Revision Cards */}
      {revisionProblems.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="w-7 h-7 text-[#4F7A5A]" />}
          title="All Caught Up on Revisions!"
          description="Your revision queue is currently empty. You can mark any problem for spaced repetition from the Problems Tracker."
          actionText="Browse Problems"
          onAction={onNavigateToProblems}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {revisionProblems.map((prob) => (
            <RevisionCard
              key={prob.id}
              problem={prob}
              onMarkRevised={onMarkRevised}
              onSelectProblem={onSelectProblem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

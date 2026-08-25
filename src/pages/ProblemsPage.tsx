import React, { useState, useMemo } from 'react';
import { Plus, FileSpreadsheet, Code2 } from 'lucide-react';
import { FilterOptions, Problem } from '../types';
import { ProblemFilters } from '../components/problems/ProblemFilters';
import { ProblemTable } from '../components/problems/ProblemTable';
import { EmptyState } from '../components/common/EmptyState';

interface ProblemsPageProps {
  problems: Problem[];
  onOpenAddProblem: () => void;
  onOpenCsvModal: () => void;
  onSelectProblem: (problem: Problem) => void;
  onEditProblem: (problem: Problem) => void;
  onDeleteProblem: (id: string) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onToggleRevision: (id: string, current: boolean) => void;
}

export const ProblemsPage: React.FC<ProblemsPageProps> = ({
  problems,
  onOpenAddProblem,
  onOpenCsvModal,
  onSelectProblem,
  onEditProblem,
  onDeleteProblem,
  onToggleFavorite,
  onToggleRevision,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    difficulty: 'All',
    platform: 'All',
    topic: 'All',
    favoriteOnly: false,
    revisionOnly: false,
  });

  const handleResetFilters = () => {
    setFilters({
      search: '',
      difficulty: 'All',
      platform: 'All',
      topic: 'All',
      favoriteOnly: false,
      revisionOnly: false,
    });
  };

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      // Search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matches =
          p.problem_name.toLowerCase().includes(q) ||
          p.problem_id.toLowerCase().includes(q) ||
          p.topic.toLowerCase().includes(q) ||
          (p.notes && p.notes.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Difficulty
      if (filters.difficulty !== 'All' && p.difficulty !== filters.difficulty) {
        return false;
      }

      // Platform
      if (filters.platform !== 'All' && p.platform !== filters.platform) {
        return false;
      }

      // Topic
      if (filters.topic !== 'All' && p.topic !== filters.topic) {
        return false;
      }

      // Favorite Only
      if (filters.favoriteOnly && !p.favorite) {
        return false;
      }

      // Revision Only
      if (filters.revisionOnly && !p.revision_needed) {
        return false;
      }

      return true;
    });
  }, [problems, filters]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A202C] dark:text-white tracking-tight flex items-center gap-2.5">
            <Code2 className="w-7 h-7 text-[#E9B949]" />
            Solved Problems Vault
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] dark:text-[#A0AEC0] mt-1">
            Search, sort, and organize all your algorithmic solutions across coding platforms.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onOpenCsvModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] text-[#2D3748] dark:text-[#E2E8F0] text-xs font-semibold shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#B0831E]" />
            <span>CSV Backup / Import</span>
          </button>

          <button
            onClick={onOpenAddProblem}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E9B949] hover:bg-[#D4A32D] text-[#1A202C] font-bold text-xs shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Problem</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <ProblemFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        totalCount={problems.length}
        filteredCount={filteredProblems.length}
      />

      {/* Problems Table / Empty State */}
      {filteredProblems.length === 0 ? (
        <EmptyState
          title="No problems found"
          description={
            problems.length === 0
              ? "You haven't logged any DSA problems yet. Click Add Problem to record your first solution!"
              : 'No solved problems matched your active search and filter criteria.'
          }
          actionText={problems.length === 0 ? 'Add First Problem' : undefined}
          onAction={problems.length === 0 ? onOpenAddProblem : undefined}
        />
      ) : (
        <ProblemTable
          problems={filteredProblems}
          onSelectProblem={onSelectProblem}
          onEditProblem={onEditProblem}
          onDeleteProblem={onDeleteProblem}
          onToggleFavorite={onToggleFavorite}
          onToggleRevision={onToggleRevision}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  ExternalLink,
  Star,
  RefreshCw,
  Edit3,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';
import { Problem, SortOption } from '../../types';
import { DifficultyBadge, PlatformBadge, TopicBadge } from '../common/Badge';
import { formatDate } from '../../lib/utils';

interface ProblemTableProps {
  problems: Problem[];
  onSelectProblem: (problem: Problem) => void;
  onEditProblem: (problem: Problem) => void;
  onDeleteProblem: (id: string) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onToggleRevision: (id: string, current: boolean) => void;
}

export const ProblemTable: React.FC<ProblemTableProps> = ({
  problems,
  onSelectProblem,
  onEditProblem,
  onDeleteProblem,
  onToggleFavorite,
  onToggleRevision,
}) => {
  const [sortOption, setSortOption] = useState<SortOption>({
    field: 'solved_date',
    order: 'desc',
  });

  const [expandedProblemId, setExpandedProblemId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sorting
  const sortedProblems = [...problems].sort((a, b) => {
    const factor = sortOption.order === 'asc' ? 1 : -1;
    if (sortOption.field === 'solved_date') {
      return a.solved_date.localeCompare(b.solved_date) * factor;
    }
    if (sortOption.field === 'problem_name') {
      return a.problem_name.localeCompare(b.problem_name) * factor;
    }
    if (sortOption.field === 'time_taken') {
      return ((a.time_taken || 0) - (b.time_taken || 0)) * factor;
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedProblems.length / itemsPerPage) || 1;
  const paginatedProblems = sortedProblems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (field: SortOption['field']) => {
    if (sortOption.field === field) {
      setSortOption({
        field,
        order: sortOption.order === 'asc' ? 'desc' : 'asc',
      });
    } else {
      setSortOption({ field, order: 'desc' });
    }
  };

  const toggleExpandNotes = (id: string) => {
    setExpandedProblemId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE]/70 dark:bg-[#16181D]/60 text-[11px] font-bold uppercase tracking-wider text-[#718096] dark:text-[#A0AEC0]">
              <th className="py-3.5 px-4 w-10 text-center"></th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-[#1A202C] dark:hover:text-white transition-colors"
                onClick={() => toggleSort('problem_name')}
              >
                <span className="flex items-center gap-1.5">
                  Problem <ArrowUpDown className="w-3 h-3" />
                </span>
              </th>
              <th className="py-3.5 px-4">Platform</th>
              <th className="py-3.5 px-4">Difficulty</th>
              <th className="py-3.5 px-4">Topic</th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-[#1A202C] dark:hover:text-white transition-colors"
                onClick={() => toggleSort('solved_date')}
              >
                <span className="flex items-center gap-1.5">
                  Solved Date <ArrowUpDown className="w-3 h-3" />
                </span>
              </th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-[#1A202C] dark:hover:text-white transition-colors text-right"
                onClick={() => toggleSort('time_taken')}
              >
                <span className="flex items-center justify-end gap-1.5">
                  Time <ArrowUpDown className="w-3 h-3" />
                </span>
              </th>
              <th className="py-3.5 px-4 text-center">Revision</th>
              <th className="py-3.5 px-4 text-center">Favorite</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFE6D5]/60 dark:divide-[#2C323F]/80 text-xs">
            {paginatedProblems.map((prob) => {
              const isExpanded = expandedProblemId === prob.id;

              return (
                <React.Fragment key={prob.id}>
                  <tr className="hover:bg-[#FFF9EE]/50 dark:hover:bg-[#252B37]/40 transition-colors group">
                    {/* Expand Row Chevron */}
                    <td className="py-3.5 px-2 text-center">
                      <button
                        onClick={() => toggleExpandNotes(prob.id)}
                        className="p-1 rounded-md text-[#A0AEC0] hover:text-[#2D3748] dark:hover:text-white transition-colors"
                        title={isExpanded ? 'Collapse notes' : 'Expand notes'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>

                    {/* Problem Name & ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-[#718096] dark:text-[#A0AEC0] font-semibold">
                          {prob.problem_id}
                        </span>
                        <button
                          onClick={() => onSelectProblem(prob)}
                          className="font-bold text-[#1A202C] dark:text-[#F7FAFC] hover:text-[#C0841D] dark:hover:text-[#E9B949] transition-colors text-left"
                        >
                          {prob.problem_name}
                        </button>
                        {prob.notes && (
                          <button
                            onClick={() => toggleExpandNotes(prob.id)}
                            className="text-[#B0831E] dark:text-[#E9B949] hover:underline text-[10px] font-medium inline-flex items-center gap-0.5 ml-1"
                          >
                            <FileText className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Platform */}
                    <td className="py-3.5 px-4">
                      <PlatformBadge platform={prob.platform} />
                    </td>

                    {/* Difficulty */}
                    <td className="py-3.5 px-4">
                      <DifficultyBadge difficulty={prob.difficulty} />
                    </td>

                    {/* Topic */}
                    <td className="py-3.5 px-4">
                      <TopicBadge topic={prob.topic} />
                    </td>

                    {/* Solved Date */}
                    <td className="py-3.5 px-4 text-[#718096] dark:text-[#A0AEC0] font-medium">
                      {formatDate(prob.solved_date)}
                    </td>

                    {/* Time Taken */}
                    <td className="py-3.5 px-4 text-right font-mono text-[#718096] dark:text-[#A0AEC0]">
                      {prob.time_taken ? `${prob.time_taken}m` : '-'}
                    </td>

                    {/* Revision Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onToggleRevision(prob.id, prob.revision_needed)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          prob.revision_needed
                            ? 'text-[#C0841D] bg-[#FEF6E9] dark:bg-[#2C210C]'
                            : 'text-[#A0AEC0] hover:text-[#C0841D]'
                        }`}
                        title={prob.revision_needed ? 'In revision queue' : 'Queue for revision'}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </td>

                    {/* Favorite Star Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onToggleFavorite(prob.id, prob.favorite)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          prob.favorite
                            ? 'text-[#E9B949] fill-[#E9B949]'
                            : 'text-[#A0AEC0] hover:text-[#E9B949]'
                        }`}
                        title={prob.favorite ? 'Remove favorite' : 'Star favorite'}
                      >
                        <Star className={`w-3.5 h-3.5 ${prob.favorite ? 'fill-[#E9B949]' : ''}`} />
                      </button>
                    </td>

                    {/* Actions: Problem URL, Edit, Delete */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {prob.problem_link && (
                          <a
                            href={prob.problem_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-[#718096] hover:text-[#1A202C] dark:hover:text-white transition-colors"
                            title="Open external problem link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          onClick={() => onEditProblem(prob)}
                          className="p-1.5 rounded-lg text-[#718096] hover:text-[#1A202C] dark:hover:text-white transition-colors"
                          title="Edit problem"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${prob.problem_name}"?`)) {
                              onDeleteProblem(prob.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-[#718096] hover:text-[#C54A53] transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expandable Notes Sub-row */}
                  {isExpanded && (
                    <tr className="bg-[#FFFDF8] dark:bg-[#16181D]">
                      <td colSpan={10} className="p-4 border-b border-[#EFE6D5] dark:border-[#2C323F]">
                        <div className="p-4 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE]/70 dark:bg-[#1E222B]/70 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-[#2D3748] dark:text-[#E2E8F0]">
                            <span className="flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-[#E9B949]" /> Personal Notes & Approach
                            </span>
                            <button
                              onClick={() => onEditProblem(prob)}
                              className="text-xs text-[#B0831E] dark:text-[#E9B949] hover:underline"
                            >
                              Edit Notes
                            </button>
                          </div>
                          <div className="text-xs font-mono whitespace-pre-wrap text-[#2D3748] dark:text-[#CBD5E0] leading-relaxed">
                            {prob.notes || (
                              <span className="text-[#A0AEC0] italic font-sans">
                                No approach notes written for this problem yet. Click Edit to add intuition and code snippets.
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[#EFE6D5] dark:border-[#2C323F] text-xs text-[#718096] dark:text-[#A0AEC0]">
        <div>
          Showing {Math.min(paginatedProblems.length, 1 + (currentPage - 1) * itemsPerPage)} to{' '}
          {Math.min(currentPage * itemsPerPage, sortedProblems.length)} of {sortedProblems.length} problems
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-[#EFE6D5] dark:border-[#2C323F] disabled:opacity-40 hover:bg-[#FFF9EE] dark:hover:bg-[#1E222B] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 font-bold text-[#1A202C] dark:text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-[#EFE6D5] dark:border-[#2C323F] disabled:opacity-40 hover:bg-[#FFF9EE] dark:hover:bg-[#1E222B] transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

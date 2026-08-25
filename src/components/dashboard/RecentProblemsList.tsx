import React from 'react';
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { Problem } from '../../types';
import { DifficultyBadge, PlatformBadge, TopicBadge } from '../common/Badge';
import { formatDate } from '../../lib/utils';

interface RecentProblemsListProps {
  problems: Problem[];
  onSelectProblem: (problem: Problem) => void;
  onViewAllClick: () => void;
}

export const RecentProblemsList: React.FC<RecentProblemsListProps> = ({
  problems,
  onSelectProblem,
  onViewAllClick,
}) => {
  const recent = problems.slice(0, 5);

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Recently Solved Problems
        </h4>
        <button
          onClick={onViewAllClick}
          className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {recent.map((prob) => (
          <div
            key={prob.id}
            onClick={() => onSelectProblem(prob)}
            className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-xl px-2 -mx-2 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400">{prob.problem_id}</span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-500 transition-colors">
                    {prob.problem_name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <PlatformBadge platform={prob.platform} className="text-[10px] py-0 px-1.5" />
                  <DifficultyBadge difficulty={prob.difficulty} className="text-[10px] py-0 px-1.5" />
                  <span className="text-[11px] text-slate-400 hidden sm:inline">#{prob.topic}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0 text-[11px] text-slate-400">
              <div>{formatDate(prob.solved_date, 'MMM dd')}</div>
              {prob.time_taken ? (
                <div className="text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                  <Clock className="w-3 h-3" /> {prob.time_taken}m
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

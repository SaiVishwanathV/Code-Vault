import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { Problem } from '../../types';
import { DifficultyBadge, PlatformBadge, TopicBadge } from '../common/Badge';
import { formatDate } from '../../lib/utils';

interface TimelineViewProps {
  problems: Problem[];
  onSelectProblem: (problem: Problem) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ problems, onSelectProblem }) => {
  // Group problems by solved date
  const groupedByDate: Record<string, Problem[]> = {};
  problems.forEach((p) => {
    if (!groupedByDate[p.solved_date]) {
      groupedByDate[p.solved_date] = [];
    }
    groupedByDate[p.solved_date].push(p);
  });

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-[#EFE6D5] dark:before:bg-[#2C323F]">
      {sortedDates.map((dateStr) => {
        const dayProblems = groupedByDate[dateStr];

        return (
          <div key={dateStr} className="relative pl-8">
            {/* Timeline dot */}
            <div className="absolute left-1.5 top-2 w-4 h-4 rounded-full bg-[#E9B949] ring-4 ring-[#FFFDF8] dark:ring-[#16181D] flex items-center justify-center -translate-x-1/2 shadow-sm" />

            {/* Date Header */}
            <div className="mb-2.5 flex items-center gap-2">
              <span className="text-xs font-bold text-[#1A202C] dark:text-white flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#B0831E] dark:text-[#E9B949]" />
                {formatDate(dateStr, 'MMMM dd, yyyy')}
              </span>
              <span className="text-[10px] bg-[#FEF6E9] dark:bg-[#2C210C] text-[#8C5D0B] dark:text-[#E9B949] border border-[#F8E0B0] dark:border-[#5C4212] px-2 py-0.2 rounded-full font-bold">
                {dayProblems.length} solved
              </span>
            </div>

            {/* Daily Problems List (Compact & Clean without raw notes) */}
            <div className="space-y-2">
              {dayProblems.map((prob) => (
                <div
                  key={prob.id}
                  onClick={() => onSelectProblem(prob)}
                  className="p-3.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] hover:border-[#E9B949] shadow-card transition-all cursor-pointer group flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-[#E9B949] font-bold shrink-0">•</span>
                    <span className="text-xs font-mono font-bold text-[#718096] shrink-0">
                      {prob.problem_id}
                    </span>
                    <h4 className="text-xs font-bold text-[#1A202C] dark:text-white group-hover:text-[#B0831E] dark:group-hover:text-[#E9B949] transition-colors truncate">
                      {prob.problem_name}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <PlatformBadge platform={prob.platform} className="text-[9px] py-0 px-1.5" />
                    <DifficultyBadge difficulty={prob.difficulty} className="text-[9px] py-0 px-1.5" />
                    <TopicBadge topic={prob.topic} className="hidden sm:inline-flex text-[9px] py-0 px-1.5" />
                    <ChevronRight className="w-4 h-4 text-[#A0AEC0] group-hover:text-[#B0831E] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

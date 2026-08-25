import React from 'react';
import { ArrowRight, CheckCircle2, Clock, RefreshCw, Calendar, Sparkles } from 'lucide-react';
import { Problem } from '../../types';
import { DifficultyBadge, PlatformBadge, TopicBadge } from '../common/Badge';
import { formatDate } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

interface ContinueLearningSectionProps {
  problems: Problem[];
  onSelectProblem: (problem: Problem) => void;
}

export const ContinueLearningSection: React.FC<ContinueLearningSectionProps> = ({
  problems,
  onSelectProblem,
}) => {
  const navigate = useNavigate();

  const recentSolved = problems.slice(0, 4);
  const revisionDue = problems.filter((p) => p.revision_needed).slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Recently Solved Feed */}
      <div className="p-5 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#718096] dark:text-[#A0AEC0] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#4F7A5A]" /> Recently Solved
            </h3>
            <button
              onClick={() => navigate('/problems')}
              className="text-xs font-bold text-[#B0831E] dark:text-[#E9B949] hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#EFE6D5]/60 dark:divide-[#2C323F]/80">
            {recentSolved.map((prob) => (
              <div
                key={prob.id}
                onClick={() => onSelectProblem(prob)}
                className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 hover:bg-[#FFF9EE]/50 dark:hover:bg-[#252B37]/30 rounded-xl px-2 -mx-2 transition-colors cursor-pointer group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#718096]">{prob.problem_id}</span>
                    <span className="text-xs font-bold text-[#1A202C] dark:text-white truncate group-hover:text-[#B0831E] transition-colors">
                      {prob.problem_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <PlatformBadge platform={prob.platform} className="text-[9px] py-0 px-1.5" />
                    <DifficultyBadge difficulty={prob.difficulty} className="text-[9px] py-0 px-1.5" />
                  </div>
                </div>

                <div className="text-right text-[10px] text-[#718096] shrink-0 font-medium">
                  {formatDate(prob.solved_date, 'MMM dd')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revision Queue Due & Reminders */}
      <div className="p-5 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#718096] dark:text-[#A0AEC0] flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-[#C0841D]" /> Revision Queue & Reminders
            </h3>
            <button
              onClick={() => navigate('/revision')}
              className="text-xs font-bold text-[#B0831E] dark:text-[#E9B949] hover:underline flex items-center gap-1"
            >
              Open Queue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {revisionDue.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#718096] italic">
              All revisions are up to date! Good job on maintaining retention.
            </div>
          ) : (
            <div className="divide-y divide-[#EFE6D5]/60 dark:divide-[#2C323F]/80">
              {revisionDue.map((prob) => (
                <div
                  key={prob.id}
                  onClick={() => onSelectProblem(prob)}
                  className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 hover:bg-[#FFF9EE]/50 dark:hover:bg-[#252B37]/30 rounded-xl px-2 -mx-2 transition-colors cursor-pointer group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#718096]">{prob.problem_id}</span>
                      <span className="text-xs font-bold text-[#1A202C] dark:text-white truncate group-hover:text-[#C0841D] transition-colors">
                        {prob.problem_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <TopicBadge topic={prob.topic} className="text-[9px] py-0 px-1.5" />
                      <span className="text-[10px] text-[#C0841D] font-semibold">
                        {prob.revision_count || 0}x reviewed
                      </span>
                    </div>
                  </div>

                  <div className="text-right text-[10px] text-[#C0841D] font-bold shrink-0 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Due Soon
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

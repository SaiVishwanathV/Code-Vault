import React, { useState } from 'react';
import { RefreshCw, Calendar, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { Problem } from '../../types';
import { DifficultyBadge, PlatformBadge, TopicBadge } from '../common/Badge';
import { formatDate } from '../../lib/utils';
import { format } from 'date-fns';

interface RevisionCardProps {
  problem: Problem;
  onMarkRevised: (id: string, nextDate?: string) => Promise<void>;
  onSelectProblem: (problem: Problem) => void;
}

export const RevisionCard: React.FC<RevisionCardProps> = ({
  problem,
  onMarkRevised,
  onSelectProblem,
}) => {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [nextDate, setNextDate] = useState(format(new Date(Date.now() + 7 * 86400000), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);

  const handleMarkDone = async (scheduleNext: boolean) => {
    setLoading(true);
    try {
      await onMarkRevised(problem.id, scheduleNext ? nextDate : undefined);
      setIsRescheduling(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => onSelectProblem(problem)}
      className="p-5 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] hover:border-[#E9B949] shadow-card transition-all flex flex-col justify-between group cursor-pointer"
    >
      <div>
        {/* Header: Badges & Revision Counter */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold text-[#718096]">
              {problem.problem_id}
            </span>
            <PlatformBadge platform={problem.platform} />
            <DifficultyBadge difficulty={problem.difficulty} />
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF6E9] dark:bg-[#2C210C] text-[#8C5D0B] dark:text-[#E9B949] border border-[#F8E0B0] dark:border-[#5C4212] flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> {problem.revision_count || 0}x
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-[#1A202C] dark:text-white group-hover:text-[#B0831E] transition-colors">
          {problem.problem_name}
        </h3>

        {/* Topic & Dates */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#718096] dark:text-[#A0AEC0] mt-2">
          <TopicBadge topic={problem.topic} />
          {problem.revision_date && (
            <span className="flex items-center gap-1 text-[#C0841D] font-semibold text-[11px]">
              <Calendar className="w-3.5 h-3.5" /> Due: {formatDate(problem.revision_date)}
            </span>
          )}
          {problem.last_revised_at && (
            <span className="flex items-center gap-1 text-[11px]">
              <Clock className="w-3.5 h-3.5" /> Last: {formatDate(problem.last_revised_at)}
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div
        className="pt-3.5 mt-3.5 border-t border-[#EFE6D5] dark:border-[#2C323F] space-y-2"
        onClick={(e) => e.stopPropagation()}
      >
        {isRescheduling ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-[#718096]">Next Date:</label>
              <input
                type="date"
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-xs text-[#1A202C] dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMarkDone(true)}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-[#E9B949] text-[#1A202C] text-xs font-bold hover:bg-[#D4A32D] transition-colors flex-1 flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Save
              </button>
              <button
                onClick={() => setIsRescheduling(false)}
                className="px-3 py-1.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] text-xs text-[#718096] hover:bg-[#FFF9EE]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleMarkDone(false)}
              disabled={loading}
              className="flex-1 py-2 px-3 rounded-xl bg-[#4F7A5A] hover:bg-[#3D6346] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Mark Revised
            </button>
            <button
              onClick={() => setIsRescheduling(true)}
              className="py-2 px-3 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] text-xs font-semibold text-[#2D3748] dark:text-[#E2E8F0] transition-colors"
            >
              Reschedule
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

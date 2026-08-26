import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  Star,
  RefreshCw,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  FileText,
  Layers,
  Sparkles,
  Zap,
  ArrowLeft,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Problem } from '../../types';
import { DifficultyBadge, PlatformBadge, TopicBadge } from '../common/Badge';
import { formatDate } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';

interface ProblemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: Problem | null;
  onEdit: (problem: Problem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onToggleRevision: (id: string, current: boolean) => void;
}

export const ProblemDetailModal: React.FC<ProblemDetailModalProps> = ({
  isOpen,
  onClose,
  problem,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleRevision,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'complexity' | 'revision'>('overview');
  const [copiedNotes, setCopiedNotes] = useState(false);
  const { success } = useToast();

  if (!problem) return null;

  const handleCopyNotes = () => {
    if (!problem.notes) return;
    navigator.clipboard.writeText(problem.notes);
    setCopiedNotes(true);
    success('Copied', 'Approach notes copied to clipboard');
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="3xl">
      <div className="space-y-5">
        {/* Top Bar with Back Button & Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EFE6D5] dark:border-[#2C323F]">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] hover:bg-[#FFF9EE] dark:hover:bg-[#1E222B] text-[#718096] hover:text-[#1A202C] transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <span className="font-mono text-xs font-bold text-[#718096] bg-[#FFF9EE] dark:bg-[#16181D] px-2.5 py-1 rounded-md border border-[#EFE6D5] dark:border-[#2C323F]">
              {problem.problem_id}
            </span>
            <PlatformBadge platform={problem.platform} />
            <DifficultyBadge difficulty={problem.difficulty} />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(problem.id, problem.favorite)}
              className={`p-2 rounded-xl border transition-all ${
                problem.favorite
                  ? 'border-[#F8E0B0] bg-[#FEF6E9] text-[#E9B949]'
                  : 'border-[#EFE6D5] dark:border-[#2C323F] text-[#A0AEC0] hover:text-[#2D3748] dark:hover:text-white'
              }`}
              title={problem.favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-4 h-4 ${problem.favorite ? 'fill-[#E9B949]' : ''}`} />
            </button>

            <button
              onClick={() => onToggleRevision(problem.id, problem.revision_needed)}
              className={`p-2 rounded-xl border transition-all ${
                problem.revision_needed
                  ? 'border-[#F8E0B0] bg-[#FEF6E9] text-[#C0841D]'
                  : 'border-[#EFE6D5] dark:border-[#2C323F] text-[#A0AEC0] hover:text-[#2D3748] dark:hover:text-white'
              }`}
              title={problem.revision_needed ? 'In revision queue' : 'Queue for revision'}
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(problem);
              }}
              className="p-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] text-[#718096] dark:text-[#E2E8F0] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] transition-colors"
              title="Edit problem"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (window.confirm(`Delete "${problem.problem_name}"?`)) {
                  onDelete(problem.id);
                  onClose();
                }
              }}
              className="p-2 rounded-xl border border-[#F5C2C4] text-[#C54A53] hover:bg-[#FDF0F0] dark:hover:bg-[#2E1416] transition-colors"
              title="Delete problem"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title & Topic */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TopicBadge topic={problem.topic} />
          </div>
          <h2 className="text-xl font-extrabold text-[#1A202C] dark:text-white">
            {problem.problem_name}
          </h2>
        </div>

        {/* 4 Tabs: Overview, Approach / Notes, Complexity, Revision */}
        <div className="flex border-b border-[#EFE6D5] dark:border-[#2C323F] text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview', icon: Layers },
            { id: 'notes', label: 'Approach / Notes', icon: FileText },
            { id: 'complexity', label: 'Complexity', icon: Zap },
            { id: 'revision', label: 'Revision Details', icon: RefreshCw },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2.5 px-4 border-b-2 font-bold flex items-center gap-1.5 transition-colors ${
                  isActive
                    ? 'border-[#E9B949] text-[#1A202C] dark:text-[#E9B949] bg-[#FFF9EE]/50 dark:bg-[#16181D]/50 rounded-t-lg'
                    : 'border-transparent text-[#718096] hover:text-[#1A202C] dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4 animate-in fade-in duration-150 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE]/50 dark:bg-[#1E222B]/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] block mb-1">
                  Solved Date
                </span>
                <span className="font-semibold text-[#1A202C] dark:text-white flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#B0831E]" />
                  {formatDate(problem.solved_date, 'EEEE, MMMM dd, yyyy')}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE]/50 dark:bg-[#1E222B]/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] block mb-1">
                  Time Invested
                </span>
                <span className="font-semibold text-[#1A202C] dark:text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#B0831E]" />
                  {problem.time_taken ? `${problem.time_taken} minutes` : 'Not recorded'}
                </span>
              </div>
            </div>

            {problem.problem_link && (
              <a
                href={problem.problem_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE] dark:bg-[#1E222B] hover:border-[#D4A32D] transition-all font-bold text-[#1A202C] dark:text-white group"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-[#B0831E] group-hover:scale-110 transition-transform" />
                  <span>Open problem statement on {problem.platform}</span>
                </span>
                <span className="text-[11px] text-[#B0831E] dark:text-[#E9B949]">External Link &rarr;</span>
              </a>
            )}
          </div>
        )}

        {/* Tab 2: Approach & Personal Notes */}
        {activeTab === 'notes' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#718096]">
                Personal solution intuition and code walkthrough
              </span>
              {problem.notes && (
                <button
                  onClick={handleCopyNotes}
                  className="p-1.5 rounded-lg border border-[#EFE6D5] dark:border-[#2C323F] text-[#718096] hover:text-[#1A202C] text-xs font-semibold flex items-center gap-1"
                >
                  {copiedNotes ? <Check className="w-3.5 h-3.5 text-[#4F7A5A]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedNotes ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            <div className="p-4 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE]/40 dark:bg-[#1E222B]/40 text-xs font-mono whitespace-pre-wrap leading-relaxed select-text text-[#2D3748] dark:text-[#CBD5E0] max-h-[350px] overflow-y-auto custom-scrollbar">
              {problem.notes?.trim() || (
                <span className="text-[#A0AEC0] italic font-sans">
                  No approach notes saved for this problem yet. Click Edit to add intuition and code snippets.
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Complexity Analysis */}
        {activeTab === 'complexity' && (
          <div className="space-y-3 animate-in fade-in duration-150 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE]/50 dark:bg-[#1E222B]/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F7A5A] block">
                    Time Complexity
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#EBF3ED] dark:bg-[#16271A] text-[#4F7A5A] font-mono font-bold text-xs border border-[#C7DFC9] dark:border-[#254A2D]">
                    {problem.time_complexity || 'Not Specified'}
                  </span>
                </div>
                <p className="text-xs text-[#718096] dark:text-[#A0AEC0] leading-relaxed">
                  Asymptotic time required for optimal algorithm execution across input sizes.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE]/50 dark:bg-[#1E222B]/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#B0831E] block">
                    Space Complexity
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#FEF6E9] dark:bg-[#2C210C] text-[#8C5D0B] dark:text-[#E9B949] font-mono font-bold text-xs border border-[#F8E0B0] dark:border-[#5C4212]">
                    {problem.space_complexity || 'Not Specified'}
                  </span>
                </div>
                <p className="text-xs text-[#718096] dark:text-[#A0AEC0] leading-relaxed">
                  Auxiliary memory allocated for data structures, recursion call stacks, or buffers.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Revision Details */}
        {activeTab === 'revision' && (
          <div className="space-y-3 animate-in fade-in duration-150 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE]/50 dark:bg-[#1E222B]/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] block mb-1">
                  Revision Count
                </span>
                <span className="text-sm font-bold text-[#B0831E] dark:text-[#E9B949]">
                  {problem.revision_count || 0} times
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE]/50 dark:bg-[#1E222B]/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] block mb-1">
                  Queue Status
                </span>
                <span className={`font-bold ${problem.revision_needed ? 'text-[#C0841D]' : 'text-[#4F7A5A]'}`}>
                  {problem.revision_needed ? 'In Revision Queue' : 'Completed'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE]/50 dark:bg-[#1E222B]/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] block mb-1">
                  Last Revised
                </span>
                <span className="font-semibold text-[#1A202C] dark:text-white">
                  {formatDate(problem.last_revised_at || problem.solved_date)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

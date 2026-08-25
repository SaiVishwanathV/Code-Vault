import React, { useState } from 'react';
import { Search, Code2, ArrowRight } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Problem } from '../../types';
import { DifficultyBadge, PlatformBadge } from '../common/Badge';

interface ShareProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  problems: Problem[];
  onShareProblem: (problem: Problem) => void;
}

export const ShareProblemModal: React.FC<ShareProblemModalProps> = ({
  isOpen,
  onClose,
  problems,
  onShareProblem,
}) => {
  const [search, setSearch] = useState('');

  const filtered = problems.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.problem_name.toLowerCase().includes(q) ||
      p.problem_id.toLowerCase().includes(q) ||
      p.topic.toLowerCase().includes(q)
    );
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title="Share Problem with Room"
      description="Select a solved problem from your catalog to embed in the discussion"
    >
      <div className="space-y-3 pt-1">
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#A0AEC0]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems to share..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-xs text-[#1A202C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
          />
        </div>

        <div className="max-h-[350px] overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
          {filtered.map((prob) => (
            <button
              key={prob.id}
              onClick={() => {
                onShareProblem(prob);
                onClose();
              }}
              className="w-full p-3 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE]/40 dark:bg-[#1E222B]/40 hover:border-[#D4A32D] text-left transition-colors flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-mono text-[10px] text-[#718096] font-bold">
                    {prob.problem_id}
                  </span>
                  <PlatformBadge platform={prob.platform} className="text-[9px] py-0 px-1.5" />
                  <DifficultyBadge difficulty={prob.difficulty} className="text-[9px] py-0 px-1.5" />
                </div>
                <div className="font-bold text-xs text-[#1A202C] dark:text-white group-hover:text-[#B0831E] transition-colors">
                  {prob.problem_name}
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-[#A0AEC0] group-hover:text-[#B0831E] transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};

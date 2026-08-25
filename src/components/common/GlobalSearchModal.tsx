import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { Problem } from '../../types';
import { DifficultyBadge, PlatformBadge } from './Badge';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  problems: Problem[];
  onSelectProblem: (problem: Problem) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  problems,
  onSelectProblem,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const filteredProblems = query.trim()
    ? problems.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.problem_name.toLowerCase().includes(q) ||
          p.problem_id.toLowerCase().includes(q) ||
          p.topic.toLowerCase().includes(q) ||
          p.platform.toLowerCase().includes(q) ||
          (p.notes && p.notes.toLowerCase().includes(q))
        );
      })
    : problems.slice(0, 5);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-[#1E222B] rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] shadow-card overflow-hidden z-10"
          >
            {/* Search Input Box */}
            <div className="flex items-center px-4 py-3.5 border-b border-[#EFE6D5] dark:border-[#2C323F]">
              <Search className="w-5 h-5 text-[#A0AEC0] mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by problem name, ID (e.g. LC-1), topic, platform, or notes..."
                className="w-full bg-transparent text-[#1A202C] dark:text-white placeholder-[#A0AEC0] text-xs focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 text-[#A0AEC0] hover:text-[#1A202C] mr-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-medium text-[#718096] bg-[#FFF9EE] dark:bg-[#16181D] border border-[#EFE6D5] dark:border-[#2C323F] rounded-md">
                ESC
              </kbd>
            </div>

            {/* Search Results */}
            <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#A0AEC0]">
                {query.trim() ? `Found ${filteredProblems.length} results` : 'Recent Problems'}
              </div>

              {filteredProblems.length === 0 ? (
                <div className="py-12 text-center text-[#718096] text-xs">
                  No problems found matching &quot;<span className="text-[#B0831E]">{query}</span>&quot;
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredProblems.map((prob) => (
                    <button
                      key={prob.id}
                      onClick={() => {
                        onSelectProblem(prob);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#FFF9EE] dark:bg-[#16181D] border border-[#EFE6D5] dark:border-[#2C323F] text-[#B0831E] dark:text-[#E9B949] flex items-center justify-center font-mono text-xs font-bold shrink-0">
                          {prob.problem_id.split('-')[0] || 'LC'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-[#718096]">{prob.problem_id}</span>
                            <span className="text-xs font-bold text-[#1A202C] dark:text-white truncate group-hover:text-[#B0831E] transition-colors">
                              {prob.problem_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <PlatformBadge platform={prob.platform} className="text-[9px] py-0 px-1.5" />
                            <DifficultyBadge difficulty={prob.difficulty} className="text-[9px] py-0 px-1.5" />
                            <span className="text-[10px] text-[#718096]">#{prob.topic}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center text-[#718096] group-hover:text-[#B0831E] transition-colors pl-2">
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer helper */}
            <div className="px-4 py-2.5 bg-[#FFF9EE]/60 dark:bg-[#16181D]/60 border-t border-[#EFE6D5] dark:border-[#2C323F] text-[11px] text-[#718096] flex items-center justify-between">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#1E222B] border border-[#EFE6D5] dark:border-[#2C323F] text-[#2D3748] dark:text-white font-mono text-[10px]">ENTER</kbd> to select</span>
              <span>Spotlight Search</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

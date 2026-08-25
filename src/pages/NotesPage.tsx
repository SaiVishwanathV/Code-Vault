import React, { useState } from 'react';
import { FileText, Search, Sparkles } from 'lucide-react';
import { Problem } from '../types';
import { MarkdownEditor } from '../components/notes/MarkdownEditor';
import { DifficultyBadge, PlatformBadge, TopicBadge } from '../components/common/Badge';

interface NotesPageProps {
  problems: Problem[];
  onSaveNotes: (problemId: string, notes: string) => Promise<void>;
}

export const NotesPage: React.FC<NotesPageProps> = ({ problems, onSaveNotes }) => {
  const [selectedProblemId, setSelectedProblemId] = useState<string>(
    problems[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');

  const selectedProblem =
    problems.find((p) => p.id === selectedProblemId) || problems[0];

  const filteredList = problems.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.problem_name.toLowerCase().includes(q) ||
      p.problem_id.toLowerCase().includes(q) ||
      p.topic.toLowerCase().includes(q)
    );
  });

  const handleSaveNotes = async (newNotes: string) => {
    if (selectedProblem) {
      await onSaveNotes(selectedProblem.id, newNotes);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1A202C] dark:text-white tracking-tight flex items-center gap-2.5">
          <FileText className="w-7 h-7 text-[#E9B949]" />
          DSA Problem Notes & Code Walkthroughs
        </h1>
        <p className="text-xs sm:text-sm text-[#718096] dark:text-[#A0AEC0] mt-1">
          Maintain deep markdown explanations, time & space complexities, edge cases, and code templates for each solved challenge.
        </p>
      </div>

      {problems.length === 0 ? (
        <div className="p-12 text-center rounded-[18px] border border-dashed border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE]/50">
          <p className="text-xs text-[#718096]">Add problems to start taking notes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Problem Selector List */}
          <div className="lg:col-span-4 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#A0AEC0]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problem notes..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-xs text-[#1A202C] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
              />
            </div>

            <div className="max-h-[600px] overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
              {filteredList.map((p) => {
                const isSelected = p.id === selectedProblem?.id;
                const hasNotes = Boolean(p.notes?.trim());

                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProblemId(p.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-[#E9B949] bg-[#FFF9EE] dark:bg-[#252B37] shadow-sm'
                        : 'border-transparent hover:bg-[#FFF9EE]/50 dark:hover:bg-[#1E222B]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[11px] font-mono text-[#718096] font-semibold">
                        {p.problem_id}
                      </span>
                      <div className="flex items-center gap-1">
                        {hasNotes && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FEF6E9] text-[#8C5D0B] font-bold">
                            Notes
                          </span>
                        )}
                        <DifficultyBadge difficulty={p.difficulty} className="text-[9px] py-0 px-1.5" />
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-[#1A202C] dark:text-white truncate">
                      {p.problem_name}
                    </h4>

                    <span className="text-[10px] text-[#718096] block mt-1">
                      #{p.topic} &bull; {p.platform}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Markdown Editor */}
          <div className="lg:col-span-8 space-y-3">
            {selectedProblem ? (
              <>
                <div className="p-4 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] flex flex-wrap items-center justify-between gap-2 shadow-card">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-[#718096]">
                        {selectedProblem.problem_id}
                      </span>
                      <PlatformBadge platform={selectedProblem.platform} />
                      <DifficultyBadge difficulty={selectedProblem.difficulty} />
                      <TopicBadge topic={selectedProblem.topic} />
                    </div>
                    <h3 className="text-base font-bold text-[#1A202C] dark:text-white">
                      {selectedProblem.problem_name}
                    </h3>
                  </div>
                </div>

                <MarkdownEditor
                  key={selectedProblem.id}
                  initialValue={selectedProblem.notes || ''}
                  onSave={handleSaveNotes}
                  title={selectedProblem.problem_name}
                />
              </>
            ) : (
              <div className="p-12 text-center text-xs text-[#718096]">
                Select a problem to view and edit notes.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

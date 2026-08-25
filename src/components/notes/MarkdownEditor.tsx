import React, { useState } from 'react';
import { Bold, Italic, Code, Heading, List, Eye, Edit3, Save, Copy, Check, Columns } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface MarkdownEditorProps {
  initialValue: string;
  onSave: (value: string) => Promise<void>;
  title?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialValue,
  onSave,
  title,
}) => {
  const [content, setContent] = useState(initialValue);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  const handleInsert = (before: string, after: string = '') => {
    const textarea = document.getElementById('notes-markdown-input') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);

    const replacement = before + (selected || 'text') + after;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (selected ? selected.length : 4));
    }, 50);
  };

  const insertTemplate = () => {
    const template = `### Problem Intuition
Explain the core intuition and approach here.

### Algorithm Steps
1. Initialize data structures and tracking variables.
2. Traverse input elements with optimal two pointers / sliding window / recursion.
3. Handle boundary conditions and compute final result.

### Code Implementation
\`\`\`cpp
// Optimal solution snippet
int solve(vector<int>& nums) {
    int ans = 0;
    return ans;
}
\`\`\`

### Complexity Analysis
- **Time Complexity:** $O(N)$
- **Space Complexity:** $O(1)$`;

    setContent((prev) => (prev ? prev + '\n\n' + template : template));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(content);
      success('Notes Saved', 'Your markdown notes have been updated successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    success('Copied', 'Markdown notes copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card overflow-hidden flex flex-col">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-b border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE]/70 dark:bg-[#16181D]/60">
        {/* Formatting buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleInsert('**', '**')}
            className="p-1.5 rounded-lg text-[#718096] hover:text-[#1A202C] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] transition-colors"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleInsert('*', '*')}
            className="p-1.5 rounded-lg text-[#718096] hover:text-[#1A202C] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] transition-colors"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleInsert('### ')}
            className="p-1.5 rounded-lg text-[#718096] hover:text-[#1A202C] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] transition-colors"
            title="Heading"
          >
            <Heading className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleInsert('\n```cpp\n', '\n```\n')}
            className="p-1.5 rounded-lg text-[#718096] hover:text-[#1A202C] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] transition-colors"
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleInsert('- ')}
            className="p-1.5 rounded-lg text-[#718096] hover:text-[#1A202C] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] transition-colors"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={insertTemplate}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#8C5D0B] dark:text-[#E9B949] bg-[#FEF6E9] dark:bg-[#2C210C] border border-[#F8E0B0] dark:border-[#5C4212] hover:bg-[#FDE68A] transition-colors ml-1"
          >
            + DSA Template
          </button>
        </div>

        {/* View mode toggle & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] p-0.5 bg-[#FFF9EE] dark:bg-[#16181D]">
            <button
              onClick={() => setViewMode('edit')}
              className={`p-1 rounded-lg text-xs transition-colors ${
                viewMode === 'edit'
                  ? 'bg-white dark:bg-[#1E222B] text-[#1A202C] dark:text-[#E9B949] font-bold shadow-sm'
                  : 'text-[#718096]'
              }`}
              title="Edit only"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`p-1 rounded-lg text-xs transition-colors ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-[#1E222B] text-[#1A202C] dark:text-[#E9B949] font-bold shadow-sm'
                  : 'text-[#718096]'
              }`}
              title="Split view"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`p-1 rounded-lg text-xs transition-colors ${
                viewMode === 'preview'
                  ? 'bg-white dark:bg-[#1E222B] text-[#1A202C] dark:text-[#E9B949] font-bold shadow-sm'
                  : 'text-[#718096]'
              }`}
              title="Preview only"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg border border-[#EFE6D5] dark:border-[#2C323F] text-[#718096] hover:text-[#1A202C] hover:bg-[#FFF9EE] dark:hover:bg-[#16181D] transition-colors"
            title="Copy markdown"
          >
            {copied ? <Check className="w-4 h-4 text-[#4F7A5A]" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3.5 py-1.5 rounded-xl bg-[#E9B949] hover:bg-[#D4A32D] text-[#1A202C] text-xs font-bold shadow-sm transition-all flex items-center gap-1 active:scale-[0.98]"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[350px] divide-y md:divide-y-0 md:divide-x divide-[#EFE6D5] dark:divide-[#2C323F]">
        {/* Left Input Pane */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`p-4 ${viewMode === 'edit' ? 'col-span-full' : ''}`}>
            <textarea
              id="notes-markdown-input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your DSA notes, approach intuition, code walkthrough, and complexity analysis..."
              className="w-full h-full min-h-[300px] bg-transparent text-[#1A202C] dark:text-white text-xs font-mono focus:outline-none resize-none leading-relaxed"
            />
          </div>
        )}

        {/* Right Preview Pane */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div
            className={`p-4 overflow-y-auto bg-[#FFF9EE]/30 dark:bg-[#16181D]/30 custom-scrollbar ${
              viewMode === 'preview' ? 'col-span-full' : ''
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#A0AEC0] mb-2">
              Live Rendered Notes Preview
            </div>
            <div className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-[#2D3748] dark:text-[#CBD5E0]">
              {content || (
                <span className="text-[#A0AEC0] italic font-sans">No notes written yet.</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

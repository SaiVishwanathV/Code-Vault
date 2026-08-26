import React, { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Eye,
  Edit3,
  Save,
  Copy,
  Check,
  Columns,
  Sparkles,
  Terminal,
} from 'lucide-react';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { success } = useToast();

  const handleFormat = (before: string, after: string = '', defaultText: string = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => prev + before + defaultText + after);
      return;
    }

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const selected = content.substring(start, end);
    const textToInsert = selected || defaultText;

    const replacement = before + textToInsert + after;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    // Re-focus and set selection
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos + textToInsert.length);
    }, 20);
  };

  const handleLinePrefix = (prefix: string, defaultText: string = 'List item') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => (prev ? `${prev}\n${prefix}${defaultText}` : `${prefix}${defaultText}`));
      return;
    }

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const selected = content.substring(start, end);

    if (selected) {
      // Apply prefix to each line in selection
      const lines = selected.split('\n');
      const prefixed = lines.map((l) => `${prefix}${l}`).join('\n');
      const newContent = content.substring(0, start) + prefixed + content.substring(end);
      setContent(newContent);
    } else {
      // Find beginning of current line
      const beforeCursor = content.substring(0, start);
      const lastNewline = beforeCursor.lastIndexOf('\n');
      const insertPos = lastNewline === -1 ? 0 : lastNewline + 1;

      const newContent = content.substring(0, insertPos) + prefix + content.substring(insertPos);
      setContent(newContent);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, start + prefix.length);
      }, 20);
    }
  };

  const insertTemplate = () => {
    const template = `### 💡 Core Intuition
Describe the main intuition behind this solution here. Why does this approach work optimally?

### ⚙️ Algorithm Steps
1. **Initialize State:** Define data structures, pointers, or lookup tables.
2. **Core Loop:** Iterate over elements using two pointers / sliding window / monotonic stack.
3. **Boundary Cases:** Validate empty inputs, single element arrays, and integer overflows.

### 💻 Code Implementation (C++ / Java / Python)
\`\`\`cpp
// Optimal O(N) Solution
int solve(vector<int>& nums) {
    int ans = 0;
    int left = 0, right = nums.size() - 1;
    while (left < right) {
        // Algorithm logic
        left++;
    }
    return ans;
}
\`\`\`

### 📊 Complexity Analysis
- **Time Complexity:** $O(N)$ — Single linear pass through the array.
- **Space Complexity:** $O(1)$ — In-place computation with constant extra memory.`;

    setContent((prev) => (prev.trim() ? `${prev}\n\n${template}` : template));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(content);
      success('Notes Saved', 'Your markdown notes have been updated in Supabase.');
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

  // Basic Markdown Parser for Preview
  const renderMarkdown = (text: string) => {
    if (!text.trim()) {
      return (
        <div className="text-center py-12 text-xs text-[#A0AEC0] italic font-sans">
          No notes written yet. Use the formatting toolbar above or add a DSA template.
        </div>
      );
    }

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeBuffer: string[] = [];

    lines.forEach((line, idx) => {
      // Code Block Start/End
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // Closing code block
          elements.push(
            <div key={`code-${idx}`} className="my-3 rounded-xl overflow-hidden border border-[#EFE6D5] dark:border-[#2C323F] bg-[#16181D] text-[#E2E8F0] shadow-sm">
              <div className="px-3 py-1.5 bg-[#1E222B] text-[10px] font-mono text-[#E9B949] flex items-center justify-between border-b border-[#2C323F]">
                <span>{codeLanguage || 'code'}</span>
                <span className="text-[#718096]">snippet</span>
              </div>
              <pre className="p-3.5 text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed text-[#A0AEC0]">
                <code>{codeBuffer.join('\n')}</code>
              </pre>
            </div>
          );
          inCodeBlock = false;
          codeBuffer = [];
          codeLanguage = '';
        } else {
          // Opening code block
          inCodeBlock = true;
          codeLanguage = line.trim().replace('```', '') || 'cpp';
          codeBuffer = [];
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Headings
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={idx} className="text-xl font-black text-[#1A202C] dark:text-white mt-4 mb-2 pb-1 border-b border-[#EFE6D5] dark:border-[#2C323F]">
            {parseInline(line.substring(2))}
          </h1>
        );
        return;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={idx} className="text-lg font-extrabold text-[#1A202C] dark:text-white mt-3.5 mb-1.5">
            {parseInline(line.substring(3))}
          </h2>
        );
        return;
      }
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={idx} className="text-sm font-bold text-[#B0831E] dark:text-[#E9B949] mt-3 mb-1">
            {parseInline(line.substring(4))}
          </h3>
        );
        return;
      }

      // Blockquotes
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={idx} className="pl-3 py-1 my-2 border-l-4 border-[#E9B949] bg-[#FFF9EE]/40 dark:bg-[#1E222B]/60 text-xs italic text-[#718096] dark:text-[#A0AEC0] rounded-r-lg">
            {parseInline(line.substring(2))}
          </blockquote>
        );
        return;
      }

      // Bullet List
      if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <div key={idx} className="flex items-start gap-2 text-xs text-[#2D3748] dark:text-[#CBD5E0] my-0.5 pl-2">
            <span className="text-[#E9B949] font-bold">&bull;</span>
            <span>{parseInline(line.substring(2))}</span>
          </div>
        );
        return;
      }

      // Numbered List
      const numMatch = line.match(/^(\d+)\.\s(.*)$/);
      if (numMatch) {
        elements.push(
          <div key={idx} className="flex items-start gap-2 text-xs text-[#2D3748] dark:text-[#CBD5E0] my-0.5 pl-2">
            <span className="font-bold text-[#B0831E] dark:text-[#E9B949] font-mono text-[11px] shrink-0">{numMatch[1]}.</span>
            <span>{parseInline(numMatch[2])}</span>
          </div>
        );
        return;
      }

      // Empty Line
      if (!line.trim()) {
        elements.push(<div key={idx} className="h-2" />);
        return;
      }

      // Regular Paragraph
      elements.push(
        <p key={idx} className="text-xs text-[#2D3748] dark:text-[#CBD5E0] leading-relaxed my-1">
          {parseInline(line)}
        </p>
      );
    });

    return elements;
  };

  // Helper to parse bold, italic, underline, inline code
  const parseInline = (text: string): React.ReactNode => {
    // Replace inline formatting
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|<u>.*?<\/u>|`.*?`)/g);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-[#1A202C] dark:text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-[#8C5D0B] dark:text-[#E9B949]">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('<u>') && part.endsWith('</u>')) {
        return <span key={i} className="underline underline-offset-2">{part.slice(3, -4)}</span>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-[#FFF9EE] dark:bg-[#16181D] border border-[#EFE6D5] dark:border-[#2C323F] font-mono text-[11px] text-[#B0831E] dark:text-[#E9B949]">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card overflow-hidden flex flex-col">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-b border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE]/70 dark:bg-[#16181D]/60">
        {/* Formatting buttons */}
        <div className="flex flex-wrap items-center gap-1">
          {/* Bold */}
          <button
            type="button"
            onClick={() => handleFormat('**', '**', 'bold text')}
            className="p-1.5 rounded-lg text-[#718096] hover:text-[#1A202C] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] transition-colors"
            title="Bold (**text**)"
          >
            <Bold className="w-4 h-4" />
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => handleFormat('*', '*', 'italic text')}
            className="p-1.5 rounded-lg text-[#718096] hover:text-[#1A202C] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] transition-colors"
            title="Italic (*text*)"
          >
            <Italic className="w-4 h-4" />
          </button>

          {/* Underline */}
          <button
            type="button"
            onClick={() => handleFormat('<u>', '</u>', 'underlined text')}
            className="p-1.5 rounded-lg text-[#718096] hover:text-[#1A202C] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] transition-colors"
            title="Underline (<u>text</u>)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-[#EFE6D5] dark:bg-[#2C323F] mx-1" />

          {/* H1 */}
          <button
            type="button"
            onClick={() => handleLinePrefix('# ')}
            className="p-1.5 rounded-lg text-[#718096] hover:text-[#1A202C] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] transition-colors"
            title="Heading 1 (# Heading)"
          >
            <Heading1 className="w-4 h-4" />
          </button>

          {/* H2 */}
          <button
            type="button"
            onClick={() => handleLinePrefix('## ')}
            className="p-1.5 rounded-lg text-[#718096] hover:text-[#1A202C] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] transition-colors"
            title="Heading 2 (## Heading)"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          {/* H3 */}
          <button
            type="button"
            onClick={() => handleLinePrefix('### ')}
            className="p-1.5 rounded-lg text-[#718096] hover:text-[#1A202C] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] transition-colors"
            title="Heading 3 (### Heading)"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-[#EFE6D5] dark:bg-[#2C323F] mx-1" />

          {/* Bullet List */}
          <button
            type="button"
            onClick={() => handleLinePrefix('- ')}
            className="p-1.5 rounded-lg text-[#718096] hover:text-[#1A202C] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] transition-colors"
            title="Bullet List (- item)"
          >
            <List className="w-4 h-4" />
          </button>

          {/* Numbered List */}
          <button
            type="button"
            onClick={() => handleLinePrefix('1. ')}
            className="p-1.5 rounded-lg text-[#718096] hover:text-[#1A202C] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] transition-colors"
            title="Numbered List (1. item)"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          {/* Quote */}
          <button
            type="button"
            onClick={() => handleLinePrefix('> ')}
            className="p-1.5 rounded-lg text-[#718096] hover:text-[#1A202C] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] transition-colors"
            title="Blockquote (> quote)"
          >
            <Quote className="w-4 h-4" />
          </button>

          {/* Code Block */}
          <button
            type="button"
            onClick={() => handleFormat('\n```cpp\n', '\n```\n', '// Solution Code')}
            className="p-1.5 rounded-lg text-[#718096] hover:text-[#1A202C] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] transition-colors"
            title="Code Block (```cpp)"
          >
            <Code className="w-4 h-4" />
          </button>

          {/* DSA Template */}
          <button
            type="button"
            onClick={insertTemplate}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#8C5D0B] dark:text-[#E9B949] bg-[#FEF6E9] dark:bg-[#2C210C] border border-[#F8E0B0] dark:border-[#5C4212] hover:bg-[#FDE68A] transition-colors ml-1 flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>+ DSA Template</span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[380px] divide-y md:divide-y-0 md:divide-x divide-[#EFE6D5] dark:divide-[#2C323F]">
        {/* Left Input Pane */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`p-4 ${viewMode === 'edit' ? 'col-span-full' : ''}`}>
            <textarea
              ref={textareaRef}
              id="notes-markdown-input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your DSA notes, approach intuition, code walkthrough, and complexity analysis in markdown..."
              className="w-full h-full min-h-[350px] bg-transparent text-[#1A202C] dark:text-white text-xs font-mono focus:outline-none resize-none leading-relaxed"
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
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#A0AEC0] mb-2 flex items-center gap-1">
              <Terminal className="w-3 h-3 text-[#B0831E]" />
              <span>Live Formatted Preview</span>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              {renderMarkdown(content)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

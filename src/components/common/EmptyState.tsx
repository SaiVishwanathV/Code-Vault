import React from 'react';
import { Code2, Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-[18px] border border-dashed border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE]/50 dark:bg-[#1E222B]/50 my-4">
      <div className="w-13 h-13 rounded-2xl bg-[#FEF6E9] dark:bg-[#2C210C] text-[#B0831E] dark:text-[#E9B949] flex items-center justify-center mb-3.5 border border-[#F8E0B0] dark:border-[#5C4212] p-3 shadow-subtle">
        {icon || <Code2 className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-bold text-[#1A202C] dark:text-white mb-1">{title}</h3>
      <p className="text-xs text-[#718096] dark:text-[#A0AEC0] max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E9B949] hover:bg-[#D4A32D] text-[#1A202C] text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
};

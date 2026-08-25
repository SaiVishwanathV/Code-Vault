import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800/60 ${className}`}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
      <Skeleton className="w-16 h-8" />
      <Skeleton className="w-32 h-3" />
    </div>
  );
};

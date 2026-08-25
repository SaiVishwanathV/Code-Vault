import React from 'react';
import { Difficulty, Platform } from '../../types';
import { DIFFICULTY_COLORS, PLATFORM_COLORS } from '../../lib/constants';

export const DifficultyBadge: React.FC<{ difficulty: Difficulty; className?: string }> = ({
  difficulty,
  className = '',
}) => {
  const style = DIFFICULTY_COLORS[difficulty] || DIFFICULTY_COLORS.Medium;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.badge} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${style.bg}`} />
      {difficulty}
    </span>
  );
};

export const PlatformBadge: React.FC<{ platform: Platform; className?: string }> = ({
  platform,
  className = '',
}) => {
  const style = PLATFORM_COLORS[platform] || PLATFORM_COLORS.Other;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${style.badge} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${style.dot}`} />
      {platform}
    </span>
  );
};

export const TopicBadge: React.FC<{ topic: string; className?: string }> = ({
  topic,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/50 ${className}`}
    >
      #{topic}
    </span>
  );
};

import React, { useState } from 'react';
import { Trophy, Sparkles, Flame, Zap, Award, Layers } from 'lucide-react';
import { Achievement, Problem, Streak } from '../types';
import { achievementService } from '../services/achievementService';
import { BadgeCard } from '../components/achievements/BadgeCard';
import { triggerConfetti } from '../lib/utils';

interface AchievementsPageProps {
  problems: Problem[];
  streak: Streak;
}

export const AchievementsPage: React.FC<AchievementsPageProps> = ({ problems, streak }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const achievements = achievementService.evaluateAchievements(problems, streak);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const percent = Math.round((unlockedCount / (totalCount || 1)) * 100);

  const filteredAchievements = achievements.filter((a) => {
    if (activeCategory === 'all') return true;
    return a.category === activeCategory;
  });

  const handleCelebrate = () => {
    triggerConfetti();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner with Unlock Progress */}
      <div className="p-6 sm:p-8 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-gradient-to-r from-[#FFF9EE] via-[#FFFDF8] to-[#FFF9EE] dark:from-[#1E222B] dark:via-[#16181D] dark:to-[#1E222B] shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF6E9] dark:bg-[#2C210C] text-[#8C5D0B] dark:text-[#E9B949] text-xs font-bold border border-[#F8E0B0] dark:border-[#5C4212]">
              <Trophy className="w-3.5 h-3.5" /> Gamified DSA Milestones
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1A202C] dark:text-white tracking-tight">
              Earn Badges & Level Up
            </h1>
            <p className="text-xs sm:text-sm text-[#718096] dark:text-[#A0AEC0] max-w-lg leading-relaxed">
              Unlock milestones as you conquer DSA topics, maintain unbroken daily streaks, and hit problem-solving milestones.
            </p>
          </div>

          {/* Progress gauge card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1E222B] border border-[#EFE6D5] dark:border-[#2C323F] shadow-card min-w-[240px] text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#718096] block mb-1">
              Achievement Progress
            </span>
            <div className="text-3xl font-black text-[#E9B949] mb-1">
              {unlockedCount} / {totalCount}
            </div>
            <span className="text-[11px] text-[#718096] font-semibold block mb-2">
              {percent}% Badges Unlocked
            </span>

            <div className="w-full h-1.5 bg-[#EFE6D5] dark:bg-[#2C323F] rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-[#E9B949] rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>

            <button
              onClick={handleCelebrate}
              className="w-full py-2 px-3 rounded-xl bg-[#E9B949] hover:bg-[#D4A32D] text-[#1A202C] text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5" /> Celebrate Progress
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: 'All Badges' },
          { id: 'consistency', label: 'Consistency & Streaks' },
          { id: 'count', label: 'Problems Solved' },
          { id: 'difficulty', label: 'Difficulty Tiers' },
          { id: 'special', label: 'Special Milestones' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeCategory === tab.id
                ? 'bg-[#E9B949] text-[#1A202C] font-bold shadow-sm'
                : 'bg-white dark:bg-[#1E222B] border border-[#EFE6D5] dark:border-[#2C323F] text-[#718096] hover:text-[#1A202C]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredAchievements.map((achievement) => (
          <BadgeCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
};

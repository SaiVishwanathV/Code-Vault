import React from 'react';
import { Sparkles, Trophy, Flame, Crown, CheckCircle2, Zap, Award, Rocket, ShieldAlert, Infinity, Lock } from 'lucide-react';
import { Achievement } from '../../types';
import { triggerConfetti } from '../../lib/utils';

interface BadgeCardProps {
  achievement: Achievement;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ achievement }) => {
  const getIcon = (iconName: string) => {
    const props = { className: 'w-6 h-6' };
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles {...props} />;
      case 'CheckCircle2':
        return <CheckCircle2 {...props} />;
      case 'Zap':
        return <Zap {...props} />;
      case 'Flame':
        return <Flame {...props} />;
      case 'Award':
        return <Award {...props} />;
      case 'Trophy':
        return <Trophy {...props} />;
      case 'Crown':
        return <Crown {...props} />;
      case 'ShieldAlert':
        return <ShieldAlert {...props} />;
      case 'Rocket':
        return <Rocket {...props} />;
      case 'Infinity':
        return <Infinity {...props} />;
      default:
        return <Award {...props} />;
    }
  };

  const percent = Math.min(Math.round((achievement.progress / achievement.target) * 100), 100);

  const handleClick = () => {
    if (achievement.unlocked) {
      triggerConfetti();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-5 rounded-[18px] border transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer group ${
        achievement.unlocked
          ? 'bg-white dark:bg-[#1E222B] border-[#E9B949] shadow-card hover:border-[#D4A32D]'
          : 'bg-[#FFF9EE]/50 dark:bg-[#1E222B]/50 border-[#EFE6D5] dark:border-[#2C323F] opacity-75 hover:opacity-100'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
              achievement.unlocked
                ? 'bg-[#E9B949] text-[#1A202C] shadow-sm font-bold'
                : 'bg-[#EFE6D5] dark:bg-[#2C323F] text-[#A0AEC0]'
            }`}
          >
            {achievement.unlocked ? getIcon(achievement.icon) : <Lock className="w-5 h-5" />}
          </div>

          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
              achievement.unlocked
                ? 'bg-[#EBF3ED] text-[#4F7A5A] border-[#C7DFC9]'
                : 'bg-[#FFFDF8] dark:bg-[#16181D] text-[#718096] border-[#EFE6D5] dark:border-[#2C323F]'
            }`}
          >
            {achievement.unlocked ? 'Unlocked' : 'In Progress'}
          </span>
        </div>

        <h4 className="text-sm font-extrabold text-[#1A202C] dark:text-white tracking-tight">
          {achievement.badge_name}
        </h4>
        <p className="text-xs text-[#718096] dark:text-[#A0AEC0] mt-1 leading-relaxed">
          {achievement.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-[#EFE6D5] dark:border-[#2C323F]">
        <div className="flex items-center justify-between text-[11px] mb-1.5 font-semibold">
          <span className="text-[#718096]">Progress</span>
          <span className={achievement.unlocked ? 'text-[#B0831E] dark:text-[#E9B949]' : 'text-[#718096]'}>
            {achievement.progress} / {achievement.target} ({percent}%)
          </span>
        </div>

        <div className="w-full h-1.5 bg-[#EFE6D5] dark:bg-[#2C323F] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              achievement.unlocked ? 'bg-[#E9B949]' : 'bg-[#C0841D]'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

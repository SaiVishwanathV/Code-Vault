import React from 'react';
import { BarChart3, Clock, Flame, Zap, CheckCircle2, Trophy } from 'lucide-react';
import { Problem, Streak } from '../types';
import { DifficultyDonutChart } from '../components/analytics/DifficultyDonutChart';
import { PlatformBarChart } from '../components/analytics/PlatformBarChart';
import { TopicDistributionChart } from '../components/analytics/TopicDistributionChart';
import { MonthlyTrendChart } from '../components/analytics/MonthlyTrendChart';
import { StatCard } from '../components/dashboard/StatCard';

interface AnalyticsPageProps {
  problems: Problem[];
  streak: Streak;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ problems, streak }) => {
  const totalSolved = problems.length || 1;
  const easyCount = problems.filter((p) => p.difficulty === 'Easy').length;
  const medCount = problems.filter((p) => p.difficulty === 'Medium').length;
  const hardCount = problems.filter((p) => p.difficulty === 'Hard').length;

  const totalMinutes = problems.reduce((acc, p) => acc + (p.time_taken || 15), 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const avgMinutes = Math.round(totalMinutes / totalSolved);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Performance & Interview Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Deep data-driven insights into your problem-solving speeds, platform distributions, and topic mastery.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Solved"
          value={problems.length}
          subtitle="Conquered challenges"
          icon={<Trophy className="w-5 h-5" />}
          accentColor="indigo"
        />
        <StatCard
          title="Time Invested"
          value={`${totalHours} hrs`}
          subtitle="Dedicated practice"
          icon={<Clock className="w-5 h-5" />}
          accentColor="emerald"
        />
        <StatCard
          title="Avg Speed"
          value={`${avgMinutes} min`}
          subtitle="Per problem average"
          icon={<Zap className="w-5 h-5" />}
          accentColor="amber"
        />
        <StatCard
          title="Max Streak"
          value={`${streak.longest_streak} days`}
          subtitle="Discipline high-score"
          icon={<Flame className="w-5 h-5" />}
          accentColor="rose"
        />
      </div>

      {/* 2x2 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DifficultyDonutChart problems={problems} />
        <PlatformBarChart problems={problems} />
        <TopicDistributionChart problems={problems} />
        <MonthlyTrendChart problems={problems} />
      </div>
    </div>
  );
};

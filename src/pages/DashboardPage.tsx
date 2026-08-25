import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Problem, Streak } from '../types';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { AnnouncementBanner } from '../components/dashboard/AnnouncementBanner';
import { ProgressOverview } from '../components/dashboard/ProgressOverview';
import { WeeklyProgressLineChart } from '../components/dashboard/WeeklyProgressLineChart';
import { DifficultyDonut } from '../components/dashboard/DifficultyDonut';
import { TopicMasteryList } from '../components/dashboard/TopicMasteryList';
import { PlatformBreakdownChart } from '../components/dashboard/PlatformBreakdownChart';
import { HeatmapCalendar } from '../components/history/HeatmapCalendar';
import { ContinueLearningSection } from '../components/dashboard/ContinueLearningSection';

interface DashboardPageProps {
  problems: Problem[];
  streak: Streak;
  onOpenAddProblem: () => void;
  onSelectProblem: (problem: Problem) => void;
  onUpdateGoal: (newGoal: number) => Promise<void>;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  problems,
  streak,
  onOpenAddProblem,
  onSelectProblem,
  onUpdateGoal,
}) => {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      {/* 1. Welcome Header */}
      <DashboardHeader fullName={profile?.full_name} streak={streak} />

      {/* 2. Platform Announcement Banner */}
      <AnnouncementBanner />

      {/* 3. Progress Overview (4 Cards) */}
      <ProgressOverview problems={problems} streak={streak} />

      {/* 4. Charts Row 1: Weekly Line Chart + Difficulty Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <WeeklyProgressLineChart problems={problems} />
        </div>
        <div>
          <DifficultyDonut problems={problems} />
        </div>
      </div>

      {/* 5. Charts Row 2: Topic Mastery List + Platform Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TopicMasteryList problems={problems} />
        <PlatformBreakdownChart problems={problems} />
      </div>

      {/* 6. GitHub-Style 365-Day Activity Heatmap */}
      <HeatmapCalendar problems={problems} onSelectProblem={onSelectProblem} />

      {/* 7. Continue Learning Section (Recently Solved & Revision Reminders) */}
      <ContinueLearningSection problems={problems} onSelectProblem={onSelectProblem} />
    </div>
  );
};

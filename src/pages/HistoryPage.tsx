import React, { useState } from 'react';
import { Flame, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Problem } from '../types';
import { HeatmapCalendar } from '../components/history/HeatmapCalendar';
import { TimelineView } from '../components/history/TimelineView';
import { MonthlyCalendarView } from '../components/history/MonthlyCalendarView';

interface HistoryPageProps {
  problems: Problem[];
  onSelectProblem: (problem: Problem) => void;
  onOpenAddProblem?: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  problems,
  onSelectProblem,
  onOpenAddProblem,
}) => {
  const [activeTab, setActiveTab] = useState<'heatmap' | 'timeline' | 'calendar'>('heatmap');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A202C] dark:text-white tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="w-7 h-7 text-[#E9B949]" />
            Coding History & Activity
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] dark:text-[#A0AEC0] mt-1">
            Track daily contributions, monthly consistency, and chronological problem progression.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] p-1 self-start sm:self-auto shadow-card">
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'heatmap'
                ? 'bg-[#E9B949] text-[#1A202C] font-bold shadow-sm'
                : 'text-[#718096] hover:text-[#1A202C] dark:hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Heatmap
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'timeline'
                ? 'bg-[#E9B949] text-[#1A202C] font-bold shadow-sm'
                : 'text-[#718096] hover:text-[#1A202C] dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Timeline
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'calendar'
                ? 'bg-[#E9B949] text-[#1A202C] font-bold shadow-sm'
                : 'text-[#718096] hover:text-[#1A202C] dark:hover:text-white'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" /> Calendar Grid
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'heatmap' && (
        <div className="space-y-6">
          <HeatmapCalendar problems={problems} onSelectProblem={onSelectProblem} />
          <div>
            <h3 className="text-sm font-bold text-[#1A202C] dark:text-white mb-4">
              Chronological Activity Feed
            </h3>
            <TimelineView problems={problems.slice(0, 15)} onSelectProblem={onSelectProblem} />
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <TimelineView problems={problems} onSelectProblem={onSelectProblem} />
      )}

      {activeTab === 'calendar' && (
        <MonthlyCalendarView
          problems={problems}
          onSelectProblem={onSelectProblem}
          onOpenAddProblem={onOpenAddProblem}
        />
      )}
    </div>
  );
};

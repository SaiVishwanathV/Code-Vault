import React, { useState, useMemo } from 'react';
import {
  format,
  parseISO,
  subDays,
  startOfWeek,
  addDays,
  getMonth,
  isSameDay,
  isAfter,
  startOfDay,
  eachDayOfInterval,
} from 'date-fns';
import { Problem } from '../../types';
import { Flame, Calendar as CalendarIcon, Info, Trophy, Zap, Target, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { DifficultyBadge, PlatformBadge } from '../common/Badge';

interface HeatmapCalendarProps {
  problems: Problem[];
  onSelectProblem?: (problem: Problem) => void;
}

export const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({
  problems,
  onSelectProblem,
}) => {
  const [selectedDayData, setSelectedDayData] = useState<{
    date: string;
    count: number;
    problems: Problem[];
  } | null>(null);

  const today = startOfDay(new Date());

  // Generate 52 weeks (364 days ending today)
  const heatmapDays = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, 363);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const dateCountMap: Record<string, { count: number; problems: Problem[] }> = {};

    problems.forEach((p) => {
      const d = p.solved_date ? p.solved_date.split('T')[0] : '';
      if (d) {
        if (!dateCountMap[d]) {
          dateCountMap[d] = { count: 0, problems: [] };
        }
        dateCountMap[d].count += 1;
        dateCountMap[d].problems.push(p);
      }
    });

    return days.map((day) => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const entry = dateCountMap[dateKey];
      const count = entry ? entry.count : 0;

      let intensity = 0;
      if (count === 1) intensity = 1;
      else if (count === 2) intensity = 2;
      else if (count >= 3 && count < 5) intensity = 3;
      else if (count >= 5) intensity = 4;

      return {
        date: dateKey,
        dayOfWeek: day.getDay(),
        count,
        intensity,
        isToday: isSameDay(day, today),
        problems: entry ? entry.problems : [],
      };
    });
  }, [problems, today]);

  // Organize days into columns (weeks)
  const weeks = useMemo(() => {
    const cols: typeof heatmapDays[] = [];
    let currentWeek: typeof heatmapDays = [];

    heatmapDays.forEach((day, index) => {
      currentWeek.push(day);
      if (day.dayOfWeek === 6 || index === heatmapDays.length - 1) {
        cols.push(currentWeek);
        currentWeek = [];
      }
    });

    return cols;
  }, [heatmapDays]);

  const monthLabels = useMemo(() => {
    const labels: { label: string; colIndex: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, colIndex) => {
      if (week.length > 0) {
        const d = parseISO(week[0].date);
        const m = getMonth(d);
        if (m !== lastMonth && colIndex < 50) {
          labels.push({
            label: format(d, 'MMM'),
            colIndex,
          });
          lastMonth = m;
        }
      }
    });

    return labels;
  }, [weeks]);

  // Premium Warm Emerald & Amber intensity scale
  const intensityColors = {
    0: 'bg-[#EFE6D5]/60 dark:bg-[#2C323F]/50 border-[#EFE6D5] dark:border-[#2C323F]',
    1: 'bg-[#C7DFC9] dark:bg-[#1C3A27] border-[#A4C0AC] dark:border-[#264E35]',
    2: 'bg-[#7FA38A] dark:bg-[#2E6B43] border-[#4F7A5A]',
    3: 'bg-[#4F7A5A] dark:bg-[#10B981] border-[#314C38] text-white',
    4: 'bg-[#E9B949] dark:bg-[#F59E0B] border-[#D4A32D] shadow-sm',
  };

  const totalContributions = problems.length;
  const activeDaysCount = useMemo(() => {
    const unique = new Set(problems.map((p) => p.solved_date?.split('T')[0]).filter(Boolean));
    return unique.size;
  }, [problems]);

  return (
    <div className="p-6 rounded-[20px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card space-y-5">
      {/* Header & Quick Activity Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#E9B949]" />
            <h3 className="text-base font-black text-[#1A202C] dark:text-white tracking-tight">
              DSA Activity & Contribution Calendar
            </h3>
          </div>
          <p className="text-xs text-[#718096] dark:text-[#A0AEC0] mt-0.5">
            {totalContributions} total problem solutions logged across {activeDaysCount} active days
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-[#718096] dark:text-[#A0AEC0]">
          <span className="text-[11px] font-semibold">Less</span>
          <div className="flex gap-1">
            <span className="w-3 h-3 rounded-sm bg-[#EFE6D5]/60 dark:bg-[#2C323F]/50 border border-[#EFE6D5] dark:border-[#2C323F]" />
            <span className="w-3 h-3 rounded-sm bg-[#C7DFC9] dark:bg-[#1C3A27] border border-[#A4C0AC]" />
            <span className="w-3 h-3 rounded-sm bg-[#7FA38A] dark:bg-[#2E6B43]" />
            <span className="w-3 h-3 rounded-sm bg-[#4F7A5A] dark:bg-[#10B981]" />
            <span className="w-3 h-3 rounded-sm bg-[#E9B949] dark:bg-[#F59E0B]" />
          </div>
          <span className="text-[11px] font-semibold">More</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2 custom-scrollbar">
        <div className="inline-block min-w-[700px]">
          {/* Months header */}
          <div className="flex text-[10px] text-[#A0AEC0] mb-1.5 ml-7 relative h-4 font-bold select-none">
            {monthLabels.map((m, idx) => (
              <span
                key={idx}
                className="absolute"
                style={{ left: `${m.colIndex * 13.5}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid with Day of Week labels */}
          <div className="flex gap-1">
            <div className="flex flex-col justify-between text-[9px] text-[#A0AEC0] font-mono pr-1.5 h-[95px] select-none font-bold">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            <div className="flex gap-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day) => {
                    const isSelected = selectedDayData?.date === day.date;
                    const isToday = day.isToday;

                    return (
                      <button
                        key={day.date}
                        onClick={() =>
                          setSelectedDayData({
                            date: day.date,
                            count: day.count,
                            problems: day.problems,
                          })
                        }
                        title={`${day.count} problem${day.count !== 1 ? 's' : ''} on ${format(
                          parseISO(day.date),
                          'MMM dd, yyyy'
                        )}${isToday ? ' (Today)' : ''}`}
                        className={`w-3 h-3 rounded-sm transition-all border relative ${
                          intensityColors[day.intensity as keyof typeof intensityColors]
                        } ${
                          isToday
                            ? 'ring-2 ring-[#E9B949] ring-offset-1 dark:ring-offset-[#16181D] scale-110 z-10'
                            : ''
                        } ${
                          isSelected
                            ? 'ring-2 ring-[#B0831E] dark:ring-white scale-125 z-20'
                            : 'hover:scale-125'
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Day Problem Breakdown */}
      {selectedDayData && (
        <div className="p-4 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE]/70 dark:bg-[#16181D]/60 animate-in fade-in duration-150 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#B0831E] dark:text-[#E9B949]" />
              <h4 className="text-xs font-bold text-[#1A202C] dark:text-white">
                {format(parseISO(selectedDayData.date), 'EEEE, MMMM dd, yyyy')}
                {selectedDayData.date === format(today, 'yyyy-MM-dd') && (
                  <span className="ml-2 px-1.5 py-0.2 rounded bg-[#FEF6E9] dark:bg-[#2C210C] text-[10px] font-extrabold text-[#8C5D0B] dark:text-[#E9B949] border border-[#F8E0B0] dark:border-[#5C4212]">
                    Today
                  </span>
                )}
              </h4>
            </div>
            <span className="text-xs font-bold text-[#B0831E] dark:text-[#E9B949]">
              {selectedDayData.count} problem{selectedDayData.count !== 1 ? 's' : ''} solved
            </span>
          </div>

          {selectedDayData.problems.length === 0 ? (
            <p className="text-xs text-[#718096] dark:text-[#A0AEC0] italic">
              No problems logged on this day.
            </p>
          ) : (
            <div className="space-y-2">
              {selectedDayData.problems.map((prob) => (
                <div
                  key={prob.id}
                  onClick={() => onSelectProblem && onSelectProblem(prob)}
                  className="p-3 rounded-lg border border-[#EFE6D5] dark:border-[#2C323F] hover:border-[#E9B949] bg-white dark:bg-[#1E222B] flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="font-mono text-xs text-[#718096] font-semibold shrink-0">
                      {prob.problem_id}
                    </span>
                    <span className="text-xs font-bold text-[#1A202C] dark:text-white truncate">
                      {prob.problem_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <PlatformBadge platform={prob.platform} />
                    <DifficultyBadge difficulty={prob.difficulty} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

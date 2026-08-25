import React, { useState, useMemo } from 'react';
import { format, parseISO, subDays, startOfWeek, addDays, getMonth } from 'date-fns';
import { Problem } from '../../types';
import { generateHeatmapData } from '../../lib/utils';
import { Flame, Calendar as CalendarIcon, Info } from 'lucide-react';
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

  const heatmapDays = useMemo(() => generateHeatmapData(problems), [problems]);

  // Organize days into 53 columns (weeks), 7 rows (days of week)
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

  // Warm Sage Green to Muted Gold intensity scale
  const intensityColors = {
    0: 'bg-[#EFE6D5]/60 dark:bg-[#2C323F]/50 border-[#EFE6D5] dark:border-[#2C323F]',
    1: 'bg-[#C7DFC9] dark:bg-[#253A2B] border-[#A4C0AC] dark:border-[#314C38]',
    2: 'bg-[#7FA38A] dark:bg-[#3E6147] border-[#4F7A5A]',
    3: 'bg-[#4F7A5A] dark:bg-[#4F7A5A] border-[#314C38]',
    4: 'bg-[#E9B949] dark:bg-[#E9B949] border-[#D4A32D]',
  };

  const totalContributions = problems.length;

  return (
    <div className="p-6 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#1A202C] dark:text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#E9B949]" />
            DSA Contribution Calendar
          </h3>
          <p className="text-xs text-[#718096] dark:text-[#A0AEC0] mt-0.5">
            {totalContributions} total problems solved across the past 365 days
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-xs text-[#718096]">
          <span>Less</span>
          <div className="flex gap-1">
            <span className="w-3 h-3 rounded-sm bg-[#EFE6D5]/60 dark:bg-[#2C323F]/50 border border-[#EFE6D5]" />
            <span className="w-3 h-3 rounded-sm bg-[#C7DFC9] dark:bg-[#253A2B] border border-[#A4C0AC]" />
            <span className="w-3 h-3 rounded-sm bg-[#7FA38A] dark:bg-[#3E6147]" />
            <span className="w-3 h-3 rounded-sm bg-[#4F7A5A]" />
            <span className="w-3 h-3 rounded-sm bg-[#E9B949]" />
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2 custom-scrollbar">
        <div className="inline-block min-w-[700px]">
          {/* Months header */}
          <div className="flex text-[10px] text-[#A0AEC0] mb-1 ml-6 relative h-4 font-semibold">
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
            <div className="flex flex-col justify-between text-[9px] text-[#A0AEC0] font-mono pr-1 h-[95px] select-none font-semibold">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            <div className="flex gap-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day) => {
                    const isSelected = selectedDayData?.date === day.date;
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
                        )}`}
                        className={`w-3 h-3 rounded-sm transition-all border ${
                          intensityColors[day.intensity as keyof typeof intensityColors]
                        } ${
                          isSelected
                            ? 'ring-2 ring-[#E9B949] ring-offset-1 dark:ring-offset-[#16181D] scale-125 z-10'
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
        <div className="p-4 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFF9EE]/70 dark:bg-[#16181D]/60 animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#B0831E] dark:text-[#E9B949]" />
              <h4 className="text-xs font-bold text-[#1A202C] dark:text-white">
                {format(parseISO(selectedDayData.date), 'EEEE, MMMM dd, yyyy')}
              </h4>
            </div>
            <span className="text-xs font-bold text-[#B0831E] dark:text-[#E9B949]">
              {selectedDayData.count} problem{selectedDayData.count !== 1 ? 's' : ''} solved
            </span>
          </div>

          {selectedDayData.problems.length === 0 ? (
            <p className="text-xs text-[#718096] italic">
              No problems logged on this day.
            </p>
          ) : (
            <div className="space-y-2">
              {selectedDayData.problems.map((prob) => (
                <div
                  key={prob.id}
                  onClick={() => onSelectProblem && onSelectProblem(prob)}
                  className="p-2.5 rounded-xl bg-white dark:bg-[#1E222B] border border-[#EFE6D5] dark:border-[#2C323F] flex items-center justify-between hover:border-[#D4A32D] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-[#718096]">
                      {prob.problem_id}
                    </span>
                    <span className="text-xs font-bold text-[#1A202C] dark:text-white">
                      {prob.problem_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
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

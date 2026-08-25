import React, { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Problem } from '../../types';
import { DifficultyBadge, PlatformBadge } from '../common/Badge';

interface MonthlyCalendarViewProps {
  problems: Problem[];
  onSelectProblem: (problem: Problem) => void;
}

export const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({
  problems,
  onSelectProblem,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const problemsByDate: Record<string, Problem[]> = {};
  problems.forEach((p) => {
    if (!problemsByDate[p.solved_date]) {
      problemsByDate[p.solved_date] = [];
    }
    problemsByDate[p.solved_date].push(p);
  });

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedDayProblems = problemsByDate[selectedDateStr] || [];

  return (
    <div className="space-y-6">
      {/* Calendar Card */}
      <div className="p-6 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-[#1A202C] dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#E9B949]" />
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-[#718096]" />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 py-1.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] text-xs font-semibold text-[#2D3748] dark:text-[#E2E8F0] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-[#718096]" />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase text-[#A0AEC0] mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayProblems = problemsByDate[dateStr] || [];
            const count = dayProblems.length;
            const isSelected = isSameDay(day, selectedDate);
            const inMonth = isSameMonth(day, monthStart);

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(day)}
                className={`min-h-[70px] sm:min-h-[90px] p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-[#E9B949] ring-2 ring-[#E9B949]/30 bg-[#FFF9EE] dark:bg-[#2C210C]/40'
                    : inMonth
                    ? 'border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] hover:border-[#D4A32D]'
                    : 'border-transparent text-[#CBD5E0] dark:text-[#4A5568] opacity-40'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs font-bold ${
                      isSameDay(day, new Date())
                        ? 'w-6 h-6 rounded-full bg-[#E9B949] text-[#1A202C] flex items-center justify-center'
                        : isSelected
                        ? 'text-[#B0831E] dark:text-[#E9B949]'
                        : 'text-[#2D3748] dark:text-[#E2E8F0]'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>

                  {count > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-[#FEF6E9] text-[#8C5D0B] dark:bg-[#2C210C] dark:text-[#E9B949] border border-[#F8E0B0] dark:border-[#5C4212]">
                      {count}
                    </span>
                  )}
                </div>

                {count > 0 && (
                  <div className="space-y-1 w-full overflow-hidden hidden sm:block">
                    {dayProblems.slice(0, 2).map((p) => (
                      <div
                        key={p.id}
                        className="text-[10px] truncate font-medium text-[#718096] dark:text-[#A0AEC0] bg-white/70 dark:bg-[#1E222B] px-1 py-0.5 rounded border border-[#EFE6D5]/60"
                      >
                        {p.problem_name}
                      </div>
                    ))}
                    {count > 2 && (
                      <span className="text-[9px] text-[#A0AEC0] font-semibold block">
                        +{count - 2} more
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Problem List */}
      <div className="p-6 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-[#1A202C] dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#B0831E]" />
            Problems Solved on {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
          </h4>
          <span className="text-xs font-semibold text-[#B0831E] dark:text-[#E9B949]">
            {selectedDayProblems.length} problem{selectedDayProblems.length !== 1 ? 's' : ''}
          </span>
        </div>

        {selectedDayProblems.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#A0AEC0] italic">
            No DSA problems solved on this date.
          </div>
        ) : (
          <div className="space-y-2.5">
            {selectedDayProblems.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProblem(p)}
                className="p-3.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] hover:border-[#E9B949] bg-[#FFF9EE]/50 dark:bg-[#16181D]/60 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs text-[#718096] font-semibold">
                    {p.problem_id}
                  </span>
                  <span className="text-xs font-bold text-[#1A202C] dark:text-white">
                    {p.problem_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <PlatformBadge platform={p.platform} />
                  <DifficultyBadge difficulty={p.difficulty} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

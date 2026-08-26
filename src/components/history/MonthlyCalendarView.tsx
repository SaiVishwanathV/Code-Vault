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
  isAfter,
  isBefore,
  startOfDay,
  differenceInCalendarDays,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Flame,
  Lock,
  Sparkles,
  CheckCircle2,
  Clock,
  PlusCircle,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Problem } from '../../types';
import { DifficultyBadge, PlatformBadge } from '../common/Badge';

interface MonthlyCalendarViewProps {
  problems: Problem[];
  onSelectProblem: (problem: Problem) => void;
  onOpenAddProblem?: () => void;
}

export const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({
  problems,
  onSelectProblem,
  onOpenAddProblem,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const today = startOfDay(new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Map problems by solved_date (normalized YYYY-MM-DD)
  const problemsByDate: Record<string, Problem[]> = {};
  problems.forEach((p) => {
    const dStr = p.solved_date ? p.solved_date.split('T')[0] : '';
    if (dStr) {
      if (!problemsByDate[dStr]) {
        problemsByDate[dStr] = [];
      }
      problemsByDate[dStr].push(p);
    }
  });

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedDayProblems = problemsByDate[selectedDateStr] || [];
  const isSelectedToday = isSameDay(selectedDate, today);
  const isSelectedFuture = isAfter(startOfDay(selectedDate), today);

  // Month Statistics
  const daysInCurrentMonthWithProblems = Object.keys(problemsByDate).filter((dStr) => {
    return dStr.startsWith(format(currentMonth, 'yyyy-MM'));
  });
  const totalProblemsThisMonth = problems.filter((p) =>
    p.solved_date?.startsWith(format(currentMonth, 'yyyy-MM'))
  ).length;

  return (
    <div className="space-y-6">
      {/* Month Progress & Target Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FEF6E9] dark:bg-[#2C210C] text-[#8C5D0B] dark:text-[#E9B949] border border-[#F8E0B0] dark:border-[#5C4212] flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] dark:text-[#A0AEC0] block">
              Active Month Solves
            </span>
            <span className="text-xl font-black text-[#1A202C] dark:text-white">
              {totalProblemsThisMonth}{' '}
              <span className="text-xs font-normal text-[#718096]">problems</span>
            </span>
          </div>
        </div>

        <div className="p-4 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#EBF3ED] dark:bg-[#16271A] text-[#4F7A5A] border border-[#C7DFC9] dark:border-[#254A2D] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] dark:text-[#A0AEC0] block">
              Active Days This Month
            </span>
            <span className="text-xl font-black text-[#4F7A5A]">
              {daysInCurrentMonthWithProblems.length}{' '}
              <span className="text-xs font-normal text-[#718096]">days active</span>
            </span>
          </div>
        </div>

        <div className="p-4 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-[#152238] text-[#2563EB] border border-[#BFDBFE] dark:border-[#1E3A8A] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#E9B949]" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] dark:text-[#A0AEC0] block">
              Today's Status
            </span>
            <span className="text-xs font-bold text-[#1A202C] dark:text-white block mt-0.5">
              {problemsByDate[format(today, 'yyyy-MM-dd')]?.length ? (
                <span className="text-[#4F7A5A] flex items-center gap-1">
                  ✓ Goal Met ({problemsByDate[format(today, 'yyyy-MM-dd')].length} Solved)
                </span>
              ) : (
                <span className="text-[#B0831E] dark:text-[#E9B949] flex items-center gap-1">
                  ⚡ Ready for Problem of the Day
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Main Calendar Card */}
      <div className="p-6 rounded-[20px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card">
        {/* Top Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black text-[#1A202C] dark:text-white flex items-center gap-2 tracking-tight">
              <CalendarIcon className="w-5 h-5 text-[#E9B949]" />
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <p className="text-xs text-[#718096] dark:text-[#A0AEC0] mt-0.5">
              Daily practice log &bull; Days unlock continuously as you advance
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] text-[#718096] hover:text-[#1A202C] dark:hover:text-white transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCurrentMonth(new Date());
                setSelectedDate(new Date());
              }}
              className="px-3.5 py-1.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-xs font-bold text-[#2D3748] dark:text-[#E2E8F0] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] transition-colors flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5 text-[#E9B949]" />
              Today
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] text-[#718096] hover:text-[#1A202C] dark:hover:text-white transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-[#A0AEC0] mb-2 pb-1 border-b border-[#EFE6D5]/60 dark:border-[#2C323F]/80">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayProblems = problemsByDate[dateStr] || [];
            const count = dayProblems.length;
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, today);
            const inMonth = isSameMonth(day, monthStart);
            const isFuture = isAfter(startOfDay(day), today);

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(day)}
                className={`min-h-[75px] sm:min-h-[95px] p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'border-[#E9B949] ring-2 ring-[#E9B949]/40 bg-[#FFF9EE] dark:bg-[#2C210C]/50 shadow-sm scale-[1.02] z-10'
                    : isToday
                    ? 'border-[#E9B949]/70 bg-[#FFFDF8] dark:bg-[#1C2029] ring-1 ring-[#E9B949]/30 hover:border-[#E9B949]'
                    : isFuture
                    ? 'border-dashed border-[#EFE6D5]/80 dark:border-[#2C323F]/80 bg-[#FAFAFA]/50 dark:bg-[#14161A]/40 opacity-70 hover:opacity-100'
                    : inMonth
                    ? 'border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] hover:border-[#D4A32D] hover:shadow-subtle'
                    : 'border-transparent text-[#CBD5E0] dark:text-[#4A5568] opacity-30'
                }`}
              >
                {/* Top Row: Date Number and Status Badge */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-xs font-black transition-transform ${
                        isToday
                          ? 'w-6 h-6 rounded-full bg-[#E9B949] text-[#1A202C] flex items-center justify-center shadow-sm font-black'
                          : isSelected
                          ? 'text-[#B0831E] dark:text-[#E9B949]'
                          : inMonth
                          ? 'text-[#2D3748] dark:text-[#E2E8F0]'
                          : 'text-[#A0AEC0]'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                    {isToday && (
                      <span className="hidden sm:inline-block text-[9px] font-extrabold uppercase px-1 py-0.2 rounded bg-[#FEF6E9] dark:bg-[#2C210C] text-[#8C5D0B] dark:text-[#E9B949]">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Solved Count or Locked Indicator */}
                  {count > 0 ? (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-lg bg-[#EBF3ED] dark:bg-[#16271A] text-[#4F7A5A] border border-[#C7DFC9] dark:border-[#254A2D] flex items-center gap-0.5">
                      <span>✓</span>
                      <span>{count}</span>
                    </span>
                  ) : isFuture ? (
                    <span
                      className="text-[9px] text-[#A0AEC0] flex items-center gap-0.5 opacity-60 group-hover:opacity-100"
                      title="Unlocks on this day"
                    >
                      <Lock className="w-2.5 h-2.5" />
                    </span>
                  ) : null}
                </div>

                {/* Problem Name Snippets (Desktop) */}
                {count > 0 ? (
                  <div className="space-y-1 w-full overflow-hidden hidden sm:block mt-1">
                    {dayProblems.slice(0, 2).map((p) => (
                      <div
                        key={p.id}
                        className="text-[10px] truncate font-medium text-[#4A5568] dark:text-[#CBD5E0] bg-white/80 dark:bg-[#1E222B] px-1.5 py-0.5 rounded-md border border-[#EFE6D5]/80 dark:border-[#2C323F]"
                      >
                        {p.problem_name}
                      </div>
                    ))}
                    {count > 2 && (
                      <span className="text-[9px] font-bold text-[#8C5D0B] dark:text-[#E9B949] block pl-0.5">
                        +{count - 2} more
                      </span>
                    )}
                  </div>
                ) : isToday ? (
                  <div className="hidden sm:flex items-center gap-1 text-[10px] text-[#B0831E] dark:text-[#E9B949] font-semibold mt-1">
                    <Flame className="w-3 h-3 shrink-0" />
                    <span className="truncate">Active Goal</span>
                  </div>
                ) : isFuture ? (
                  <div className="hidden sm:block text-[9px] text-[#A0AEC0] italic mt-1 truncate">
                    Unlocks soon
                  </div>
                ) : (
                  <div className="h-3" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Problem List */}
      <div className="p-6 rounded-[20px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EFE6D5]/70 dark:border-[#2C323F]/80 pb-3">
          <div>
            <h4 className="text-sm font-bold text-[#1A202C] dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#B0831E] dark:text-[#E9B949]" />
              {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
              {isSelectedToday && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FEF6E9] dark:bg-[#2C210C] text-[#8C5D0B] dark:text-[#E9B949] border border-[#F8E0B0] dark:border-[#5C4212]">
                  Today
                </span>
              )}
            </h4>
            <p className="text-xs text-[#718096] dark:text-[#A0AEC0] mt-0.5">
              {isSelectedFuture
                ? 'This calendar day is upcoming and will unlock automatically.'
                : `${selectedDayProblems.length} DSA problem${
                    selectedDayProblems.length !== 1 ? 's' : ''
                  } completed on this date.`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isSelectedToday && onOpenAddProblem && (
              <button
                onClick={onOpenAddProblem}
                className="px-3.5 py-1.5 rounded-xl bg-[#E9B949] hover:bg-[#D4A32D] text-[#1A202C] font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Log Problem for Today</span>
              </button>
            )}
          </div>
        </div>

        {/* Problem Cards */}
        {selectedDayProblems.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            {isSelectedFuture ? (
              <div className="space-y-1">
                <Lock className="w-8 h-8 text-[#A0AEC0] mx-auto opacity-50 mb-2" />
                <p className="text-xs font-bold text-[#4A5568] dark:text-[#A0AEC0]">
                  Upcoming Practice Day
                </p>
                <p className="text-[11px] text-[#A0AEC0]">
                  This day will unlock in{' '}
                  {differenceInCalendarDays(startOfDay(selectedDate), today)} day(s).
                </p>
              </div>
            ) : isSelectedToday ? (
              <div className="space-y-2">
                <Flame className="w-8 h-8 text-[#E9B949] mx-auto animate-bounce" />
                <p className="text-xs font-bold text-[#1A202C] dark:text-white">
                  No problems logged for today yet!
                </p>
                <p className="text-xs text-[#718096] dark:text-[#A0AEC0] max-w-sm mx-auto">
                  Solve your daily algorithm challenge now to keep your streak glowing.
                </p>
                {onOpenAddProblem && (
                  <button
                    onClick={onOpenAddProblem}
                    className="mt-2 px-4 py-2 rounded-xl bg-[#E9B949] hover:bg-[#D4A32D] text-[#1A202C] font-bold text-xs shadow-sm transition-all inline-flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Conquer Today's Problem</span>
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#A0AEC0] italic">
                No DSA problems recorded on this date.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {selectedDayProblems.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProblem(p)}
                className="p-3.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] hover:border-[#E9B949] bg-[#FFF9EE]/50 dark:bg-[#16181D]/60 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 truncate">
                  <span className="font-mono text-xs text-[#8C5D0B] dark:text-[#E9B949] font-bold shrink-0">
                    {p.problem_id}
                  </span>
                  <span className="text-xs font-bold text-[#1A202C] dark:text-white truncate">
                    {p.problem_name}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <PlatformBadge platform={p.platform} />
                  <DifficultyBadge difficulty={p.difficulty} />
                  {p.time_taken ? (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#718096] dark:text-[#A0AEC0] font-medium">
                      <Clock className="w-3 h-3" /> {p.time_taken}m
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import { Problem } from '../../types';
import { Calendar } from 'lucide-react';

interface WeeklyActivityChartProps {
  problems: Problem[];
}

export const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({ problems }) => {
  // Generate last 7 days
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(today, 6 - i);
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayLabel = format(day, 'EEE'); // Mon, Tue, etc.

    const solvedCount = problems.filter((p) => p.solved_date === dayStr).length;

    return {
      day: dayLabel,
      date: dayStr,
      count: solvedCount,
      isToday: i === 6,
    };
  });

  const totalThisWeek = last7Days.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Weekly Activity
          </h4>
        </div>
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          <strong className="text-indigo-500">{totalThisWeek}</strong> solved this week
        </span>
      </div>

      <div className="h-44 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={last7Days} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs border border-slate-700 shadow-xl">
                      <div className="font-semibold">{data.day} ({data.date})</div>
                      <div className="text-indigo-400 font-bold mt-0.5">
                        {data.count} problem{data.count !== 1 ? 's' : ''} solved
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {last7Days.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isToday ? '#6366f1' : entry.count > 0 ? '#818cf8' : '#334155'}
                  fillOpacity={entry.count > 0 ? 0.9 : 0.3}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

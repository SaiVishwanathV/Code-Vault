import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { format, subMonths, startOfMonth, parseISO } from 'date-fns';
import { Problem } from '../../types';

interface MonthlyTrendChartProps {
  problems: Problem[];
}

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ problems }) => {
  // Last 6 months trend
  const today = new Date();
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const monthDate = subMonths(today, 5 - i);
    const monthKey = format(monthDate, 'yyyy-MM');
    const monthLabel = format(monthDate, 'MMM yy');

    const count = problems.filter((p) => p.solved_date.startsWith(monthKey)).length;

    return {
      month: monthLabel,
      key: monthKey,
      count,
    };
  });

  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Monthly Progress Trend
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Problems solved over the last 6 months
          </p>
        </div>
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={last6Months} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
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
                  const item = payload[0].payload;
                  return (
                    <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs border border-slate-700 shadow-xl">
                      <div className="font-semibold">{item.month}</div>
                      <div className="text-indigo-400 font-bold">{item.count} problems solved</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#6366f1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorCount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { format, subDays } from 'date-fns';
import { Problem } from '../../types';
import { TrendingUp } from 'lucide-react';

interface WeeklyProgressLineChartProps {
  problems: Problem[];
}

export const WeeklyProgressLineChart: React.FC<WeeklyProgressLineChartProps> = ({ problems }) => {
  const today = new Date();
  const data = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(today, 6 - i);
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayLabel = format(day, 'EEE');

    const solvedCount = problems.filter((p) => p.solved_date === dayStr).length;

    return {
      day: dayLabel,
      date: dayStr,
      count: solvedCount,
    };
  });

  const totalThisWeek = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="p-5 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#B0831E] dark:text-[#E9B949]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#718096] dark:text-[#A0AEC0]">
            Weekly Progress
          </h3>
        </div>
        <span className="text-xs font-semibold text-[#2D3748] dark:text-[#E2E8F0]">
          <strong className="text-[#B0831E] dark:text-[#E9B949]">{totalThisWeek}</strong> solved this week
        </span>
      </div>

      <div className="h-44 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EFE6D5" opacity={0.5} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#718096', fontSize: 11 }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#718096', fontSize: 10 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="p-2.5 rounded-xl bg-[#1A202C] text-white text-xs shadow-card">
                      <div className="font-semibold">{item.day} ({item.date})</div>
                      <div className="text-[#E9B949] font-bold mt-0.5">
                        {item.count} problem{item.count !== 1 ? 's' : ''} solved
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#E9B949"
              strokeWidth={3}
              dot={{ r: 4, fill: '#E9B949' }}
              activeDot={{ r: 6, fill: '#D4A32D' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

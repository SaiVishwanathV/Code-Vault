import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Problem } from '../../types';
import { PLATFORMS } from '../../lib/constants';

interface PlatformBarChartProps {
  problems: Problem[];
}

export const PlatformBarChart: React.FC<PlatformBarChartProps> = ({ problems }) => {
  const platformCounts = PLATFORMS.map((p) => {
    const count = problems.filter((prob) => prob.platform === p).length;
    return {
      platform: p,
      count,
    };
  }).filter((item) => item.count > 0 || ['LeetCode', 'Codeforces', 'GFG', 'HackerRank'].includes(item.platform));

  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#16a34a', '#a855f7', '#ec4899', '#f43f5e', '#64748b'];

  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] shadow-sm flex flex-col justify-between">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
        Platform Breakdown
      </h3>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={platformCounts}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
          >
            <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis
              type="category"
              dataKey="platform"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              width={80}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs border border-slate-700 shadow-xl">
                      <div className="font-semibold">{item.platform}</div>
                      <div className="text-indigo-400 font-bold">{item.count} problems solved</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
              {platformCounts.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

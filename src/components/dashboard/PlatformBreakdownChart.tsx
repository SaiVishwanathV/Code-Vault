import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Problem } from '../../types';
import { PLATFORMS } from '../../lib/constants';
import { Globe } from 'lucide-react';

interface PlatformBreakdownChartProps {
  problems: Problem[];
}

export const PlatformBreakdownChart: React.FC<PlatformBreakdownChartProps> = ({ problems }) => {
  const platformCounts = PLATFORMS.map((p) => {
    const count = problems.filter((prob) => prob.platform === p).length;
    return {
      platform: p,
      count,
    };
  }).filter((item) => item.count > 0 || ['LeetCode', 'Codeforces', 'GFG', 'HackerRank'].includes(item.platform));

  const colors = ['#E9B949', '#3182CE', '#4F7A5A', '#2F855A', '#B7791F', '#805AD5', '#E53E3E', '#718096'];

  return (
    <div className="p-5 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-2">
        <Globe className="w-4 h-4 text-[#B0831E] dark:text-[#E9B949]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#718096] dark:text-[#A0AEC0]">
          Platform Breakdown
        </h3>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={platformCounts}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 15, bottom: 0 }}
          >
            <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#718096', fontSize: 10 }} />
            <YAxis
              type="category"
              dataKey="platform"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#718096', fontSize: 11 }}
              width={75}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="p-2 rounded-xl bg-[#1A202C] text-white text-xs shadow-card">
                      <div className="font-semibold">{item.platform}</div>
                      <div className="text-[#E9B949] font-bold">{item.count} problems solved</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
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

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Problem } from '../../types';

interface TopicDistributionChartProps {
  problems: Problem[];
}

export const TopicDistributionChart: React.FC<TopicDistributionChartProps> = ({ problems }) => {
  const topicMap: Record<string, number> = {};
  problems.forEach((p) => {
    topicMap[p.topic] = (topicMap[p.topic] || 0) + 1;
  });

  const topicData = Object.entries(topicMap)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Top 8 topics

  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] shadow-sm flex flex-col justify-between">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
        Top DSA Topic Mastery
      </h3>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topicData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
            <XAxis
              dataKey="topic"
              angle={-30}
              textAnchor="end"
              interval={0}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
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
                      <div className="font-semibold">{item.topic}</div>
                      <div className="text-indigo-400 font-bold">{item.count} solved</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

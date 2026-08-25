import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Problem } from '../../types';

interface DifficultyDonutChartProps {
  problems: Problem[];
}

export const DifficultyDonutChart: React.FC<DifficultyDonutChartProps> = ({ problems }) => {
  const easyCount = problems.filter((p) => p.difficulty === 'Easy').length;
  const medCount = problems.filter((p) => p.difficulty === 'Medium').length;
  const hardCount = problems.filter((p) => p.difficulty === 'Hard').length;
  const total = problems.length || 1;

  const data = [
    { name: 'Easy', value: easyCount, color: '#10b981' },
    { name: 'Medium', value: medCount, color: '#f59e0b' },
    { name: 'Hard', value: hardCount, color: '#f43f5e' },
  ];

  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] shadow-sm flex flex-col justify-between">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
        Difficulty Distribution
      </h3>

      <div className="relative h-56 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0];
                  const percent = Math.round(((item.value as number) / total) * 100);
                  return (
                    <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs border border-slate-700 shadow-xl">
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-slate-300">
                        {item.value} problems ({percent}%)
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Count */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {problems.length}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Solved
          </span>
        </div>
      </div>

      {/* Legend with Counts and Percentages */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
        <div>
          <span className="text-xs font-bold text-emerald-500 block">
            {easyCount} ({Math.round((easyCount / total) * 100)}%)
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Easy</span>
        </div>
        <div>
          <span className="text-xs font-bold text-amber-500 block">
            {medCount} ({Math.round((medCount / total) * 100)}%)
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Medium</span>
        </div>
        <div>
          <span className="text-xs font-bold text-rose-500 block">
            {hardCount} ({Math.round((hardCount / total) * 100)}%)
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Hard</span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Problem } from '../../types';
import { PieChart as PieIcon } from 'lucide-react';

interface DifficultyDonutProps {
  problems: Problem[];
}

export const DifficultyDonut: React.FC<DifficultyDonutProps> = ({ problems }) => {
  const easyCount = problems.filter((p) => p.difficulty === 'Easy').length;
  const medCount = problems.filter((p) => p.difficulty === 'Medium').length;
  const hardCount = problems.filter((p) => p.difficulty === 'Hard').length;
  const total = problems.length || 1;

  const data = [
    { name: 'Easy', value: easyCount, color: '#4F7A5A' }, // Sage green
    { name: 'Medium', value: medCount, color: '#C0841D' }, // Warm amber
    { name: 'Hard', value: hardCount, color: '#C54A53' }, // Soft crimson
  ];

  return (
    <div className="p-5 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-2">
        <PieIcon className="w-4 h-4 text-[#B0831E] dark:text-[#E9B949]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#718096] dark:text-[#A0AEC0]">
          Difficulty Distribution
        </h3>
      </div>

      <div className="relative h-44 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={50}
              outerRadius={70}
              paddingAngle={3}
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
                    <div className="p-2 rounded-xl bg-[#1A202C] text-white text-xs shadow-card">
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-[#E9B949]">
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
          <span className="text-xl font-black text-[#1A202C] dark:text-white">
            {problems.length}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#718096] dark:text-[#A0AEC0]">
            Total
          </span>
        </div>
      </div>

      {/* Legend with Counts and Percentages */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#EFE6D5] dark:border-[#2C323F] text-center text-xs">
        <div>
          <span className="font-bold text-[#4F7A5A] block">
            {easyCount} ({Math.round((easyCount / total) * 100)}%)
          </span>
          <span className="text-[10px] text-[#718096]">Easy</span>
        </div>
        <div>
          <span className="font-bold text-[#C0841D] block">
            {medCount} ({Math.round((medCount / total) * 100)}%)
          </span>
          <span className="text-[10px] text-[#718096]">Medium</span>
        </div>
        <div>
          <span className="font-bold text-[#C54A53] block">
            {hardCount} ({Math.round((hardCount / total) * 100)}%)
          </span>
          <span className="text-[10px] text-[#718096]">Hard</span>
        </div>
      </div>
    </div>
  );
};

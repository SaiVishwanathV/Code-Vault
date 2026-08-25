import React from 'react';
import { Layers, CheckCircle } from 'lucide-react';
import { Problem } from '../../types';

interface TopicMasteryListProps {
  problems: Problem[];
}

export const TopicMasteryList: React.FC<TopicMasteryListProps> = ({ problems }) => {
  const targetTopics = [
    { name: 'Arrays', target: 50 },
    { name: 'Strings', target: 30 },
    { name: 'Dynamic Programming', target: 40 },
    { name: 'Trees & BST', target: 35 },
    { name: 'Graphs', target: 30 },
    { name: 'Greedy', target: 25 },
    { name: 'Binary Search', target: 25 },
  ];

  const topicCounts: Record<string, number> = {};
  problems.forEach((p) => {
    topicCounts[p.topic] = (topicCounts[p.topic] || 0) + 1;
  });

  return (
    <div className="p-5 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#B0831E] dark:text-[#E9B949]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#718096] dark:text-[#A0AEC0]">
            Topic Mastery Progress
          </h3>
        </div>
        <span className="text-[11px] text-[#718096]">Core Foundations</span>
      </div>

      <div className="space-y-3">
        {targetTopics.map((topic) => {
          const count = topicCounts[topic.name] || 0;
          const percent = Math.min(Math.round((count / topic.target) * 100), 100);

          return (
            <div key={topic.name} className="space-y-1 text-xs">
              <div className="flex items-center justify-between font-medium">
                <span className="text-[#2D3748] dark:text-[#E2E8F0]">{topic.name}</span>
                <span className="text-[11px] text-[#718096] font-mono">
                  {count} / {topic.target} ({percent}%)
                </span>
              </div>

              <div className="w-full h-1.5 bg-[#EFE6D5] dark:bg-[#2C323F] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    percent >= 100
                      ? 'bg-[#4F7A5A]'
                      : percent >= 50
                      ? 'bg-[#E9B949]'
                      : 'bg-[#C0841D]'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

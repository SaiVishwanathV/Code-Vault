import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
  accentColor?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'blue' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendPositive = true,
  accentColor = 'indigo',
}) => {
  const colorMap = {
    indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 shadow-glow-indigo',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-glow-emerald',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-glow-amber',
    rose: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  };

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#111622] hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow-md flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border ${colorMap[accentColor]} transition-transform duration-300 group-hover:scale-105`}>
          {icon}
        </div>
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {value}
        </div>
        <div className="flex items-center justify-between mt-1 text-xs">
          {subtitle && <span className="text-slate-500 dark:text-slate-400">{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold ${
                trendPositive ? 'text-emerald-500' : 'text-rose-500'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

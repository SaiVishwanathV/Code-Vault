import React, { useState } from 'react';
import { Target, Edit2, Check, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface GoalProgressCardProps {
  totalSolved: number;
  targetGoal: number;
  onUpdateGoal: (newGoal: number) => Promise<void>;
}

export const GoalProgressCard: React.FC<GoalProgressCardProps> = ({
  totalSolved,
  targetGoal,
  onUpdateGoal,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [goalInput, setGoalInput] = useState(targetGoal.toString());

  const progressPercent = Math.min(Math.round((totalSolved / (targetGoal || 1)) * 100), 100);
  const remaining = Math.max(targetGoal - totalSolved, 0);

  const handleSaveGoal = async () => {
    const num = parseInt(goalInput, 10);
    if (!isNaN(num) && num > 0) {
      await onUpdateGoal(num);
      setIsEditing(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Target Goal Progress
          </h4>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              className="w-20 px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
              min="10"
              max="2000"
            />
            <button
              onClick={handleSaveGoal}
              className="p-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setGoalInput(targetGoal.toString());
              setIsEditing(true);
            }}
            className="text-[11px] text-slate-400 hover:text-indigo-400 font-semibold flex items-center gap-1 transition-colors"
          >
            <Edit2 className="w-3 h-3" /> Edit Target
          </button>
        )}
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {totalSolved}
            </span>
            <span className="text-xs text-slate-400 font-semibold">/ {targetGoal} problems</span>
          </div>
          <span className="text-sm font-extrabold text-indigo-500">{progressPercent}%</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700/60">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 shadow-sm"
          />
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          {remaining === 0
            ? 'Goal achieved! Set a higher target to challenge yourself.'
            : `Only ${remaining} more problems to reach your placement milestone.`}
        </p>
      </div>
    </div>
  );
};

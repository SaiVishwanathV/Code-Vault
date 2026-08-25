import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Link as LinkIcon, Clock, Calendar, Star, RefreshCw, Sparkles, BookOpen } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Difficulty, Platform, Problem } from '../../types';
import { DIFFICULTIES, PLATFORMS, TOPICS } from '../../lib/constants';
import { isValidUrl } from '../../lib/utils';

interface AddEditProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (problemData: any) => Promise<void>;
  initialData?: Problem | null;
}

interface FormValues {
  problem_id: string;
  problem_name: string;
  platform: Platform;
  difficulty: Difficulty;
  topic: string;
  problem_link: string;
  notes: string;
  solved_date: string;
  time_taken: number;
  favorite: boolean;
  revision_needed: boolean;
  revision_date?: string;
}

export const AddEditProblemModal: React.FC<AddEditProblemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      problem_id: '',
      problem_name: '',
      platform: 'LeetCode',
      difficulty: 'Medium',
      topic: 'Arrays',
      problem_link: '',
      notes: '',
      solved_date: format(new Date(), 'yyyy-MM-dd'),
      time_taken: 20,
      favorite: false,
      revision_needed: false,
      revision_date: format(new Date(Date.now() + 7 * 86400000), 'yyyy-MM-dd'),
    },
  });

  const revisionNeeded = watch('revision_needed');
  const favorite = watch('favorite');

  useEffect(() => {
    if (initialData) {
      reset({
        problem_id: initialData.problem_id || '',
        problem_name: initialData.problem_name || '',
        platform: initialData.platform || 'LeetCode',
        difficulty: initialData.difficulty || 'Medium',
        topic: initialData.topic || 'Arrays',
        problem_link: initialData.problem_link || '',
        notes: initialData.notes || '',
        solved_date: initialData.solved_date || format(new Date(), 'yyyy-MM-dd'),
        time_taken: initialData.time_taken || 20,
        favorite: initialData.favorite || false,
        revision_needed: initialData.revision_needed || false,
        revision_date: initialData.revision_date || format(new Date(Date.now() + 7 * 86400000), 'yyyy-MM-dd'),
      });
    } else {
      reset({
        problem_id: '',
        problem_name: '',
        platform: 'LeetCode',
        difficulty: 'Medium',
        topic: 'Arrays',
        problem_link: '',
        notes: '',
        solved_date: format(new Date(), 'yyyy-MM-dd'),
        time_taken: 20,
        favorite: false,
        revision_needed: false,
        revision_date: format(new Date(Date.now() + 7 * 86400000), 'yyyy-MM-dd'),
      });
    }
  }, [initialData, isOpen, reset]);

  const onSubmit = async (data: FormValues) => {
    await onSave({
      ...data,
      id: initialData?.id,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={isEditing ? 'Edit Problem Details' : 'Add Solved Problem'}
      description={isEditing ? 'Update notes, platform, or revision details' : 'Log a newly conquered DSA problem and save your solution notes'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        {/* Row 1: Problem Name & ID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-[#A0AEC0] mb-1.5">
              Problem Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              {...register('problem_name', { required: 'Problem name is required' })}
              placeholder="e.g. Trapping Rain Water"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-[#1A202C] dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
            />
            {errors.problem_name && (
              <p className="text-xs text-rose-500 mt-1">{errors.problem_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-[#A0AEC0] mb-1.5">
              Problem ID
            </label>
            <input
              type="text"
              {...register('problem_id')}
              placeholder="e.g. LC-42, CF-158A"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-[#1A202C] dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
            />
          </div>
        </div>

        {/* Row 2: Platform, Difficulty, Topic */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-[#A0AEC0] mb-1.5">
              Platform <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('platform', { required: true })}
              className="w-full px-3 py-2.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-[#1A202C] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-[#A0AEC0] mb-1.5">
              Difficulty <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('difficulty', { required: true })}
              className="w-full px-3 py-2.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-[#1A202C] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-[#A0AEC0] mb-1.5">
              Topic <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('topic', { required: true })}
              className="w-full px-3 py-2.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-[#1A202C] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
            >
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Problem URL Only (No GitHub/Solution link) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-[#A0AEC0] mb-1.5">
            Problem URL
          </label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-[#A0AEC0]" />
            <input
              type="url"
              {...register('problem_link', {
                validate: (val) => isValidUrl(val) || 'Enter a valid URL (http/https)',
              })}
              placeholder="https://leetcode.com/problems/..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-[#1A202C] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
            />
          </div>
          {errors.problem_link && (
            <p className="text-xs text-rose-500 mt-1">{errors.problem_link.message}</p>
          )}
        </div>

        {/* Row 4: Solved Date & Time Taken */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-[#A0AEC0] mb-1.5">
              Date Solved
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-[#A0AEC0]" />
              <input
                type="date"
                {...register('solved_date', { required: true })}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-[#1A202C] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-[#A0AEC0] mb-1.5">
              Time Taken (Minutes)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 w-4 h-4 text-[#A0AEC0]" />
              <input
                type="number"
                min="1"
                max="999"
                {...register('time_taken', { valueAsNumber: true })}
                placeholder="20"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-[#1A202C] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
              />
            </div>
          </div>
        </div>

        {/* Personal Notes (Markdown & Code Snippets) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-[#A0AEC0]">
              Personal Notes & Code Walkthrough (Markdown)
            </label>
            <span className="text-[11px] text-[#718096] dark:text-[#A0AEC0]">
              Save intuition, code snippets & $O(N)$ complexities here
            </span>
          </div>
          <textarea
            rows={5}
            {...register('notes')}
            placeholder="### Core Intuition&#10;Describe your solution steps here...&#10;&#10;```cpp&#10;// Code snippet&#10;int solve() { ... }&#10;```&#10;&#10;- Time: O(N)&#10;- Space: O(1)"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-[#1A202C] dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#E9B949] leading-relaxed"
          />
        </div>

        {/* Toggles: Favorite & Revision Queue */}
        <div className="p-3.5 rounded-xl bg-[#FFF9EE] dark:bg-[#1E222B] border border-[#EFE6D5] dark:border-[#2C323F] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className={`w-4 h-4 ${favorite ? 'text-[#E9B949] fill-[#E9B949]' : 'text-[#A0AEC0]'}`} />
              <span className="text-xs font-semibold text-[#2D3748] dark:text-[#E2E8F0]">
                Mark as Favorite Problem
              </span>
            </div>
            <input
              type="checkbox"
              {...register('favorite')}
              className="w-4 h-4 text-[#E9B949] rounded border-[#EFE6D5] dark:border-[#2C323F] focus:ring-[#E9B949] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between border-t border-[#EFE6D5]/60 dark:border-[#2C323F] pt-2.5">
            <div className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${revisionNeeded ? 'text-[#C0841D]' : 'text-[#A0AEC0]'}`} />
              <div>
                <span className="text-xs font-semibold text-[#2D3748] dark:text-[#E2E8F0] block">
                  Add to Revision Queue
                </span>
                <span className="text-[11px] text-[#718096] dark:text-[#A0AEC0]">
                  Queue for spaced repetition review before placements
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              {...register('revision_needed')}
              className="w-4 h-4 text-[#E9B949] rounded border-[#EFE6D5] dark:border-[#2C323F] focus:ring-[#E9B949] cursor-pointer"
            />
          </div>

          {revisionNeeded && (
            <div className="pt-2 pl-6">
              <label className="block text-[11px] text-[#718096] dark:text-[#A0AEC0] mb-1">
                Target Revision Date
              </label>
              <input
                type="date"
                {...register('revision_date')}
                className="px-3 py-1.5 rounded-lg border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#16181D] text-xs text-[#2D3748] dark:text-white"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EFE6D5] dark:border-[#2C323F]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#718096] dark:text-[#A0AEC0] hover:bg-[#FFF9EE] dark:hover:bg-[#1E222B] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#E9B949] hover:bg-[#D4A32D] text-[#1A202C] text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            {isEditing ? 'Save Changes' : 'Save Problem'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

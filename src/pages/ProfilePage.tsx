import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  User,
  Mail,
  GraduationCap,
  Building,
  Calendar,
  Sparkles,
  Flame,
  Trophy,
  Edit2,
  Save,
  Layers,
  Code2,
  Target,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Problem, Profile, Streak } from '../types';
import { formatDate } from '../lib/utils';

interface ProfilePageProps {
  problems: Problem[];
  streak: Streak;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ problems, streak }) => {
  const { profile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit } = useForm<Partial<Profile>>({
    defaultValues: {
      full_name: profile?.full_name || '',
      college: profile?.college || '',
      branch: profile?.branch || '',
      graduation_year: profile?.graduation_year || undefined,
      bio: profile?.bio || '',
      target_goal: profile?.target_goal || 500,
      avatar_url: profile?.avatar_url || '',
    },
  });

  const onSave = async (data: Partial<Profile>) => {
    setSaving(true);
    try {
      await updateProfile(data);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  // Computations from user's live problem data
  const totalSolved = problems.length;
  const easyCount = problems.filter((p) => p.difficulty === 'Easy').length;
  const medCount = problems.filter((p) => p.difficulty === 'Medium').length;
  const hardCount = problems.filter((p) => p.difficulty === 'Hard').length;

  const hardestProblem = problems.find((p) => p.difficulty === 'Hard');

  // Dynamic Favorite Topic
  const topicCounts: Record<string, number> = {};
  problems.forEach((p) => {
    topicCounts[p.topic] = (topicCounts[p.topic] || 0) + 1;
  });
  const favoriteTopic =
    Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return (
    <div className="space-y-6">
      {/* Top Banner & Profile Header */}
      <div className="p-6 sm:p-8 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={
                profile?.avatar_url ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.username || 'user'}`
              }
              alt="Profile Avatar"
              className="w-24 h-24 rounded-2xl object-cover border-2 border-[#E9B949] shadow-sm"
            />

            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-[#1A202C] dark:text-white tracking-tight">
                  {profile?.full_name || 'Coder'}
                </h1>
                {profile?.role === 'admin' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FEF6E9] text-[#8C5D0B] border border-[#F8E0B0]">
                    ADMIN
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#718096] dark:text-[#A0AEC0] font-mono">
                <span>@{profile?.username || 'user'}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {profile?.email || 'No email'}
                </span>
              </div>

              {profile?.bio ? (
                <p className="text-xs text-[#4A5568] dark:text-[#CBD5E0] max-w-xl pt-1">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-xs italic text-[#A0AEC0] pt-1">
                  No bio added yet. Click &quot;Edit Profile&quot; to set your goals.
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] hover:bg-[#FFF9EE] dark:hover:bg-[#252B37] text-xs font-semibold text-[#2D3748] dark:text-[#E2E8F0] transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Edit2 className="w-3.5 h-3.5" />
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>

        {/* Inline Edit Form */}
        {isEditing && (
          <form onSubmit={handleSubmit(onSave)} className="mt-6 pt-6 border-t border-[#EFE6D5] dark:border-[#2C323F] space-y-4">
            <h3 className="text-sm font-bold text-[#1A202C] dark:text-white">Edit Profile Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4A5568] dark:text-[#A0AEC0] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  {...register('full_name')}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-xs text-[#1A202C] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A5568] dark:text-[#A0AEC0] mb-1">
                  College / Institute
                </label>
                <input
                  type="text"
                  {...register('college')}
                  placeholder="e.g. University / College"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-xs text-[#1A202C] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A5568] dark:text-[#A0AEC0] mb-1">
                  Branch / Major
                </label>
                <input
                  type="text"
                  {...register('branch')}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-xs text-[#1A202C] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A5568] dark:text-[#A0AEC0] mb-1">
                  Graduation Year
                </label>
                <input
                  type="number"
                  {...register('graduation_year', { valueAsNumber: true })}
                  placeholder="e.g. 2026"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-xs text-[#1A202C] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A5568] dark:text-[#A0AEC0] mb-1">
                  Target Problem Goal
                </label>
                <input
                  type="number"
                  {...register('target_goal', { valueAsNumber: true })}
                  placeholder="500"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-xs text-[#1A202C] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A5568] dark:text-[#A0AEC0] mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  {...register('avatar_url')}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-xs text-[#1A202C] dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A5568] dark:text-[#A0AEC0] mb-1">
                Bio / Placement Goals
              </label>
              <textarea
                rows={2}
                {...register('bio')}
                placeholder="Share your goals and target placement companies..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-xs text-[#1A202C] dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-[#E9B949] hover:bg-[#D4A32D] text-[#1A202C] text-xs font-bold shadow-sm flex items-center gap-1.5 active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        )}
      </div>

      {/* Grid: Academic Details & Comprehensive Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal & Academic Details Card */}
        <div className="p-6 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card space-y-4">
          <h3 className="text-sm font-bold text-[#1A202C] dark:text-white">
            Academic & Profile Background
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-[#EFE6D5]/60 dark:border-[#2C323F]/80">
              <span className="text-[#718096] flex items-center gap-2">
                <Building className="w-4 h-4 text-[#B0831E] dark:text-[#E9B949]" /> College / Institute
              </span>
              <span className="font-semibold text-[#1A202C] dark:text-white">
                {profile?.college || 'Not specified'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#EFE6D5]/60 dark:border-[#2C323F]/80">
              <span className="text-[#718096] flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#B0831E] dark:text-[#E9B949]" /> Branch / Department
              </span>
              <span className="font-semibold text-[#1A202C] dark:text-white">
                {profile?.branch || 'Not specified'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#EFE6D5]/60 dark:border-[#2C323F]/80">
              <span className="text-[#718096] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#B0831E] dark:text-[#E9B949]" /> Graduation Year
              </span>
              <span className="font-semibold text-[#1A202C] dark:text-white">
                {profile?.graduation_year ? profile.graduation_year : 'Not specified'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#EFE6D5]/60 dark:border-[#2C323F]/80">
              <span className="text-[#718096] flex items-center gap-2">
                <Target className="w-4 h-4 text-[#E9B949]" /> Problem Target Goal
              </span>
              <span className="font-bold text-[#B0831E] dark:text-[#E9B949]">
                {profile?.target_goal || 500} Problems
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-[#718096] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B0831E] dark:text-[#E9B949]" /> Member Since
              </span>
              <span className="font-semibold text-[#1A202C] dark:text-white">
                {formatDate(profile?.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* DSA Performance Statistics */}
        <div className="p-6 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card space-y-4">
          <h3 className="text-sm font-bold text-[#1A202C] dark:text-white">
            DSA Problem Solving Statistics
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-[#EFE6D5]/60 dark:border-[#2C323F]/80">
              <span className="text-[#718096] flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#B0831E] dark:text-[#E9B949]" /> Total Problems Solved
              </span>
              <span className="font-black text-[#1A202C] dark:text-white text-sm">
                {totalSolved}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#EFE6D5]/60 dark:border-[#2C323F]/80">
              <span className="text-[#718096]">Easy / Medium / Hard</span>
              <div className="flex items-center gap-2 font-mono font-bold">
                <span className="text-[#4F7A5A]">{easyCount} Easy</span>
                <span>/</span>
                <span className="text-[#C0841D]">{medCount} Med</span>
                <span>/</span>
                <span className="text-[#C54A53]">{hardCount} Hard</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#EFE6D5]/60 dark:border-[#2C323F]/80">
              <span className="text-[#718096] flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#E9B949]" /> Current & Longest Streak
              </span>
              <span className="font-bold text-[#1A202C] dark:text-white">
                {streak.current_streak}d current / {streak.longest_streak}d max
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#EFE6D5]/60 dark:border-[#2C323F]/80">
              <span className="text-[#718096] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#B0831E]" /> Top Topic
              </span>
              <span className="font-semibold text-[#1A202C] dark:text-white">
                {favoriteTopic ? `#${favoriteTopic}` : 'None yet'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-[#718096] flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#C54A53]" /> Hardest Solved Problem
              </span>
              <span className="font-semibold text-[#C54A53] truncate max-w-[200px]">
                {hardestProblem ? hardestProblem.problem_name : 'None yet'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

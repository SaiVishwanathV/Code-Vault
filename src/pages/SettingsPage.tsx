import React, { useState } from 'react';
import { Settings, Bell, Moon, Sun, Download, Upload, Shield, Lock, Trash2, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Problem } from '../types';
import { exportProblemsToCsv } from '../lib/utils';

interface SettingsPageProps {
  problems: Problem[];
  onOpenCsvModal: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ problems, onOpenCsvModal }) => {
  const { theme, toggleTheme, setTheme } = useTheme();
  const { profile, updateProfile, signOut } = useAuth();
  const { success, info } = useToast();

  const [dailyReminder, setDailyReminder] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [targetGoal, setTargetGoal] = useState(profile?.target_goal || 500);

  const handleSavePreferences = async () => {
    await updateProfile({ target_goal: targetGoal });
    success('Settings Saved', 'Your workspace preferences have been updated.');
  };

  const handleExportData = () => {
    exportProblemsToCsv(problems, `codevault_backup_${new Date().toISOString().split('T')[0]}.csv`);
    success('Export Complete', `Exported ${problems.length} problem records.`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1A202C] dark:text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-[#E9B949]" />
          Platform Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-[#718096] dark:text-[#A0AEC0] mt-1">
          Customize your study environment, manage reminders, and back up your DSA data.
        </p>
      </div>

      <div className="space-y-5">
        {/* 1. Theme Preferences */}
        <div className="p-6 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card space-y-4">
          <h3 className="text-sm font-bold text-[#1A202C] dark:text-white flex items-center gap-2">
            <Sun className="w-4 h-4 text-[#B0831E] dark:text-[#E9B949]" /> Interface Appearance
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                theme === 'light'
                  ? 'border-[#E9B949] bg-[#FFF9EE] ring-2 ring-[#E9B949]/30'
                  : 'border-[#EFE6D5] dark:border-[#2C323F] hover:bg-[#FFF9EE]/50'
              }`}
            >
              <div>
                <span className="font-bold text-xs text-[#1A202C] block">Warm White (Default)</span>
                <span className="text-[11px] text-[#718096]">Soft cream background with minimal dark text</span>
              </div>
              <Sun className="w-5 h-5 text-[#E9B949]" />
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                theme === 'dark'
                  ? 'border-[#E9B949] bg-[#1E222B] ring-2 ring-[#E9B949]/30'
                  : 'border-[#EFE6D5] dark:border-[#2C323F] hover:bg-[#1E222B]/50'
              }`}
            >
              <div>
                <span className="font-bold text-xs text-white block">Espresso Slate Dark</span>
                <span className="text-[11px] text-[#A0AEC0]">Warm dark obsidian for night coding</span>
              </div>
              <Moon className="w-5 h-5 text-[#E9B949]" />
            </button>
          </div>
        </div>

        {/* 2. Problem Target Goal & Notifications */}
        <div className="p-6 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card space-y-4">
          <h3 className="text-sm font-bold text-[#1A202C] dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#B0831E] dark:text-[#E9B949]" /> Notifications & Study Reminders
          </h3>

          <div className="space-y-3 divide-y divide-[#EFE6D5]/60 dark:divide-[#2C323F]/80 text-xs">
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="font-bold text-[#1A202C] dark:text-white block">Daily Problem Reminders</span>
                <span className="text-[11px] text-[#718096] dark:text-[#A0AEC0]">
                  Receive notification alerts if no problem is logged by 8:00 PM
                </span>
              </div>
              <input
                type="checkbox"
                checked={dailyReminder}
                onChange={(e) => setDailyReminder(e.target.checked)}
                className="w-4 h-4 text-[#E9B949] rounded border-[#EFE6D5] focus:ring-[#E9B949]"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="font-bold text-[#1A202C] dark:text-white block">Streak Freeze & Warning Alerts</span>
                <span className="text-[11px] text-[#718096] dark:text-[#A0AEC0]">
                  Get alerted before your continuous daily coding streak expires
                </span>
              </div>
              <input
                type="checkbox"
                checked={streakAlerts}
                onChange={(e) => setStreakAlerts(e.target.checked)}
                className="w-4 h-4 text-[#E9B949] rounded border-[#EFE6D5] focus:ring-[#E9B949]"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="font-bold text-[#1A202C] dark:text-white block">Target Problem Goal</span>
                <span className="text-[11px] text-[#718096] dark:text-[#A0AEC0]">
                  Set your placement target count (e.g. 500 problems)
                </span>
              </div>
              <input
                type="number"
                value={targetGoal}
                onChange={(e) => setTargetGoal(Number(e.target.value))}
                min="10"
                max="2000"
                className="w-24 px-3 py-1.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] font-bold text-xs text-right"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSavePreferences}
              className="px-4 py-2 rounded-xl bg-[#E9B949] hover:bg-[#D4A32D] text-[#1A202C] text-xs font-bold shadow-sm transition-all"
            >
              Save Preferences
            </button>
          </div>
        </div>

        {/* 3. Data Backup & CSV Management */}
        <div className="p-6 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card space-y-4">
          <h3 className="text-sm font-bold text-[#1A202C] dark:text-white flex items-center gap-2">
            <Download className="w-4 h-4 text-[#B0831E] dark:text-[#E9B949]" /> Data Backup & Portability
          </h3>

          <p className="text-xs text-[#718096] dark:text-[#A0AEC0]">
            Export all your solved problems, approach notes, and revision logs to a standard CSV file or import records from external spreadsheets.
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              onClick={handleExportData}
              className="px-4 py-2.5 rounded-xl bg-[#FFF9EE] dark:bg-[#16181D] border border-[#EFE6D5] dark:border-[#2C323F] hover:border-[#D4A32D] text-xs font-bold text-[#1A202C] dark:text-white flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4 text-[#B0831E]" />
              <span>Export Solved Problems CSV</span>
            </button>

            <button
              onClick={onOpenCsvModal}
              className="px-4 py-2.5 rounded-xl bg-[#FFF9EE] dark:bg-[#16181D] border border-[#EFE6D5] dark:border-[#2C323F] hover:border-[#D4A32D] text-xs font-bold text-[#1A202C] dark:text-white flex items-center gap-2 transition-all"
            >
              <Upload className="w-4 h-4 text-[#4F7A5A]" />
              <span>Import from Spreadsheet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

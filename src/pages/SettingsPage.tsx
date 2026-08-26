import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Moon,
  Sun,
  Download,
  Upload,
  Shield,
  Lock,
  Trash2,
  AlertTriangle,
  LogOut,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Problem } from '../types';
import { exportProblemsToCsv } from '../lib/utils';
import { Modal } from '../components/common/Modal';

interface SettingsPageProps {
  problems: Problem[];
  onOpenCsvModal: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ problems, onOpenCsvModal }) => {
  const { theme, setTheme } = useTheme();
  const { profile, updateProfile, deleteOwnAccount } = useAuth();
  const { success, error: showError } = useToast();

  const [dailyReminder, setDailyReminder] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [targetGoal, setTargetGoal] = useState(profile?.target_goal || 500);

  // Delete account modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSavePreferences = async () => {
    await updateProfile({ target_goal: targetGoal });
    success('Settings Saved', 'Your workspace preferences have been updated.');
  };

  const handleExportData = () => {
    exportProblemsToCsv(problems, `codevault_backup_${new Date().toISOString().split('T')[0]}.csv`);
    success('Export Complete', `Exported ${problems.length} problem records.`);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      showError('Confirmation Required', 'Please type DELETE to confirm permanent account removal.');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteOwnAccount();
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      showError('Action Failed', err.message || 'Unable to delete account.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1A202C] dark:text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-[#E9B949]" />
          Platform Settings & Account
        </h1>
        <p className="text-xs sm:text-sm text-[#718096] dark:text-[#A0AEC0] mt-1">
          Customize your study environment, manage reminders, back up data, and manage account security.
        </p>
      </div>

      <div className="space-y-5">
        {/* 1. Theme Preferences */}
        <div className="p-6 rounded-[18px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card space-y-4">
          <h3 className="text-sm font-bold text-[#1A202C] dark:text-white flex items-center gap-2">
            <Sun className="w-4 h-4 text-[#B0831E] dark:text-[#E9B949]" /> Interface Appearance
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Light Theme Card — always light-styled so text is visible */}
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                theme === 'light'
                  ? 'border-[#E9B949] ring-2 ring-[#E9B949]/40'
                  : 'border-[#EFE6D5] dark:border-[#3A4150] hover:border-[#D4A32D]'
              }`}
              style={{ backgroundColor: '#FFFDF8' }}
            >
              <div>
                <span className="font-bold text-xs block" style={{ color: '#1A202C' }}>
                  ☀️ Warm White (Default)
                </span>
                <span className="text-[11px]" style={{ color: '#718096' }}>
                  Soft cream background with minimal dark text
                </span>
              </div>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ml-2 ${
                  theme === 'light'
                    ? 'bg-[#E9B949]'
                    : 'bg-[#EFE6D5]'
                }`}
              >
                <Sun className="w-4 h-4" style={{ color: '#8C5D0B' }} />
              </div>
            </button>

            {/* Dark Theme Card — always dark-styled so text is visible */}
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                theme === 'dark'
                  ? 'border-[#E9B949] ring-2 ring-[#E9B949]/40'
                  : 'border-[#2C323F] hover:border-[#D4A32D]'
              }`}
              style={{ backgroundColor: '#1E222B' }}
            >
              <div>
                <span className="font-bold text-xs block" style={{ color: '#F7F8FA' }}>
                  🌙 Espresso Slate Dark
                </span>
                <span className="text-[11px]" style={{ color: '#A0AEC0' }}>
                  Warm dark obsidian for night coding
                </span>
              </div>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ml-2 ${
                  theme === 'dark'
                    ? 'bg-[#E9B949]'
                    : 'bg-[#2C323F]'
                }`}
              >
                <Moon className="w-4 h-4" style={{ color: theme === 'dark' ? '#1A202C' : '#E9B949' }} />
              </div>
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

        {/* 4. Danger Zone: Delete My Account */}
        <div className="p-6 rounded-[18px] border border-red-200 dark:border-red-950/80 bg-[#FFF5F5] dark:bg-[#201214] shadow-card space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-900 dark:text-red-300">
                Danger Zone & Account Termination
              </h3>
              <p className="text-xs text-red-700 dark:text-red-400">
                Permanently delete your account, problem logs, notes, streaks, and community access.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setDeleteConfirmText('');
                setIsDeleteModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete My Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        maxWidth="md"
        title="Permanently Delete Account"
        description="This action cannot be undone. All your progress will be permanently erased."
      >
        <div className="space-y-4 pt-2">
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 flex items-start gap-2.5 text-xs text-red-800 dark:text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Permanent Data Deletion</p>
              <p className="mt-0.5">
                All your tracked problems, solution notes, streaks, achievements, and room memberships will be permanently deleted from the database.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A5568] dark:text-[#A0AEC0] mb-1.5">
              Type <strong className="text-red-600 font-mono">DELETE</strong> to confirm:
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3.5 py-2.5 rounded-xl border border-red-300 dark:border-red-900 bg-white dark:bg-[#16181D] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-500 text-red-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EFE6D5] dark:border-[#2C323F]">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#718096] hover:bg-[#FFF9EE] dark:hover:bg-[#1E222B]"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE' || isDeleting}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold text-xs shadow-sm transition-all"
            >
              {isDeleting ? 'Deleting Account...' : 'Permanently Delete Account'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

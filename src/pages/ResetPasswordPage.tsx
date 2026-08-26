import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle2, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface ResetPasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

export const ResetPasswordPage: React.FC = () => {
  const { updatePassword } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [completed, setCompleted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>();

  const newPassword = watch('newPassword', '');

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setLoading(true);
    try {
      await updatePassword(data.newPassword);
      setCompleted(true);
      success('Password Updated', 'Your password has been changed successfully.');
    } catch (err: any) {
      showError('Reset Failed', err.message || 'Unable to update password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-[22px] border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] shadow-card">
        {completed ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#EBF3ED] dark:bg-[#1C2C20] text-[#4F7A5A] border border-[#C7DFC9] dark:border-[#2A4730] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-[#1A202C] dark:text-white tracking-tight">
                Password Changed!
              </h2>
              <p className="text-xs text-[#718096] dark:text-[#A0AEC0]">
                Your CodeVault password has been updated securely. You can now login with your new credentials.
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 px-4 rounded-xl bg-[#E9B949] hover:bg-[#D4A32D] text-[#1A202C] font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In to CodeVault</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF9EE] dark:bg-[#2C210C] text-[#8C5D0B] dark:text-[#E9B949] border border-[#F8E0B0] dark:border-[#5C4212] flex items-center justify-center mx-auto shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1A202C] dark:text-white tracking-tight">
                Create New Password
              </h1>
              <p className="text-xs text-[#718096] dark:text-[#A0AEC0]">
                Enter a strong password for your CodeVault account.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-[#A0AEC0] mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#A0AEC0]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    disabled={loading}
                    {...register('newPassword', {
                      required: 'New password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-[#1A202C] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-[#A0AEC0] hover:text-[#2D3748] dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-xs text-[#C54A53] mt-1">{errors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-[#A0AEC0] mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#A0AEC0]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    disabled={loading}
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (val) => val === newPassword || 'Passwords do not match',
                    })}
                    placeholder="Repeat new password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-[#1A202C] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-[#C54A53] mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#E9B949] hover:bg-[#D4A32D] disabled:opacity-50 text-[#1A202C] font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

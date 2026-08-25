import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { User, AtSign, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onRequireOtp: (email: string) => void;
}

interface RegisterFormValues {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
  onRequireOtp,
}) => {
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const isSubmittingRef = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>();

  const password = watch('password', '');

  const onSubmit = async (data: RegisterFormValues) => {
    // Prevent double-clicks and concurrent submissions
    if (isSubmittingRef.current || loading) return;
    isSubmittingRef.current = true;
    setLoading(true);

    try {
      // Exactly ONE call to signUp
      await signUp({
        fullName: data.fullName.trim(),
        username: data.username.toLowerCase().trim(),
        email: data.email.trim(),
        password: data.password,
      });

      // On success, open OTP modal and close register modal
      onRequireOtp(data.email.trim());
      onClose();
    } catch {
      // On failure, re-enable button and reset ref so user can correct and retry
      isSubmittingRef.current = false;
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { label: 'None', width: '0%', color: 'bg-slate-300' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { label: 'Weak', width: '25%', color: 'bg-[#C54A53]' };
    if (score === 2) return { label: 'Fair', width: '50%', color: 'bg-[#C0841D]' };
    if (score === 3) return { label: 'Good', width: '75%', color: 'bg-[#E9B949]' };
    return { label: 'Strong', width: '100%', color: 'bg-[#4F7A5A]' };
  };

  const strength = getPasswordStrength();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title="Join CodeVault – Coders Space"
      description="Create your personal workspace to track DSA problems, review notes, and maintain streaks"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-[#A0AEC0] mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3 w-4 h-4 text-[#A0AEC0]" />
            <input
              type="text"
              disabled={loading}
              {...register('fullName', { required: 'Full Name is required' })}
              placeholder="e.g. Alex Rivera"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-[#1A202C] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#E9B949] disabled:opacity-60"
            />
          </div>
          {errors.fullName && (
            <p className="text-xs text-[#C54A53] mt-1">{errors.fullName.message}</p>
          )}
        </div>

        {/* Username */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-[#A0AEC0] mb-1.5">
            Username
          </label>
          <div className="relative">
            <AtSign className="absolute left-3.5 top-3 w-4 h-4 text-[#A0AEC0]" />
            <input
              type="text"
              disabled={loading}
              {...register('username', {
                required: 'Username is required',
                pattern: {
                  value: /^[a-zA-Z0-9_]{3,20}$/,
                  message: 'Username must be 3-20 characters (letters, numbers, underscore only)',
                },
              })}
              placeholder="e.g. alex_algo"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-[#1A202C] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#E9B949] disabled:opacity-60"
            />
          </div>
          {errors.username && (
            <p className="text-xs text-[#C54A53] mt-1">{errors.username.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-[#A0AEC0] mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#A0AEC0]" />
            <input
              type="email"
              disabled={loading}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              placeholder="alex@example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-[#1A202C] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#E9B949] disabled:opacity-60"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-[#C54A53] mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-[#A0AEC0] mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#A0AEC0]" />
            <input
              type="password"
              disabled={loading}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-[#1A202C] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#E9B949] disabled:opacity-60"
            />
          </div>
          {password && (
            <div className="mt-2">
              <div className="h-1.5 w-full bg-[#EFE6D5] dark:bg-[#2C323F] rounded-full overflow-hidden">
                <div
                  className={`h-full ${strength.color} transition-all duration-300`}
                  style={{ width: strength.width }}
                />
              </div>
              <span className="text-[10px] text-[#718096] mt-1 block">
                Strength: {strength.label}
              </span>
            </div>
          )}
          {errors.password && (
            <p className="text-xs text-[#C54A53] mt-1">{errors.password.message}</p>
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
              type="password"
              disabled={loading}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val: string) => val === password || 'Passwords do not match',
              })}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-[#1A202C] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#E9B949] disabled:opacity-60"
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-[#C54A53] mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit button with instant disable & loading indicator */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-[#E9B949] hover:bg-[#D4A32D] disabled:opacity-60 disabled:cursor-not-allowed text-[#1A202C] font-bold text-xs shadow-sm transition-all mt-4 flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending Verification OTP...</span>
            </>
          ) : (
            <>
              <span>Send Verification OTP</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Switch to login */}
        <p className="text-center text-xs text-[#718096] pt-2 border-t border-[#EFE6D5] dark:border-[#2C323F]">
          Already have an account?{' '}
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              onClose();
              onSwitchToLogin();
            }}
            className="text-[#B0831E] dark:text-[#E9B949] hover:underline font-bold"
          >
            Sign In
          </button>
        </p>
      </form>
    </Modal>
  );
};

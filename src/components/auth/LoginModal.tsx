import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Lock, LogIn, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister,
  onForgotPassword,
}) => {
  const { signIn, startGuestSession } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string; password?: string }>();

  const onSubmit = async (data: { email: string; password?: string }) => {
    setLoading(true);
    try {
      await signIn(data.email.trim(), data.password);
      onClose();
    } catch {
      // Error toast handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    startGuestSession();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title="Welcome to CodeVault – Coders Space"
      description="Enter your credentials to access your solved problems, streaks, and community rooms"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        {/* Email */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-[#A0AEC0] mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#A0AEC0]" />
            <input
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              placeholder="alex@example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-[#1A202C] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-[#C54A53] mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-[#A0AEC0]">
              Password
            </label>
            <button
              type="button"
              onClick={() => {
                onClose();
                onForgotPassword();
              }}
              className="text-xs text-[#B0831E] dark:text-[#E9B949] hover:underline"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#A0AEC0]" />
            <input
              type="password"
              {...register('password', { required: 'Password is required' })}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-[#1A202C] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
            />
          </div>
          {errors.password && (
            <p className="text-xs text-[#C54A53] mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <input
            id="remember_me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 text-[#E9B949] rounded border-[#EFE6D5] dark:border-[#2C323F] focus:ring-[#E9B949]"
          />
          <label htmlFor="remember_me" className="ml-2 text-xs text-[#718096]">
            Remember me on this device
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-[#E9B949] hover:bg-[#D4A32D] disabled:opacity-50 text-[#1A202C] font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {loading ? 'Signing In...' : 'Sign In'}
          <LogIn className="w-4 h-4" />
        </button>

        {/* Guest Demo shortcut */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full py-2.5 px-4 rounded-xl border border-[#F8E0B0] dark:border-[#5C4212] bg-[#FFF9EE] dark:bg-[#2C210C] hover:bg-[#FEF6E9] text-[#8C5D0B] dark:text-[#E9B949] font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Try Instant Demo (Guest Mode)
          </button>
        </div>

        {/* Switch to Register */}
        <p className="text-center text-xs text-[#718096] pt-2 border-t border-[#EFE6D5] dark:border-[#2C323F]">
          Don&apos;t have an account yet?{' '}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSwitchToRegister();
            }}
            className="text-[#B0831E] dark:text-[#E9B949] hover:underline font-bold"
          >
            Create an Account
          </button>
        </p>
      </form>
    </Modal>
  );
};

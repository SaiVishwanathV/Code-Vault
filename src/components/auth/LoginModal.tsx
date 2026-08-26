import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

interface LoginFormValues {
  identifier: string;
  password?: string;
  rememberMe?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSwitchToRegister,
  onForgotPassword,
}) => {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>();

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      await signIn(data.identifier.trim(), data.password);
      onClose();
    } catch {
      // Handled in AuthContext toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title="Welcome Back to CodeVault"
      description="Sign in with your email address or username to access your DSA tracker"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        {/* Email or Username */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A5568] dark:text-[#A0AEC0] mb-1.5">
            Email Address or Username
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#A0AEC0]" />
            <input
              type="text"
              {...register('identifier', {
                required: 'Please enter your email or username',
              })}
              placeholder="e.g. alex@example.com or @alex_codes"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-[#1A202C] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
            />
          </div>
          {errors.identifier && (
            <p className="text-xs text-[#C54A53] mt-1">{errors.identifier.message}</p>
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
              className="text-xs text-[#B0831E] dark:text-[#E9B949] hover:underline font-semibold"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#A0AEC0]" />
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password', { required: 'Password is required' })}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-[#FFFDF8] dark:bg-[#16181D] text-[#1A202C] dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#E9B949]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-[#A0AEC0] hover:text-[#2D3748] dark:hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-[#C54A53] mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center">
          <input
            id="remember_me"
            type="checkbox"
            {...register('rememberMe')}
            className="w-4 h-4 text-[#E9B949] rounded border-[#EFE6D5] dark:border-[#2C323F] focus:ring-[#E9B949] cursor-pointer"
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

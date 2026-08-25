import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, KeyRound, ArrowLeft, Send } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onBackToLogin,
}) => {
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>();

  const onSubmit = async (data: { email: string }) => {
    setLoading(true);
    try {
      await resetPassword(data.email.trim());
      setSent(true);
    } catch {
      // Handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title="Reset Your Password"
      description="Enter your registered email address to receive password reset instructions"
    >
      {sent ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <Mail className="w-7 h-7" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Reset Link Sent!
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-xs mx-auto">
            Please check your email inbox for instructions to securely reset your password.
          </p>
          <button
            onClick={() => {
              setSent(false);
              onClose();
              onBackToLogin();
            }}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-md"
          >
            Back to Sign In
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Sending Instructions...' : 'Send Reset Link'}
            <Send className="w-4 h-4" />
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                onClose();
                onBackToLogin();
              }}
              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

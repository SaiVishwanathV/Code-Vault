import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { Lock, ShieldAlert, Home, LogIn, UserX } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireAdmin?: boolean;
  onOpenLogin?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  onOpenLogin,
}) => {
  const { user, profile, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#E9B949] border-t-transparent animate-spin" />
        <span className="text-xs text-[#718096]">Authenticating session...</span>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#FFF9EE] dark:bg-[#2C210C] text-[#8C5D0B] dark:text-[#E9B949] border border-[#F8E0B0] dark:border-[#5C4212] flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-[#1A202C] dark:text-white tracking-tight">
            Authentication Required
          </h2>
          <p className="text-xs sm:text-sm text-[#718096] dark:text-[#A0AEC0] max-w-sm">
            Please login or register to access this section of CodeVault – Coders Space.
          </p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          {onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E9B949] hover:bg-[#D4A32D] text-[#1A202C] text-xs font-bold shadow-sm transition-all active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" /> Sign In to Continue
            </button>
          )}
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#EFE6D5] dark:border-[#2C323F] bg-white dark:bg-[#1E222B] hover:bg-[#FFF9EE] text-xs font-semibold text-[#2D3748] dark:text-[#E2E8F0] transition-colors"
          >
            <Home className="w-4 h-4" /> Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Suspended account check
  if (profile?.status === 'suspended') {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#FDF2F3] dark:bg-[#2E1416] text-[#C54A53] border border-[#F8D2D5] dark:border-[#521C20] flex items-center justify-center mx-auto shadow-sm">
          <UserX className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-[#1A202C] dark:text-white tracking-tight">
            Account Suspended
          </h2>
          <p className="text-xs sm:text-sm text-[#718096] dark:text-[#A0AEC0] max-w-md">
            Your account has been suspended by an administrator. Please contact support at{' '}
            <a href="mailto:code.v4ult@gmail.com" className="text-[#E9B949] underline font-bold">
              code.v4ult@gmail.com
            </a>{' '}
            for assistance.
          </p>
        </div>
        <button
          onClick={() => signOut()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C54A53] hover:bg-[#A83840] text-white text-xs font-bold shadow-sm transition-all"
        >
          Sign Out
        </button>
      </div>
    );
  }

  // Admin access check
  if (requireAdmin && profile?.role !== 'admin') {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#FDF2F3] dark:bg-[#2E1416] text-[#C54A53] border border-[#F8D2D5] dark:border-[#521C20] flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-[#1A202C] dark:text-white tracking-tight">
            403 - Admin Access Required
          </h2>
          <p className="text-xs sm:text-sm text-[#718096] dark:text-[#A0AEC0] max-w-sm">
            You do not have administrative privileges to view this workspace.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E9B949] hover:bg-[#D4A32D] text-[#1A202C] text-xs font-bold shadow-sm transition-all"
        >
          <Home className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return children;
};

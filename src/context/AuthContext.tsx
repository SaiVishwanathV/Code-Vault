import React, { createContext, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { authService, SignUpData } from '../services/authService';
import { profileService } from '../services/profileService';
import { Profile } from '../types';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  isGuest: boolean;
  isSupabaseConnected: boolean;
  signUp: (data: SignUpData) => Promise<any>;
  verifyOtp: (email: string, token: string) => Promise<any>;
  resendOtp: (email: string) => Promise<boolean>;
  signIn: (email: string, password?: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  startGuestSession: () => void;
  updateProfile: (data: Partial<Profile>) => Promise<Profile>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const { success, error: showError } = useToast();

  const isSupabaseConnected = isSupabaseConfigured();

  const refreshProfile = async () => {
    if (user?.id) {
      try {
        const prof = await profileService.getProfile(user.id);
        setProfile(prof);
      } catch (err) {
        console.error('Failed to refresh profile:', err);
      }
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        if (isSupabaseConfigured() && supabase) {
          // Check active session from Supabase
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            setUser(data.session.user);
            const prof = await profileService.getProfile(data.session.user.id);
            setProfile(prof);
            setIsGuest(false);
          } else {
            // Check local demo profile
            const localProf = authService.getCurrentStoredUser();
            if (localProf) {
              setUser({ id: localProf.id, email: localProf.email });
              setProfile(localProf);
              setIsGuest(localProf.id.startsWith('mock-'));
            }
          }

          // Listen to auth changes
          const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
              setUser(session.user);
              const prof = await profileService.getProfile(session.user.id);
              setProfile(prof);
              setIsGuest(false);
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              setProfile(null);
            }
          });

          return () => {
            authListener.subscription.unsubscribe();
          };
        } else {
          // Pure local storage mode
          const localProf = authService.getCurrentStoredUser();
          if (localProf) {
            setUser({ id: localProf.id, email: localProf.email });
            setProfile(localProf);
            setIsGuest(true);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signUp = async (data: SignUpData) => {
    try {
      const res = await authService.signUp(data);
      success('OTP Sent!', `A 6-digit verification code has been sent to ${data.email}`);
      return res;
    } catch (err: any) {
      showError('Registration Failed', err.message || 'Unable to register user.');
      throw err;
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    try {
      const res = await authService.verifyOtp(email, token);
      const userId = res.user?.id || `usr_${Date.now()}`;
      setUser({ id: userId, email });
      const prof = await profileService.getProfile(userId);
      setProfile(prof);
      success('Verification Successful', 'Welcome to CodeVault – Coders Space! Your profile is ready.');
      return res;
    } catch (err: any) {
      showError('Invalid OTP', err.message || 'The entered OTP code is incorrect or expired.');
      throw err;
    }
  };

  const resendOtp = async (email: string) => {
    try {
      await authService.resendOtp(email);
      success('OTP Resent', `A new verification code has been sent to ${email}`);
      return true;
    } catch (err: any) {
      showError('Resend Failed', err.message || 'Unable to resend OTP code.');
      throw err;
    }
  };

  const signIn = async (email: string, password?: string) => {
    try {
      const res = await authService.signIn(email, password);
      const userId = res.user?.id || `usr_${Date.now()}`;
      setUser({ id: userId, email });
      const prof = await profileService.getProfile(userId);
      setProfile(prof);
      success('Welcome Back!', `Logged in as ${prof.full_name || email}`);
      return res;
    } catch (err: any) {
      showError('Login Failed', err.message || 'Invalid email or password.');
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setProfile(null);
      setIsGuest(false);
      success('Logged Out', 'You have been signed out safely.');
    } catch (err: any) {
      showError('Sign Out Error', err.message);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
      success('Password Reset Sent', `Check ${email} for instructions to reset your password.`);
      return true;
    } catch (err: any) {
      showError('Password Reset Failed', err.message);
      throw err;
    }
  };

  const startGuestSession = () => {
    const guestProf = authService.startGuestSession();
    setUser({ id: guestProf.id, email: guestProf.email });
    setProfile(guestProf);
    setIsGuest(true);
    success('Demo Mode Active', 'Exploring CodeTracker Pro as guest with pre-populated DSA records.');
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!profile) throw new Error('No active profile to update');
    try {
      const updated = await profileService.updateProfile(profile.id, data);
      setProfile(updated);
      success('Profile Updated', 'Your profile information has been saved.');
      return updated;
    } catch (err: any) {
      showError('Update Failed', err.message || 'Unable to save profile changes.');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isGuest,
        isSupabaseConnected,
        signUp,
        verifyOtp,
        resendOtp,
        signIn,
        signOut,
        resetPassword,
        startGuestSession,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

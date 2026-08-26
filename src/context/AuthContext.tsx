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
  isSupabaseConnected: boolean;
  signUp: (data: SignUpData) => Promise<any>;
  verifyOtp: (email: string, token: string) => Promise<any>;
  resendOtp: (email: string) => Promise<boolean>;
  signIn: (identifier: string, password?: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  deleteOwnAccount: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<Profile>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { success, error: showError } = useToast();

  const isSupabaseConnected = isSupabaseConfigured();

  const refreshProfile = async () => {
    if (user?.id) {
      try {
        const prof = await profileService.getProfile(user.id);
        if (prof.status === 'suspended') {
          await signOut();
          showError('Account Suspended', 'Your account has been suspended. Please contact code.v4ult@gmail.com.');
          return;
        }
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
            const authUser = data.session.user;
            const prof = await profileService.getProfile(authUser.id);

            if (prof.status === 'suspended') {
              await authService.signOut();
              authService.clearSession();
              setUser(null);
              setProfile(null);
              showError('Account Suspended', 'Your account has been suspended by an administrator. Please contact code.v4ult@gmail.com for assistance.');
            } else {
              setUser(authUser);
              setProfile(prof);
            }
          } else {
            setUser(null);
            setProfile(null);
          }

          // Listen to auth changes
          const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
              const prof = await profileService.getProfile(session.user.id);
              if (prof.status === 'suspended') {
                await authService.signOut();
                authService.clearSession();
                setUser(null);
                setProfile(null);
                showError('Account Suspended', 'Your account has been suspended by an administrator.');
              } else {
                setUser(session.user);
                setProfile(prof);
              }
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              setProfile(null);
            }
          });

          return () => {
            authListener.subscription.unsubscribe();
          };
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Real-time security guard: check if user account is deleted or suspended by admin
  useEffect(() => {
    if (!user?.id || !isSupabaseConfigured() || !supabase) return;

    const channel = supabase
      .channel(`profile_guard_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        async (payload: any) => {
          if (payload.eventType === 'DELETE') {
            await authService.signOut();
            authService.clearSession();
            setUser(null);
            setProfile(null);
            showError('Account Removed', 'Your account has been removed by the administrator.');
          } else if (payload.new?.status === 'suspended') {
            await authService.signOut();
            authService.clearSession();
            setUser(null);
            setProfile(null);
            showError('Account Suspended', 'Your account has been suspended by an administrator.');
          } else if (payload.new) {
            setProfile(payload.new);
          }
        }
      )
      .subscribe();

    // 5-second background sanity heartbeat
    const interval = setInterval(async () => {
      if (user?.id && supabase) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('status')
            .eq('id', user.id)
            .maybeSingle();

          if (error || !data) {
            // User was removed by admin
            await authService.signOut();
            authService.clearSession();
            setUser(null);
            setProfile(null);
            showError('Account Removed', 'Your account has been removed by the administrator.');
          } else if (data.status === 'suspended') {
            await authService.signOut();
            authService.clearSession();
            setUser(null);
            setProfile(null);
            showError('Account Suspended', 'Your account has been suspended by an administrator.');
          }
        } catch {
          // ignore
        }
      }
    }, 5000);

    return () => {
      channel.unsubscribe();
      clearInterval(interval);
    };
  }, [user?.id]);

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
      const prof = await profileService.getProfile(userId);

      if (prof.status === 'suspended') {
        await authService.signOut();
        authService.clearSession();
        throw new Error('This account has been suspended by an administrator.');
      }

      setUser({ id: userId, email });
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

  const signIn = async (identifier: string, password?: string) => {
    try {
      const res = await authService.signIn(identifier, password);
      const userId = res.user?.id || `usr_${Date.now()}`;
      const prof = await profileService.getProfile(userId);

      if (prof.status === 'suspended') {
        await authService.signOut();
        authService.clearSession();
        throw new Error('Your account has been suspended by an administrator.');
      }

      setUser({ id: userId, email: prof.email || res.user?.email });
      setProfile(prof);
      success('Welcome Back!', `Logged in as ${prof.full_name || prof.username}`);
      return res;
    } catch (err: any) {
      showError('Login Failed', err.message || 'Invalid credentials.');
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      authService.clearSession();
      setUser(null);
      setProfile(null);
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

  const updatePassword = async (newPassword: string) => {
    try {
      await authService.updatePassword(newPassword);
      success('Password Updated', 'Your password has been changed successfully. You can now login.');
      return true;
    } catch (err: any) {
      showError('Password Update Failed', err.message);
      throw err;
    }
  };

  const deleteOwnAccount = async () => {
    try {
      await authService.deleteOwnAccount();
      setUser(null);
      setProfile(null);
      success('Account Deleted', 'Your account and all associated data have been permanently removed.');
    } catch (err: any) {
      showError('Delete Failed', err.message);
      throw err;
    }
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
        isSupabaseConnected,
        signUp,
        verifyOtp,
        resendOtp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        deleteOwnAccount,
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

import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { INITIAL_MOCK_PROFILE } from '../lib/mockData';
import { Profile } from '../types';

const LOCAL_STORAGE_USER_KEY = 'codevault_current_user';
const LOCAL_STORAGE_GUEST_KEY = 'codevault_guest_session';
const PENDING_OTP_EMAIL_KEY = 'codevault_pending_otp_email';
const PENDING_OTP_DATA_KEY = 'codevault_pending_otp_data';

export interface SignUpData {
  fullName: string;
  username: string;
  email: string;
  password?: string;
}

export const authService = {
  /**
   * Register a new user with Supabase Email OTP (called exactly once)
   */
  async signUp(data: SignUpData) {
    const role: 'user' | 'admin' =
      data.email.toLowerCase() === 'code.v4ult@gmail.com' ||
      data.email.toLowerCase() === 'admin@codevault.dev'
        ? 'admin'
        : 'user';

    if (isSupabaseConfigured() && supabase) {
      // Exactly ONE request to supabase.auth.signUp()
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password || 'TemporaryPassword123!',
        options: {
          data: {
            full_name: data.fullName.trim(),
            username: data.username.toLowerCase().trim(),
            role,
          },
        },
      });

      if (error) {
        throw error;
      }

      localStorage.setItem(PENDING_OTP_EMAIL_KEY, data.email.trim());
      return authData;
    } else {
      // Local persistent storage fallback when offline / unconfigured
      localStorage.setItem(PENDING_OTP_EMAIL_KEY, data.email.trim());
      localStorage.setItem(
        PENDING_OTP_DATA_KEY,
        JSON.stringify({
          id: `usr_${Date.now()}`,
          full_name: data.fullName.trim(),
          username: data.username.toLowerCase().trim(),
          email: data.email.trim(),
          target_goal: 500,
          role,
          status: 'active',
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        })
      );
      return { user: { email: data.email.trim() } };
    }
  },

  /**
   * Verify the 6-digit OTP code (called exactly once, no duplicate calls)
   */
  async verifyOtp(email: string, token: string) {
    if (isSupabaseConfigured() && supabase) {
      // Exactly ONE call to verifyOtp with signup type
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: 'signup',
      });

      if (error) {
        throw error;
      }

      return data;
    } else {
      // Local demo mode OTP validation
      if (!token || token.trim().length < 6) {
        throw new Error('Please enter a valid 6-digit OTP verification code.');
      }
      const rawPending = localStorage.getItem(PENDING_OTP_DATA_KEY);
      const profileData: Profile = rawPending
        ? JSON.parse(rawPending)
        : {
            ...INITIAL_MOCK_PROFILE,
            email: email.trim(),
            role:
              email.trim().toLowerCase() === 'code.v4ult@gmail.com'
                ? 'admin'
                : 'user',
            status: 'active',
          };

      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profileData));
      localStorage.removeItem(PENDING_OTP_DATA_KEY);
      localStorage.removeItem(PENDING_OTP_EMAIL_KEY);
      return { user: { id: profileData.id, email: email.trim() } };
    }
  },

  /**
   * Resend OTP verification code (only when explicitly requested by user)
   */
  async resendOtp(email: string) {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });
      if (error) throw error;
    }
    return true;
  },

  /**
   * Sign in with Email & Password
   */
  async signIn(email: string, password?: string) {
    const cleanEmail = email.trim();

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password || '',
      });
      if (error) throw error;

      // Check if user is suspended
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('status, role')
          .eq('id', data.user.id)
          .single();

        if (profile?.status === 'suspended') {
          await supabase.auth.signOut();
          throw new Error('This account has been suspended by an administrator.');
        }
      }

      return data;
    } else {
      // Local persistent authentication
      const isAdmin =
        cleanEmail.toLowerCase() === 'code.v4ult@gmail.com' ||
        cleanEmail.toLowerCase() === 'admin@codevault.dev';

      const userProfile: Profile = {
        ...INITIAL_MOCK_PROFILE,
        id: isAdmin ? 'admin-user-001' : 'user-patel-123',
        full_name: isAdmin ? 'CodeVault Administrator' : 'Vishwa Patel',
        username: isAdmin ? 'codevault_admin' : 'vishwa_codes',
        email: cleanEmail,
        role: isAdmin ? 'admin' : 'user',
        status: 'active',
      };

      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userProfile));
      return { user: { id: userProfile.id, email: cleanEmail } };
    }
  },

  /**
   * Request password reset email
   */
  async resetPassword(email: string) {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    }
    return true;
  },

  /**
   * Sign out
   */
  async signOut() {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    localStorage.removeItem(LOCAL_STORAGE_GUEST_KEY);
    localStorage.removeItem(PENDING_OTP_EMAIL_KEY);
  },

  /**
   * Get current stored profile (real profile only)
   */
  getCurrentStoredUser(): Profile | null {
    const raw = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && !parsed.id?.startsWith('mock-')) {
        return parsed;
      }
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      return null;
    } catch {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      return null;
    }
  },

  /**
   * Clear session
   */
  clearSession() {
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    localStorage.removeItem(LOCAL_STORAGE_GUEST_KEY);
    localStorage.removeItem(PENDING_OTP_EMAIL_KEY);
    localStorage.removeItem(PENDING_OTP_DATA_KEY);
  },
};

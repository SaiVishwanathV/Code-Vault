import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Profile } from '../types';

const LOCAL_STORAGE_USER_KEY = 'codevault_current_user';
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
   * Register a new user with Supabase Email OTP
   * Validates duplicate email and username before requesting signup
   */
  async signUp(data: SignUpData) {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanUsername = data.username.toLowerCase().trim().replace(/^@/, '');
    const cleanFullName = data.fullName.trim();

    const role: 'user' | 'admin' =
      cleanEmail === 'code.v4ult@gmail.com' || cleanEmail === 'admin@codevault.dev'
        ? 'admin'
        : 'user';

    if (isSupabaseConfigured() && supabase) {
      // 1. Check if email already exists in profiles
      const { data: existingEmail } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingEmail) {
        throw new Error('An account with this email already exists.');
      }

      // 2. Check if username already exists in profiles
      const { data: existingUsername } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', cleanUsername)
        .maybeSingle();

      if (existingUsername) {
        throw new Error(`Username '@${cleanUsername}' is already taken. Please choose a different username.`);
      }

      // 3. Register user in Supabase Auth
      const { data: authData, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: data.password || 'TemporaryPassword123!',
        options: {
          data: {
            full_name: cleanFullName,
            username: cleanUsername,
            role,
          },
        },
      });

      if (error) {
        if (
          error.message?.toLowerCase().includes('already registered') ||
          error.message?.toLowerCase().includes('unique') ||
          error.message?.toLowerCase().includes('exists')
        ) {
          throw new Error('An account with this email already exists.');
        }
        throw error;
      }

      localStorage.setItem(PENDING_OTP_EMAIL_KEY, cleanEmail);
      return authData;
    } else {
      // Local persistent storage fallback
      localStorage.setItem(PENDING_OTP_EMAIL_KEY, cleanEmail);
      localStorage.setItem(
        PENDING_OTP_DATA_KEY,
        JSON.stringify({
          id: `usr_${Date.now()}`,
          full_name: cleanFullName,
          username: cleanUsername,
          email: cleanEmail,
          target_goal: 500,
          role,
          status: 'active',
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        })
      );
      return { user: { email: cleanEmail } };
    }
  },

  /**
   * Verify the 6-digit OTP code
   */
  async verifyOtp(email: string, token: string) {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: token.trim(),
        type: 'signup',
      });

      if (error) {
        throw error;
      }

      return data;
    } else {
      if (!token || token.trim().length < 6) {
        throw new Error('Please enter a valid 6-digit OTP verification code.');
      }
      const rawPending = localStorage.getItem(PENDING_OTP_DATA_KEY);
      const profileData: Profile = rawPending
        ? JSON.parse(rawPending)
        : {
            id: `usr_${Date.now()}`,
            full_name: 'Coder',
            username: cleanEmail.split('@')[0],
            email: cleanEmail,
            role: cleanEmail === 'code.v4ult@gmail.com' ? 'admin' : 'user',
            status: 'active',
            target_goal: 500,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
          };

      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profileData));
      localStorage.removeItem(PENDING_OTP_DATA_KEY);
      localStorage.removeItem(PENDING_OTP_EMAIL_KEY);
      return { user: { id: profileData.id, email: cleanEmail } };
    }
  },

  /**
   * Resend OTP verification code
   */
  async resendOtp(email: string) {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
      });
      if (error) throw error;
    }
    return true;
  },

  /**
   * Sign in with Email OR Username
   */
  async signIn(identifier: string, password?: string) {
    const cleanIdentifier = identifier.trim();
    let emailToUse = cleanIdentifier;

    if (isSupabaseConfigured() && supabase) {
      // If user passed a username (no '@'), lookup their email in profiles
      if (!cleanIdentifier.includes('@')) {
        const usernameQuery = cleanIdentifier.replace(/^@/, '').toLowerCase();
        const { data: profileMatch, error: profErr } = await supabase
          .from('profiles')
          .select('email, username')
          .ilike('username', usernameQuery)
          .maybeSingle();

        if (profErr || !profileMatch?.email) {
          throw new Error(`No account found with username @${usernameQuery}. Please check your spelling.`);
        }
        emailToUse = profileMatch.email.trim();
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
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
          throw new Error('Your account has been suspended by an administrator.');
        }
      }

      return data;
    } else {
      const isAdmin =
        emailToUse.toLowerCase() === 'code.v4ult@gmail.com' ||
        emailToUse.toLowerCase() === 'admin@codevault.dev';

      const userProfile: Profile = {
        id: isAdmin ? 'admin-user-001' : 'user-patel-123',
        full_name: isAdmin ? 'CodeVault Administrator' : 'Vishwa Patel',
        username: isAdmin ? 'codevault_admin' : 'vishwa_codes',
        email: emailToUse,
        role: isAdmin ? 'admin' : 'user',
        status: 'active',
      };

      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userProfile));
      return { user: { id: userProfile.id, email: emailToUse } };
    }
  },

  /**
   * Request password reset email using Supabase Auth
   */
  async resetPassword(email: string) {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        throw error;
      }
    }
    return true;
  },

  /**
   * Update password for current session (e.g. after clicking reset link)
   */
  async updatePassword(newPassword: string) {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
    }
    return true;
  },

  /**
   * Self delete current user account
   */
  async deleteOwnAccount() {
    if (isSupabaseConfigured() && supabase) {
      // 1. Call secure RPC function
      const { error: rpcError } = await supabase.rpc('user_delete_own_account');
      if (rpcError) {
        // Fallback: delete profile row directly
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;
        if (userId) {
          await supabase.from('profiles').delete().eq('id', userId);
        }
      }
      await supabase.auth.signOut();
    }
    this.clearSession();
  },

  /**
   * Safe sign out
   */
  async signOut() {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    this.clearSession();
  },

  /**
   * Clear all local storage session traces
   */
  clearSession() {
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    localStorage.removeItem(PENDING_OTP_EMAIL_KEY);
    localStorage.removeItem(PENDING_OTP_DATA_KEY);
  },
};

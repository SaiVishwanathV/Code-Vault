import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Profile } from '../types';

export interface SignUpData {
  email: string;
  username: string;
  fullName: string;
  password?: string;
}

const LOCAL_STORAGE_USER_KEY = 'codevault_current_user_v1';
const PENDING_OTP_EMAIL_KEY = 'codevault_pending_otp_email';
const PENDING_OTP_DATA_KEY = 'codevault_pending_otp_data';

export const authService = {
  /**
   * Register a new user account with duplicate validation
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
      // 1. Check duplicate email and username via RPC or direct query
      try {
        const { data: checkData } = await supabase.rpc('check_user_exists', {
          p_email: cleanEmail,
          p_username: cleanUsername,
        });

        if (checkData) {
          if (checkData.email_exists) {
            throw new Error('Email already exists. Please sign in or use Forgot Password.');
          }
          if (checkData.username_exists) {
            throw new Error('Username already taken. Please choose another username.');
          }
        }
      } catch (rpcErr: any) {
        // Fallback to table check if RPC is not yet created
        if (rpcErr.message?.includes('Email already exists') || rpcErr.message?.includes('Username already taken')) {
          throw rpcErr;
        }

        try {
          const { data: existingEmail } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', cleanEmail)
            .maybeSingle();

          if (existingEmail) {
            throw new Error('Email already exists. Please sign in or use Forgot Password.');
          }

          const { data: existingUsername } = await supabase
            .from('profiles')
            .select('id')
            .ilike('username', cleanUsername)
            .maybeSingle();

          if (existingUsername) {
            throw new Error('Username already taken. Please choose another username.');
          }
        } catch (innerErr: any) {
          if (innerErr.message?.includes('Email already exists') || innerErr.message?.includes('Username already taken')) {
            throw innerErr;
          }
        }
      }

      // 2. Register user in Supabase Auth
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
        const msg = error.message?.toLowerCase() || '';
        if (msg.includes('already registered') || msg.includes('unique') || msg.includes('exists') || msg.includes('user already exists')) {
          throw new Error('Email already exists. Please sign in or use Forgot Password.');
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
   * Sign in with Email OR Username / User ID
   */
  async signIn(identifier: string, password?: string) {
    const cleanIdentifier = identifier.trim();
    let emailToUse = cleanIdentifier;

    if (isSupabaseConfigured() && supabase) {
      // If user passed a username (no '@'), lookup their email in profiles
      if (!cleanIdentifier.includes('@')) {
        const usernameQuery = cleanIdentifier.replace(/^@/, '').toLowerCase();

        // 1. Try secure RPC lookup
        let resolvedEmail: string | null = null;
        try {
          const { data: rpcEmail } = await supabase.rpc('get_email_by_username', {
            p_username: usernameQuery,
          });
          if (rpcEmail) {
            resolvedEmail = rpcEmail;
          }
        } catch {
          // fallback
        }

        // 2. Fallback to direct query on profiles
        if (!resolvedEmail) {
          try {
            const { data: profileMatch } = await supabase
              .from('profiles')
              .select('email, username')
              .ilike('username', usernameQuery)
              .maybeSingle();

            if (profileMatch?.email) {
              resolvedEmail = profileMatch.email;
            }
          } catch {
            // fallback
          }
        }

        if (!resolvedEmail) {
          throw new Error(`No account found with username @${usernameQuery}. Please verify your username or log in with your email.`);
        }

        emailToUse = resolvedEmail.trim();
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
   * Uses deployed domain https://c0dev4ult.web.app in production
   */
  async resetPassword(email: string) {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured() && supabase) {
      // Determine redirection URL: strictly use https://c0dev4ult.web.app/reset-password for production
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const redirectUrl = isLocalhost
        ? `${window.location.origin}/reset-password`
        : 'https://c0dev4ult.web.app/reset-password';

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
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
   * Permanently delete own account (Self Delete)
   */
  async deleteOwnAccount() {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.rpc('user_delete_own_account');
      if (error) throw error;
      await supabase.auth.signOut();
    }
    this.clearSession();
    return true;
  },

  /**
   * Sign out current user
   */
  async signOut() {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Supabase signOut error:', err);
      }
    }
    this.clearSession();
  },

  /**
   * Clear local session storage
   */
  clearSession() {
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    localStorage.removeItem(PENDING_OTP_EMAIL_KEY);
    localStorage.removeItem(PENDING_OTP_DATA_KEY);
  },
};

-- ==============================================================================
-- CodeVault – Coders Space (V2.1) - Supabase PostgreSQL Schema
-- Complete schema with Row Level Security (RLS), Role-Based Access Control, 
-- Admin Management, Platform Announcements, Community Rooms, Triggers & Indexes
-- ==============================================================================

-- 1. Create Profiles Table with Role and Status
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  college TEXT,
  branch TEXT,
  graduation_year INTEGER,
  bio TEXT,
  avatar_url TEXT,
  target_goal INTEGER DEFAULT 500,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  last_login TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Problems Table (Without solution_link, using markdown notes)
CREATE TABLE IF NOT EXISTS public.problems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  problem_id TEXT,
  problem_name TEXT NOT NULL,
  platform TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  topic TEXT NOT NULL,
  problem_link TEXT,
  notes TEXT,
  time_complexity TEXT DEFAULT 'O(n)',
  space_complexity TEXT DEFAULT 'O(1)',
  solved_date DATE DEFAULT CURRENT_DATE NOT NULL,
  time_taken INTEGER DEFAULT 0, -- in minutes
  favorite BOOLEAN DEFAULT FALSE,
  revision_needed BOOLEAN DEFAULT FALSE,
  revision_date DATE,
  revision_count INTEGER DEFAULT 0,
  last_revised_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Streaks Table
CREATE TABLE IF NOT EXISTS public.streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Platform Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('contest', 'placement', 'notice', 'general')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Community Chat Rooms Table
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  is_private BOOLEAN DEFAULT FALSE,
  max_members INTEGER DEFAULT 50,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  creator_username TEXT,
  creator_name TEXT,
  member_count INTEGER DEFAULT 1,
  category TEXT DEFAULT 'general',
  pinned_message_id TEXT,
  room_code TEXT,
  invited_usernames TEXT[] DEFAULT '{}'::text[],
  joined_user_ids UUID[] DEFAULT '{}'::uuid[],
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Community Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id TEXT PRIMARY KEY,
  room_id TEXT REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  reply_to JSONB,
  shared_problem JSONB,
  reactions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Achievements Table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_key TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_badge UNIQUE (user_id, badge_key)
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_problems_user_id ON public.problems(user_id);
CREATE INDEX IF NOT EXISTS idx_problems_solved_date ON public.problems(solved_date);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON public.problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON public.chat_messages(room_id, created_at);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.announcements(is_active, created_at DESC);

-- ==============================================================================
-- HELPER FUNCTIONS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    lower(COALESCE(auth.jwt() ->> 'email', '')) IN ('code.v4ult@gmail.com', 'admin@codevault.dev')
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles" 
  ON public.profiles FOR DELETE USING (public.is_admin());

-- 2. Problems Policies
DROP POLICY IF EXISTS "Users view their own problems, Admin views all" ON public.problems;
CREATE POLICY "Users view their own problems, Admin views all" 
  ON public.problems FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert their own problems" ON public.problems;
CREATE POLICY "Users can insert their own problems" 
  ON public.problems FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own problems" ON public.problems;
CREATE POLICY "Users can update their own problems" 
  ON public.problems FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete their own problems" ON public.problems;
CREATE POLICY "Users can delete their own problems" 
  ON public.problems FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- 3. Streaks Policies
DROP POLICY IF EXISTS "Streaks are viewable by authenticated users for leaderboard" ON public.streaks;
CREATE POLICY "Streaks are viewable by authenticated users for leaderboard" 
  ON public.streaks FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert their own streak record" ON public.streaks;
CREATE POLICY "Users can insert their own streak record" 
  ON public.streaks FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own streak record" ON public.streaks;
CREATE POLICY "Users can update their own streak record" 
  ON public.streaks FOR UPDATE USING (auth.uid() = user_id);

-- 4. Announcements Policies
DROP POLICY IF EXISTS "Announcements are viewable by everyone" ON public.announcements;
CREATE POLICY "Announcements are viewable by everyone" 
  ON public.announcements FOR SELECT USING (is_active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "Only admins can insert announcements" ON public.announcements;
CREATE POLICY "Only admins can insert announcements" 
  ON public.announcements FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only admins can update announcements" ON public.announcements;
CREATE POLICY "Only admins can update announcements" 
  ON public.announcements FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Only admins can delete announcements" ON public.announcements;
CREATE POLICY "Only admins can delete announcements" 
  ON public.announcements FOR DELETE USING (public.is_admin());

-- 5. Chat Rooms Policies
DROP POLICY IF EXISTS "Public rooms are viewable by all authenticated users" ON public.chat_rooms;
CREATE POLICY "Public rooms are viewable by all authenticated users" 
  ON public.chat_rooms FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can create rooms" ON public.chat_rooms;
CREATE POLICY "Authenticated users can create rooms" 
  ON public.chat_rooms FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Room creator or admin can update room" ON public.chat_rooms;
DROP POLICY IF EXISTS "Authenticated users can update room" ON public.chat_rooms;
CREATE POLICY "Authenticated users can update room" 
  ON public.chat_rooms FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Room creator or admin can delete room" ON public.chat_rooms;
CREATE POLICY "Room creator or admin can delete room" 
  ON public.chat_rooms FOR DELETE USING (auth.uid() = created_by OR public.is_admin());

-- 6. Chat Messages Policies
DROP POLICY IF EXISTS "Messages are viewable by authenticated users" ON public.chat_messages;
CREATE POLICY "Messages are viewable by authenticated users" 
  ON public.chat_messages FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can post messages" ON public.chat_messages;
CREATE POLICY "Authenticated users can post messages" 
  ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can update messages (pin/react)" ON public.chat_messages;
CREATE POLICY "Authenticated users can update messages (pin/react)" 
  ON public.chat_messages FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Author or admin can delete message" ON public.chat_messages;
CREATE POLICY "Author or admin can delete message" 
  ON public.chat_messages FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- ==============================================================================
-- AUTOMATIC AUTH USER TRIGGER (Creates profile & streak on signup)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  raw_username TEXT;
  raw_fullname TEXT;
  user_role TEXT;
BEGIN
  raw_username := COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  raw_fullname := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  
  -- Ensure username is not empty
  IF raw_username IS NULL OR raw_username = '' THEN
    raw_username := 'coder_' || substr(md5(random()::text), 1, 6);
  END IF;

  -- Check if admin email
  IF lower(new.email) = 'code.v4ult@gmail.com' OR lower(new.email) = 'admin@codevault.dev' THEN
    user_role := 'admin';
  ELSE
    user_role := 'user';
  END IF;

  -- Insert profile with safety exception handling
  BEGIN
    INSERT INTO public.profiles (id, email, username, full_name, avatar_url, role, status)
    VALUES (
      new.id,
      new.email,
      raw_username,
      raw_fullname,
      'https://api.dicebear.com/7.x/bottts/svg?seed=' || raw_username,
      user_role,
      'active'
    )
    ON CONFLICT (id) DO UPDATE SET
      last_login = timezone('utc'::text, now());
  EXCEPTION WHEN unique_violation THEN
    -- If username collision occurs, append random suffix
    INSERT INTO public.profiles (id, email, username, full_name, avatar_url, role, status)
    VALUES (
      new.id,
      new.email,
      raw_username || '_' || substr(md5(random()::text), 1, 4),
      raw_fullname,
      'https://api.dicebear.com/7.x/bottts/svg?seed=' || raw_username,
      user_role,
      'active'
    )
    ON CONFLICT (id) DO UPDATE SET
      last_login = timezone('utc'::text, now());
  WHEN OTHERS THEN
    NULL;
  END;

  -- Insert initial streak
  BEGIN
    INSERT INTO public.streaks (user_id, current_streak, longest_streak)
    VALUES (new.id, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN new;
END;
$$;

-- Trigger execution on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for auto updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_problems_updated_at ON public.problems;
CREATE TRIGGER update_problems_updated_at
  BEFORE UPDATE ON public.problems
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================================================
-- SECURE ADMIN BACKEND FUNCTIONS (RPCs)
-- ==============================================================================

-- 1. Permanently delete a user from public.profiles and auth.users
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Only administrators can delete users.';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own active administrator account.';
  END IF;

  -- Delete from profiles (cascades to problems, streaks, chat messages, rooms)
  DELETE FROM public.profiles WHERE id = target_user_id;

  -- Delete from auth.users so login is permanently revoked
  DELETE FROM auth.users WHERE id = target_user_id;

  RETURN TRUE;
END;
$$;

-- 2. Suspend or reactivate user account
CREATE OR REPLACE FUNCTION public.admin_update_user_status(target_user_id UUID, new_status TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Only administrators can change account status.';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot suspend your own administrator account.';
  END IF;

  IF new_status NOT IN ('active', 'suspended') THEN
    RAISE EXCEPTION 'Invalid status value.';
  END IF;

  UPDATE public.profiles 
  SET status = new_status, updated_at = now()
  WHERE id = target_user_id;

  RETURN TRUE;
END;
$$;

-- 3. Promote or demote user role (admin / user)
CREATE OR REPLACE FUNCTION public.admin_update_user_role(target_user_id UUID, new_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Only administrators can modify user roles.';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot demote your own administrator account.';
  END IF;

  IF new_role NOT IN ('user', 'admin') THEN
    RAISE EXCEPTION 'Invalid role value.';
  END IF;

  UPDATE public.profiles 
  SET role = new_role, updated_at = now()
  WHERE id = target_user_id;

  RETURN TRUE;
END;
$$;

-- Grant execute permissions to authenticated users (functions enforce is_admin internally)
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_status(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_role(UUID, TEXT) TO authenticated;

-- ==============================================================================
-- USER SELF DELETE FUNCTION
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.user_delete_own_account()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to delete account.';
  END IF;

  -- Delete from profiles (cascades all problems, streaks, chat messages, etc.)
  DELETE FROM public.profiles WHERE id = current_user_id;

  -- Delete from auth.users
  DELETE FROM auth.users WHERE id = current_user_id;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.user_delete_own_account() TO authenticated;

-- ==============================================================================
-- USERNAME EMAIL LOOKUP FUNCTION (Unauthenticated / Authenticated)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_email TEXT;
  clean_uname TEXT;
BEGIN
  clean_uname := lower(trim(replace(p_username, '@', '')));
  SELECT email INTO found_email
  FROM public.profiles
  WHERE lower(trim(replace(username, '@', ''))) = clean_uname
  LIMIT 1;

  RETURN found_email;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_email_by_username(TEXT) TO anon, authenticated;

-- ==============================================================================
-- DUPLICATE EMAIL / USERNAME VALIDATION FUNCTION
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.check_user_exists(p_email TEXT, p_username TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  email_exists BOOLEAN := FALSE;
  username_exists BOOLEAN := FALSE;
  clean_email TEXT := lower(trim(p_email));
  clean_uname TEXT := lower(trim(replace(p_username, '@', '')));
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE lower(email) = clean_email) THEN
    email_exists := TRUE;
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE lower(trim(replace(username, '@', ''))) = clean_uname) THEN
    username_exists := TRUE;
  END IF;

  RETURN jsonb_build_object(
    'email_exists', email_exists,
    'username_exists', username_exists
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_user_exists(TEXT, TEXT) TO anon, authenticated;

-- ==============================================================================
-- TOGGLE PIN CHAT MESSAGE FUNCTION
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.toggle_pin_chat_message(p_room_id TEXT, p_message_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_pin_state BOOLEAN;
  new_pin_state BOOLEAN;
BEGIN
  SELECT COALESCE(is_pinned, FALSE) INTO current_pin_state
  FROM public.chat_messages
  WHERE id = p_message_id AND room_id = p_room_id;

  IF current_pin_state IS NULL THEN
    RAISE EXCEPTION 'Message not found in the room.';
  END IF;

  new_pin_state := NOT current_pin_state;

  UPDATE public.chat_messages
  SET is_pinned = new_pin_state
  WHERE id = p_message_id AND room_id = p_room_id;

  RETURN new_pin_state;
END;
$$;

GRANT EXECUTE ON FUNCTION public.toggle_pin_chat_message(TEXT, TEXT) TO authenticated;




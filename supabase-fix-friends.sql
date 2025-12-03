-- ============================================
-- FIX FOR FRIEND REQUESTS SYSTEM
-- ============================================
-- This script creates the tables that match your JavaScript code
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CREATE PROFILES TABLE
-- ============================================
-- This table stores user profile information
-- It should be linked to auth.users

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Trigger for profiles updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can view own profile'
    ) THEN
        DROP POLICY "Users can view own profile" ON profiles;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can view friends profiles'
    ) THEN
        DROP POLICY "Users can view friends profiles" ON profiles;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can search profiles by email'
    ) THEN
        DROP POLICY "Users can search profiles by email" ON profiles;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can insert own profile'
    ) THEN
        DROP POLICY "Users can insert own profile" ON profiles;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can update own profile'
    ) THEN
        DROP POLICY "Users can update own profile" ON profiles;
    END IF;
END $$;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Policy: Users can search other users by email (for friend requests)
-- This allows users to find other users to send friend requests
CREATE POLICY "Users can search profiles by email"
    ON profiles FOR SELECT
    USING (
        -- Allow searching other users (not yourself)
        auth.uid() IS NOT NULL 
        AND id != auth.uid()
    );

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ============================================
-- CREATE FRIEND_REQUESTS TABLE
-- ============================================
-- This table matches what your JavaScript code expects

CREATE TABLE IF NOT EXISTS friend_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(sender_id, receiver_id),
    CHECK (sender_id != receiver_id)
);

-- Ensure all users have profiles before adding foreign keys
-- This prevents errors if friend_requests already has data
INSERT INTO profiles (id, email)
SELECT id, email 
FROM auth.users 
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- Add foreign keys to profiles for PostgREST to detect relationships
-- These are in addition to the auth.users references
-- Since profiles.id references auth.users(id), these will work correctly
DO $$
BEGIN
    -- Add foreign key for sender_id -> profiles if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_friend_requests_sender_profile'
    ) THEN
        ALTER TABLE friend_requests 
        ADD CONSTRAINT fk_friend_requests_sender_profile 
        FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key for receiver_id -> profiles if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_friend_requests_receiver_profile'
    ) THEN
        ALTER TABLE friend_requests 
        ADD CONSTRAINT fk_friend_requests_receiver_profile 
        FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Indexes for friend_requests
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender_status ON friend_requests(sender_id, status);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver_status ON friend_requests(receiver_id, status);

-- Trigger for friend_requests updated_at
DROP TRIGGER IF EXISTS update_friend_requests_updated_at ON friend_requests;
CREATE TRIGGER update_friend_requests_updated_at
    BEFORE UPDATE ON friend_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for friend_requests
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'friend_requests' 
        AND policyname = 'Users can view own friend requests'
    ) THEN
        DROP POLICY "Users can view own friend requests" ON friend_requests;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'friend_requests' 
        AND policyname = 'Users can create friend requests'
    ) THEN
        DROP POLICY "Users can create friend requests" ON friend_requests;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'friend_requests' 
        AND policyname = 'Users can update own friend requests'
    ) THEN
        DROP POLICY "Users can update own friend requests" ON friend_requests;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'friend_requests' 
        AND policyname = 'Users can delete own friend requests'
    ) THEN
        DROP POLICY "Users can delete own friend requests" ON friend_requests;
    END IF;
END $$;

-- Policy: Users can view friend requests where they are sender or receiver
CREATE POLICY "Users can view own friend requests"
    ON friend_requests FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Policy: Users can insert friend requests (as sender)
CREATE POLICY "Users can create friend requests"
    ON friend_requests FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- Policy: Users can update friend requests where they are involved
CREATE POLICY "Users can update own friend requests"
    ON friend_requests FOR UPDATE
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
    WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Policy: Users can delete friend requests where they are involved
CREATE POLICY "Users can delete own friend requests"
    ON friend_requests FOR DELETE
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- ============================================
-- ADD FRIENDS PROFILE POLICY (AFTER FRIEND_REQUESTS IS CREATED)
-- ============================================
-- Now we can create the policy that references friend_requests

-- Policy: Users can view friends' profiles
CREATE POLICY "Users can view friends profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM friend_requests
            WHERE status = 'accepted'
            AND (
                (sender_id = auth.uid() AND receiver_id = profiles.id)
                OR (sender_id = profiles.id AND receiver_id = auth.uid())
            )
        )
    );

-- ============================================
-- UPDATE USER_DATA AND SESSIONS POLICIES
-- ============================================
-- Update policies to allow friends to view each other's data

DO $$
BEGIN
    -- Drop existing policies that need to be updated
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_data' 
        AND policyname = 'Users can view own data'
    ) THEN
        DROP POLICY "Users can view own data" ON user_data;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'sessions' 
        AND policyname = 'Users can view own sessions'
    ) THEN
        DROP POLICY "Users can view own sessions" ON sessions;
    END IF;
END $$;

-- Updated Policy: Users can view their own data AND their friends' data
CREATE POLICY "Users can view own data"
    ON user_data FOR SELECT
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM friend_requests
            WHERE status = 'accepted'
            AND (
                (sender_id = auth.uid() AND receiver_id = user_data.user_id)
                OR (sender_id = user_data.user_id AND receiver_id = auth.uid())
            )
        )
    );

-- Updated Policy: Users can view their own sessions AND their friends' sessions
CREATE POLICY "Users can view own sessions"
    ON sessions FOR SELECT
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM friend_requests
            WHERE status = 'accepted'
            AND (
                (sender_id = auth.uid() AND receiver_id = sessions.user_id)
                OR (sender_id = sessions.user_id AND receiver_id = auth.uid())
            )
        )
    );

-- ============================================
-- FUNCTION TO AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================
-- This function automatically creates a profile when a user signs up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ADD COMMENTS
-- ============================================

COMMENT ON TABLE profiles IS 'Stores user profile information linked to auth.users';
COMMENT ON TABLE friend_requests IS 'Stores friendship requests between users. Status can be: pending, accepted, blocked, or declined.';
COMMENT ON COLUMN friend_requests.sender_id IS 'The user who sent the friendship request';
COMMENT ON COLUMN friend_requests.receiver_id IS 'The user who received the friendship request';
COMMENT ON COLUMN friend_requests.status IS 'Friendship status: pending, accepted, blocked, or declined';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Your JavaScript code should now work correctly!
-- 
-- The tables created:
-- 1. profiles - User profile information
-- 2. friend_requests - Friendship requests (matches your JS code)
--
-- Note: If you have existing users, you may need to manually create
-- their profiles or run:
-- INSERT INTO profiles (id, email) 
-- SELECT id, email FROM auth.users 
-- WHERE id NOT IN (SELECT id FROM profiles);
-- ============================================


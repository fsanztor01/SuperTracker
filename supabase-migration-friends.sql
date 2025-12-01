-- ============================================
-- SAFE MIGRATION SCRIPT FOR FRIENDSHIP SYSTEM
-- ============================================
-- This script can be run multiple times without errors
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CREATE FRIENDSHIPS TABLE
-- ============================================

-- Drop table if exists (only if you want to start fresh - comment out if you have data)
-- DROP TABLE IF EXISTS friendships CASCADE;

CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(requester_id, addressee_id),
    CHECK (requester_id != addressee_id)
);

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
CREATE INDEX IF NOT EXISTS idx_friendships_requester_status ON friendships(requester_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee_status ON friendships(addressee_id, status);

-- ============================================
-- CREATE TRIGGER FUNCTION (if not exists)
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- CREATE TRIGGER FOR FRIENDSHIPS
-- ============================================

DROP TRIGGER IF EXISTS update_friendships_updated_at ON friendships;
CREATE TRIGGER update_friendships_updated_at
    BEFORE UPDATE ON friendships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ENABLE RLS
-- ============================================

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DROP EXISTING POLICIES (if any)
-- ============================================

DO $$
BEGIN
    -- Drop friendships policies
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'friendships' 
        AND policyname = 'Users can view own friendships'
    ) THEN
        DROP POLICY "Users can view own friendships" ON friendships;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'friendships' 
        AND policyname = 'Users can create friendship requests'
    ) THEN
        DROP POLICY "Users can create friendship requests" ON friendships;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'friendships' 
        AND policyname = 'Users can update own friendships'
    ) THEN
        DROP POLICY "Users can update own friendships" ON friendships;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'friendships' 
        AND policyname = 'Users can delete own friendships'
    ) THEN
        DROP POLICY "Users can delete own friendships" ON friendships;
    END IF;
    
    -- Drop and recreate user_data and sessions policies to allow friend access
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

-- ============================================
-- CREATE FRIENDSHIPS POLICIES
-- ============================================

CREATE POLICY "Users can view own friendships"
    ON friendships FOR SELECT
    USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can create friendship requests"
    ON friendships FOR INSERT
    WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update own friendships"
    ON friendships FOR UPDATE
    USING (auth.uid() = requester_id OR auth.uid() = addressee_id)
    WITH CHECK (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can delete own friendships"
    ON friendships FOR DELETE
    USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- ============================================
-- UPDATE USER_DATA AND SESSIONS POLICIES
-- ============================================

-- Updated Policy: Users can view their own data AND their friends' data
CREATE POLICY "Users can view own data"
    ON user_data FOR SELECT
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM friendships
            WHERE status = 'accepted'
            AND (
                (requester_id = auth.uid() AND addressee_id = user_data.user_id)
                OR (requester_id = user_data.user_id AND addressee_id = auth.uid())
            )
        )
    );

-- Updated Policy: Users can view their own sessions AND their friends' sessions
CREATE POLICY "Users can view own sessions"
    ON sessions FOR SELECT
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM friendships
            WHERE status = 'accepted'
            AND (
                (requester_id = auth.uid() AND addressee_id = sessions.user_id)
                OR (requester_id = sessions.user_id AND addressee_id = auth.uid())
            )
        )
    );

-- ============================================
-- CREATE HELPER FUNCTIONS
-- ============================================

-- Function to check if two users are friends
CREATE OR REPLACE FUNCTION are_friends(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM friendships
        WHERE status = 'accepted'
        AND (
            (requester_id = user1_id AND addressee_id = user2_id)
            OR (requester_id = user2_id AND addressee_id = user1_id)
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get friend IDs for a user
CREATE OR REPLACE FUNCTION get_friend_ids(user_uuid UUID)
RETURNS TABLE(friend_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT CASE
        WHEN requester_id = user_uuid THEN addressee_id
        ELSE requester_id
    END AS friend_id
    FROM friendships
    WHERE status = 'accepted'
    AND (requester_id = user_uuid OR addressee_id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CREATE VIEWS
-- ============================================

CREATE OR REPLACE VIEW friendships_accepted AS
SELECT 
    f.id,
    f.requester_id,
    f.addressee_id,
    f.status,
    f.created_at,
    f.updated_at
FROM friendships f
WHERE f.status = 'accepted';

GRANT SELECT ON friendships_accepted TO authenticated;

-- ============================================
-- ADD COMMENTS
-- ============================================

COMMENT ON TABLE friendships IS 'Stores friendship relationships between users. Status can be: pending, accepted, blocked, or declined.';
COMMENT ON COLUMN friendships.requester_id IS 'The user who sent the friendship request';
COMMENT ON COLUMN friendships.addressee_id IS 'The user who received the friendship request';
COMMENT ON COLUMN friendships.status IS 'Friendship status: pending, accepted, blocked, or declined';
COMMENT ON FUNCTION are_friends IS 'Checks if two users are friends (status = accepted)';
COMMENT ON FUNCTION get_friend_ids IS 'Returns all friend IDs for a given user';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- You can now:
-- 1. Send friendship requests: INSERT INTO friendships (requester_id, addressee_id) VALUES (...)
-- 2. Accept requests: UPDATE friendships SET status = 'accepted' WHERE id = ...
-- 3. View friends' data: SELECT * FROM user_data WHERE user_id IN (SELECT friend_id FROM get_friend_ids(auth.uid()))
-- 4. View friends' sessions: SELECT * FROM sessions WHERE user_id IN (SELECT friend_id FROM get_friend_ids(auth.uid()))
-- ============================================


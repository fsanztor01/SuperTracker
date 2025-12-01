-- TrainTracker Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to create the necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Data Table
-- Stores all user data in a JSONB column for flexibility
CREATE TABLE IF NOT EXISTS user_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_data_updated_at
    BEFORE UPDATE ON user_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own data
CREATE POLICY "Users can view own data"
    ON user_data FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own data
CREATE POLICY "Users can insert own data"
    ON user_data FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
    ON user_data FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own data
CREATE POLICY "Users can delete own data"
    ON user_data FOR DELETE
    USING (auth.uid() = user_id);

-- Optional: Sessions table for better querying (if you want to query sessions separately)
-- This is optional - you can keep everything in JSONB or normalize it
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_data JSONB NOT NULL,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON sessions(user_id, date);

-- RLS for sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
    ON sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
    ON sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
    ON sessions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
    ON sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for sessions updated_at
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();






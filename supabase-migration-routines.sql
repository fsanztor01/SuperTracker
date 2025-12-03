-- Migration: Add routines table to Supabase
-- This migration adds a routines table similar to the sessions table
-- Run this SQL in your Supabase SQL Editor

-- Routines table for better querying (similar to sessions)
CREATE TABLE IF NOT EXISTS routines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    routine_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_routines_user_id ON routines(user_id);
CREATE INDEX IF NOT EXISTS idx_routines_created_at ON routines(created_at);
CREATE INDEX IF NOT EXISTS idx_routines_user_created ON routines(user_id, created_at);

-- Row Level Security (RLS) Policies
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own routines
CREATE POLICY "Users can view own routines"
    ON routines FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own routines
CREATE POLICY "Users can insert own routines"
    ON routines FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own routines
CREATE POLICY "Users can update own routines"
    ON routines FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own routines
CREATE POLICY "Users can delete own routines"
    ON routines FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_routines_updated_at
    BEFORE UPDATE ON routines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- Migration: Usage Logs Table
-- Creates usage_logs table for tracking AI generation events per user
-- Requirements: 1.1, 1.4

-- Create generation_type enum for type safety
CREATE TYPE public.generation_type AS ENUM (
  'lesson-plan',
  'activity',
  'worksheet',
  'quiz',
  'reading',
  'slides',
  'assessment',
  'file-upload'
);

-- Create tier enum for subscription levels
CREATE TYPE public.user_tier AS ENUM (
  'free',
  'premium',
  'enterprise'
);

-- Table: usage_logs
-- Stores usage tracking data for AI generation events
CREATE TABLE public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_type public.generation_type NOT NULL,
  tier public.user_tier NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Index for efficient monthly queries (user_id + month)
-- This index supports the primary query pattern: count usage per user per month
CREATE INDEX idx_usage_logs_user_month ON public.usage_logs (
  user_id,
  DATE_TRUNC('month', created_at)
);

-- Index for generation type filtering
CREATE INDEX idx_usage_logs_type ON public.usage_logs (generation_type);

-- Composite index for user + type queries within a time range
CREATE INDEX idx_usage_logs_user_type_created ON public.usage_logs (
  user_id,
  generation_type,
  created_at DESC
);

-- RLS Policies for usage_logs table

-- Users can view their own usage logs
CREATE POLICY "Users can view own usage logs"
  ON public.usage_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Service role can insert usage logs (Edge Functions use service role)
-- Users cannot directly insert - only through Edge Functions
CREATE POLICY "Service role can insert usage logs"
  ON public.usage_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow authenticated users to insert their own usage logs
-- This is needed for client-side tracking if required
CREATE POLICY "Users can insert own usage logs"
  ON public.usage_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users cannot update or delete usage logs (immutable audit trail)
-- No UPDATE or DELETE policies are created intentionally

-- Comment on table for documentation
COMMENT ON TABLE public.usage_logs IS 'Tracks AI generation events per user for usage-based billing and limits';
COMMENT ON COLUMN public.usage_logs.user_id IS 'Reference to the user who triggered the generation';
COMMENT ON COLUMN public.usage_logs.generation_type IS 'Type of AI generation (lesson-plan, activity, etc.)';
COMMENT ON COLUMN public.usage_logs.tier IS 'User tier at the time of generation';
COMMENT ON COLUMN public.usage_logs.metadata IS 'Additional metadata about the generation (optional)';

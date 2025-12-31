-- Migration: Unit Plans Table
-- Creates unit_plans table for multi-day instructional unit planning
-- Requirements: 2.1, 2.7, 13.1

-- Table: unit_plans
-- Stores unit plan definitions with standards alignment and lesson outlines
CREATE TABLE public.unit_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  standards TEXT[] NOT NULL DEFAULT '{}',
  duration_days INTEGER NOT NULL CHECK (duration_days > 0 AND duration_days <= 30),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  sub_skills JSONB NOT NULL DEFAULT '[]',
  lesson_outlines JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.unit_plans ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
-- Index for user_id queries (list user's unit plans)
CREATE INDEX idx_unit_plans_user_id ON public.unit_plans(user_id);

-- Index for date range queries (calendar view)
CREATE INDEX idx_unit_plans_date_range ON public.unit_plans(start_date, end_date);

-- Index for filtering by grade and subject
CREATE INDEX idx_unit_plans_grade_subject ON public.unit_plans(grade_level, subject);

-- Index for archived status filtering
CREATE INDEX idx_unit_plans_archived ON public.unit_plans(archived_at) WHERE archived_at IS NULL;

-- Trigger for updated_at timestamp
CREATE TRIGGER update_unit_plans_updated_at
  BEFORE UPDATE ON public.unit_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for unit_plans table

-- Users can create their own unit plans
CREATE POLICY "Users can create own unit plans"
  ON public.unit_plans FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can view their own unit plans
CREATE POLICY "Users can view own unit plans"
  ON public.unit_plans FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can update their own unit plans
CREATE POLICY "Users can update own unit plans"
  ON public.unit_plans FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own unit plans
CREATE POLICY "Users can delete own unit plans"
  ON public.unit_plans FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

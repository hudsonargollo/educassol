-- Migration: Lesson Plans Table
-- Creates lesson_plans table for daily instructional planning with version tracking
-- Requirements: 3.7, 13.1, 13.2, 13.4

-- Table: lesson_plans
-- Stores detailed daily lesson plans with phases, vocabulary, and assessments
CREATE TABLE public.lesson_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES public.unit_plans(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  topic TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  subject TEXT NOT NULL,
  duration INTEGER NOT NULL CHECK (duration > 0),
  standards TEXT[] NOT NULL DEFAULT '{}',
  learning_objective TEXT NOT NULL,
  key_vocabulary JSONB NOT NULL DEFAULT '[]',
  materials_needed TEXT[] DEFAULT '{}',
  phases JSONB NOT NULL DEFAULT '[]',
  formative_assessment JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'planned', 'in-progress', 'completed')),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;

-- Indexes for performance

-- Index for user_id queries (list user's lesson plans)
CREATE INDEX idx_lesson_plans_user_id ON public.lesson_plans(user_id);

-- Index for unit_id queries (get lessons in a unit)
CREATE INDEX idx_lesson_plans_unit_id ON public.lesson_plans(unit_id);

-- Index for date queries (calendar view)
CREATE INDEX idx_lesson_plans_date ON public.lesson_plans(date);

-- Index for status filtering
CREATE INDEX idx_lesson_plans_status ON public.lesson_plans(status);

-- Index for topic search (text pattern matching)
CREATE INDEX idx_lesson_plans_topic ON public.lesson_plans USING gin(to_tsvector('english', topic));

-- Index for standards search (array contains)
CREATE INDEX idx_lesson_plans_standards ON public.lesson_plans USING gin(standards);

-- Index for archived status filtering
CREATE INDEX idx_lesson_plans_archived ON public.lesson_plans(archived_at) WHERE archived_at IS NULL;

-- Composite index for common query patterns (user + date range)
CREATE INDEX idx_lesson_plans_user_date ON public.lesson_plans(user_id, date);

-- Trigger for updated_at timestamp
CREATE TRIGGER update_lesson_plans_updated_at
  BEFORE UPDATE ON public.lesson_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for lesson_plans table

-- Users can create their own lesson plans
CREATE POLICY "Users can create own lesson plans"
  ON public.lesson_plans FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can view their own lesson plans
CREATE POLICY "Users can view own lesson plans"
  ON public.lesson_plans FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can update their own lesson plans
CREATE POLICY "Users can update own lesson plans"
  ON public.lesson_plans FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own lesson plans
CREATE POLICY "Users can delete own lesson plans"
  ON public.lesson_plans FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

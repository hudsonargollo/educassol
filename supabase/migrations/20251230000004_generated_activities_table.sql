-- Migration: Generated Activities Table
-- Creates generated_activities table for quizzes, worksheets, readings, and slides
-- Requirements: 13.1, 13.3

-- Table: generated_activities
-- Stores AI-generated educational resources linked to lesson plans
CREATE TABLE public.generated_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_plan_id UUID NOT NULL REFERENCES public.lesson_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('quiz', 'worksheet', 'reading', 'slides')),
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.generated_activities ENABLE ROW LEVEL SECURITY;

-- Indexes for performance

-- Index for lesson_plan_id queries (get activities for a lesson)
CREATE INDEX idx_generated_activities_lesson_id ON public.generated_activities(lesson_plan_id);

-- Index for user_id queries (list user's activities)
CREATE INDEX idx_generated_activities_user_id ON public.generated_activities(user_id);

-- Index for type filtering
CREATE INDEX idx_generated_activities_type ON public.generated_activities(type);

-- Composite index for common query pattern (lesson + type)
CREATE INDEX idx_generated_activities_lesson_type ON public.generated_activities(lesson_plan_id, type);

-- Index for archived status filtering
CREATE INDEX idx_generated_activities_archived ON public.generated_activities(archived_at) WHERE archived_at IS NULL;

-- Trigger for updated_at timestamp
CREATE TRIGGER update_generated_activities_updated_at
  BEFORE UPDATE ON public.generated_activities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for generated_activities table

-- Users can create activities for their own lesson plans
CREATE POLICY "Users can create own activities"
  ON public.generated_activities FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND lesson_plan_id IN (
      SELECT id FROM public.lesson_plans WHERE user_id = auth.uid()
    )
  );

-- Users can view their own activities
CREATE POLICY "Users can view own activities"
  ON public.generated_activities FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can update their own activities
CREATE POLICY "Users can update own activities"
  ON public.generated_activities FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own activities
CREATE POLICY "Users can delete own activities"
  ON public.generated_activities FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

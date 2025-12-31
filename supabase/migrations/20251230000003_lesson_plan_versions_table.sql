-- Migration: Lesson Plan Versions Table
-- Creates lesson_plan_versions table for version history and rollback support
-- Requirements: 13.2

-- Table: lesson_plan_versions
-- Stores historical versions of lesson plans for rollback capability
CREATE TABLE public.lesson_plan_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_plan_id UUID NOT NULL REFERENCES public.lesson_plans(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(lesson_plan_id, version)
);

-- Enable Row Level Security
ALTER TABLE public.lesson_plan_versions ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_lesson_plan_versions_lesson_id ON public.lesson_plan_versions(lesson_plan_id);
CREATE INDEX idx_lesson_plan_versions_version ON public.lesson_plan_versions(lesson_plan_id, version DESC);

-- Function to auto-create version on lesson plan update
CREATE OR REPLACE FUNCTION public.create_lesson_plan_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create version if content has actually changed
  IF OLD.topic IS DISTINCT FROM NEW.topic
     OR OLD.learning_objective IS DISTINCT FROM NEW.learning_objective
     OR OLD.key_vocabulary IS DISTINCT FROM NEW.key_vocabulary
     OR OLD.phases IS DISTINCT FROM NEW.phases
     OR OLD.formative_assessment IS DISTINCT FROM NEW.formative_assessment
     OR OLD.materials_needed IS DISTINCT FROM NEW.materials_needed
     OR OLD.standards IS DISTINCT FROM NEW.standards
  THEN
    -- Insert the OLD version into history
    INSERT INTO public.lesson_plan_versions (
      lesson_plan_id,
      version,
      content,
      created_by
    ) VALUES (
      OLD.id,
      OLD.version,
      jsonb_build_object(
        'topic', OLD.topic,
        'grade_level', OLD.grade_level,
        'subject', OLD.subject,
        'duration', OLD.duration,
        'standards', OLD.standards,
        'learning_objective', OLD.learning_objective,
        'key_vocabulary', OLD.key_vocabulary,
        'materials_needed', OLD.materials_needed,
        'phases', OLD.phases,
        'formative_assessment', OLD.formative_assessment,
        'status', OLD.status,
        'date', OLD.date
      ),
      OLD.user_id
    );
    
    -- Increment version number on the new record
    NEW.version := OLD.version + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create version before update
CREATE TRIGGER create_lesson_plan_version_trigger
  BEFORE UPDATE ON public.lesson_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.create_lesson_plan_version();

-- RLS Policies for lesson_plan_versions table

-- Users can view versions of their own lesson plans
CREATE POLICY "Users can view own lesson plan versions"
  ON public.lesson_plan_versions FOR SELECT
  TO authenticated
  USING (
    lesson_plan_id IN (
      SELECT id FROM public.lesson_plans WHERE user_id = auth.uid()
    )
  );

-- System can insert versions (via trigger)
-- No direct insert policy needed as trigger runs with SECURITY DEFINER

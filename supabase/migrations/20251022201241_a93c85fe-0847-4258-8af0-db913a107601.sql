-- Add methodology enum
CREATE TYPE public.content_methodology AS ENUM (
  'active_learning',
  'traditional',
  'project_based',
  'gamification',
  'flipped_classroom',
  'collaborative',
  'inquiry_based'
);

-- Add difficulty level enum
CREATE TYPE public.difficulty_level AS ENUM ('basic', 'intermediate', 'advanced');

-- Add more fields to generated_content for richer specifications
ALTER TABLE public.generated_content
ADD COLUMN methodology content_methodology DEFAULT 'traditional',
ADD COLUMN duration_minutes integer,
ADD COLUMN accessibility_options text[] DEFAULT '{}',
ADD COLUMN materials_needed text[] DEFAULT '{}',
ADD COLUMN objectives text[] DEFAULT '{}',
ADD COLUMN difficulty_level difficulty_level DEFAULT 'intermediate',
ADD COLUMN student_age_range text,
ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;

-- Update content_templates with methodology support
ALTER TABLE public.content_templates
ADD COLUMN methodology content_methodology[] DEFAULT '{}',
ADD COLUMN supports_accessibility boolean DEFAULT true;
-- Migration: Automated Assessment Tables
-- Creates exams, submissions, and results tables for the automated assessment feature
-- Requirements: 1.1, 7.3

-- Table: exams
-- Stores exam definitions with rubrics for automated grading
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  educator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  rubric JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- Table: submissions
-- Stores uploaded exam files and their processing status
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_identifier TEXT,
  storage_path TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'jpeg', 'png')),
  file_size_bytes INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('uploaded', 'processing', 'graded', 'failed')) DEFAULT 'uploaded',
  error_message TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;


-- Table: results
-- Stores AI grading output with generated column for total_score extraction
CREATE TABLE public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL UNIQUE REFERENCES public.submissions(id) ON DELETE CASCADE,
  ai_output JSONB NOT NULL,
  total_score NUMERIC GENERATED ALWAYS AS ((ai_output->>'total_score')::numeric) STORED,
  pdf_report_url TEXT,
  verification_token UUID NOT NULL DEFAULT gen_random_uuid(),
  graded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_exams_educator ON public.exams(educator_id);
CREATE INDEX idx_exams_school ON public.exams(school_id);
CREATE INDEX idx_exams_class ON public.exams(class_id);
CREATE INDEX idx_exams_status ON public.exams(status);
CREATE INDEX idx_submissions_exam ON public.submissions(exam_id);
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_results_verification ON public.results(verification_token);
CREATE INDEX idx_results_submission ON public.results(submission_id);

-- Triggers for updated_at on exams table
CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON public.exams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for exams table

-- Educators can create exams in their school
CREATE POLICY "Educators can create exams"
  ON public.exams FOR INSERT
  TO authenticated
  WITH CHECK (
    educator_id = auth.uid()
    AND school_id = public.get_user_school_id(auth.uid())
  );

-- Educators can view their own exams
CREATE POLICY "Educators can view own exams"
  ON public.exams FOR SELECT
  TO authenticated
  USING (educator_id = auth.uid());

-- School admins can view all exams in their school
CREATE POLICY "School admins can view school exams"
  ON public.exams FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'school_admin')
    AND school_id = public.get_user_school_id(auth.uid())
  );


-- Educators can update their own exams
CREATE POLICY "Educators can update own exams"
  ON public.exams FOR UPDATE
  TO authenticated
  USING (educator_id = auth.uid())
  WITH CHECK (educator_id = auth.uid());

-- Educators can delete their own exams (only if no submissions exist - enforced at application level)
CREATE POLICY "Educators can delete own exams"
  ON public.exams FOR DELETE
  TO authenticated
  USING (educator_id = auth.uid());

-- RLS Policies for submissions table

-- Educators can create submissions for their exams
CREATE POLICY "Educators can create submissions"
  ON public.submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    exam_id IN (SELECT id FROM public.exams WHERE educator_id = auth.uid())
  );

-- Educators can view submissions for their exams
CREATE POLICY "Educators can view own exam submissions"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (
    exam_id IN (SELECT id FROM public.exams WHERE educator_id = auth.uid())
  );

-- School admins can view submissions for exams in their school
CREATE POLICY "School admins can view school submissions"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'school_admin')
    AND exam_id IN (
      SELECT id FROM public.exams 
      WHERE school_id = public.get_user_school_id(auth.uid())
    )
  );

-- Educators can update submissions for their exams (for status updates)
CREATE POLICY "Educators can update own exam submissions"
  ON public.submissions FOR UPDATE
  TO authenticated
  USING (
    exam_id IN (SELECT id FROM public.exams WHERE educator_id = auth.uid())
  )
  WITH CHECK (
    exam_id IN (SELECT id FROM public.exams WHERE educator_id = auth.uid())
  );

-- Educators can delete submissions for their exams
CREATE POLICY "Educators can delete own exam submissions"
  ON public.submissions FOR DELETE
  TO authenticated
  USING (
    exam_id IN (SELECT id FROM public.exams WHERE educator_id = auth.uid())
  );


-- RLS Policies for results table

-- Educators can create results for submissions of their exams
CREATE POLICY "Educators can create results"
  ON public.results FOR INSERT
  TO authenticated
  WITH CHECK (
    submission_id IN (
      SELECT s.id FROM public.submissions s
      JOIN public.exams e ON s.exam_id = e.id
      WHERE e.educator_id = auth.uid()
    )
  );

-- Educators can view results for their exam submissions
CREATE POLICY "Educators can view own exam results"
  ON public.results FOR SELECT
  TO authenticated
  USING (
    submission_id IN (
      SELECT s.id FROM public.submissions s
      JOIN public.exams e ON s.exam_id = e.id
      WHERE e.educator_id = auth.uid()
    )
  );

-- School admins can view results for exams in their school
CREATE POLICY "School admins can view school results"
  ON public.results FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'school_admin')
    AND submission_id IN (
      SELECT s.id FROM public.submissions s
      JOIN public.exams e ON s.exam_id = e.id
      WHERE e.school_id = public.get_user_school_id(auth.uid())
    )
  );

-- Educators can update results for their exam submissions (for PDF URL updates)
CREATE POLICY "Educators can update own exam results"
  ON public.results FOR UPDATE
  TO authenticated
  USING (
    submission_id IN (
      SELECT s.id FROM public.submissions s
      JOIN public.exams e ON s.exam_id = e.id
      WHERE e.educator_id = auth.uid()
    )
  )
  WITH CHECK (
    submission_id IN (
      SELECT s.id FROM public.submissions s
      JOIN public.exams e ON s.exam_id = e.id
      WHERE e.educator_id = auth.uid()
    )
  );

-- Public access for verification (read-only by verification_token)
-- This allows anyone with a valid token to verify a grade
CREATE POLICY "Public can verify results by token"
  ON public.results FOR SELECT
  TO anon
  USING (verification_token IS NOT NULL);

-- Enable Realtime for submissions table (for status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;

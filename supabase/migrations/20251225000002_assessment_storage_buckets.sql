-- Migration: Assessment Storage Buckets
-- Creates storage buckets for raw exam uploads and graded PDF reports
-- Requirements: 2.3, 5.4

-- Create bucket for raw exam uploads (PDFs and images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'raw-exams',
  'raw-exams',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
);

-- Create bucket for graded PDF reports
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'graded-reports',
  'graded-reports',
  false,
  20971520, -- 20MB limit for generated PDFs
  ARRAY['application/pdf']
);

-- Storage policies for raw-exams bucket

-- Authenticated users can upload to their own folder
CREATE POLICY "Users can upload raw exams"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'raw-exams'
    AND (storage.foldername(name))[1] = 'user_' || auth.uid()::text
  );

-- Users can view their own uploaded exams
CREATE POLICY "Users can view own raw exams"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'raw-exams'
    AND (storage.foldername(name))[1] = 'user_' || auth.uid()::text
  );

-- Users can delete their own uploaded exams
CREATE POLICY "Users can delete own raw exams"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'raw-exams'
    AND (storage.foldername(name))[1] = 'user_' || auth.uid()::text
  );

-- Storage policies for graded-reports bucket

-- Authenticated users can upload graded reports (via Edge Functions)
CREATE POLICY "Service can upload graded reports"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'graded-reports');

-- Users can view graded reports for their exam results
CREATE POLICY "Users can view own graded reports"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'graded-reports'
    AND EXISTS (
      SELECT 1 FROM public.results r
      JOIN public.submissions s ON r.submission_id = s.id
      JOIN public.exams e ON s.exam_id = e.id
      WHERE r.pdf_report_url LIKE '%' || name || '%'
      AND e.educator_id = auth.uid()
    )
  );

-- School admins can view graded reports for their school
CREATE POLICY "School admins can view school graded reports"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'graded-reports'
    AND public.has_role(auth.uid(), 'school_admin')
    AND EXISTS (
      SELECT 1 FROM public.results r
      JOIN public.submissions s ON r.submission_id = s.id
      JOIN public.exams e ON s.exam_id = e.id
      WHERE r.pdf_report_url LIKE '%' || name || '%'
      AND e.school_id = public.get_user_school_id(auth.uid())
    )
  );

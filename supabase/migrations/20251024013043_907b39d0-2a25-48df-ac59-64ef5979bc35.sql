-- Allow all authenticated users to view schools for selection
CREATE POLICY "Authenticated users can view schools for selection"
ON public.schools
FOR SELECT
TO authenticated
USING (true);
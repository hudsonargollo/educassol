-- Add INSERT policy for teachers to create classes in their school
CREATE POLICY "Teachers can create classes in their school"
ON public.classes
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'teacher'::app_role) 
  AND teacher_id = auth.uid() 
  AND school_id = get_user_school_id(auth.uid())
);
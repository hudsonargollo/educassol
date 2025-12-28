-- Fix the classes RLS policies for teachers
-- The previous policies were too restrictive and required school_id to match 
-- the user's profile school_id, which fails when teachers are creating their first class.

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Teachers can create classes in their school" ON public.classes;
DROP POLICY IF EXISTS "Teachers can view classes in their school" ON public.classes;
DROP POLICY IF EXISTS "Teachers can create classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can update their own classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can delete their own classes" ON public.classes;

-- Create permissive policies for teachers
-- Teachers can create classes where they are the teacher
CREATE POLICY "Teachers can create classes"
ON public.classes
FOR INSERT
TO authenticated
WITH CHECK (
  teacher_id = auth.uid()
);

-- Teachers can view their own classes (by teacher_id)
CREATE POLICY "Teachers can view their own classes"
ON public.classes
FOR SELECT
TO authenticated
USING (
  teacher_id = auth.uid()
);

-- Teachers can update their own classes
CREATE POLICY "Teachers can update their own classes"
ON public.classes
FOR UPDATE
TO authenticated
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

-- Teachers can delete their own classes
CREATE POLICY "Teachers can delete their own classes"
ON public.classes
FOR DELETE
TO authenticated
USING (teacher_id = auth.uid());

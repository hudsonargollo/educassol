-- Add student and ANE information to classes table
ALTER TABLE public.classes
ADD COLUMN total_alunos integer,
ADD COLUMN possui_ane boolean DEFAULT false,
ADD COLUMN detalhes_ane text;

COMMENT ON COLUMN public.classes.total_alunos IS 'Total number of students in the class';
COMMENT ON COLUMN public.classes.possui_ane IS 'Indicates if class has students with special needs (ANE)';
COMMENT ON COLUMN public.classes.detalhes_ane IS 'Details about special needs students for AI contextualization';
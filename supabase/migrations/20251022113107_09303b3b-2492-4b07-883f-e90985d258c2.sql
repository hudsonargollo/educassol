-- Create role enum
CREATE TYPE public.app_role AS ENUM ('district_admin', 'school_admin', 'teacher');

-- Create districts table
CREATE TABLE public.districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;

-- Create schools table
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  district_id UUID REFERENCES public.districts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  grade TEXT NOT NULL,
  subject TEXT NOT NULL,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Create content_templates table
CREATE TABLE public.content_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('activity', 'project', 'test', 'assessment', 'quiz')),
  title TEXT NOT NULL,
  description TEXT,
  grade_levels TEXT[] NOT NULL DEFAULT '{}',
  subjects TEXT[] NOT NULL DEFAULT '{}',
  prompt_template TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.content_templates ENABLE ROW LEVEL SECURITY;

-- Create generated_content table
CREATE TABLE public.generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('lesson_plan', 'activity', 'assessment')),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  bncc_codes TEXT[] DEFAULT '{}',
  prompt TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to get user's school_id
CREATE OR REPLACE FUNCTION public.get_user_school_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school_id FROM public.profiles WHERE id = _user_id
$$;

-- Create function to get user's district_id
CREATE OR REPLACE FUNCTION public.get_user_district_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT district_id FROM public.profiles WHERE id = _user_id
$$;

-- RLS Policies for districts
CREATE POLICY "District admins can view their districts"
  ON public.districts FOR SELECT
  USING (
    public.has_role(auth.uid(), 'district_admin') 
    AND id = public.get_user_district_id(auth.uid())
  );

CREATE POLICY "District admins can update their districts"
  ON public.districts FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'district_admin') 
    AND id = public.get_user_district_id(auth.uid())
  );

-- RLS Policies for schools
CREATE POLICY "District admins can manage schools in their district"
  ON public.schools FOR ALL
  USING (
    public.has_role(auth.uid(), 'district_admin') 
    AND district_id = public.get_user_district_id(auth.uid())
  );

CREATE POLICY "School admins can view their school"
  ON public.schools FOR SELECT
  USING (
    public.has_role(auth.uid(), 'school_admin') 
    AND id = public.get_user_school_id(auth.uid())
  );

CREATE POLICY "Teachers can view their school"
  ON public.schools FOR SELECT
  USING (
    public.has_role(auth.uid(), 'teacher') 
    AND id = public.get_user_school_id(auth.uid())
  );

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "School admins can view profiles in their school"
  ON public.profiles FOR SELECT
  USING (
    public.has_role(auth.uid(), 'school_admin') 
    AND school_id = public.get_user_school_id(auth.uid())
  );

CREATE POLICY "District admins can view profiles in their district"
  ON public.profiles FOR SELECT
  USING (
    public.has_role(auth.uid(), 'district_admin') 
    AND district_id = public.get_user_district_id(auth.uid())
  );

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "School admins can view roles in their school"
  ON public.user_roles FOR SELECT
  USING (
    public.has_role(auth.uid(), 'school_admin')
    AND user_id IN (
      SELECT id FROM public.profiles 
      WHERE school_id = public.get_user_school_id(auth.uid())
    )
  );

-- RLS Policies for classes
CREATE POLICY "School admins can manage classes in their school"
  ON public.classes FOR ALL
  USING (
    public.has_role(auth.uid(), 'school_admin') 
    AND school_id = public.get_user_school_id(auth.uid())
  );

CREATE POLICY "Teachers can view classes in their school"
  ON public.classes FOR SELECT
  USING (
    public.has_role(auth.uid(), 'teacher') 
    AND school_id = public.get_user_school_id(auth.uid())
  );

-- RLS Policies for content_templates
CREATE POLICY "All authenticated users can view templates"
  ON public.content_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "School admins can manage templates"
  ON public.content_templates FOR ALL
  USING (public.has_role(auth.uid(), 'school_admin'));

CREATE POLICY "District admins can manage templates"
  ON public.content_templates FOR ALL
  USING (public.has_role(auth.uid(), 'district_admin'));

-- RLS Policies for generated_content
CREATE POLICY "Teachers can create their own content"
  ON public.generated_content FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'teacher') 
    AND author_id = auth.uid()
    AND school_id = public.get_user_school_id(auth.uid())
  );

CREATE POLICY "Teachers can view their own content"
  ON public.generated_content FOR SELECT
  USING (
    public.has_role(auth.uid(), 'teacher') 
    AND author_id = auth.uid()
  );

CREATE POLICY "Teachers can update their own content"
  ON public.generated_content FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'teacher') 
    AND author_id = auth.uid()
  );

CREATE POLICY "Teachers can delete their own content"
  ON public.generated_content FOR DELETE
  USING (
    public.has_role(auth.uid(), 'teacher') 
    AND author_id = auth.uid()
  );

CREATE POLICY "School admins can view content in their school"
  ON public.generated_content FOR SELECT
  USING (
    public.has_role(auth.uid(), 'school_admin') 
    AND school_id = public.get_user_school_id(auth.uid())
  );

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_districts_updated_at
  BEFORE UPDATE ON public.districts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_templates_updated_at
  BEFORE UPDATE ON public.content_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_generated_content_updated_at
  BEFORE UPDATE ON public.generated_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
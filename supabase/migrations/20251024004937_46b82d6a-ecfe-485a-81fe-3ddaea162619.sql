-- Add city field to schools table
ALTER TABLE public.schools 
ADD COLUMN city TEXT NOT NULL DEFAULT 'Jequié';

-- Add index for faster city-based queries
CREATE INDEX idx_schools_city ON public.schools(city);

-- First, ensure we have a default district
INSERT INTO public.districts (id, name) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Secretaria Municipal de Educação - Jequié')
ON CONFLICT (id) DO NOTHING;

-- Insert some example schools for each city
INSERT INTO public.schools (name, city, district_id) VALUES
  ('Escola Municipal José de Alencar', 'Jequié', '00000000-0000-0000-0000-000000000001'),
  ('Escola Municipal Castro Alves', 'Jequié', '00000000-0000-0000-0000-000000000001'),
  ('Escola Municipal Anísio Teixeira', 'Itagi', '00000000-0000-0000-0000-000000000001'),
  ('Escola Municipal Rui Barbosa', 'Jitaúna', '00000000-0000-0000-0000-000000000001'),
  ('Escola Municipal Monteiro Lobato', 'Ipiaú', '00000000-0000-0000-0000-000000000001'),
  ('Escola Municipal Cecília Meireles', 'Jaguaquara', '00000000-0000-0000-0000-000000000001'),
  ('Escola Municipal Carlos Drummond de Andrade', 'Aiquara', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

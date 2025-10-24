-- Add city field to schools table
ALTER TABLE public.schools 
ADD COLUMN city TEXT NOT NULL DEFAULT 'Jequié';

-- Add index for faster city-based queries
CREATE INDEX idx_schools_city ON public.schools(city);

-- Insert some example schools for each city
INSERT INTO public.schools (name, city, district_id) VALUES
  ('Escola Municipal José de Alencar', 'Jequié', (SELECT id FROM public.districts LIMIT 1)),
  ('Escola Municipal Castro Alves', 'Jequié', (SELECT id FROM public.districts LIMIT 1)),
  ('Escola Municipal Anísio Teixeira', 'Itagi', (SELECT id FROM public.districts LIMIT 1)),
  ('Escola Municipal Rui Barbosa', 'Jitaúna', (SELECT id FROM public.districts LIMIT 1)),
  ('Escola Municipal Monteiro Lobato', 'Ipiaú', (SELECT id FROM public.districts LIMIT 1)),
  ('Escola Municipal Cecília Meireles', 'Jaguaquara', (SELECT id FROM public.districts LIMIT 1)),
  ('Escola Municipal Carlos Drummond de Andrade', 'Aiquara', (SELECT id FROM public.districts LIMIT 1))
ON CONFLICT DO NOTHING;
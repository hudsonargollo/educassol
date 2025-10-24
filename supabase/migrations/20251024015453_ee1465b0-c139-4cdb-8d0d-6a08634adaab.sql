-- Fix city name spelling for Itagi (remove accent)
UPDATE public.schools 
SET city = 'Itagi' 
WHERE city = 'Itagí';
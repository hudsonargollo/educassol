-- Remove example schools inserted earlier
DELETE FROM public.schools WHERE name IN (
  'Escola Municipal José de Alencar',
  'Escola Municipal Castro Alves',
  'Escola Municipal Anísio Teixeira',
  'Escola Municipal Rui Barbosa',
  'Escola Municipal Monteiro Lobato',
  'Escola Municipal Cecília Meireles',
  'Escola Municipal Carlos Drummond de Andrade'
);

-- Insert all primary schools from Jequié
INSERT INTO public.schools (name, city, district_id) 
SELECT name, 'Jequié', (SELECT id FROM public.districts LIMIT 1)
FROM (VALUES
  ('ESCOLA FRANZ GEDEON'),
  ('ESCOLA MUNICIPAL SANTO ANTONIO DE PADUA'),
  ('ESCOLA MUNICIPAL SAO JOSE'),
  ('ESCOLA MUNICIPAL SEVERIANO GERALDO DA SILVA'),
  ('ESCOLA MUNICIPAL XV DE NOVEMBRO'),
  ('CENTRO EDUCACIONAL LEUR LOMANTO'),
  ('ESCOLA MUNICIPAL RUI BARBOSA'),
  ('ESCOLA MUNICIPAL CANDINHA BARRETO'),
  ('ESCOLA MUNICIPAL DOUTOR DANIEL ANDRADE'),
  ('ESCOLA MUNICIPAL DOUTOR RENAN BALEEIRO'),
  ('ESCOLA MUNICIPAL JOSE DE ANCHIETA'),
  ('ESCOLA MUNICIPAL LOURDES MOREIRA GIUDICE'),
  ('ESCOLA MUNICIPAL MARCELINO JOSE DOS SANTOS'),
  ('ESCOLA MUNICIPAL MARIA BASTOS DAMASCENO'),
  ('ESCOLA MUNICIPALIZADA JOANA ANGELICA'),
  ('ESCOLA MUNICIPAL ANTIDIO BARROS DE SOUZA'),
  ('ESCOLA MUNICIPAL DIMAS RIBEIRO MACEDO'),
  ('ESCOLA MUNICIPAL JUDITH RABELO BORGES'),
  ('ESCOLA MUNICIPAL OSVALDO EVANGELISTA NASCIMENTO'),
  ('Escola Municipal Silvia Vieira'),
  ('Escola Municipal Eufrasio Santana'),
  ('Escola Municipal Romualdo Bispo Freitas'),
  ('Escola Favo De Mel'),
  ('Colégio Super Passo'),
  ('Colégio Matisse'),
  ('Escola Pequeno Cidadão')
) AS t(name)
ON CONFLICT DO NOTHING;

-- Insert all primary schools from Ipiaú
INSERT INTO public.schools (name, city, district_id) 
SELECT name, 'Ipiaú', (SELECT id FROM public.districts LIMIT 1)
FROM (VALUES
  ('Escola Municipal Adélia Matta'),
  ('Escola Municipal Agostinho Pinheiro'),
  ('Escola Municipal Edvaldo Santiago'),
  ('Escola Municipal Florentino Pinheiro'),
  ('Escola Municipal José Mendes de Andrade'),
  ('Escola Municipal Pastor Paulo José da Silva Junior'),
  ('Escola Municipal Professora Leovícia Andrade'),
  ('Escola Municipal Dr. Euclides Neto'),
  ('ESCOLA MUNICIPAL RAULINA RODRIGUES DE SANTANA'),
  ('Escola Municipal Otaviano Nunes'),
  ('Escola Municipal José Thiara'),
  ('Escola Municipal Eunice Thiara'),
  ('Escola Municipal Joana Lisboa'),
  ('Escola Municipal Miguel Machado'),
  ('Escola Municipal Dois Amigos'),
  ('ESCOLA MUNICIPAL CORACAO DE JESUS'),
  ('Escola De Aplicacao Dom Bosco'),
  ('Colegio Academus Escola Arte E Vida'),
  ('COLEGIO APROVADO')
) AS t(name)
ON CONFLICT DO NOTHING;

-- Insert all primary schools from Jaguaquara
INSERT INTO public.schools (name, city, district_id) 
SELECT name, 'Jaguaquara', (SELECT id FROM public.districts LIMIT 1)
FROM (VALUES
  ('ESCOLA IPIRANGA'),
  ('ESCOLA RURAL DE FORMOSA'),
  ('COLEGIO MUNICIPAL ANTONIO FRANCISCO DE SOUZA'),
  ('ESCOLA FENIX')
) AS t(name)
ON CONFLICT DO NOTHING;

-- Insert all primary schools from Itagi
INSERT INTO public.schools (name, city, district_id) 
SELECT name, 'Itagi', (SELECT id FROM public.districts LIMIT 1)
FROM (VALUES
  ('ESCOLA JULIETA PONTES VIANA'),
  ('ESCOLA ANA NERY'),
  ('ESCOLA CARDEAL DA SILVA'),
  ('ESCOLA LUZIA CESAR'),
  ('ESCOLA MONTEIRO LOBATO')
) AS t(name)
ON CONFLICT DO NOTHING;

-- Insert all primary schools from Jitaúna
INSERT INTO public.schools (name, city, district_id) 
SELECT name, 'Jitaúna', (SELECT id FROM public.districts LIMIT 1)
FROM (VALUES
  ('ESCOLA CELY BATISTA BRITO'),
  ('ESCOLA JOSE LINO'),
  ('ESCOLA MARIA FRANCISCA DE JESUS'),
  ('ESCOLA PEDRO VIRGINIO'),
  ('COLEGIO MUNICIPAL MARIA ELEONORA CAJAIBA'),
  ('GRUPO ESCOLAR ARELANO BARREIRA'),
  ('ESCOLA AURINO DIAS GOMES'),
  ('ESCOLA MUNICIPAL ITALINO FERNANDES COSTA'),
  ('ESCOLA REINO INFANTIL'),
  ('COLEGIO RAIZES DO SABER')
) AS t(name)
ON CONFLICT DO NOTHING;

-- Insert all primary schools from Aiquara
INSERT INTO public.schools (name, city, district_id) 
SELECT name, 'Aiquara', (SELECT id FROM public.districts LIMIT 1)
FROM (VALUES
  ('COLEGIO MUNICIPAL AMERICO SOUTO'),
  ('ESCOLA CRECHE MARIA LUIZA REIS MENDONCA'),
  ('ESCOLA MUNICIPAL PROFESSORA ALMERINDA GALVAO'),
  ('GRUPO ESCOLAR EDGARD CARDOSO DE MOURA'),
  ('GRUPO ESCOLAR JULIO IGNACIO DE MATOS'),
  ('GRUPO ESCOLAR LUIS CARLOS BRAGA'),
  ('ESCOLA MUNICIPAL ABC'),
  ('ESCOLA MUNICIPAL ALOISIO BORGES DE SOUZA'),
  ('ESCOLA MUNICIPAL ANTENOR PEREIRA CAMARGO'),
  ('ESCOLA MUNICIPAL BRAZ ALBINO DA CRUZ'),
  ('ESCOLA MUNICIPAL CANDIDA ROCHA'),
  ('ESCOLA MUNICIPAL DR VILBERTO PEREIRA BORGES'),
  ('ESCOLA MUNICIPAL JECELINO NOGUEIRA'),
  ('ESCOLA MUNICIPAL JOAO BRAGA'),
  ('ESCOLA MUNICIPAL LUIS VIANA'),
  ('ESCOLA MUNICIPAL MANOEL COSTA'),
  ('ESCOLA MUNICIPAL RAFAEL MARCELINO'),
  ('COLEGIO ESTADUAL LUIS EDUARDO MAGALHAES'),
  ('ESCOLA BATISTA GENTE FELIZ')
) AS t(name)
ON CONFLICT DO NOTHING;
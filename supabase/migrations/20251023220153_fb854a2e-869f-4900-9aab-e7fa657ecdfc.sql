-- Create calendar table for pedagogical events
CREATE TABLE public.calendario (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('feriado', 'comemorativo', 'cultural', 'pedagogico')),
  titulo TEXT NOT NULL,
  descricao TEXT,
  relevancia_pedagogica TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster date queries
CREATE INDEX idx_calendario_data ON public.calendario(data);

-- Enable RLS
ALTER TABLE public.calendario ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view calendar events
CREATE POLICY "All authenticated users can view calendar events"
  ON public.calendario
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Only admins can manage calendar events (for now, teachers can view)
CREATE POLICY "Admins can manage calendar events"
  ON public.calendario
  FOR ALL
  USING (
    has_role(auth.uid(), 'school_admin'::app_role) OR 
    has_role(auth.uid(), 'district_admin'::app_role)
  );

-- Add trigger for updated_at
CREATE TRIGGER update_calendario_updated_at
  BEFORE UPDATE ON public.calendario
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some common Brazilian educational dates
INSERT INTO public.calendario (data, tipo, titulo, descricao, relevancia_pedagogica) VALUES
  ('2025-01-20', 'comemorativo', 'Dia do Farmacêutico', 'Dia dedicado aos profissionais da farmácia', 'Abordar a importância da saúde e medicamentos'),
  ('2025-02-14', 'comemorativo', 'Dia da Amizade', 'Celebração das relações de amizade', 'Trabalhar valores como companheirismo e respeito'),
  ('2025-03-08', 'comemorativo', 'Dia Internacional da Mulher', 'Celebração das conquistas das mulheres', 'Discutir igualdade de gênero e direitos das mulheres'),
  ('2025-03-15', 'comemorativo', 'Dia da Escola', 'Celebração do ambiente escolar', 'Valorizar o espaço de aprendizagem'),
  ('2025-03-22', 'comemorativo', 'Dia Mundial da Água', 'Conscientização sobre preservação da água', 'Educação ambiental e sustentabilidade'),
  ('2025-04-18', 'comemorativo', 'Dia Nacional do Livro Infantil', 'Homenagem a Monteiro Lobato', 'Incentivar a leitura e literatura infantil'),
  ('2025-04-19', 'comemorativo', 'Dia do Índio', 'Celebração da cultura indígena brasileira', 'Valorizar a diversidade cultural'),
  ('2025-04-21', 'feriado', 'Tiradentes', 'Feriado nacional', 'História do Brasil - Inconfidência Mineira'),
  ('2025-04-22', 'comemorativo', 'Dia da Terra', 'Conscientização ambiental', 'Sustentabilidade e cuidado com o planeta'),
  ('2025-05-01', 'feriado', 'Dia do Trabalho', 'Feriado nacional', 'Discutir diferentes profissões e direitos trabalhistas'),
  ('2025-05-13', 'comemorativo', 'Abolição da Escravatura', 'Assinatura da Lei Áurea', 'História do Brasil e direitos humanos'),
  ('2025-06-05', 'comemorativo', 'Dia Mundial do Meio Ambiente', 'Conscientização ambiental', 'Preservação da natureza e sustentabilidade'),
  ('2025-06-12', 'comemorativo', 'Dia dos Namorados', 'Celebração do amor e afeto', 'Trabalhar sentimentos e relações interpessoais'),
  ('2025-06-24', 'cultural', 'Festa Junina (São João)', 'Celebração da cultura popular', 'Valorizar tradições culturais brasileiras'),
  ('2025-07-20', 'comemorativo', 'Dia do Amigo', 'Celebração da amizade', 'Valores de amizade e companheirismo'),
  ('2025-08-11', 'comemorativo', 'Dia do Estudante', 'Celebração dos estudantes', 'Valorizar a educação e o papel do aluno'),
  ('2025-08-22', 'comemorativo', 'Dia do Folclore', 'Celebração da cultura popular brasileira', 'Lendas, mitos e tradições brasileiras'),
  ('2025-09-07', 'feriado', 'Independência do Brasil', 'Feriado nacional', 'História do Brasil - Independência'),
  ('2025-09-21', 'comemorativo', 'Dia da Árvore', 'Conscientização sobre preservação das árvores', 'Educação ambiental'),
  ('2025-10-04', 'comemorativo', 'Dia dos Animais', 'Conscientização sobre proteção animal', 'Respeito aos animais e biodiversidade'),
  ('2025-10-12', 'feriado', 'Dia das Crianças / Nossa Senhora Aparecida', 'Feriado nacional', 'Celebração da infância e cidadania'),
  ('2025-10-15', 'comemorativo', 'Dia do Professor', 'Homenagem aos educadores', 'Valorizar a profissão docente'),
  ('2025-11-15', 'feriado', 'Proclamação da República', 'Feriado nacional', 'História do Brasil - República'),
  ('2025-11-20', 'comemorativo', 'Dia da Consciência Negra', 'Reflexão sobre racismo e cultura afro-brasileira', 'Diversidade étnico-racial e direitos humanos'),
  ('2025-12-25', 'feriado', 'Natal', 'Feriado nacional', 'Valores de solidariedade e família');

COMMENT ON TABLE public.calendario IS 'Calendário de eventos pedagógicos, feriados e datas comemorativas';
COMMENT ON COLUMN public.calendario.tipo IS 'Tipo de evento: feriado, comemorativo, cultural, pedagogico';
COMMENT ON COLUMN public.calendario.relevancia_pedagogica IS 'Sugestão de como trabalhar pedagogicamente a data';
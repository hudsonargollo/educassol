-- Add missing types to the constraint
ALTER TABLE public.content_templates DROP CONSTRAINT content_templates_type_check;

ALTER TABLE public.content_templates ADD CONSTRAINT content_templates_type_check 
CHECK (type = ANY (ARRAY['activity'::text, 'project'::text, 'test'::text, 'assessment'::text, 'quiz'::text, 'lesson_plan'::text]));

-- Now insert the BNCC templates
INSERT INTO public.content_templates (type, title, description, grade_levels, subjects, prompt_template, methodology, supports_accessibility) VALUES
  (
    'lesson_plan',
    'Plano de Aula - Alfabetização e Letramento',
    'Template para aulas de alfabetização nos anos iniciais',
    ARRAY['1º ano', '2º ano', '3º ano'],
    ARRAY['Língua Portuguesa'],
    'Crie um plano de aula detalhado sobre [topic] para [grade] na disciplina de [subject].

BNCC: [bnccCode]

Foco em alfabetização e letramento, com atividades lúdicas e práticas.

O plano deve incluir:
1. Objetivos de Aprendizagem (BNCC)
2. Materiais (preferencialmente de baixo custo)
3. Momento Inicial (acolhimento e contextualização - 10 min)
4. Desenvolvimento (atividades práticas - [duration-20] min)
5. Avaliação e Fechamento (10 min)
6. Sugestões de Adaptação para ANE

Use linguagem clara e objetiva.',
    ARRAY['active_learning'::content_methodology, 'gamification'::content_methodology],
    true
  ),
  (
    'lesson_plan',
    'Plano de Aula - Matemática Lúdica',
    'Template para aulas de matemática com jogos e atividades práticas',
    ARRAY['1º ano', '2º ano', '3º ano', '4º ano', '5º ano'],
    ARRAY['Matemática'],
    'Crie um plano de aula de matemática sobre [topic] para [grade].

BNCC: [bnccCode]
Duração: [duration] minutos

Use jogos, materiais concretos e situações do cotidiano dos alunos.

Estrutura:
1. Objetivos (alinhados à BNCC)
2. Materiais Necessários (preferencialmente recicláveis)
3. Aquecimento com jogo matemático (15 min)
4. Atividade principal com manipulação (25 min)
5. Sistematização coletiva (10 min)
6. Desafio individual (10 min)
7. Critérios de Avaliação

Inclua variações para diferentes níveis de aprendizagem.',
    ARRAY['gamification'::content_methodology, 'active_learning'::content_methodology],
    true
  ),
  (
    'activity',
    'Atividade Investigativa - Ciências',
    'Template para atividades de investigação científica',
    ARRAY['3º ano', '4º ano', '5º ano'],
    ARRAY['Ciências'],
    'Crie uma atividade investigativa de ciências sobre [topic] para [grade].

BNCC: [bnccCode]
Tipo: [activityType]
Metodologia: [methodology]

A atividade deve estimular a curiosidade científica e o pensamento crítico.

Estrutura:
1. Pergunta Investigativa (o que queremos descobrir?)
2. Hipóteses (o que os alunos acham que vai acontecer?)
3. Materiais Necessários
4. Procedimento Experimental (passo a passo ilustrado)
5. Registro de Observações (tabela/desenho)
6. Análise dos Resultados
7. Conclusões Coletivas
8. Questões para Reflexão

Garanta que seja seguro e acessível para todos os alunos.',
    ARRAY['inquiry_based'::content_methodology, 'collaborative'::content_methodology],
    true
  );

COMMENT ON COLUMN public.content_templates.prompt_template IS 'Template de prompt com placeholders: [topic], [bnccCode], [grade], [subject], [duration], [activityType], [methodology], [numQuestions]';
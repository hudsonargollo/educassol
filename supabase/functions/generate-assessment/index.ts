import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Validation schema
    const assessmentSchema = z.object({
      grade: z.string().min(1).max(100),
      subject: z.string().min(1).max(200),
      bnccCode: z.string().max(50).optional(),
      topic: z.string().min(1).max(500),
      numQuestions: z.number().int().min(1).max(50).optional(),
      templateId: z.string().uuid().optional(),
      methodology: z.string().max(200).optional(),
      durationMinutes: z.number().int().min(1).max(300).optional(),
      accessibilityOptions: z.array(z.string().max(100)).max(10).optional(),
      difficultyLevel: z.enum(['easy', 'intermediate', 'advanced']).optional(),
      specificIdea: z.string().max(1000).optional(),
      studentsPerClass: z.number().int().min(1).max(200).optional(),
      classId: z.string().uuid().optional(),
      classContext: z.object({
        total_alunos: z.number().int().nullable().optional(),
        possui_ane: z.boolean().optional(),
        detalhes_ane: z.string().nullable().optional(),
      }).optional(),
    });

    const requestBody = await req.json();
    const validationResult = assessmentSchema.safeParse(requestBody);
    
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input data',
          details: validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        }), 
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { grade, subject, bnccCode, topic, numQuestions, templateId, classId, classContext } = validationResult.data;

    console.log('Generating assessment for user:', user.id);

    // Get user's school_id and verify role
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.school_id) {
      throw new Error('User profile not found or no school assigned');
    }

    // Check if user has teacher role
    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'teacher')
      .maybeSingle();

    if (!roles) {
      throw new Error('Only teachers can generate assessments');
    }

    // Build prompt
    let userPrompt = '';
    
    // Add class context to prompt if available
    let classContextText = '';
    if (classContext) {
      if (classContext.total_alunos) {
        classContextText += `\nNúmero de alunos na turma: ${classContext.total_alunos}`;
      }
      if (classContext.possui_ane && classContext.detalhes_ane) {
        classContextText += `\n\nIMPORTANTE - Adaptação para Alunos com Necessidades Especiais:\n${classContext.detalhes_ane}\n\nPor favor, adapte as questões e os critérios de avaliação considerando estas necessidades especiais.`;
      }
    }
    
    if (templateId) {
      const { data: template } = await supabaseClient
        .from('content_templates')
        .select('prompt_template')
        .eq('id', templateId)
        .single();
      
      if (template) {
        userPrompt = template.prompt_template
          .replace('[topic]', topic)
          .replace('[bnccCode]', bnccCode)
          .replace('[grade]', grade)
          .replace('[subject]', subject)
          .replace('[numQuestions]', numQuestions);
      }
    } else {
      userPrompt = `Crie uma avaliação com ${numQuestions} questões para ${grade} sobre o tema "${topic}" na disciplina de ${subject}.
      
Código BNCC: ${bnccCode}${classContextText}

A avaliação deve incluir:
1. Título
2. Instruções claras para os alunos
3. ${numQuestions} questões variadas (múltipla escolha, verdadeiro/falso, dissertativas)
4. Gabarito com respostas corretas
5. Critérios de pontuação
6. Competências avaliadas (alinhadas à BNCC)

Formate a resposta em Markdown com títulos e listas organizadas. As questões devem avaliar diferentes níveis cognitivos.`;
    }

    const systemPrompt = `Você é um assistente pedagógico especializado em educação primária brasileira e na Base Nacional Comum Curricular (BNCC). Sua função é criar avaliações educacionais de alta qualidade, adequadas ao nível dos alunos, seguindo as diretrizes da BNCC. Seja claro, objetivo e didático. As questões devem avaliar compreensão, aplicação e análise. Use linguagem apropriada para educadores.`;

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Calling AI Gateway...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const generatedContent = aiData.choices[0].message.content;

    console.log('Content generated successfully');

    // Save to database
    const contentData: any = {
      type: 'assessment',
      author_id: user.id,
      school_id: profile.school_id,
      title: `Avaliação: ${topic}`,
      bncc_codes: [bnccCode],
      prompt: userPrompt,
      content: generatedContent,
    };

    if (classId) {
      contentData.class_id = classId;
    }

    const { data: savedContent, error: saveError } = await supabaseClient
      .from('generated_content')
      .insert(contentData)
      .select()
      .single();

    if (saveError) {
      console.error('Error saving content:', saveError);
      throw saveError;
    }

    console.log('Content saved to database');

    return new Response(JSON.stringify(savedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-assessment:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      {
        status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

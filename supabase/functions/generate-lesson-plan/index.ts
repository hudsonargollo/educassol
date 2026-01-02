import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import {
  checkUsageLimit,
  recordUsage,
  createLimitExceededResponse,
  createRateLimitHeaders,
} from '../_shared/usage-limits.ts';

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

    // Check usage limit before proceeding (Requirements: 12.1, 12.2)
    const limitCheck = await checkUsageLimit(supabaseClient, user.id, 'lesson-plan');
    
    if (!limitCheck.allowed) {
      return createLimitExceededResponse(limitCheck, 'lesson-plan', corsHeaders);
    }

    // Validation schema
    const lessonPlanSchema = z.object({
      grade: z.string().min(1).max(100),
      subject: z.string().min(1).max(200),
      bnccCode: z.string().max(50).optional(),
      topic: z.string().min(1).max(500),
      duration: z.number().int().min(1).max(300).optional(),
      templateId: z.string().uuid().optional(),
      methodology: z.string().max(200).optional(),
      durationMinutes: z.number().int().min(1).max(300).optional(),
      accessibilityOptions: z.array(z.string().max(100)).max(10).optional(),
      difficultyLevel: z.enum(['easy', 'intermediate', 'advanced']).optional(),
      specificIdea: z.string().max(1000).optional(),
      studentsPerClass: z.number().int().min(1).max(200).optional(),
      numberOfLessons: z.number().int().min(1).max(50).optional(),
      classId: z.string().uuid().optional(),
      classContext: z.object({
        total_alunos: z.number().int().nullable().optional(),
        possui_ane: z.boolean().optional(),
        detalhes_ane: z.string().nullable().optional(),
      }).optional(),
    });

    const requestBody = await req.json();
    const validationResult = lessonPlanSchema.safeParse(requestBody);
    
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

    const { grade, subject, bnccCode, topic, duration, templateId, classId, classContext } = validationResult.data;

    console.log('Generating lesson plan for user:', user.id);

    // Get user's school_id and verify role
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.school_id) {
      throw new Error('Seu perfil não está associado a uma escola. Entre em contato com o administrador do sistema.');
    }

    // Check if user has teacher role
    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'teacher')
      .maybeSingle();

    if (!roles) {
      throw new Error('Only teachers can generate lesson plans');
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
        classContextText += `\n\nIMPORTANTE - Adaptação para Alunos com Necessidades Especiais:\n${classContext.detalhes_ane}\n\nPor favor, adapte as atividades e estratégias pedagógicas considerando estas necessidades especiais.`;
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
          .replace('[duration]', duration);
      }
    } else {
      const lessonDuration = duration || 50; // Default to 50 minutes if not specified
      userPrompt = `Crie um plano de aula detalhado para ${grade} sobre o tema "${topic}" na disciplina de ${subject}.
      
Código BNCC: ${bnccCode}
Duração: ${lessonDuration} minutos${classContextText}

O plano de aula deve incluir:
1. Objetivos de Aprendizagem (alinhados à BNCC)
2. Materiais Necessários
3. Introdução (10 minutos)
4. Desenvolvimento (${lessonDuration - 20} minutos)
5. Avaliação (10 minutos)
6. Recursos Adicionais

Formate a resposta em Markdown com títulos e listas organizadas.`;
    }

    const systemPrompt = `Você é um assistente pedagógico especializado em educação primária brasileira e na Base Nacional Comum Curricular (BNCC). Sua função é criar conteúdo educacional de alta qualidade, adequado ao nível dos alunos, seguindo as diretrizes da BNCC. Seja claro, objetivo e didático. Use linguagem apropriada para educadores.`;

    // Call Google Gemini API
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log('Calling Google Gemini API...');
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt + '\n\n' + userPrompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Gemini API error:', aiResponse.status, errorText);
      throw new Error(`Gemini API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const generatedContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedContent) {
      throw new Error('No content generated from Gemini API');
    }

    console.log('Content generated successfully');

    // Save to database
    const contentData: any = {
      type: 'lesson_plan',
      author_id: user.id,
      school_id: profile.school_id,
      title: `Plano de Aula: ${topic}`,
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

    // Record usage after successful generation (Requirements: 12.3)
    await recordUsage(supabaseClient, user.id, 'lesson-plan', limitCheck.tier, {
      content_id: savedContent.id,
      topic,
      grade,
      subject,
    });

    // Add rate limit headers to response (Requirements: 12.5)
    const rateLimitHeaders = createRateLimitHeaders(limitCheck);

    return new Response(JSON.stringify(savedContent), {
      headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-lesson-plan:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      {
        status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

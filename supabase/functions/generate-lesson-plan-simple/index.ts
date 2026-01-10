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
    console.log('Starting lesson plan generation...');
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }), 
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    console.log('Supabase client created');

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('User auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Sessão expirada. Por favor, faça login novamente.' }), 
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('User authenticated:', user.id);

    // Validation schema
    const lessonPlanSchema = z.object({
      grade: z.string().min(1).max(100),
      subject: z.string().min(1).max(200),
      bnccCode: z.string().max(50).optional(),
      topic: z.string().min(1).max(500),
      duration: z.number().int().min(1).max(300).optional(),
    });

    const requestBody = await req.json();
    console.log('Request body received:', requestBody);
    
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

    const { grade, subject, bnccCode, topic, duration } = validationResult.data;
    console.log('Input validated successfully');

    // Build prompt
    const lessonDuration = duration || 50;
    const userPrompt = `Crie um plano de aula detalhado para ${grade} sobre o tema "${topic}" na disciplina de ${subject}.
      
Código BNCC: ${bnccCode}
Duração: ${lessonDuration} minutos

O plano de aula deve incluir:
1. Objetivos de Aprendizagem (alinhados à BNCC)
2. Materiais Necessários
3. Introdução (10 minutos)
4. Desenvolvimento (${lessonDuration - 20} minutos)
5. Avaliação (10 minutos)
6. Recursos Adicionais

Formate a resposta em Markdown com títulos e listas organizadas.`;

    const systemPrompt = `Você é um assistente pedagógico especializado em educação primária brasileira e na Base Nacional Comum Curricular (BNCC). Sua função é criar conteúdo educacional de alta qualidade, adequado ao nível dos alunos, seguindo as diretrizes da BNCC. Seja claro, objetivo e didático. Use linguagem apropriada para educadores.`;

    // Call Google Gemini API
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Serviço de IA não configurado. Entre em contato com o suporte.' }), 
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
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
      return new Response(
        JSON.stringify({ error: 'Erro no serviço de IA. Tente novamente em alguns minutos.' }), 
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const aiData = await aiResponse.json();
    const generatedContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedContent) {
      console.error('No content in AI response:', aiData);
      return new Response(
        JSON.stringify({ error: 'Nenhum conteúdo foi gerado. Tente novamente.' }), 
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Content generated successfully');

    // Create a simple response object without database save
    const savedContent = {
      id: crypto.randomUUID(),
      type: 'lesson_plan',
      author_id: user.id,
      title: `Plano de Aula: ${topic}`,
      content: generatedContent,
      created_at: new Date().toISOString(),
    };

    console.log('Content ready');

    return new Response(JSON.stringify(savedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-lesson-plan-simple:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor. Tente novamente.',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
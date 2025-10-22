import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

    const { 
      grade, 
      subject, 
      bnccCode, 
      topic, 
      activityType, 
      templateId,
      methodology = 'traditional',
      durationMinutes,
      accessibilityOptions = [],
      difficultyLevel = 'intermediate'
    } = await req.json();

    console.log('Generating activity for user:', user.id);

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
      throw new Error('Only teachers can generate activities');
    }

    // Build prompt with specifications
    let userPrompt = '';
    
    const methodologyText = {
      'active_learning': 'Metodologias Ativas',
      'traditional': 'Metodologia Tradicional',
      'project_based': 'Aprendizagem Baseada em Projetos',
      'gamification': 'Gamificação',
      'flipped_classroom': 'Sala de Aula Invertida',
      'collaborative': 'Aprendizagem Colaborativa',
      'inquiry_based': 'Aprendizagem por Investigação'
    }[methodology] || 'Metodologia Tradicional';

    const accessibilityText = accessibilityOptions.length > 0 
      ? `\n\nAdaptar para: ${accessibilityOptions.join(', ')}`
      : '';
    
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
          .replace('[activityType]', activityType)
          .replace('[methodology]', methodologyText)
          .replace('[duration]', durationMinutes ? `${durationMinutes} minutos` : 'a definir');
      }
    } else {
      userPrompt = `Crie uma atividade do tipo "${activityType}" para ${grade} sobre o tema "${topic}" na disciplina de ${subject}.
      
Código BNCC: ${bnccCode}
Metodologia: ${methodologyText}
${durationMinutes ? `Duração: ${durationMinutes} minutos` : ''}
Nível de Dificuldade: ${difficultyLevel}${accessibilityText}

A atividade deve incluir:
1. Título criativo
2. Objetivos de Aprendizagem (alinhados à BNCC)
3. Materiais Necessários
4. Instruções passo a passo para os alunos
5. Tempo estimado
6. Critérios de avaliação

Formate a resposta em Markdown com títulos e listas organizadas. Torne a atividade engajante e apropriada para a faixa etária.`;
    }

    const systemPrompt = `Você é um assistente pedagógico especializado em educação primária brasileira e na Base Nacional Comum Curricular (BNCC). Sua função é criar atividades educacionais criativas e engajadoras de alta qualidade, adequadas ao nível dos alunos, seguindo as diretrizes da BNCC. Seja claro, objetivo e didático. Use linguagem apropriada para educadores.`;

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
    const { data: savedContent, error: saveError } = await supabaseClient
      .from('generated_content')
      .insert({
        type: 'activity',
        author_id: user.id,
        school_id: profile.school_id,
        title: `Atividade: ${topic}`,
        bncc_codes: [bnccCode],
        prompt: userPrompt,
        content: generatedContent,
        methodology,
        duration_minutes: durationMinutes,
        accessibility_options: accessibilityOptions,
        difficulty_level: difficultyLevel,
      })
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
    console.error('Error in generate-activity:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      {
        status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

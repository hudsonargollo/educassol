import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// Inline usage limits to avoid import issues
type GenerationType = 'lesson-plan' | 'activity' | 'worksheet' | 'quiz' | 'reading' | 'slides' | 'assessment' | 'file-upload';
type Tier = 'free' | 'premium' | 'enterprise';

interface LimitCheckResult {
  allowed: boolean;
  currentUsage: number;
  limit: number | null;
  tier: Tier;
}

// Simple usage check without external dependencies
async function checkUsageLimit(supabase: any, userId: string, generationType: GenerationType): Promise<LimitCheckResult> {
  try {
    // Get user's tier from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', userId)
      .single();

    const tier: Tier = (profile?.tier as Tier) || 'free';
    
    // Simple limits for free tier
    const limits = {
      'lesson-plan': tier === 'free' ? 5 : null,
      'activity': tier === 'free' ? 10 : null,
      'assessment': tier === 'free' ? 3 : null,
    };
    
    const limit = limits[generationType] || null;

    // If unlimited (null), allow the request
    if (limit === null) {
      return { allowed: true, currentUsage: 0, limit: null, tier };
    }

    // Get start of current month for query
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Count current month's usage
    const { count } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('generation_type', generationType)
      .gte('created_at', startOfMonth.toISOString());

    const currentUsage = count || 0;

    return {
      allowed: currentUsage < limit,
      currentUsage,
      limit,
      tier,
    };
  } catch (error) {
    console.error('Error checking usage limit:', error);
    // On error, default to allowing (fail open)
    return { allowed: true, currentUsage: 0, limit: null, tier: 'free' };
  }
}

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
    if (userError) {
      console.error('Auth error:', userError);
      throw new Error('Authentication failed: ' + userError.message);
    }
    if (!user) {
      throw new Error('No user found in session');
    }

    // Check usage limit before proceeding
    const limitCheck = await checkUsageLimit(supabaseClient, user.id, 'activity');
    
    if (!limitCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Limite de uso excedido',
          limit_type: 'activity',
          current_usage: limitCheck.currentUsage,
          limit: limitCheck.limit,
          tier: limitCheck.tier,
        }),
        {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validation schema
    const activitySchema = z.object({
      grade: z.string().min(1).max(100),
      subject: z.string().min(1).max(200),
      bnccCode: z.string().max(50).optional(),
      topic: z.string().min(1).max(500),
      activityType: z.string().min(1).max(200).optional(),
      templateId: z.string().uuid().optional(),
      methodology: z.enum(['traditional', 'active_learning', 'project_based', 'gamification', 'flipped_classroom', 'collaborative', 'inquiry_based']).optional(),
      durationMinutes: z.number().int().min(1).max(300).optional(),
      accessibilityOptions: z.array(z.string().max(100)).max(10).optional(),
      difficultyLevel: z.enum(['easy', 'intermediate', 'advanced']).optional(),
      specificIdea: z.string().max(1000).optional(),
      studentsPerClass: z.number().int().min(1).max(200).optional(),
      numberOfLessons: z.number().int().min(1).max(50).optional(),
      durationPerLesson: z.number().int().min(1).max(300).optional(),
      classId: z.string().uuid().optional(),
      classContext: z.object({
        total_alunos: z.number().int().nullable().optional(),
        possui_ane: z.boolean().optional(),
        detalhes_ane: z.string().nullable().optional(),
      }).optional(),
    });

    const requestBody = await req.json();
    const validationResult = activitySchema.safeParse(requestBody);
    
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
      difficultyLevel = 'intermediate',
      classId,
      classContext
    } = validationResult.data;

    console.log('Generating activity for user:', user.id);

    // Get user's school_id (optional for freemium users)
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Profile error:', profileError);
      // Continue without profile - freemium users may not have one
    }
    
    // school_id is optional - freemium users can generate without school association
    const schoolId = profile?.school_id || null;

    // Check if user has teacher role (optional for freemium)
    const { data: roles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'teacher')
      .maybeSingle();

    if (rolesError) {
      console.error('Roles error:', rolesError);
      // Continue without role check for freemium users
    }

    // Log if user doesn't have teacher role (but don't block)
    if (!roles) {
      console.log('User does not have teacher role, proceeding as freemium user');
    }

    // Build prompt with specifications
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
      
${bnccCode ? `Código BNCC: ${bnccCode}` : ''}
Metodologia: ${methodologyText}
${durationMinutes ? `Duração: ${durationMinutes} minutos` : ''}
Nível de Dificuldade: ${difficultyLevel}${accessibilityText}${classContextText}

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
      throw new Error('Erro no serviço de IA. Tente novamente em alguns minutos.');
    }

    const aiData = await aiResponse.json();
    const generatedContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedContent) {
      throw new Error('No content generated from Gemini API');
    }

    console.log('Content generated successfully');

    // Save to database (only if user has school_id, otherwise return content without saving)
    let savedContent: any = null;
    
    if (schoolId) {
      const contentData: any = {
        type: 'activity',
        author_id: user.id,
        school_id: schoolId,
        title: `Atividade: ${topic}`,
        bncc_codes: bnccCode ? [bnccCode] : [],
        prompt: userPrompt,
        content: generatedContent,
        methodology,
        duration_minutes: durationMinutes,
        accessibility_options: accessibilityOptions,
        difficulty_level: difficultyLevel,
      };

      if (classId) {
        contentData.class_id = classId;
      }

      const { data, error: saveError } = await supabaseClient
        .from('generated_content')
        .insert(contentData)
        .select()
        .single();

      if (saveError) {
        console.error('Error saving content:', saveError);
        // Don't throw - return content without saving for freemium users
        console.log('Returning content without database save');
      } else {
        savedContent = data;
      }
    }
    
    // If not saved to DB, create a response object
    if (!savedContent) {
      savedContent = {
        id: crypto.randomUUID(),
        type: 'activity',
        author_id: user.id,
        title: `Atividade: ${topic}`,
        content: generatedContent,
        created_at: new Date().toISOString(),
      };
    }

    console.log('Content saved to database');

    // Record usage after successful generation (simplified)
    try {
      await supabaseClient.from('usage_logs').insert({
        user_id: user.id,
        generation_type: 'activity',
        tier: limitCheck.tier,
        metadata: {
          content_id: savedContent?.id,
          topic,
          grade,
          subject,
        },
      });
    } catch (usageError) {
      console.error('Error recording usage:', usageError);
      // Don't fail the request if usage recording fails
    }

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

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Differentiation types supported by the engine
 * Requirement 8.1: Options for ELL, Advanced, ADHD, Visual
 */
const DifferentiationTypeSchema = z.enum(['ell', 'advanced', 'adhd', 'visual']);

/**
 * Content types that can be differentiated
 */
const ContentTypeSchema = z.enum(['lesson-plan', 'quiz', 'worksheet']);

/**
 * Request validation schema
 */
const differentiateRequestSchema = z.object({
  contentId: z.string().uuid(),
  contentType: ContentTypeSchema,
  differentiationTypes: z.array(DifferentiationTypeSchema).min(1),
});

/**
 * System prompt for content differentiation
 * Requirements: 8.2, 8.3, 8.4, 8.5
 */
const DIFFERENTIATION_SYSTEM_PROMPT = `You are Educasol AI, an expert in differentiated instruction and Universal Design for Learning (UDL).
Your goal is to adapt educational content for diverse learners while preserving the core learning objective.

CRITICAL RULE: The learning objective MUST remain unchanged. Only modify the instructional path, not the destination.

When differentiating for ELL (English Language Learners):
- Simplify vocabulary and sentence structure
- Add visual aids descriptions and context clues
- Include sentence frames and scaffolds
- Provide native language cognates where applicable
- Use shorter sentences and clearer transitions

When differentiating for Advanced learners:
- Add extension activities and challenges
- Include higher-order thinking prompts (Bloom's: Evaluate, Create)
- Provide opportunities for deeper exploration
- Add connections to real-world applications
- Include open-ended questions for inquiry

When differentiating for ADHD support:
- Chunk content into smaller, manageable segments
- Add frequent check-ins and brain breaks
- Include movement-based activities where possible
- Provide clear, numbered step-by-step instructions
- Add visual timers and progress indicators

When differentiating for Visual supports:
- Add graphic organizer suggestions
- Include color-coding recommendations
- Provide visual vocabulary card descriptions
- Add icons and symbols for key concepts
- Include diagram and chart suggestions

Output must be valid JSON matching the EXACT same schema as the input content.
Do not include markdown formatting blocks in the JSON output, just the raw JSON.
The output structure must be identical to the input - only the content values should change.`;


/**
 * Get differentiation instructions based on selected types
 */
function getDifferentiationInstructions(types: string[]): string {
  const instructions: string[] = [];

  if (types.includes('ell')) {
    instructions.push(`
ELL MODIFICATIONS:
- Simplify vocabulary: Replace complex words with simpler alternatives
- Add visual cues: Include descriptions of helpful visuals
- Provide scaffolds: Add sentence frames and word banks
- Shorten sentences: Break long sentences into shorter ones`);
  }

  if (types.includes('advanced')) {
    instructions.push(`
ADVANCED MODIFICATIONS:
- Add extension prompts: Include "Challenge" or "Go Deeper" sections
- Increase complexity: Add higher-order thinking questions
- Connect to real-world: Include application scenarios
- Encourage inquiry: Add open-ended exploration opportunities`);
  }

  if (types.includes('adhd')) {
    instructions.push(`
ADHD MODIFICATIONS:
- Chunk content: Break into smaller numbered steps
- Add check-ins: Include "Stop and Check" moments
- Include movement: Suggest kinesthetic activities
- Clarify instructions: Make each step explicit and clear`);
  }

  if (types.includes('visual')) {
    instructions.push(`
VISUAL MODIFICATIONS:
- Add graphic organizers: Suggest diagrams, charts, mind maps
- Include color-coding: Recommend color schemes for organization
- Visual vocabulary: Describe picture cards for key terms
- Icons and symbols: Suggest visual markers for concepts`);
  }

  return instructions.join('\n');
}

/**
 * Build the user prompt for differentiation
 */
function buildDifferentiationPrompt(
  content: Record<string, unknown>,
  contentType: string,
  types: string[],
  learningObjective: string
): string {
  const differentiationInstructions = getDifferentiationInstructions(types);

  return `Differentiate the following ${contentType.replace('-', ' ')} content.

CRITICAL: Preserve this learning objective exactly: "${learningObjective}"

Apply these differentiation modifications:
${differentiationInstructions}

Original content to differentiate:
${JSON.stringify(content, null, 2)}

Return the differentiated content as valid JSON with the EXACT same structure.
Only modify the content values to apply the differentiation - do not change field names or structure.
The learning objective field must remain UNCHANGED.`;
}

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

    // Parse and validate request
    const requestBody = await req.json();
    const validationResult = differentiateRequestSchema.safeParse(requestBody);
    
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

    const { contentId, contentType, differentiationTypes } = validationResult.data;

    console.log(`Differentiating ${contentType} (${contentId}) with types:`, differentiationTypes);

    // Fetch the content based on type
    let content: Record<string, unknown> | null = null;
    let learningObjective = '';

    if (contentType === 'lesson-plan') {
      const { data: lessonPlan, error: fetchError } = await supabaseClient
        .from('lesson_plans')
        .select('*')
        .eq('id', contentId)
        .single();

      if (fetchError || !lessonPlan) {
        throw new Error('Lesson plan not found');
      }

      // Verify user has access
      if (lessonPlan.user_id !== user.id) {
        throw new Error('Access denied to this lesson plan');
      }

      content = lessonPlan;
      learningObjective = lessonPlan.learning_objective || '';
    } else {
      // For quiz and worksheet, fetch from generated_activities
      const { data: activity, error: fetchError } = await supabaseClient
        .from('generated_activities')
        .select('*, lesson_plans!inner(user_id, learning_objective)')
        .eq('id', contentId)
        .eq('type', contentType)
        .single();

      if (fetchError || !activity) {
        throw new Error(`${contentType} not found`);
      }

      // Verify user has access through the lesson plan
      if (activity.lesson_plans.user_id !== user.id) {
        throw new Error(`Access denied to this ${contentType}`);
      }

      content = activity.content as Record<string, unknown>;
      learningObjective = activity.lesson_plans.learning_objective || activity.content?.title || '';
    }

    if (!content) {
      throw new Error('Content not found');
    }

    // Build the differentiation prompt
    const userPrompt = buildDifferentiationPrompt(
      content,
      contentType,
      differentiationTypes,
      learningObjective
    );

    // Call AI Gateway
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Calling AI Gateway for differentiation...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: DIFFERENTIATION_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 8192,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let generatedContent = aiData.choices[0].message.content;

    // Clean up JSON response (remove markdown code blocks if present)
    generatedContent = generatedContent.trim();
    if (generatedContent.startsWith('```json')) {
      generatedContent = generatedContent.slice(7);
    } else if (generatedContent.startsWith('```')) {
      generatedContent = generatedContent.slice(3);
    }
    if (generatedContent.endsWith('```')) {
      generatedContent = generatedContent.slice(0, -3);
    }

    // Parse the differentiated content
    let differentiatedContent;
    try {
      differentiatedContent = JSON.parse(generatedContent.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('AI generated invalid JSON response');
    }

    console.log('Content differentiated successfully');

    // Return the differentiated content
    // Requirement 8.5: Preserve the core Learning_Objective
    // Requirement 8.6: Return modified JSON with the same schema structure
    return new Response(JSON.stringify({
      original: content,
      differentiated: differentiatedContent,
      modificationsApplied: differentiationTypes,
      preservedObjective: learningObjective,
      contentType,
      contentId,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in differentiate-content:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      {
        status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

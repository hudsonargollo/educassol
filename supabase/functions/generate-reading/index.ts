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

/**
 * Request validation schema
 */
const generateReadingRequestSchema = z.object({
  lessonPlanId: z.string().uuid(),
  topic: z.string().max(500).optional(),
  easyLexile: z.number().int().min(100).max(800).default(500),
  mediumLexile: z.number().int().min(400).max(1000).default(800),
  hardLexile: z.number().int().min(700).max(1400).default(1100),
});

/**
 * System prompt for leveled reading generation
 * Requirements: 4.1, 4.2
 */
const READING_SYSTEM_PROMPT = `You are Educasol AI, an expert reading passage creator.
Your goal is to create differentiated reading passages at multiple Lexile levels while maintaining consistent core concepts.

ALWAYS follow these rules:
1. Generate the SAME content at three distinct Lexile levels simultaneously
2. Maintain consistent core concepts across all levels
3. Adjust vocabulary complexity, sentence length, and structure for each level
4. Ensure passages are engaging and age-appropriate

For Lexile levels:
- Easy (400-600L): Simple sentences, common vocabulary, shorter paragraphs
- Medium (700-900L): Moderate complexity, some academic vocabulary
- Hard (1000-1200L): Complex sentences, academic vocabulary, longer paragraphs

Output must be valid JSON matching the requested schema.
Do not include markdown formatting blocks in the JSON output, just the raw JSON.`;

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
    const limitCheck = await checkUsageLimit(supabaseClient, user.id, 'reading');
    
    if (!limitCheck.allowed) {
      return createLimitExceededResponse(limitCheck, 'reading', corsHeaders);
    }

    // Parse and validate request
    const requestBody = await req.json();
    const validationResult = generateReadingRequestSchema.safeParse(requestBody);
    
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

    const { lessonPlanId, topic, easyLexile, mediumLexile, hardLexile } = validationResult.data;

    // Validate Lexile level ordering
    if (easyLexile >= mediumLexile || mediumLexile >= hardLexile) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid Lexile levels',
          details: ['Lexile levels must be in ascending order: easy < medium < hard']
        }), 
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Generating leveled reading for lesson plan:', lessonPlanId);

    // Fetch lesson plan context
    const { data: lessonPlan, error: lessonError } = await supabaseClient
      .from('lesson_plans')
      .select('*')
      .eq('id', lessonPlanId)
      .single();

    if (lessonError || !lessonPlan) {
      throw new Error('Lesson plan not found');
    }

    // Verify user has access to this lesson plan
    if (lessonPlan.user_id !== user.id) {
      throw new Error('Access denied to this lesson plan');
    }

    const readingTopic = topic || lessonPlan.topic;

    // Build the prompt with lesson context
    // Requirement 4.2: Generate three Lexile levels simultaneously
    const userPrompt = `Generate leveled reading passages based on the following lesson plan:

Topic: ${readingTopic}
Subject: ${lessonPlan.subject}
Grade Level: ${lessonPlan.grade_level}
Learning Objective: ${lessonPlan.learning_objective}

Key Vocabulary:
${JSON.stringify(lessonPlan.key_vocabulary || [], null, 2)}

Generate THREE versions of a reading passage about "${readingTopic}" at these Lexile levels:
- Easy: approximately ${easyLexile}L
- Medium: approximately ${mediumLexile}L  
- Hard: approximately ${hardLexile}L

IMPORTANT: All three passages must cover the SAME core concepts, just at different reading levels.

Return a JSON object with this exact structure:
{
  "topic": "${readingTopic}",
  "passages": {
    "easy": {
      "text": "The easy reading passage text here (2-3 paragraphs, simple vocabulary, short sentences)...",
      "lexileLevel": ${easyLexile}
    },
    "medium": {
      "text": "The medium reading passage text here (3-4 paragraphs, moderate vocabulary)...",
      "lexileLevel": ${mediumLexile}
    },
    "hard": {
      "text": "The hard reading passage text here (4-5 paragraphs, academic vocabulary, complex sentences)...",
      "lexileLevel": ${hardLexile}
    }
  },
  "coreConceptsPreserved": [
    "Core concept 1 that appears in all three versions",
    "Core concept 2 that appears in all three versions",
    "Core concept 3 that appears in all three versions"
  ]
}

Ensure each passage is engaging, informative, and appropriate for the target reading level.`;

    // Call Google Gemini API
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log('Calling Google Gemini API for leveled reading generation...');
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: READING_SYSTEM_PROMPT + '\n\n' + userPrompt }
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
    let generatedContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedContent) {
      throw new Error('No content generated from Gemini API');
    }

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

    // Parse the generated reading
    let readingData;
    try {
      readingData = JSON.parse(generatedContent.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('AI generated invalid JSON response');
    }

    console.log('Leveled reading generated successfully');

    // Generate UUID for the reading
    const readingId = crypto.randomUUID();

    // Save to database
    const { data: savedActivity, error: saveError } = await supabaseClient
      .from('generated_activities')
      .insert({
        id: readingId,
        lesson_plan_id: lessonPlanId,
        type: 'reading',
        content: {
          id: readingId,
          lessonPlanId: lessonPlanId,
          topic: readingData.topic,
          passages: readingData.passages,
          coreConceptsPreserved: readingData.coreConceptsPreserved,
          createdAt: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving leveled reading:', saveError);
      throw saveError;
    }

    console.log('Leveled reading saved to database');

    // Record usage after successful generation (Requirements: 12.3)
    await recordUsage(supabaseClient, user.id, 'reading', limitCheck.tier, {
      activity_id: savedActivity.id,
      lesson_plan_id: lessonPlanId,
    });

    // Add rate limit headers to response (Requirements: 12.5)
    const rateLimitHeaders = createRateLimitHeaders(limitCheck);

    return new Response(JSON.stringify(savedActivity), {
      headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-reading:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      {
        status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

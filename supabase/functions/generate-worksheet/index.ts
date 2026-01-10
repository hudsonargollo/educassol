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
 * Worksheet section types
 * Requirements: 6.2, 6.3
 */
const WorksheetSectionTypeSchema = z.enum([
  'vocabulary-matching',
  'cloze',
  'diagram-labeling',
  'short-answer',
]);

/**
 * Request validation schema
 */
const generateWorksheetRequestSchema = z.object({
  lessonPlanId: z.string().uuid(),
  sectionTypes: z.array(WorksheetSectionTypeSchema).min(1).default(['vocabulary-matching', 'cloze']),
  title: z.string().max(200).optional(),
  includeAnswerKey: z.boolean().default(true),
});

/**
 * System prompt for worksheet generation
 * Requirements: 6.1, 6.2, 6.3
 */
const WORKSHEET_SYSTEM_PROMPT = `You are Educasol AI, an expert worksheet designer.
Your goal is to create engaging, educational worksheets that reinforce lesson content.

ALWAYS follow these rules:
1. Extract key vocabulary from the lesson context for vocabulary matching activities
2. Generate cloze (fill-in-the-blank) passages from lesson summaries
3. Create clear instructions for each section
4. Ensure content is age-appropriate and aligned to lesson objectives

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
    const limitCheck = await checkUsageLimit(supabaseClient, user.id, 'worksheet');
    
    if (!limitCheck.allowed) {
      return createLimitExceededResponse(limitCheck, 'worksheet', corsHeaders);
    }

    // Parse and validate request
    const requestBody = await req.json();
    const validationResult = generateWorksheetRequestSchema.safeParse(requestBody);
    
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

    const { lessonPlanId, sectionTypes, title, includeAnswerKey } = validationResult.data;

    console.log('Generating worksheet for lesson plan:', lessonPlanId);

    // Fetch lesson plan context
    // Requirement 6.1: Extract key vocabulary from the lesson context
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

    // Build section instructions for the prompt
    const sectionInstructions = sectionTypes.map(type => {
      switch (type) {
        case 'vocabulary-matching':
          return `- Vocabulary Matching: Create a matching activity with terms and definitions from the lesson vocabulary`;
        case 'cloze':
          return `- Cloze Passage: Create a fill-in-the-blank passage summarizing key concepts`;
        case 'diagram-labeling':
          return `- Diagram Labeling: Create a labeling activity with positions and answers`;
        case 'short-answer':
          return `- Short Answer: Create comprehension questions with expected answers`;
        default:
          return '';
      }
    }).join('\n');

    // Build the prompt with lesson context
    const userPrompt = `Generate a worksheet based on the following lesson plan:

Topic: ${lessonPlan.topic}
Subject: ${lessonPlan.subject}
Grade Level: ${lessonPlan.grade_level}
Learning Objective: ${lessonPlan.learning_objective}

Key Vocabulary:
${JSON.stringify(lessonPlan.key_vocabulary || [], null, 2)}

Lesson Phases:
${JSON.stringify(lessonPlan.phases || [], null, 2)}

Generate a worksheet with the following sections:
${sectionInstructions}

Return a JSON object with this exact structure:
{
  "title": "${title || `Worksheet: ${lessonPlan.topic}`}",
  "sections": [
    {
      "type": "vocabulary-matching",
      "instructions": "Match each term with its correct definition.",
      "content": {
        "terms": [
          { "term": "Term 1", "definition": "Definition 1" }
        ]
      }
    },
    {
      "type": "cloze",
      "instructions": "Fill in the blanks with the correct words.",
      "content": {
        "text": "The _____ is an important concept that _____.",
        "answers": ["word1", "word2"]
      }
    },
    {
      "type": "short-answer",
      "instructions": "Answer the following questions in complete sentences.",
      "content": {
        "questions": [
          { "question": "Question text?", "expectedAnswer": "Expected answer" }
        ]
      }
    }
  ],
  "markdownContent": "# Worksheet Title\\n\\n## Section 1: Vocabulary Matching\\n..."
}

The markdownContent should be a complete, formatted version of the worksheet suitable for PDF export.
${includeAnswerKey ? 'Include an answer key section at the end of the markdownContent.' : ''}`;

    // Call Google Gemini API
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log('Calling Google Gemini API for worksheet generation...');
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: WORKSHEET_SYSTEM_PROMPT + '\n\n' + userPrompt }
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

    // Parse the generated worksheet
    let worksheetData;
    try {
      worksheetData = JSON.parse(generatedContent.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('AI generated invalid JSON response');
    }

    console.log('Worksheet generated successfully');

    // Generate UUID for the worksheet
    const worksheetId = crypto.randomUUID();

    // Save to database
    const { data: savedActivity, error: saveError } = await supabaseClient
      .from('generated_activities')
      .insert({
        id: worksheetId,
        lesson_plan_id: lessonPlanId,
        type: 'worksheet',
        content: {
          id: worksheetId,
          lessonPlanId: lessonPlanId,
          title: worksheetData.title,
          sections: worksheetData.sections,
          markdownContent: worksheetData.markdownContent,
          createdAt: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving worksheet:', saveError);
      throw saveError;
    }

    console.log('Worksheet saved to database');

    // Record usage after successful generation (Requirements: 12.3)
    await recordUsage(supabaseClient, user.id, 'worksheet', limitCheck.tier, {
      activity_id: savedActivity.id,
      lesson_plan_id: lessonPlanId,
    });

    // Add rate limit headers to response (Requirements: 12.5)
    const rateLimitHeaders = createRateLimitHeaders(limitCheck);

    return new Response(JSON.stringify(savedActivity), {
      headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-worksheet:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      {
        status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

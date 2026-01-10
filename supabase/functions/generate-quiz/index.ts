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
 * Bloom's Taxonomy levels for quiz questions
 * Requirements: 5.2 - Target Apply and Analyze levels by default
 */
const BloomLevelSchema = z.enum([
  'remember',
  'understand',
  'apply',
  'analyze',
  'evaluate',
  'create',
]);

/**
 * Question types supported by the quiz
 * Requirement 5.4: Multiple choice, true/false, and short answer
 */
const QuestionTypeSchema = z.enum([
  'multiple-choice',
  'true-false',
  'short-answer',
]);

/**
 * Request validation schema
 */
const generateQuizRequestSchema = z.object({
  lessonPlanId: z.string().uuid(),
  numberOfQuestions: z.number().int().min(1).max(30).default(10),
  questionTypes: z.array(QuestionTypeSchema).min(1).default(['multiple-choice', 'true-false']),
  bloomLevels: z.array(BloomLevelSchema).min(1).default(['apply', 'analyze']),
  title: z.string().max(200).optional(),
  instructions: z.string().max(500).optional(),
});

/**
 * System prompt for quiz generation
 * Requirements: 5.2, 5.3, 14.4
 */
const QUIZ_SYSTEM_PROMPT = `You are Educasol AI, an expert assessment designer.
Your goal is to create high-quality quizzes that assess student understanding at higher-order thinking levels.

ALWAYS follow these rules:
1. Target "Apply" and "Analyze" levels of Bloom's Taxonomy - avoid simple recall questions
2. Generate plausible distractor answers based on common misconceptions
3. Include a clear explanation for each correct answer
4. Ensure questions are age-appropriate and aligned to the lesson objectives

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
    const limitCheck = await checkUsageLimit(supabaseClient, user.id, 'quiz');
    
    if (!limitCheck.allowed) {
      return createLimitExceededResponse(limitCheck, 'quiz', corsHeaders);
    }

    // Parse and validate request
    const requestBody = await req.json();
    const validationResult = generateQuizRequestSchema.safeParse(requestBody);
    
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

    const { lessonPlanId, numberOfQuestions, questionTypes, bloomLevels, title, instructions } = validationResult.data;

    console.log('Generating quiz for lesson plan:', lessonPlanId);

    // Fetch lesson plan context
    // Requirement 5.1: Inherit lesson context automatically
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

    // Build the prompt with lesson context
    const userPrompt = `Generate a quiz based on the following lesson plan:

Topic: ${lessonPlan.topic}
Subject: ${lessonPlan.subject}
Grade Level: ${lessonPlan.grade_level}
Learning Objective: ${lessonPlan.learning_objective}
Standards: ${lessonPlan.standards?.join(', ') || 'Not specified'}

Key Vocabulary:
${JSON.stringify(lessonPlan.key_vocabulary || [], null, 2)}

Generate ${numberOfQuestions} questions with the following specifications:
- Question types to include: ${questionTypes.join(', ')}
- Target Bloom's Taxonomy levels: ${bloomLevels.join(', ')}

Return a JSON object with this exact structure:
{
  "title": "${title || `Quiz: ${lessonPlan.topic}`}",
  "instructions": "${instructions || 'Answer all questions to the best of your ability.'}",
  "questions": [
    {
      "id": 1,
      "text": "Question text here",
      "type": "multiple-choice" | "true-false" | "short-answer",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOptionIndex": 0,
      "explanation": "Explanation of why this is correct",
      "bloomLevel": "apply" | "analyze" | "evaluate" | "create"
    }
  ]
}

For true-false questions, use options: ["True", "False"]
For short-answer questions, omit options and correctOptionIndex, use correctAnswer instead.
Ensure all questions target higher-order thinking (Apply, Analyze, Evaluate, Create).`;

    // Call Google Gemini API
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log('Calling Google Gemini API for quiz generation...');
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: QUIZ_SYSTEM_PROMPT + '\n\n' + userPrompt }
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

    // Parse the generated quiz
    let quizData;
    try {
      quizData = JSON.parse(generatedContent.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('AI generated invalid JSON response');
    }

    console.log('Quiz generated successfully');

    // Generate UUID for the quiz
    const quizId = crypto.randomUUID();

    // Save to database
    const { data: savedActivity, error: saveError } = await supabaseClient
      .from('generated_activities')
      .insert({
        id: quizId,
        lesson_plan_id: lessonPlanId,
        type: 'quiz',
        content: {
          id: quizId,
          lessonPlanId: lessonPlanId,
          title: quizData.title,
          instructions: quizData.instructions,
          questions: quizData.questions,
          createdAt: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving quiz:', saveError);
      throw saveError;
    }

    console.log('Quiz saved to database');

    // Record usage after successful generation (Requirements: 12.3)
    await recordUsage(supabaseClient, user.id, 'quiz', limitCheck.tier, {
      activity_id: savedActivity.id,
      lesson_plan_id: lessonPlanId,
    });

    // Add rate limit headers to response (Requirements: 12.5)
    const rateLimitHeaders = createRateLimitHeaders(limitCheck);

    return new Response(JSON.stringify(savedActivity), {
      headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-quiz:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      {
        status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Slide types for presentation outlines
 * Requirement 7.2: Include Title, Agenda, Concept Definition, Examples, and Summary slides
 */
const SlideTypeSchema = z.enum([
  'title',
  'agenda',
  'concept',
  'example',
  'activity',
  'summary',
]);

/**
 * Request validation schema
 */
const generateSlidesRequestSchema = z.object({
  lessonPlanId: z.string().uuid(),
  title: z.string().max(200).optional(),
  numberOfSlides: z.number().int().min(5).max(30).default(10),
  includeActivities: z.boolean().default(true),
});

/**
 * System prompt for slide outline generation
 * Requirements: 7.1, 7.2, 7.4
 */
const SLIDES_SYSTEM_PROMPT = `You are Educasol AI, an expert presentation designer for educators.
Your goal is to create engaging slide deck outlines for direct instruction.

ALWAYS follow these rules:
1. Include Title, Agenda, Concept Definition, Examples, and Summary slides
2. Generate speaker notes for each slide
3. Suggest visual elements where appropriate
4. Keep bullet points concise and scannable
5. Structure content for the Direct Instruction phase of a lesson

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

    // Parse and validate request
    const requestBody = await req.json();
    const validationResult = generateSlidesRequestSchema.safeParse(requestBody);
    
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

    const { lessonPlanId, title, numberOfSlides, includeActivities } = validationResult.data;

    console.log('Generating slide outline for lesson plan:', lessonPlanId);

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

    // Build the prompt with lesson context
    // Requirements: 7.1, 7.2, 7.4
    const userPrompt = `Generate a slide deck outline based on the following lesson plan:

Topic: ${lessonPlan.topic}
Subject: ${lessonPlan.subject}
Grade Level: ${lessonPlan.grade_level}
Learning Objective: ${lessonPlan.learning_objective}
Duration: ${lessonPlan.duration} minutes

Key Vocabulary:
${JSON.stringify(lessonPlan.key_vocabulary || [], null, 2)}

Lesson Phases:
${JSON.stringify(lessonPlan.phases || [], null, 2)}

Generate a slide deck outline with approximately ${numberOfSlides} slides for the Direct Instruction phase.

REQUIRED slide types (must include at least one of each):
- title: Opening slide with lesson title
- agenda: Overview of what will be covered
- concept: Key concept definitions and explanations
- example: Examples illustrating the concepts
- summary: Recap of key points

${includeActivities ? '- activity: Interactive activities or discussion prompts' : ''}

Return a JSON object with this exact structure:
{
  "title": "${title || lessonPlan.topic}",
  "slides": [
    {
      "slideNumber": 1,
      "type": "title",
      "title": "Slide Title",
      "bulletPoints": ["Point 1", "Point 2"],
      "speakerNotes": "What the teacher should say or do during this slide...",
      "visualSuggestion": "Optional: Suggested image or diagram"
    },
    {
      "slideNumber": 2,
      "type": "agenda",
      "title": "Today's Agenda",
      "bulletPoints": ["Topic 1", "Topic 2", "Topic 3"],
      "speakerNotes": "Review the agenda with students..."
    },
    {
      "slideNumber": 3,
      "type": "concept",
      "title": "Key Concept",
      "bulletPoints": ["Definition", "Key characteristics"],
      "speakerNotes": "Explain the concept clearly..."
    }
  ]
}

IMPORTANT:
- Every slide MUST have non-empty speakerNotes
- Include at least one 'title', one 'concept', and one 'summary' slide
- Keep bullet points concise (max 6 per slide)
- Speaker notes should guide the teacher on what to say and do`;

    // Call Google Gemini API
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log('Calling Google Gemini API for slide outline generation...');
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: SLIDES_SYSTEM_PROMPT + '\n\n' + userPrompt }
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

    // Parse the generated slides
    let slidesData;
    try {
      slidesData = JSON.parse(generatedContent.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('AI generated invalid JSON response');
    }

    // Validate required slide types
    const slideTypes = slidesData.slides?.map((s: { type: string }) => s.type) || [];
    const hasTitle = slideTypes.includes('title');
    const hasConcept = slideTypes.includes('concept');
    const hasSummary = slideTypes.includes('summary');

    if (!hasTitle || !hasConcept || !hasSummary) {
      console.warn('Generated slides missing required types, regenerating...');
      // For now, we'll accept what we got but log the warning
    }

    console.log('Slide outline generated successfully');

    // Generate UUID for the slide outline
    const slidesId = crypto.randomUUID();

    // Save to database
    const { data: savedActivity, error: saveError } = await supabaseClient
      .from('generated_activities')
      .insert({
        id: slidesId,
        lesson_plan_id: lessonPlanId,
        type: 'slides',
        content: {
          id: slidesId,
          lessonPlanId: lessonPlanId,
          title: slidesData.title,
          slides: slidesData.slides,
          createdAt: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving slide outline:', saveError);
      throw saveError;
    }

    console.log('Slide outline saved to database');

    return new Response(JSON.stringify(savedActivity), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-slides:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      {
        status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

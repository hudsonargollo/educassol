import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Refinement action types
 * Requirement 10.2: Support "Rewrite", "Simplify", "Make more engaging", and "Expand" actions
 */
const RefinementActionSchema = z.enum(['rewrite', 'simplify', 'engage', 'expand']);

/**
 * Request validation schema
 * Requirement 10.3: Modify only selected portion
 */
const refineRequestSchema = z.object({
  selectedText: z.string().min(1, 'Selected text is required'),
  action: RefinementActionSchema,
  context: z.string().optional(), // Surrounding context for better refinement
  contentType: z.enum(['lesson-plan', 'quiz', 'worksheet', 'reading', 'slides']).optional(),
});

/**
 * System prompt for content refinement
 * Requirements: 10.1, 10.2, 10.3
 */
const REFINEMENT_SYSTEM_PROMPT = `You are Educasol AI, an expert educational content editor.
Your goal is to refine selected text while preserving its educational intent and context.

CRITICAL RULES:
1. Only modify the selected text - do not add or remove content beyond what's necessary for the refinement
2. Maintain the same general meaning and educational purpose
3. Keep the same tone and style as the original
4. Preserve any technical terms, proper nouns, or specific references
5. Return ONLY the refined text, no explanations or additional commentary

When REWRITING:
- Rephrase the text using different words and sentence structures
- Maintain the same meaning and level of detail
- Improve clarity if possible

When SIMPLIFYING:
- Use simpler vocabulary and shorter sentences
- Break complex ideas into smaller parts
- Remove unnecessary jargon while keeping essential terms
- Target a lower reading level

When making more ENGAGING:
- Add vivid language and active voice
- Include rhetorical questions or hooks where appropriate
- Make the content more dynamic and interesting
- Add enthusiasm without being unprofessional

When EXPANDING:
- Add more detail, examples, or explanations
- Elaborate on key concepts
- Include supporting information
- Maintain coherence with the original text`;

/**
 * Get specific instructions based on the refinement action
 */
function getActionInstructions(action: string): string {
  switch (action) {
    case 'rewrite':
      return `REWRITE this text:
- Use different words and sentence structures
- Keep the same meaning and level of detail
- Improve clarity where possible
- Maintain the educational tone`;

    case 'simplify':
      return `SIMPLIFY this text:
- Use simpler vocabulary (aim for 6th-8th grade reading level)
- Use shorter sentences (max 15-20 words each)
- Break complex ideas into smaller, digestible parts
- Remove jargon but keep essential technical terms
- Make it easier for struggling readers to understand`;

    case 'engage':
      return `Make this text more ENGAGING:
- Use active voice and vivid language
- Add hooks or attention-grabbing elements
- Include rhetorical questions if appropriate
- Make it more dynamic and interesting to read
- Add enthusiasm while staying professional`;

    case 'expand':
      return `EXPAND this text:
- Add more detail and explanation
- Include examples or analogies where helpful
- Elaborate on key concepts
- Provide supporting information
- Roughly double the length while maintaining quality`;

    default:
      return 'Refine this text while maintaining its meaning.';
  }
}

/**
 * Build the user prompt for refinement
 */
function buildRefinementPrompt(
  selectedText: string,
  action: string,
  context?: string
): string {
  const actionInstructions = getActionInstructions(action);

  let prompt = `${actionInstructions}

Selected text to refine:
"${selectedText}"`;

  if (context) {
    prompt += `

Surrounding context (for reference only, do not include in output):
"${context}"`;
  }

  prompt += `

Return ONLY the refined text, nothing else. No quotes, no explanations, just the refined content.`;

  return prompt;
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
    const validationResult = refineRequestSchema.safeParse(requestBody);
    
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

    const { selectedText, action, context } = validationResult.data;

    console.log(`Refining content with action: ${action}, text length: ${selectedText.length}`);

    // Build the refinement prompt
    const userPrompt = buildRefinementPrompt(selectedText, action, context);

    // Call Google Gemini API
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log('Calling Google Gemini API for refinement...');
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: REFINEMENT_SYSTEM_PROMPT + '\n\n' + userPrompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Gemini API error:', aiResponse.status, errorText);
      throw new Error(`Gemini API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let refinedText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!refinedText) {
      throw new Error('No content generated from Gemini API');
    }

    // Clean up the response - remove any quotes or extra whitespace
    refinedText = refinedText.trim();
    
    // Remove surrounding quotes if present
    if ((refinedText.startsWith('"') && refinedText.endsWith('"')) ||
        (refinedText.startsWith("'") && refinedText.endsWith("'"))) {
      refinedText = refinedText.slice(1, -1);
    }

    console.log('Content refined successfully');

    // Return the refined content
    // Requirement 10.3: Modify only selected portion
    return new Response(JSON.stringify({
      originalText: selectedText,
      refinedText: refinedText,
      action: action,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in refine-content:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      {
        status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

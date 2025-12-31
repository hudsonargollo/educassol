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

    // Validation schema
    const requestSchema = z.object({
      grade: z.string().min(1).max(100),
      subject: z.string().min(1).max(200),
      topic: z.string().min(1).max(500).optional(),
    });

    const requestBody = await req.json();
    const validationResult = requestSchema.safeParse(requestBody);
    
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

    const { grade, subject, topic } = validationResult.data;

    console.log('Suggesting BNCC skills for:', { grade, subject, topic });

    // Build prompt for AI to suggest BNCC skills
    const systemPrompt = `Você é um especialista em BNCC (Base Nacional Comum Curricular) brasileira. Sua função é sugerir habilidades e competências da BNCC apropriadas para o contexto educacional fornecido.`;

    const userPrompt = `Com base nas seguintes informações, sugira 3-5 habilidades da BNCC mais relevantes:

Ano: ${grade}
Disciplina: ${subject}
${topic ? `Tema: ${topic}` : ''}

Para cada habilidade, forneça:
1. Código BNCC (ex: EF05MA01)
2. Descrição da habilidade
3. Relevância para o contexto (1-2 frases)

Formato de resposta (JSON):
{
  "skills": [
    {
      "code": "string",
      "description": "string",
      "relevance": "string"
    }
  ]
}`;

    // Call Google Gemini API
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log('Calling Google Gemini API for BNCC suggestions...');
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
          maxOutputTokens: 4096,
        }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Gemini API error:', aiResponse.status, errorText);
      throw new Error(`Gemini API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    // Parse JSON response from AI
    const aiContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiContent) {
      throw new Error('No content generated from Gemini API');
    }
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, aiContent];
    const jsonText = jsonMatch[1] || aiContent;
    
    let suggestions;
    try {
      suggestions = JSON.parse(jsonText.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Failed to parse AI response as JSON');
    }

    console.log('BNCC suggestions generated successfully');

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in suggest-bncc-skills:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      {
        status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

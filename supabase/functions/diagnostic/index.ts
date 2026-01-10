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
    const diagnostics = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries()),
      environment: {
        SUPABASE_URL: Deno.env.get('SUPABASE_URL') ? 'SET' : 'NOT_SET',
        SUPABASE_ANON_KEY: Deno.env.get('SUPABASE_ANON_KEY') ? 'SET' : 'NOT_SET',
        GEMINI_API_KEY: Deno.env.get('GEMINI_API_KEY') ? 'SET' : 'NOT_SET',
      },
      deno: {
        version: Deno.version.deno,
        v8: Deno.version.v8,
        typescript: Deno.version.typescript,
      }
    };

    // Test Supabase connection
    try {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        diagnostics.supabase = {
          connection: 'SUCCESS',
          user: user ? { id: user.id, email: user.email } : null,
          error: userError?.message || null,
        };
      } else {
        diagnostics.supabase = {
          connection: 'NO_AUTH_HEADER',
          user: null,
          error: 'No authorization header provided',
        };
      }
    } catch (supabaseError) {
      diagnostics.supabase = {
        connection: 'ERROR',
        user: null,
        error: supabaseError instanceof Error ? supabaseError.message : 'Unknown error',
      };
    }

    // Test Gemini API connection
    try {
      const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
      if (GEMINI_API_KEY) {
        const testResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: 'Say hello in Portuguese' }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 100,
            }
          }),
        });

        diagnostics.gemini = {
          connection: testResponse.ok ? 'SUCCESS' : 'ERROR',
          status: testResponse.status,
          statusText: testResponse.statusText,
        };
      } else {
        diagnostics.gemini = {
          connection: 'NO_API_KEY',
          status: null,
          statusText: 'GEMINI_API_KEY not set',
        };
      }
    } catch (geminiError) {
      diagnostics.gemini = {
        connection: 'ERROR',
        status: null,
        statusText: geminiError instanceof Error ? geminiError.message : 'Unknown error',
      };
    }

    return new Response(JSON.stringify(diagnostics, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Diagnostic failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : null,
      }, null, 2), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
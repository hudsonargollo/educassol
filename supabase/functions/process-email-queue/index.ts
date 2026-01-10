/**
 * Edge Function: process-email-queue
 * 
 * Processes scheduled emails from the automation_queue table.
 * Should be called periodically via cron (e.g., every 5 minutes).
 * 
 * This function calls trigger-automation with the 'process.scheduled_emails' event.
 * 
 * Requirements: 6.2, 6.3
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing Supabase configuration' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Call trigger-automation with process.scheduled_emails event
    // We use a dummy userId since this is a system-level operation
    const response = await fetch(`${supabaseUrl}/functions/v1/trigger-automation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        event: 'process.scheduled_emails',
        userId: '00000000-0000-0000-0000-000000000000', // System user placeholder
        timestamp: new Date().toISOString(),
        payload: {},
      }),
    });

    const result = await response.json();

    console.log('Process email queue result:', result);

    return new Response(
      JSON.stringify({
        success: result.success,
        action: result.action,
        error: result.error,
        processedAt: new Date().toISOString(),
      }),
      {
        status: result.success ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in process-email-queue:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

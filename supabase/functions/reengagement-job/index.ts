/**
 * Edge Function: reengagement-job
 * 
 * Identifies users who have been inactive for 14+ days and triggers re-engagement emails.
 * Should be called daily via cron job.
 * 
 * Requirements: 7.1, 7.3
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Calculate the cutoff date (14 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 14);

    console.log(`Looking for users inactive since: ${cutoffDate.toISOString()}`);

    // Find users who:
    // 1. Haven't logged in for 14+ days
    // 2. Have marketing consent (LGPD compliance - Requirement 7.3)
    // 3. Haven't received a re-engagement email recently (handled by cooldown in trigger-automation)
    const { data: inactiveUsers, error: fetchError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        last_sign_in_at,
        marketing_preferences!inner(lgpd_consent, newsletter)
      `)
      .lt('last_sign_in_at', cutoffDate.toISOString())
      .eq('marketing_preferences.lgpd_consent', true)
      .eq('marketing_preferences.newsletter', true)
      .limit(100); // Process in batches to avoid timeouts

    if (fetchError) {
      console.error('Error fetching inactive users:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: fetchError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!inactiveUsers || inactiveUsers.length === 0) {
      console.log('No inactive users found');
      return new Response(
        JSON.stringify({
          success: true,
          action: 'no_inactive_users',
          processedAt: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Found ${inactiveUsers.length} inactive users`);

    const results = [];
    const errors = [];

    // Process each inactive user
    for (const user of inactiveUsers) {
      try {
        const daysSinceActive = Math.floor(
          (Date.now() - new Date(user.last_sign_in_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Trigger re-engagement automation
        const response = await fetch(`${supabaseUrl}/functions/v1/trigger-automation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            event: 'user.inactive_14d',
            userId: user.id,
            timestamp: new Date().toISOString(),
            payload: {
              lastActiveAt: user.last_sign_in_at,
              daysSinceActive,
            },
          }),
        });

        const result = await response.json();

        if (result.success) {
          results.push({
            userId: user.id,
            email: user.email,
            daysSinceActive,
            action: result.action,
          });
          console.log(`Triggered re-engagement for user ${user.id} (${daysSinceActive} days inactive)`);
        } else {
          errors.push({
            userId: user.id,
            email: user.email,
            error: result.error,
          });
          console.error(`Failed to trigger re-engagement for user ${user.id}:`, result.error);
        }
      } catch (userError) {
        console.error(`Error processing user ${user.id}:`, userError);
        errors.push({
          userId: user.id,
          email: user.email,
          error: userError instanceof Error ? userError.message : 'Unknown error',
        });
      }
    }

    const summary = {
      success: true,
      totalFound: inactiveUsers.length,
      processed: results.length,
      errors: errors.length,
      results: results.slice(0, 10), // Include first 10 results for debugging
      processedAt: new Date().toISOString(),
    };

    if (errors.length > 0) {
      summary.success = false;
      console.error(`Re-engagement job completed with ${errors.length} errors`);
    } else {
      console.log(`Re-engagement job completed successfully. Processed ${results.length} users.`);
    }

    return new Response(
      JSON.stringify(summary),
      {
        status: summary.success ? 200 : 207, // 207 Multi-Status for partial success
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in reengagement-job:', error);
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
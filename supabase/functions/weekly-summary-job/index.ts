/**
 * Edge Function: weekly-summary-job
 * 
 * Calculates weekly activity metrics for active users and triggers activity summary emails.
 * Should be called weekly (e.g., Sunday night) via cron job.
 * 
 * Requirements: 9.1, 9.3, 9.4
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeeklyMetrics {
  userId: string;
  email: string;
  fullName: string | null;
  plansCreated: number;
  activitiesGenerated: number;
  assessmentsCreated: number;
  totalActivity: number;
}

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

    // Calculate the week range (last 7 days)
    const weekEndDate = new Date();
    weekEndDate.setHours(23, 59, 59, 999); // End of today
    
    const weekStartDate = new Date(weekEndDate);
    weekStartDate.setDate(weekStartDate.getDate() - 6); // 7 days ago
    weekStartDate.setHours(0, 0, 0, 0); // Start of that day

    console.log(`Calculating weekly metrics from ${weekStartDate.toISOString()} to ${weekEndDate.toISOString()}`);

    // Get all users who have product_updates consent (Requirement 9.3)
    const { data: eligibleUsers, error: usersError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        marketing_preferences!inner(product_updates)
      `)
      .eq('marketing_preferences.product_updates', true)
      .limit(500); // Process in batches

    if (usersError) {
      console.error('Error fetching eligible users:', usersError);
      return new Response(
        JSON.stringify({ success: false, error: usersError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!eligibleUsers || eligibleUsers.length === 0) {
      console.log('No eligible users found');
      return new Response(
        JSON.stringify({
          success: true,
          action: 'no_eligible_users',
          processedAt: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Found ${eligibleUsers.length} eligible users`);

    const weeklyMetrics: WeeklyMetrics[] = [];

    // Calculate metrics for each user
    for (const user of eligibleUsers) {
      try {
        // Count lesson plans created this week
        const { count: plansCreated } = await supabase
          .from('lesson_plans')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', weekStartDate.toISOString())
          .lte('created_at', weekEndDate.toISOString());

        // Count activities generated this week
        const { count: activitiesGenerated } = await supabase
          .from('generated_activities')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', weekStartDate.toISOString())
          .lte('created_at', weekEndDate.toISOString());

        // Count assessments created this week
        const { count: assessmentsCreated } = await supabase
          .from('generated_assessments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', weekStartDate.toISOString())
          .lte('created_at', weekEndDate.toISOString());

        const metrics: WeeklyMetrics = {
          userId: user.id,
          email: user.email,
          fullName: user.full_name,
          plansCreated: plansCreated || 0,
          activitiesGenerated: activitiesGenerated || 0,
          assessmentsCreated: assessmentsCreated || 0,
          totalActivity: (plansCreated || 0) + (activitiesGenerated || 0) + (assessmentsCreated || 0),
        };

        // Only include users with activity (Requirement 9.4)
        if (metrics.totalActivity > 0) {
          weeklyMetrics.push(metrics);
        }
      } catch (userError) {
        console.error(`Error calculating metrics for user ${user.id}:`, userError);
        // Continue with other users
      }
    }

    console.log(`Found ${weeklyMetrics.length} users with activity this week`);

    if (weeklyMetrics.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          action: 'no_active_users',
          weekStartDate: weekStartDate.toISOString(),
          weekEndDate: weekEndDate.toISOString(),
          processedAt: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const results = [];
    const errors = [];

    // Trigger weekly summary for each active user
    for (const metrics of weeklyMetrics) {
      try {
        // Trigger weekly summary automation
        const response = await fetch(`${supabaseUrl}/functions/v1/trigger-automation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            event: 'weekly.summary',
            userId: metrics.userId,
            timestamp: new Date().toISOString(),
            payload: {
              weekStartDate: weekStartDate.toISOString().split('T')[0], // YYYY-MM-DD format
              weekEndDate: weekEndDate.toISOString().split('T')[0],
              plansCreated: metrics.plansCreated,
              activitiesGenerated: metrics.activitiesGenerated,
              assessmentsCreated: metrics.assessmentsCreated,
            },
          }),
        });

        const result = await response.json();

        if (result.success) {
          results.push({
            userId: metrics.userId,
            email: metrics.email,
            totalActivity: metrics.totalActivity,
            action: result.action,
          });
          console.log(`Triggered weekly summary for user ${metrics.userId} (${metrics.totalActivity} activities)`);
        } else {
          errors.push({
            userId: metrics.userId,
            email: metrics.email,
            error: result.error,
          });
          console.error(`Failed to trigger weekly summary for user ${metrics.userId}:`, result.error);
        }
      } catch (userError) {
        console.error(`Error processing user ${metrics.userId}:`, userError);
        errors.push({
          userId: metrics.userId,
          email: metrics.email,
          error: userError instanceof Error ? userError.message : 'Unknown error',
        });
      }
    }

    const summary = {
      success: true,
      weekStartDate: weekStartDate.toISOString().split('T')[0],
      weekEndDate: weekEndDate.toISOString().split('T')[0],
      totalEligible: eligibleUsers.length,
      activeUsers: weeklyMetrics.length,
      processed: results.length,
      errors: errors.length,
      results: results.slice(0, 10), // Include first 10 results for debugging
      processedAt: new Date().toISOString(),
    };

    if (errors.length > 0) {
      summary.success = false;
      console.error(`Weekly summary job completed with ${errors.length} errors`);
    } else {
      console.log(`Weekly summary job completed successfully. Processed ${results.length} users.`);
    }

    return new Response(
      JSON.stringify(summary),
      {
        status: summary.success ? 200 : 207, // 207 Multi-Status for partial success
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in weekly-summary-job:', error);
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
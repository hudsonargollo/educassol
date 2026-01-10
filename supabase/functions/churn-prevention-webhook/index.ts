/**
 * Edge Function: churn-prevention-webhook
 * 
 * Handles subscription cancellation webhooks and triggers churn survey emails.
 * This function should be called by payment providers (e.g., Mercado Pago, Stripe) 
 * when a subscription is cancelled.
 * 
 * Requirements: 8.1
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Webhook payload schema (adapt based on your payment provider)
const CancellationWebhookSchema = z.object({
  userId: z.string().uuid(),
  subscriptionId: z.string().optional(),
  reason: z.string().optional(),
  previousTier: z.enum(['free', 'premium', 'enterprise']).optional(),
  cancelledAt: z.string().datetime().optional(),
});

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

    // Parse and validate webhook payload
    const body = await req.json();
    console.log('Received cancellation webhook:', JSON.stringify(body, null, 2));

    const validationResult = CancellationWebhookSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('Webhook payload validation failed:', validationResult.error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid webhook payload',
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { userId, reason, previousTier } = validationResult.data;

    // Verify user exists
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('User not found:', userId);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'User not found',
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Trigger churn prevention automation
    const response = await fetch(`${supabaseUrl}/functions/v1/trigger-automation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        event: 'subscription.cancelled',
        userId,
        timestamp: new Date().toISOString(),
        payload: {
          reason,
          previousTier,
        },
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log(`Triggered churn prevention for user ${userId}`);
      return new Response(
        JSON.stringify({
          success: true,
          userId,
          action: result.action,
          processedAt: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      console.error(`Failed to trigger churn prevention for user ${userId}:`, result.error);
      return new Response(
        JSON.stringify({
          success: false,
          userId,
          error: result.error,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    console.error('Error in churn-prevention-webhook:', error);
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
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
    const MP_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');

    if (!MP_ACCESS_TOKEN) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN not configured');
    }

    // Create Supabase client with service role for webhook processing
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const { type, data } = body;

    console.log('Received MercadoPago webhook:', type, data);

    // Handle subscription_preapproval IPN events (Requirements: 10.2, 10.4, 10.5)
    if (type === 'subscription_preapproval') {
      // Verify webhook authenticity by fetching the resource from MercadoPago
      const preapprovalResponse = await fetch(
        `https://api.mercadopago.com/preapproval/${data.id}`,
        {
          headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
        }
      );

      if (!preapprovalResponse.ok) {
        console.error('Failed to verify preapproval:', await preapprovalResponse.text());
        return new Response(
          JSON.stringify({ error: 'Failed to verify preapproval' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const preapproval = await preapprovalResponse.json();
      const userId = preapproval.external_reference;

      console.log('Processing preapproval status:', preapproval.status, 'for user:', userId);


      if (!userId) {
        console.error('No external_reference (user ID) found in preapproval');
        return new Response(
          JSON.stringify({ error: 'Missing user reference' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      switch (preapproval.status) {
        case 'authorized': {
          // Subscription activated - upgrade to premium (Requirements: 10.2)
          console.log('Upgrading user to premium:', userId);
          
          const { error: updateError } = await supabaseClient
            .from('profiles')
            .update({
              tier: 'premium',
              mp_subscription_id: preapproval.id,
              subscription_status: 'active',
            })
            .eq('id', userId);

          if (updateError) {
            console.error('Error updating profile to premium:', updateError);
            throw updateError;
          }
          
          console.log('User upgraded to premium successfully');
          break;
        }

        case 'cancelled': {
          // Subscription cancelled - downgrade to free (Requirements: 10.5)
          console.log('Downgrading user to free (cancelled):', userId);
          
          const { error: updateError } = await supabaseClient
            .from('profiles')
            .update({
              tier: 'free',
              subscription_status: 'cancelled',
            })
            .eq('mp_subscription_id', preapproval.id);

          if (updateError) {
            console.error('Error downgrading profile:', updateError);
            throw updateError;
          }
          
          console.log('User downgraded to free (cancelled) successfully');
          break;
        }

        case 'paused': {
          // Subscription paused - downgrade to free (Requirements: 10.4)
          console.log('Downgrading user to free (paused):', userId);
          
          const { error: updateError } = await supabaseClient
            .from('profiles')
            .update({
              tier: 'free',
              subscription_status: 'paused',
            })
            .eq('mp_subscription_id', preapproval.id);

          if (updateError) {
            console.error('Error downgrading profile:', updateError);
            throw updateError;
          }
          
          console.log('User downgraded to free (paused) successfully');
          break;
        }

        case 'pending': {
          // Payment pending - update status only
          console.log('Updating subscription status to pending:', userId);
          
          const { error: updateError } = await supabaseClient
            .from('profiles')
            .update({
              subscription_status: 'pending',
            })
            .eq('id', userId);

          if (updateError) {
            console.error('Error updating subscription status:', updateError);
            throw updateError;
          }
          
          console.log('Subscription status updated to pending');
          break;
        }

        default:
          console.log('Unhandled preapproval status:', preapproval.status);
      }
    }

    // Return success response to MercadoPago
    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in mp-webhook:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

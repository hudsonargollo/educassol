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
    const PREMIUM_PLAN_ID = Deno.env.get('MERCADOPAGO_PREMIUM_PLAN_ID');

    if (!MP_ACCESS_TOKEN) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN not configured');
    }

    if (!PREMIUM_PLAN_ID) {
      throw new Error('MERCADOPAGO_PREMIUM_PLAN_ID not configured');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating MercadoPago preference for user:', user.id);

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('mp_customer_id, email, name')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Failed to fetch user profile');
    }


    // Create or get MercadoPago customer
    let customerId = profile?.mp_customer_id;

    if (!customerId) {
      console.log('Creating new MercadoPago customer...');
      
      const customerResponse = await fetch('https://api.mercadopago.com/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: profile?.email || user.email,
          first_name: profile?.name?.split(' ')[0] || '',
          last_name: profile?.name?.split(' ').slice(1).join(' ') || '',
        }),
      });

      if (!customerResponse.ok) {
        // Customer might already exist with this email, try to search
        const searchResponse = await fetch(
          `https://api.mercadopago.com/v1/customers/search?email=${encodeURIComponent(profile?.email || user.email || '')}`,
          {
            headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
          }
        );
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.results && searchData.results.length > 0) {
            customerId = searchData.results[0].id;
          }
        }
        
        if (!customerId) {
          const errorText = await customerResponse.text();
          console.error('MercadoPago customer creation error:', errorText);
          throw new Error('Failed to create MercadoPago customer');
        }
      } else {
        const customer = await customerResponse.json();
        customerId = customer.id;
      }

      // Save customer ID to profile
      await supabaseClient
        .from('profiles')
        .update({ mp_customer_id: customerId })
        .eq('id', user.id);

      console.log('MercadoPago customer created:', customerId);
    }

    // Get origin for back_url
    const origin = req.headers.get('origin') || 'https://educasol.com.br';

    // Create subscription preapproval (recurring payment)
    console.log('Creating subscription preapproval...');
    
    const preapprovalResponse = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        preapproval_plan_id: PREMIUM_PLAN_ID,
        payer_email: profile?.email || user.email,
        external_reference: user.id,
        back_url: `${origin}/dashboard?subscription=success`,
        status: 'pending',
      }),
    });

    if (!preapprovalResponse.ok) {
      const errorText = await preapprovalResponse.text();
      console.error('MercadoPago preapproval error:', errorText);
      throw new Error('Failed to create subscription preapproval');
    }

    const preapproval = await preapprovalResponse.json();
    console.log('Preapproval created:', preapproval.id);

    return new Response(
      JSON.stringify({
        init_point: preapproval.init_point,
        preapproval_id: preapproval.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in create-mp-preference:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

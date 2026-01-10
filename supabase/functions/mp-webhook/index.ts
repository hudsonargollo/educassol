import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Sends an email via the send-email Edge Function
 * Requirements: 4.2, 4.3
 */
async function sendEmail(
  supabaseUrl: string,
  serviceRoleKey: string,
  to: string,
  templateId: string,
  userId: string,
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        templateId,
        userId,
        data,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to send email:', errorData);
      return { success: false, error: errorData.error || `HTTP ${response.status}` };
    }

    const result = await response.json();
    return { success: result.success, error: result.error };
  } catch (error) {
    console.error('Error calling send-email function:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Gets user email from profiles table
 */
async function getUserEmail(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<string | null> {
  try {
    // First try to get from auth.users via admin API
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (!userError && userData?.user?.email) {
      return userData.user.email;
    }

    // Fallback to profiles table if it has email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (!profileError && profile?.email) {
      return profile.email;
    }

    return null;
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
}

/**
 * Gets user name from profiles table
 */
async function getUserName(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<string> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('full_name, display_name')
      .eq('id', userId)
      .single();

    if (!error && profile) {
      return profile.display_name || profile.full_name || 'Professor';
    }

    return 'Professor';
  } catch (error) {
    console.error('Error getting user name:', error);
    return 'Professor';
  }
}

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

          // Send premium-welcome email (Requirements: 4.2)
          const userEmail = await getUserEmail(supabaseClient, userId);
          const userName = await getUserName(supabaseClient, userId);
          
          if (userEmail) {
            console.log('Sending premium-welcome email to:', userEmail);
            const emailResult = await sendEmail(
              Deno.env.get('SUPABASE_URL') ?? '',
              Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
              userEmail,
              'premium-welcome',
              userId,
              {
                userName,
                planName: 'Premium',
                dashboardUrl: 'https://educasol.com.br/dashboard',
              }
            );
            
            if (!emailResult.success) {
              console.error('Failed to send premium-welcome email:', emailResult.error);
              // Don't throw - email failure shouldn't block the webhook
            } else {
              console.log('Premium-welcome email sent successfully');
            }
          } else {
            console.warn('Could not find email for user:', userId);
          }
          
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
          
          // Get user info before updating for email
          const userEmailPaused = await getUserEmail(supabaseClient, userId);
          const userNamePaused = await getUserName(supabaseClient, userId);
          
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

          // Send payment-failed email (Requirements: 4.3)
          if (userEmailPaused) {
            console.log('Sending payment-failed email to:', userEmailPaused);
            const emailResult = await sendEmail(
              Deno.env.get('SUPABASE_URL') ?? '',
              Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
              userEmailPaused,
              'payment-failed',
              userId,
              {
                userName: userNamePaused,
                planName: 'Premium',
                settingsUrl: 'https://educasol.com.br/settings/billing',
              }
            );
            
            if (!emailResult.success) {
              console.error('Failed to send payment-failed email:', emailResult.error);
            } else {
              console.log('Payment-failed email sent successfully');
            }
          }
          
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

    // Handle payment IPN events for failed payments (Requirements: 4.3)
    if (type === 'payment') {
      // Fetch payment details from MercadoPago
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${data.id}`,
        {
          headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
        }
      );

      if (!paymentResponse.ok) {
        console.error('Failed to verify payment:', await paymentResponse.text());
        return new Response(
          JSON.stringify({ error: 'Failed to verify payment' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const payment = await paymentResponse.json();
      console.log('Processing payment status:', payment.status, 'for external_reference:', payment.external_reference);

      // Handle rejected/cancelled payments
      if (payment.status === 'rejected' || payment.status === 'cancelled') {
        const paymentUserId = payment.external_reference;
        
        if (paymentUserId) {
          const userEmail = await getUserEmail(supabaseClient, paymentUserId);
          const userName = await getUserName(supabaseClient, paymentUserId);
          
          if (userEmail) {
            console.log('Sending payment-failed email for rejected payment to:', userEmail);
            
            // Calculate grace period end date (7 days from now)
            const gracePeriodEnd = new Date();
            gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);
            const gracePeriodEndDate = gracePeriodEnd.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });
            
            const emailResult = await sendEmail(
              Deno.env.get('SUPABASE_URL') ?? '',
              Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
              userEmail,
              'payment-failed',
              paymentUserId,
              {
                userName,
                planName: 'Premium',
                settingsUrl: 'https://educasol.com.br/settings/billing',
                gracePeriodEndDate,
                lastFourDigits: payment.card?.last_four_digits,
              }
            );
            
            if (!emailResult.success) {
              console.error('Failed to send payment-failed email:', emailResult.error);
            } else {
              console.log('Payment-failed email sent successfully');
            }
          }
        }
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

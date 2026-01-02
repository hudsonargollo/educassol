/**
 * useSubscription Hook
 * 
 * Manages MercadoPago subscription checkout flow.
 * Handles creating checkout sessions, redirecting to MercadoPago,
 * and processing success/cancel URL parameters.
 * 
 * Requirements: 10.1, 10.3
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Subscription status types
 */
export type SubscriptionStatus = 'active' | 'pending' | 'paused' | 'cancelled' | null;

/**
 * Subscription state
 */
export interface SubscriptionState {
  isLoading: boolean;
  error: string | null;
  subscriptionStatus: SubscriptionStatus;
  mpSubscriptionId: string | null;
}

/**
 * Return type for the useSubscription hook
 */
export interface UseSubscriptionReturn extends SubscriptionState {
  createCheckoutSession: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

/**
 * Custom hook for managing MercadoPago subscription
 * 
 * Requirements:
 * - 10.1: Create MercadoPago preapproval (subscription) with Premium plan ID
 * - 10.3: Redirect user to dashboard with success message after authorization
 * 
 * @returns Subscription state and control functions
 */
export function useSubscription(): UseSubscriptionReturn {
  const { toast } = useToast();
  const [state, setState] = useState<SubscriptionState>({
    isLoading: false,
    error: null,
    subscriptionStatus: null,
    mpSubscriptionId: null,
  });


  /**
   * Fetches current subscription status from profile
   */
  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_status, mp_subscription_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching subscription status:', profileError);
        return;
      }

      setState(prev => ({
        ...prev,
        subscriptionStatus: profile?.subscription_status as SubscriptionStatus,
        mpSubscriptionId: profile?.mp_subscription_id || null,
      }));
    } catch (err) {
      console.error('Error in fetchSubscriptionStatus:', err);
    }
  }, []);

  /**
   * Creates a MercadoPago checkout session and redirects to payment
   * Requirement 10.1: Create MercadoPago preapproval with Premium plan ID
   */
  const createCheckoutSession = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Not authenticated');
      }

      // Call the Edge Function to create MercadoPago preference
      const { data, error } = await supabase.functions.invoke('create-mp-preference', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (!data?.init_point) {
        throw new Error('No checkout URL returned');
      }

      // Redirect to MercadoPago checkout
      window.location.href = data.init_point;

    } catch (err) {
      console.error('Error in createCheckoutSession:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast({
        title: 'Erro ao iniciar pagamento',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [toast]);

  /**
   * Refresh subscription status
   */
  const refreshSubscription = useCallback(async () => {
    await fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  /**
   * Handle success/cancel URL parameters
   * Requirement 10.3: Redirect to dashboard with success message
   */
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const subscriptionParam = urlParams.get('subscription');

    if (subscriptionParam === 'success') {
      toast({
        title: 'Assinatura ativada!',
        description: 'Bem-vindo ao Educasol Premium! Aproveite recursos ilimitados.',
      });

      // Clean up URL parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);

      // Refresh subscription status
      fetchSubscriptionStatus();
    } else if (subscriptionParam === 'cancelled') {
      toast({
        title: 'Assinatura cancelada',
        description: 'O processo de assinatura foi cancelado.',
        variant: 'destructive',
      });

      // Clean up URL parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [toast, fetchSubscriptionStatus]);

  // Fetch subscription status on mount
  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  return {
    // State
    isLoading: state.isLoading,
    error: state.error,
    subscriptionStatus: state.subscriptionStatus,
    mpSubscriptionId: state.mpSubscriptionId,

    // Actions
    createCheckoutSession,
    refreshSubscription,
  };
}

export default useSubscription;

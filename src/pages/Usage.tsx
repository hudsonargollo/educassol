/**
 * Usage Page
 * 
 * Displays usage statistics dashboard with circular progress rings
 * for each generation type, billing period info, and upgrade CTA.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUsageContext } from '@/contexts/UsageContext';
import { UsageRing } from '@/components/usage';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';
import { Calendar, Clock, Sparkles } from 'lucide-react';

/**
 * Formats a date to a localized string
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Gets the tier display name and variant
 */
function getTierDisplay(tier: string): { name: string; variant: 'default' | 'secondary' | 'outline' } {
  switch (tier) {
    case 'premium':
      return { name: 'Premium', variant: 'default' };
    case 'enterprise':
      return { name: 'Enterprise', variant: 'default' };
    default:
      return { name: 'Grátis', variant: 'secondary' };
  }
}

/**
 * Usage Page Component
 * 
 * Displays:
 * - Usage rings for all generation types (Req 5.1)
 * - Billing period dates (Req 5.2)
 * - Tier badge (Req 5.3)
 * - Warning indicators at 80% (Req 5.4)
 * - Days until reset countdown (Req 5.5)
 * - "Unlimited" for premium users (Req 5.6)
 * - Upgrade CTA for free users (Req 5.7)
 */
export default function Usage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const {
    tier,
    currentPeriod,
    usage,
    isLoading: usageLoading,
    error,
  } = useUsageContext();

  // Auth check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
      } else {
        navigate('/auth');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleUpgrade = () => {
    // TODO: Implement MercadoPago checkout redirect
    console.log('Upgrade clicked');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    );
  }

  const tierDisplay = getTierDisplay(tier);
  const isFreeUser = tier === 'free';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Header user={user} onSignOut={handleSignOut} showNav={true} />

      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Uso da Plataforma</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Clock className="h-4 w-4" />
              {currentPeriod.daysRemaining} dias até a renovação
            </p>
          </div>
          <Badge variant={tierDisplay.variant} className="text-sm px-3 py-1">
            Plano {tierDisplay.name}
          </Badge>
        </div>

        {/* Billing Period Card */}
        <Card className="mb-8">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-full bg-examai-purple-500/10">
              <Calendar className="h-6 w-6 text-examai-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Período de Faturamento</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(currentPeriod.start)} — {formatDate(currentPeriod.end)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Usage Rings Grid */}
        {usageLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6">
                <div className="flex flex-col items-center">
                  <Skeleton className="w-24 h-24 rounded-full" />
                  <Skeleton className="w-20 h-4 mt-4" />
                  <Skeleton className="w-16 h-3 mt-2" />
                </div>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="mb-8 border-destructive">
            <CardContent className="p-6 text-center text-destructive">
              Erro ao carregar dados de uso: {error}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <UsageRing
                label="Planos de Aula"
                used={usage.lessonPlans.used}
                limit={usage.lessonPlans.limit}
                color="purple"
              />
            </Card>
            <Card>
              <UsageRing
                label="Atividades"
                used={usage.activities.used}
                limit={usage.activities.limit}
                color="blue"
              />
            </Card>
            <Card>
              <UsageRing
                label="Avaliações"
                used={usage.assessments.used}
                limit={usage.assessments.limit}
                color="amber"
              />
            </Card>
            <Card>
              <UsageRing
                label="Uploads"
                used={usage.fileUploads.used}
                limit={usage.fileUploads.limit}
                color="green"
              />
            </Card>
          </div>
        )}

        {/* Upgrade CTA for Free Users (Req 5.7) */}
        {isFreeUser && (
          <Card className="bg-gradient-to-r from-examai-purple-500/10 to-violet-500/10 border-examai-purple-500/20">
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-examai-purple-500/20">
                  <Sparkles className="h-6 w-6 text-examai-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Desbloqueie Acesso Ilimitado
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Atualize para o Premium e tenha gerações ilimitadas e recursos avançados.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleUpgrade}
                className="bg-gradient-to-r from-examai-purple-500 to-violet-500 hover:from-examai-purple-600 hover:to-violet-600 text-white whitespace-nowrap"
              >
                Assinar Premium
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Usage Legend */}
        <div className="mt-8 text-sm text-muted-foreground">
          <h4 className="font-medium text-foreground mb-2">Legenda</h4>
          <ul className="space-y-1">
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-examai-purple-500" />
              Normal - Uso dentro do limite
            </li>
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              Atenção - Uso acima de 80% do limite
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">∞</span>
              Ilimitado - Disponível para usuários Premium
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

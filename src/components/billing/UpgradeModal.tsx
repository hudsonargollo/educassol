/**
 * UpgradeModal Component
 * 
 * Displays when a free user exceeds their generation limit.
 * Shows pricing tier comparison and upgrade options.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */

import { Check, Crown, Sparkles, Building2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { LimitCategory } from '@/hooks/useUsage';
import { useSubscription } from '@/hooks/useSubscription';

/**
 * Props for the UpgradeModal component
 * Requirement 4.1: Display limit type and current usage
 */
export interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: LimitCategory;
  currentUsage: number;
  limit: number;
}

/**
 * Pricing tier configuration
 * Requirement 4.2: Display three pricing tiers
 */
interface PricingTier {
  id: 'free' | 'premium' | 'enterprise';
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  icon: typeof Crown;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Grátis',
    price: 'R$0',
    period: '/mês',
    features: [
      '5 planos de aula/mês',
      '10 atividades/mês',
      '3 avaliações/mês',
      '2 uploads de arquivo (15MB máx)',
      'Exportação apenas PDF',
      'Suporte comunidade',
    ],
    cta: 'Plano Atual',
    highlighted: false,
    icon: Sparkles,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'R$99,90',
    period: '/mês',
    features: [
      'Planos de aula ilimitados',
      'Atividades ilimitadas',
      'Avaliações ilimitadas',
      'Uploads ilimitados',
      'Exportação PDF, DOCX, Google Slides',
      'Gemini Pro (contexto 1M tokens)',
      'Suporte prioritário por email',
    ],
    cta: 'Assinar Premium',
    highlighted: true,
    icon: Crown,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Personalizado',
    period: '',
    features: [
      'Tudo do Premium',
      'Limites de uso personalizados',
      'Integração LMS (Canvas, Google Classroom)',
      'Agente de sucesso dedicado',
      'Contexto AI personalizado',
      'SSO & segurança avançada',
    ],
    cta: 'Falar com Vendas',
    highlighted: false,
    icon: Building2,
  },
];

/**
 * Maps limit category to display name
 */
function getLimitDisplayName(limitType: LimitCategory): string {
  switch (limitType) {
    case 'lessonPlans':
      return 'planos de aula';
    case 'activities':
      return 'atividades';
    case 'assessments':
      return 'avaliações';
    case 'fileUploads':
      return 'uploads de arquivo';
    default:
      return 'gerações';
  }
}

/**
 * UpgradeModal Component
 * 
 * Requirements:
 * - 4.1: Display immediately when limit exceeded with specific limit reached
 * - 4.2: Display three pricing tiers in card layout
 * - 4.3: Highlight Premium as recommended
 * - 4.4: Display feature comparison between tiers
 * - 4.5: Redirect to checkout on "Upgrade to Premium"
 * - 4.6: Include "Maybe Later" dismissal option
 */
export function UpgradeModal({
  isOpen,
  onClose,
  limitType,
  currentUsage,
  limit,
}: UpgradeModalProps) {
  const limitDisplayName = getLimitDisplayName(limitType);
  const { createCheckoutSession, isLoading } = useSubscription();

  /**
   * Handle upgrade to Premium
   * Requirement 4.5: Redirect to MercadoPago checkout flow
   */
  const handleUpgrade = async () => {
    await createCheckoutSession();
  };

  /**
   * Handle enterprise contact
   */
  const handleEnterpriseContact = () => {
    // Open contact form or email
    window.open('mailto:vendas@educasol.com.br?subject=Interesse no Plano Enterprise', '_blank');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl font-bold">
            Limite de {limitDisplayName} atingido
          </DialogTitle>
          <DialogDescription className="text-base">
            Você usou {currentUsage} de {limit} {limitDisplayName} este mês.
            Faça upgrade para continuar criando conteúdo incrível!
          </DialogDescription>
        </DialogHeader>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-4 py-4">
          {PRICING_TIERS.map((tier) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              isLoading={tier.id === 'premium' && isLoading}
              onSelect={
                tier.id === 'premium'
                  ? handleUpgrade
                  : tier.id === 'enterprise'
                  ? handleEnterpriseContact
                  : undefined
              }
            />
          ))}
        </div>

        {/* Maybe Later Button - Requirement 4.6 */}
        <div className="flex justify-center pt-4 border-t">
          <Button variant="ghost" onClick={onClose} className="text-muted-foreground">
            Talvez depois
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Individual Pricing Card Component
 */
interface PricingCardProps {
  tier: PricingTier;
  isLoading?: boolean;
  onSelect?: () => void;
}

function PricingCard({ tier, isLoading, onSelect }: PricingCardProps) {
  const Icon = tier.icon;
  const isCurrentPlan = tier.id === 'free';

  return (
    <Card
      className={cn(
        'relative flex flex-col',
        tier.highlighted && 'border-examai-purple-500 shadow-examai-purple'
      )}
    >
      {/* Recommended Badge - Requirement 4.3 */}
      {tier.highlighted && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-examai-purple-500">
          Recomendado
        </Badge>
      )}

      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-2">
          <div
            className={cn(
              'p-2 rounded-full',
              tier.highlighted
                ? 'bg-examai-purple-500/10 text-examai-purple-500'
                : 'bg-muted text-muted-foreground'
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <CardTitle className="text-lg">{tier.name}</CardTitle>
        <div className="mt-2">
          <span className="text-3xl font-bold">{tier.price}</span>
          <span className="text-muted-foreground">{tier.period}</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Features List - Requirement 4.4 */}
        <ul className="space-y-2 flex-1 mb-4">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Button
          variant={tier.highlighted ? 'default' : 'outline'}
          className={cn(
            'w-full',
            tier.highlighted && 'bg-examai-purple-500 hover:bg-examai-purple-600'
          )}
          onClick={onSelect}
          disabled={isCurrentPlan || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            tier.cta
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default UpgradeModal;

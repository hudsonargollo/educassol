import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Building2, Zap } from "lucide-react";
import { STAGGER_PARENT, FADE_UP_ITEM } from "@/lib/motion";
import { useSubscription } from "@/hooks/useSubscription";

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaVariant: 'default' | 'outline';
  highlighted: boolean;
  icon: typeof Zap;
}

const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Grátis',
    price: 'R$0',
    period: '/mês',
    description: 'Perfeito para começar',
    features: [
      '5 planos de aula/mês',
      '10 atividades/mês',
      '3 avaliações/mês',
      '2 arquivos (15MB máx)',
      'Exportação PDF',
      'Suporte comunidade',
    ],
    cta: 'Começar Grátis',
    ctaVariant: 'outline',
    highlighted: false,
    icon: Zap,
  },
  {
    name: 'Premium',
    price: 'R$99,90',
    period: '/mês',
    description: 'Para educadores dedicados',
    features: [
      'Gerações ilimitadas',
      'Arquivos ilimitados',
      'Exportação PDF/DOCX/Slides',
      'Contexto Gemini Pro',
      'Suporte prioritário',
      'Acesso antecipado a novidades',
    ],
    cta: 'Assinar',
    ctaVariant: 'default',
    highlighted: true,
    icon: Sparkles,
  },
  {
    name: 'Enterprise',
    price: 'Personalizado',
    period: '',
    description: 'Para escolas e redes',
    features: [
      'Tudo do Premium',
      'Limites personalizados',
      'Integração LMS',
      'Agente dedicado',
      'Contexto AI personalizado',
      'SSO & segurança avançada',
    ],
    cta: 'Falar com Vendas',
    ctaVariant: 'outline',
    highlighted: false,
    icon: Building2,
  },
];

interface PricingCardProps {
  tier: PricingTier;
  onAction: (tierName: string) => void;
}

function PricingCard({ tier, onAction }: PricingCardProps) {
  const Icon = tier.icon;

  return (
    <motion.div variants={FADE_UP_ITEM}>
      <Card 
        className={`relative h-full transition-all duration-300 ${
          tier.highlighted 
            ? 'bg-gradient-to-b from-examai-purple-500/10 to-violet-500/5 border-examai-purple-500/40 shadow-examai-purple scale-105' 
            : 'bg-white/[0.02] border-white/10 hover:border-white/20'
        }`}
      >
        {tier.highlighted && (
          <Badge 
            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-examai-purple-500 to-violet-500 text-white border-0"
          >
            Recomendado
          </Badge>
        )}

        <CardHeader className="text-center pb-4">
          <div className={`inline-flex mx-auto p-3 rounded-xl mb-4 ${
            tier.highlighted 
              ? 'bg-gradient-to-br from-examai-purple-500 to-violet-600' 
              : 'bg-white/5'
          }`}>
            <Icon className={`h-6 w-6 ${tier.highlighted ? 'text-white' : 'text-gray-400'}`} />
          </div>
          
          <CardTitle className="text-xl text-white">{tier.name}</CardTitle>
          <CardDescription className="text-gray-400">{tier.description}</CardDescription>
          
          <div className="mt-4">
            <span className="text-4xl font-bold text-white">{tier.price}</span>
            <span className="text-gray-400">{tier.period}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Features list */}
          <ul className="space-y-3">
            {tier.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                  tier.highlighted ? 'text-examai-purple-400' : 'text-green-400'
                }`} />
                <span className="text-sm text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <Button
            onClick={() => onAction(tier.name)}
            variant={tier.ctaVariant}
            className={`w-full h-12 font-semibold ${
              tier.highlighted 
                ? 'bg-gradient-to-r from-examai-purple-500 to-violet-500 hover:from-examai-purple-400 hover:to-violet-400 text-white border-0' 
                : 'border-white/20 text-white hover:bg-white/5'
            }`}
          >
            {tier.cta}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function PricingSection() {
  const navigate = useNavigate();
  const { createCheckoutSession, isLoading } = useSubscription();

  const handleAction = async (tierName: string) => {
    switch (tierName) {
      case 'Grátis':
        navigate('/auth');
        break;
      case 'Premium':
        try {
          await createCheckoutSession();
        } catch {
          // If not logged in, redirect to auth
          navigate('/auth?redirect=upgrade');
        }
        break;
      case 'Enterprise':
        // Open contact form or mailto
        window.location.href = 'mailto:contato@educasol.com.br?subject=Enterprise%20Plan%20Inquiry';
        break;
    }
  };

  return (
    <section id="pricing" className="py-24 bg-[#0a0d14]">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Planos para{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-examai-purple-400 to-violet-400">
              cada necessidade
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Comece grátis e escale conforme sua necessidade. Sem compromisso.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <motion.div
          variants={STAGGER_PARENT}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch"
        >
          {PRICING_TIERS.map((tier) => (
            <PricingCard 
              key={tier.name} 
              tier={tier} 
              onAction={handleAction}
            />
          ))}
        </motion.div>

        {/* FAQ link */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 text-gray-400"
        >
          Dúvidas? {' '}
          <a href="mailto:suporte@educasol.com.br" className="text-examai-purple-400 hover:underline">
            Fale conosco
          </a>
        </motion.p>
      </div>
    </section>
  );
}

export default PricingSection;

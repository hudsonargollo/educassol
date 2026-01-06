import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Building2, Zap, ArrowRight } from "lucide-react";
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
    description: 'Perfeito para começar a explorar',
    features: [
      '5 planos de aula por mês',
      '10 atividades por mês',
      '3 avaliações por mês',
      '2 uploads de arquivo (15MB)',
      'Exportação em PDF',
      'Suporte da comunidade',
    ],
    cta: 'Começar Grátis',
    ctaVariant: 'outline',
    highlighted: false,
    icon: Zap,
  },
  {
    name: 'Premium',
    price: 'R$49,90',
    period: '/mês',
    description: 'Para educadores dedicados',
    features: [
      'Gerações ilimitadas',
      'Uploads ilimitados',
      'Exportação PDF, DOCX e Slides',
      'Contexto Gemini Pro avançado',
      'Suporte prioritário por email',
      'Acesso antecipado a novidades',
    ],
    cta: 'Assinar Agora',
    ctaVariant: 'default',
    highlighted: true,
    icon: Sparkles,
  },
  {
    name: 'Escola',
    price: 'Personalizado',
    period: '',
    description: 'Para escolas e redes de ensino',
    features: [
      'Tudo do Premium incluído',
      'Limites personalizados',
      'Integração com LMS',
      'Gerente de conta dedicado',
      'Treinamento para equipe',
      'SSO e segurança avançada',
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
  index: number;
}

function PricingCard({ tier, onAction, index }: PricingCardProps) {
  const Icon = tier.icon;

  return (
    <motion.div 
      variants={FADE_UP_ITEM}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`relative h-full transition-all duration-500 border ${
          tier.highlighted 
            ? 'bg-gradient-to-b from-orange-500/15 to-amber-500/5 border-orange-500/40 shadow-xl shadow-orange-500/20 scale-105 z-10' 
            : 'bg-[#12161f] hover:bg-[#161b26] border-gray-800 hover:border-orange-500/30'
        }`}
      >
        {tier.highlighted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Badge 
              className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-lg"
            >
              Mais Popular
            </Badge>
          </motion.div>
        )}

        <CardHeader className="text-center pb-4">
          <motion.div 
            className={`inline-flex mx-auto p-3 rounded-xl mb-4 ${
              tier.highlighted 
                ? 'bg-gradient-to-br from-orange-500 to-amber-500' 
                : 'bg-gray-800'
            }`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Icon className={`h-6 w-6 ${tier.highlighted ? 'text-white' : 'text-gray-400'}`} />
          </motion.div>
          
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
              <motion.li 
                key={i} 
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Check className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                  tier.highlighted ? 'text-orange-400' : 'text-green-400'
                }`} />
                <span className="text-sm text-gray-300">{feature}</span>
              </motion.li>
            ))}
          </ul>

          {/* CTA Button */}
          <Button
            onClick={() => onAction(tier.name)}
            variant={tier.ctaVariant}
            className={`w-full h-12 font-semibold group ${
              tier.highlighted 
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 shadow-lg shadow-orange-500/25' 
                : 'border-gray-700 hover:border-orange-500/50 text-white hover:bg-orange-500/10'
            }`}
          >
            {tier.cta}
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
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
          navigate('/auth?redirect=upgrade');
        }
        break;
      case 'Escola':
        window.location.href = 'mailto:contato@educasol.com.br?subject=Plano%20Escola%20-%20Solicita%C3%A7%C3%A3o';
        break;
    }
  };

  return (
    <section id="pricing" className="py-24 lg:py-32 bg-gradient-to-b from-[#0c1018] to-[#0a0d14]">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-orange-500/10 border border-orange-500/30 text-orange-400"
          >
            Preços Simples
          </motion.span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Comece grátis,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400">
              evolua quando quiser
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Sem surpresas. Sem taxas escondidas. Cancele a qualquer momento.
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
          {PRICING_TIERS.map((tier, index) => (
            <PricingCard 
              key={tier.name} 
              tier={tier} 
              onAction={handleAction}
              index={index}
            />
          ))}
        </motion.div>

        {/* FAQ link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-gray-400">
            Dúvidas sobre os planos?{' '}
            <a 
              href="mailto:suporte@educasol.com.br" 
              className="text-orange-400 hover:text-orange-300 font-medium underline-offset-4 hover:underline transition-colors"
            >
              Fale conosco
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default PricingSection;

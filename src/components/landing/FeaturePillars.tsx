import { motion } from "framer-motion";
import { CalendarDays, Wand2, Users, FileText, Brain, Zap, LucideIcon } from "lucide-react";
import { STAGGER_PARENT, FADE_UP_ITEM } from "@/lib/motion";

interface FeaturePillar {
  id: string;
  headline: string;
  copy: string;
  icon: LucideIcon;
  gradient: 'orange' | 'teal' | 'purple' | 'blue' | 'green' | 'amber';
}

const FEATURE_PILLARS: FeaturePillar[] = [
  {
    id: 'magic-planner',
    headline: 'Planos de Aula em Segundos',
    copy: 'Escolha o tema, clique em gerar. Receba um plano completo com objetivos, metodologia e recursos — pronto para usar.',
    icon: CalendarDays,
    gradient: 'orange',
  },
  {
    id: 'instant-activity',
    headline: 'Atividades Prontas',
    copy: 'Exercícios, fichas e apresentações geradas automaticamente. Diversifique suas aulas sem esforço extra.',
    icon: Wand2,
    gradient: 'teal',
  },
  {
    id: 'differentiation',
    headline: 'Adapte para Cada Aluno',
    copy: 'Simplifique, enriqueça ou traduza qualquer material. Inclusão real com um clique.',
    icon: Users,
    gradient: 'purple',
  },
  {
    id: 'bncc-aligned',
    headline: '100% BNCC',
    copy: 'Todo conteúdo segue as competências e habilidades da Base Nacional. Conformidade garantida.',
    icon: FileText,
    gradient: 'blue',
  },
  {
    id: 'ai-powered',
    headline: 'IA que Entende Você',
    copy: 'Tecnologia Gemini Pro treinada em pedagogia brasileira. Resultados que fazem sentido.',
    icon: Brain,
    gradient: 'amber',
  },
  {
    id: 'fast-generation',
    headline: '15h Economizadas/Semana',
    copy: 'O que levava horas agora leva segundos. Mais tempo para o que importa: seus alunos.',
    icon: Zap,
    gradient: 'green',
  },
];

const gradientStyles = {
  orange: {
    bg: 'bg-gradient-to-br from-orange-500/10 to-amber-500/5 dark:from-orange-500/15 dark:to-amber-500/10',
    border: 'border-orange-500/20 hover:border-orange-500/40 dark:border-orange-500/25 dark:hover:border-orange-500/50',
    iconBg: 'bg-gradient-to-br from-orange-500 to-amber-500',
    glow: 'group-hover:shadow-[0_0_25px_rgba(249,115,22,0.25)]',
  },
  teal: {
    bg: 'bg-gradient-to-br from-teal-500/10 to-emerald-500/5 dark:from-teal-500/15 dark:to-emerald-500/10',
    border: 'border-teal-500/20 hover:border-teal-500/40 dark:border-teal-500/25 dark:hover:border-teal-500/50',
    iconBg: 'bg-gradient-to-br from-teal-500 to-emerald-500',
    glow: 'group-hover:shadow-[0_0_25px_rgba(20,184,166,0.25)]',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-500/10 to-violet-500/5 dark:from-purple-500/15 dark:to-violet-500/10',
    border: 'border-purple-500/20 hover:border-purple-500/40 dark:border-purple-500/25 dark:hover:border-purple-500/50',
    iconBg: 'bg-gradient-to-br from-purple-500 to-violet-500',
    glow: 'group-hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]',
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/5 dark:from-blue-500/15 dark:to-cyan-500/10',
    border: 'border-blue-500/20 hover:border-blue-500/40 dark:border-blue-500/25 dark:hover:border-blue-500/50',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    glow: 'group-hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]',
  },
  green: {
    bg: 'bg-gradient-to-br from-green-500/10 to-emerald-500/5 dark:from-green-500/15 dark:to-emerald-500/10',
    border: 'border-green-500/20 hover:border-green-500/40 dark:border-green-500/25 dark:hover:border-green-500/50',
    iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500',
    glow: 'group-hover:shadow-[0_0_25px_rgba(34,197,94,0.25)]',
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-500/10 to-yellow-500/5 dark:from-amber-500/15 dark:to-yellow-500/10',
    border: 'border-amber-500/20 hover:border-amber-500/40 dark:border-amber-500/25 dark:hover:border-amber-500/50',
    iconBg: 'bg-gradient-to-br from-amber-500 to-yellow-500',
    glow: 'group-hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]',
  },
};

interface FeaturePillarCardProps {
  pillar: FeaturePillar;
  index: number;
}

function FeaturePillarCard({ pillar, index }: FeaturePillarCardProps) {
  const styles = gradientStyles[pillar.gradient];
  const Icon = pillar.icon;

  return (
    <motion.div
      variants={FADE_UP_ITEM}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={`group relative p-6 rounded-2xl border backdrop-blur-sm transition-all duration-500 ${styles.bg} ${styles.border} ${styles.glow}`}
    >
      {/* Animated background gradient on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/5 to-transparent" />
      
      {/* Icon with animation */}
      <motion.div 
        className={`relative inline-flex p-3 rounded-xl ${styles.iconBg} shadow-lg mb-5`}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <Icon className="h-6 w-6 text-white" />
      </motion.div>

      {/* Content */}
      <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
        {pillar.headline}
      </h3>
      <p className="text-muted-foreground leading-relaxed">
        {pillar.copy}
      </p>

      {/* Hover effect line */}
      <motion.div 
        className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        whileHover={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

export function FeaturePillars() {
  return (
    <section id="features" className="py-24 lg:py-32 bg-gradient-to-b from-background to-muted/30 dark:from-[#0a0d14] dark:to-[#0c1018]">
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
            className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-primary/10 border border-primary/20 text-primary"
          >
            Funcionalidades
          </motion.span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Ferramentas que{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">
              economizam seu tempo
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Seis recursos que transformam horas de trabalho em minutos
          </p>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          variants={STAGGER_PARENT}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURE_PILLARS.map((pillar, index) => (
            <FeaturePillarCard key={pillar.id} pillar={pillar} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default FeaturePillars;

import { motion } from "framer-motion";
import { CalendarDays, Wand2, Users, LucideIcon } from "lucide-react";
import { STAGGER_PARENT, FADE_UP_ITEM } from "@/lib/motion";

interface FeaturePillar {
  id: string;
  headline: string;
  copy: string;
  icon: LucideIcon;
  gradient: 'purple' | 'blue' | 'green';
}

const FEATURE_PILLARS: FeaturePillar[] = [
  {
    id: 'magic-planner',
    headline: 'Let AI design your week.',
    copy: 'Select your topic and grade level. Watch as Educasol generates a complete 5-day unit plan with objectives, hooks, and materials instantly.',
    icon: CalendarDays,
    gradient: 'purple',
  },
  {
    id: 'instant-activity',
    headline: 'From Plan to Handout in a click.',
    copy: "Don't just plan it—create it. Automatically generate worksheets, slide decks, and reading passages that match your lesson perfectly.",
    icon: Wand2,
    gradient: 'blue',
  },
  {
    id: 'differentiation',
    headline: 'Personalize for every student.',
    copy: "One click to 'Scaffold', 'Enrich', or 'Translate' any resource. Ensure every student accesses the same high-quality curriculum.",
    icon: Users,
    gradient: 'green',
  },
];

const gradientStyles = {
  purple: {
    bg: 'bg-gradient-to-br from-examai-purple-500/10 to-violet-500/5',
    border: 'border-examai-purple-500/20 hover:border-examai-purple-500/40',
    iconBg: 'bg-gradient-to-br from-examai-purple-500 to-violet-600',
    glow: 'group-hover:shadow-examai-purple',
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/5',
    border: 'border-blue-500/20 hover:border-blue-500/40',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    glow: 'group-hover:shadow-[0_0_20px_rgba(59,130,246,0.25)]',
  },
  green: {
    bg: 'bg-gradient-to-br from-green-500/10 to-emerald-500/5',
    border: 'border-green-500/20 hover:border-green-500/40',
    iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
    glow: 'group-hover:shadow-[0_0_20px_rgba(34,197,94,0.25)]',
  },
};

interface FeaturePillarCardProps {
  pillar: FeaturePillar;
}

function FeaturePillarCard({ pillar }: FeaturePillarCardProps) {
  const styles = gradientStyles[pillar.gradient];
  const Icon = pillar.icon;

  return (
    <motion.div
      variants={FADE_UP_ITEM}
      className={`group relative p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${styles.bg} ${styles.border} ${styles.glow}`}
    >
      {/* Icon */}
      <div className={`inline-flex p-3 rounded-xl ${styles.iconBg} shadow-lg mb-4`}>
        <Icon className="h-6 w-6 text-white" />
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-white mb-3">
        {pillar.headline}
      </h3>
      <p className="text-gray-400 leading-relaxed">
        {pillar.copy}
      </p>

      {/* Hover effect line */}
      <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}

export function FeaturePillars() {
  return (
    <section id="features" className="py-24 bg-[#0a0d14]">
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
            Everything you need to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-examai-purple-400 to-violet-400">
              plan smarter
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Three powerful features that transform how you create curriculum
          </p>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          variants={STAGGER_PARENT}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          {FEATURE_PILLARS.map((pillar) => (
            <FeaturePillarCard key={pillar.id} pillar={pillar} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default FeaturePillars;

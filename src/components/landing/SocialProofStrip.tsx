import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { CheckCircle, BookOpen, Clock, Users, Star } from "lucide-react";

interface Metric {
  value: number;
  suffix: string;
  label: string;
  icon: typeof BookOpen;
}

const METRICS: Metric[] = [
  { value: 50000, suffix: '+', label: 'Planos Criados', icon: BookOpen },
  { value: 15, suffix: 'h', label: 'Economizadas/Semana', icon: Clock },
  { value: 5000, suffix: '+', label: 'Educadores Ativos', icon: Users },
  { value: 98, suffix: '%', label: 'Satisfação', icon: Star },
];

interface AnimatedCounterProps {
  value: number;
  suffix: string;
  label: string;
  icon: typeof BookOpen;
  delay?: number;
}

function AnimatedCounter({ value, suffix, label, icon: Icon, delay = 0 }: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const timeout = setTimeout(() => {
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, stepDuration);

      return () => clearInterval(timer);
    }, delay);

    return () => clearTimeout(timeout);
  }, [isInView, value, delay]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + 'k';
    }
    return num.toString();
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className="flex items-center gap-4"
    >
      <motion.div 
        className="p-3 rounded-xl bg-primary/10 dark:bg-primary/15"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <Icon className="h-5 w-5 text-primary" />
      </motion.div>
      <div>
        <div className="text-2xl sm:text-3xl font-bold text-foreground">
          {formatNumber(displayValue)}{suffix}
        </div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </motion.div>
  );
}

export function SocialProofStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section 
      ref={ref}
      className="py-16 bg-gradient-to-r from-muted/50 via-background to-muted/50 dark:from-white/[0.02] dark:via-white/[0.04] dark:to-white/[0.02] border-y border-border/50"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row items-center justify-between gap-8"
        >
          {/* Animated metrics */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-8 lg:gap-12">
            {METRICS.map((metric, index) => (
              <AnimatedCounter key={metric.label} {...metric} delay={index * 150} />
            ))}
          </div>

          {/* Trust signal */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex items-center gap-3 px-5 py-3 rounded-full bg-secondary/10 border border-secondary/20"
          >
            <CheckCircle className="h-5 w-5 text-secondary" />
            <span className="text-sm font-medium text-foreground">Alinhado à BNCC e NGSS</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default SocialProofStrip;

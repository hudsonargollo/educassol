import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { CheckCircle, BookOpen, Clock } from "lucide-react";

interface Metric {
  value: number;
  suffix: string;
  label: string;
  icon: typeof BookOpen;
}

const METRICS: Metric[] = [
  { value: 50000, suffix: '+', label: 'Lessons Planned', icon: BookOpen },
  { value: 500, suffix: '+', label: 'Hours Saved per Teacher/Year', icon: Clock },
];

interface AnimatedCounterProps {
  value: number;
  suffix: string;
  label: string;
  icon: typeof BookOpen;
}

function AnimatedCounter({ value, suffix, label, icon: Icon }: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000; // 2 seconds
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
  }, [isInView, value]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + 'k';
    }
    return num.toString();
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-3"
    >
      <div className="p-2 rounded-lg bg-examai-purple-500/10">
        <Icon className="h-5 w-5 text-examai-purple-400" />
      </div>
      <div>
        <div className="text-2xl font-bold text-white">
          {formatNumber(displayValue)}{suffix}
        </div>
        <div className="text-sm text-gray-400">{label}</div>
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
      className="py-12 bg-white/[0.02] border-y border-white/5"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center items-center gap-8 md:gap-16"
        >
          {/* Animated metrics */}
          {METRICS.map((metric) => (
            <AnimatedCounter key={metric.label} {...metric} />
          ))}

          {/* Divider */}
          <div className="hidden md:block w-px h-12 bg-white/10" />

          {/* Trust signal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-2 text-gray-400"
          >
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-sm">Aligned with Common Core & NGSS Standards</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default SocialProofStrip;

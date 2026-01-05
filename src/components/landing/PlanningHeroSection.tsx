import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TransformationAnimation } from "./TransformationAnimation";

interface FloatingElementProps {
  className?: string;
  delay?: number;
  size?: "sm" | "md" | "lg";
}

const FloatingElement = ({ className = "", delay = 0, size = "sm" }: FloatingElementProps) => {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4"
  };
  
  return (
    <motion.div
      animate={{ 
        y: [0, -20, 0], 
        opacity: [0.2, 0.6, 0.2],
        scale: [1, 1.2, 1]
      }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay }}
      className={`absolute rounded-full bg-gradient-to-br from-orange-400 to-amber-500 blur-sm ${sizeClasses[size]} ${className}`}
    />
  );
};

interface PlanningHeroSectionProps {
  onStartPlanning?: () => void;
  onViewFeatures?: () => void;
}

export function PlanningHeroSection({ onStartPlanning, onViewFeatures }: PlanningHeroSectionProps) {
  const navigate = useNavigate();

  const handleStartPlanning = () => {
    if (onStartPlanning) {
      onStartPlanning();
    } else {
      navigate('/auth');
    }
  };

  const handleViewFeatures = () => {
    if (onViewFeatures) {
      onViewFeatures();
    } else {
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[95vh] flex items-center overflow-hidden pt-20 bg-gradient-to-b from-[#0c1018] to-[#0a0d14]">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary) / 0.4) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.4) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Gradient orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1], 
            opacity: [0.12, 0.22, 0.12],
            x: [0, 30, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-32 w-[600px] h-[600px] rounded-full blur-[150px] bg-gradient-to-br from-orange-500/40 to-amber-400/30"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2], 
            opacity: [0.08, 0.18, 0.08],
            x: [0, -20, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 -right-32 w-[700px] h-[700px] rounded-full blur-[150px] bg-gradient-to-br from-teal-500/30 to-emerald-400/20"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.15, 1], 
            opacity: [0.06, 0.12, 0.06]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] bg-gradient-to-br from-purple-500/20 to-violet-400/15"
        />
      </div>
      
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingElement className="top-24 left-[8%]" delay={0} size="md" />
        <FloatingElement className="top-36 right-[12%]" delay={0.8} size="lg" />
        <FloatingElement className="bottom-40 left-1/4" delay={1.5} size="sm" />
        <FloatingElement className="top-1/3 right-1/3" delay={2.2} size="md" />
        <FloatingElement className="bottom-1/3 right-[18%]" delay={3} size="lg" />
        <FloatingElement className="top-1/2 left-[15%]" delay={1} size="sm" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Copy */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-8 text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 shadow-lg shadow-primary/5 mx-auto lg:mx-0"
            >
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary">IA para Educadores Brasileiros</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] text-center lg:text-left"
            >
              Sua aula pronta{' '}
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-500 to-amber-500">
                  em segundos
                </span>
                <motion.span 
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-amber-500 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                />
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed lg:text-left text-center"
            >
              Planos de aula, atividades e avaliações{' '}
              <span className="text-white font-medium">alinhados à BNCC</span> — gerados por IA em segundos.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button 
                size="lg" 
                onClick={handleStartPlanning} 
                className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 group"
              >
                Começar Grátis
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleViewFeatures}
                className="h-14 px-8 text-lg font-semibold border-2 border-primary/40 text-foreground hover:bg-primary/10 hover:border-primary/60 transition-all duration-300"
              >
                Ver Funcionalidades
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.6 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-sm text-muted-foreground"
            >
              {["Sem cartão de crédito", "Alinhado à BNCC", "100% em português"].map((item, i) => (
                <motion.div 
                  key={i} 
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                >
                  <CheckCircle2 className="h-4 w-4 text-secondary" />
                  <span>{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Animation: PDF → Calendar transformation */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, type: "spring", stiffness: 100 }}
            className="relative flex items-center justify-center"
          >
            <TransformationAnimation />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default PlanningHeroSection;

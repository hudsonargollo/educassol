import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TransformationAnimation } from "./TransformationAnimation";

interface FloatingElementProps {
  className?: string;
  delay?: number;
}

const FloatingElement = ({ className = "", delay = 0 }: FloatingElementProps) => (
  <motion.div
    animate={{ y: [0, -15, 0], opacity: [0.3, 0.6, 0.3] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
    className={`absolute w-3 h-3 rounded-full bg-examai-purple-500/40 blur-sm ${className}`}
  />
);

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
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-16 bg-[#0a0d14]">
      {/* Gradient background */}
      <div className="absolute inset-0">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Gradient orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-20 w-[500px] h-[500px] rounded-full blur-[120px] bg-examai-purple-500/30"
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] rounded-full blur-[120px] bg-violet-500/20"
        />
      </div>
      
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingElement className="top-20 left-[10%]" delay={0} />
        <FloatingElement className="top-40 right-[15%]" delay={0.5} />
        <FloatingElement className="bottom-32 left-1/4" delay={1} />
        <FloatingElement className="top-1/3 right-1/3" delay={1.5} />
        <FloatingElement className="bottom-1/4 right-[20%]" delay={2} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Copy */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-examai-purple-500/10 border border-examai-purple-500/20"
            >
              <CalendarDays className="h-4 w-4 text-examai-purple-400" />
              <span className="text-sm font-medium text-examai-purple-400">Planejamento Inteligente</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight"
            >
              Plan Your Entire Curriculum in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-examai-purple-400 via-violet-400 to-examai-purple-500">
                Seconds
              </span>
              , Not Weekends.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto lg:mx-0"
            >
              Transform your teaching with the AI-powered instructional design platform. 
              Generate standards-aligned lesson plans, activities, and assessments in one click.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button 
                size="lg" 
                onClick={handleStartPlanning} 
                className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-examai-purple-500 to-violet-500 hover:from-examai-purple-400 hover:to-violet-400 shadow-lg shadow-examai-purple-500/25 hover:-translate-y-0.5 transition-all"
              >
                Start Planning Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleViewFeatures}
                className="h-14 px-8 text-lg font-semibold border-2 border-examai-purple-500/50 text-white hover:bg-examai-purple-500/10 hover:border-examai-purple-500"
              >
                View Features
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-gray-400"
            >
              {["No credit card required", "BNCC Aligned", "Portuguese support"].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>{item}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Animation: PDF → Calendar transformation */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
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

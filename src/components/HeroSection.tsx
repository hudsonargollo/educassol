import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, CheckCircle2, GraduationCap, Brain, FileCheck, BarChart3, BookOpen, Target, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[100dvh] bg-[#0a0d14] flex items-center overflow-hidden pt-16">
      {/* Animated background */}
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
          className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] rounded-full blur-[120px] bg-blue-500/20"
        />

        {/* Floating dots */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-examai-purple-500/30 rounded-full"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-examai-purple-500/10 border border-examai-purple-500/20 mb-6"
            >
              <GraduationCap className="h-4 w-4 text-examai-purple-400" />
              <span className="text-sm font-medium text-examai-purple-400">Educa Sol — IA para Educadores</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] text-white mb-6"
            >
              Crie, corrija e{" "}
              <span className="bg-gradient-to-r from-examai-purple-400 via-violet-400 to-examai-purple-500 bg-clip-text text-transparent">
                analise
              </span>
              {" "}com IA
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
            >
              Transforme fotos de quadro, anotações ou PDFs em planos de aula, 
              atividades e avaliações completas. Correção automática com feedback 
              personalizado para cada aluno.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
            >
              <Button
                size="lg"
                className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-examai-purple-500 to-violet-500 hover:from-examai-purple-400 hover:to-violet-400 shadow-lg shadow-examai-purple-500/25 hover:-translate-y-0.5 transition-all"
                onClick={() => navigate('/auth')}
              >
                Começar Grátis
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 text-lg font-semibold border-2 border-examai-purple-500/50 text-white hover:bg-examai-purple-500/10 hover:border-examai-purple-500"
                onClick={() => navigate('/auth')}
              >
                <Sparkles className="h-5 w-5 mr-2 text-examai-purple-400" />
                Ver Demo
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-gray-400"
            >
              {["Sem cartão de crédito", "Alinhado à BNCC", "Suporte em português"].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>{item}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column - Orbiting Icons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative flex items-center justify-center min-h-[400px] lg:min-h-[500px]"
          >
            {/* Orbit animation styles */}
            <style>{`
              @keyframes orbit-cw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              @keyframes orbit-ccw { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
              @keyframes counter-cw { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
              @keyframes counter-ccw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 30px rgba(168, 85, 247, 0.4); } 50% { box-shadow: 0 0 60px rgba(168, 85, 247, 0.6); } }
              .orbit-inner { animation: orbit-cw 20s linear infinite; }
              .orbit-outer { animation: orbit-ccw 30s linear infinite; }
              .counter-inner { animation: counter-cw 20s linear infinite; }
              .counter-outer { animation: counter-ccw 30s linear infinite; }
              .center-glow { animation: pulse-glow 3s ease-in-out infinite; }
            `}</style>

            {/* Center icon */}
            <div className="relative z-20 center-glow rounded-full">
              <div className="relative p-6 rounded-full bg-gradient-to-br from-examai-purple-500 to-violet-600 shadow-2xl">
                <BookOpen className="h-12 w-12 text-white" />
              </div>
            </div>
            
            {/* Inner orbit ring */}
            <div className="absolute w-[200px] h-[200px] rounded-full border border-dashed border-examai-purple-500/30" />
            
            {/* Outer orbit ring */}
            <div className="absolute w-[320px] h-[320px] rounded-full border border-dashed border-violet-500/20" />

            {/* Inner orbit icons */}
            <div className="absolute w-[200px] h-[200px] orbit-inner">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 counter-inner">
                <div className="p-3 rounded-full bg-examai-purple-500/20 border border-examai-purple-500/40 backdrop-blur-sm">
                  <Brain className="h-5 w-5 text-examai-purple-400" />
                </div>
              </div>
              <div className="absolute bottom-[13%] left-[3%] -translate-x-1/2 counter-inner">
                <div className="p-3 rounded-full bg-violet-500/20 border border-violet-500/40 backdrop-blur-sm">
                  <Sparkles className="h-5 w-5 text-violet-400" />
                </div>
              </div>
              <div className="absolute bottom-[13%] right-[3%] translate-x-1/2 counter-inner">
                <div className="p-2.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 backdrop-blur-sm">
                  <Lightbulb className="h-4 w-4 text-cyan-400" />
                </div>
              </div>
            </div>

            {/* Outer orbit icons */}
            <div className="absolute w-[320px] h-[320px] orbit-outer">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 counter-outer">
                <div className="p-3 rounded-full bg-amber-500/20 border border-amber-500/40 backdrop-blur-sm">
                  <FileCheck className="h-5 w-5 text-amber-400" />
                </div>
              </div>
              <div className="absolute bottom-[13%] left-[3%] -translate-x-1/2 counter-outer">
                <div className="p-3 rounded-full bg-blue-500/20 border border-blue-500/40 backdrop-blur-sm">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                </div>
              </div>
              <div className="absolute bottom-[13%] right-[3%] translate-x-1/2 counter-outer">
                <div className="p-3 rounded-full bg-green-500/20 border border-green-500/40 backdrop-blur-sm">
                  <Target className="h-5 w-5 text-green-400" />
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 right-0 lg:right-10 bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg"
            >
              +15h/semana
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

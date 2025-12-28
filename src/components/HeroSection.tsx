import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, CheckCircle2, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { STAGGER_PARENT, FADE_UP_ITEM, EDUCASSOL_SPRING } from "@/lib/motion";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[100dvh] bg-background flex items-center overflow-hidden">
      {/* ExamAI gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Purple gradient orb - top left */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-20 w-96 h-96 rounded-full blur-3xl bg-gradient-to-br from-examai-purple-500/40 to-examai-purple-700/20"
        />
        
        {/* Blue gradient orb - bottom right */}
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.3, 0.15]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] rounded-full blur-3xl bg-gradient-to-br from-blue-500/30 to-cyan-500/20"
        />

        {/* Floating decorative elements */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 right-1/4 w-16 h-16 rounded-2xl bg-examai-purple-500/10 border border-examai-purple-500/20 backdrop-blur-sm hidden lg:block"
        />
        <motion.div
          animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/3 left-1/4 w-12 h-12 rounded-xl bg-examai-amber-500/10 border border-examai-amber-500/20 backdrop-blur-sm hidden lg:block"
        />
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 left-[10%] w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm hidden lg:block"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <motion.div
            variants={STAGGER_PARENT}
            initial="hidden"
            animate="show"
            className="text-center lg:text-left"
          >
            {/* Logo Badge */}
            <motion.div variants={FADE_UP_ITEM} className="mb-6">
              <Badge 
                className="px-4 py-2 text-sm font-medium border-0 bg-primary/10 text-primary backdrop-blur-sm"
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                ExamAI — IA para Educadores Brasileiros
              </Badge>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              variants={FADE_UP_ITEM}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] text-foreground mb-6"
            >
              Crie, corrija e{" "}
              <span className="bg-gradient-to-r from-examai-purple-500 via-examai-purple-400 to-examai-purple-600 bg-clip-text text-transparent">
                analise
              </span>
              {" "}com IA
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              variants={FADE_UP_ITEM}
              className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
            >
              Transforme fotos de quadro, anotações ou PDFs em planos de aula, 
              atividades e avaliações completas. Correção automática com feedback 
              personalizado para cada aluno.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={FADE_UP_ITEM}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={EDUCASSOL_SPRING}
              >
                <Button
                  size="lg"
                  variant="default"
                  className="h-14 px-8 text-lg font-semibold shadow-examai-purple"
                  onClick={() => navigate('/auth')}
                >
                  Começar Grátis
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={EDUCASSOL_SPRING}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 text-lg font-semibold"
                  onClick={() => navigate('/auth')}
                >
                  <Sparkles className="h-5 w-5 mr-2 text-primary" />
                  Ver Demo
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust indicators */}
            <motion.div 
              variants={FADE_UP_ITEM}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-muted-foreground"
            >
              {[
                "Sem cartão de crédito",
                "Alinhado à BNCC",
                "Suporte em português"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>{item}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column - Product Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotateY: -10 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 blur-3xl opacity-30 rounded-3xl scale-110 bg-gradient-to-br from-examai-purple-500 to-blue-500" />
            
            {/* Main Preview Card */}
            <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-background/50 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">examai.app</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">ExamAI</span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Planos", value: "127", icon: "📚" },
                    { label: "Atividades", value: "384", icon: "✏️" },
                    { label: "Corrigidas", value: "892", icon: "✅" },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="bg-muted/50 rounded-xl p-3 text-center"
                    >
                      <span className="text-lg">{stat.icon}</span>
                      <p className="text-xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* AI Generation Card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="gradient-purple-examai rounded-xl p-4 border border-examai-purple-500/20"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl gradient-purple-solid flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Gerando plano de aula...</p>
                      <p className="text-xs text-muted-foreground">Matemática 5º Ano • Frações</p>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "78%" }}
                      transition={{ delay: 1.1, duration: 2, ease: "easeOut" }}
                      className="h-full rounded-full gradient-purple-solid"
                    />
                  </div>
                </motion.div>

                {/* Recent Activity */}
                <div className="space-y-2">
                  {[
                    { text: "Prova de História corrigida", time: "Agora", color: "emerald" },
                    { text: "Atividade de Português criada", time: "2 min", color: "blue" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.3 + i * 0.15 }}
                      className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                    >
                      <div className={`w-2 h-2 rounded-full ${item.color === 'emerald' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                      <span className="text-sm text-muted-foreground flex-1">{item.text}</span>
                      <span className="text-xs text-muted-foreground/70">{item.time}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
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

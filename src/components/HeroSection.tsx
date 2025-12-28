import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, CheckCircle2, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { STAGGER_PARENT, FADE_UP_ITEM, EDUCASSOL_SPRING } from "@/lib/motion";
import { EDUCASSOL_COLORS } from "@/lib/colors";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[100dvh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(${EDUCASSOL_COLORS.primary} 1px, transparent 1px), linear-gradient(90deg, ${EDUCASSOL_COLORS.primary} 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        {/* Gradient orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-20 w-96 h-96 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${EDUCASSOL_COLORS.primary}40 0%, transparent 70%)` }}
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${EDUCASSOL_COLORS.accent}30 0%, transparent 70%)` }}
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
                className="px-4 py-2 text-sm font-medium border-0 bg-white/10 text-white/90 backdrop-blur-sm"
              >
                <Sun className="h-4 w-4 mr-2 text-amber-400" />
                EducaSol — IA para Educadores Brasileiros
              </Badge>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              variants={FADE_UP_ITEM}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] text-white mb-6"
            >
              Crie, corrija e{" "}
              <span 
                className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent"
              >
                analise
              </span>
              {" "}com IA
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              variants={FADE_UP_ITEM}
              className="text-lg sm:text-xl text-slate-300 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
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
                  className="h-14 px-8 text-lg font-semibold shadow-2xl shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-300 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900"
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
                  className="h-14 px-8 text-lg font-semibold border-slate-600 text-white hover:bg-white/10 hover:border-slate-500"
                  onClick={() => navigate('/auth')}
                >
                  <Sparkles className="h-5 w-5 mr-2 text-amber-400" />
                  Ver Demo
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust indicators */}
            <motion.div 
              variants={FADE_UP_ITEM}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-slate-400"
            >
              {[
                "Sem cartão de crédito",
                "Alinhado à BNCC",
                "Suporte em português"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
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
            <div 
              className="absolute inset-0 blur-3xl opacity-30 rounded-3xl scale-110"
              style={{ background: `linear-gradient(135deg, ${EDUCASSOL_COLORS.primary} 0%, ${EDUCASSOL_COLORS.accent} 100%)` }}
            />
            
            {/* Main Preview Card */}
            <div className="relative bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900/50 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs text-slate-500 font-mono">educasol.pages.dev</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-semibold text-white">EducaSol</span>
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
                      className="bg-slate-700/50 rounded-xl p-3 text-center"
                    >
                      <span className="text-lg">{stat.icon}</span>
                      <p className="text-xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-slate-400">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* AI Generation Card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/20"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Gerando plano de aula...</p>
                      <p className="text-xs text-slate-400">Matemática 5º Ano • Frações</p>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "78%" }}
                      transition={{ delay: 1.1, duration: 2, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
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
                      className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/30"
                    >
                      <div className={`w-2 h-2 rounded-full ${item.color === 'emerald' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                      <span className="text-sm text-slate-300 flex-1">{item.text}</span>
                      <span className="text-xs text-slate-500">{item.time}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
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

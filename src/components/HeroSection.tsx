import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Play, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { STAGGER_PARENT, FADE_UP_ITEM, EDUCASSOL_SPRING } from "@/lib/motion";
import { EDUCASSOL_COLORS } from "@/lib/colors";

const HeroSection = () => {
  const navigate = useNavigate();

  const headlineWords = ["Planejar", "aulas", "levava", "horas.", "Agora", "leva", "minutos."];

  return (
    <section className="relative min-h-[100dvh] bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-blue-500/3 to-transparent rounded-full" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            variants={STAGGER_PARENT}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div variants={FADE_UP_ITEM}>
              <Badge 
                variant="outline" 
                className="px-4 py-2 text-sm font-medium border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
              >
                <Sparkles className="h-4 w-4 mr-2" style={{ color: EDUCASSOL_COLORS.accent }} />
                IA especializada em educação brasileira
              </Badge>
            </motion.div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                {headlineWords.map((word, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.1 + index * 0.08,
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                    }}
                    className="inline-block mr-3"
                    style={{ 
                      color: index >= 4 ? EDUCASSOL_COLORS.primary : EDUCASSOL_COLORS.textMain 
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>
            </div>

            {/* Subheadline */}
            <motion.p 
              variants={FADE_UP_ITEM}
              className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed"
              style={{ color: EDUCASSOL_COLORS.textMuted }}
            >
              Educassol é o assistente de IA que cria planos de aula, 
              atividades e avaliações alinhados à BNCC instantaneamente. 
              <span className="font-semibold" style={{ color: EDUCASSOL_COLORS.textMain }}>
                {" "}Recupere suas noites.
              </span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={FADE_UP_ITEM}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={EDUCASSOL_SPRING}
              >
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{ 
                    background: `linear-gradient(135deg, ${EDUCASSOL_COLORS.primary} 0%, #4F46E5 100%)`,
                  }}
                  onClick={() => navigate('/auth')}
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Comece Grátis
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
                  className="h-14 px-8 text-lg font-semibold border-2 hover:bg-slate-50"
                  onClick={() => navigate('/auth')}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Ver Demonstração
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust indicators */}
            <motion.div 
              variants={FADE_UP_ITEM}
              className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm"
              style={{ color: EDUCASSOL_COLORS.textMuted }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" style={{ color: EDUCASSOL_COLORS.success }} />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" style={{ color: EDUCASSOL_COLORS.success }} />
                <span>Alinhado à BNCC</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" style={{ color: EDUCASSOL_COLORS.success }} />
                <span>Conteúdo ilimitado</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Dashboard Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 60, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 lg:mt-20"
          >
            <div className="relative max-w-4xl mx-auto">
              {/* Glow effect behind card */}
              <div 
                className="absolute inset-0 blur-3xl opacity-20 rounded-3xl"
                style={{ background: `linear-gradient(135deg, ${EDUCASSOL_COLORS.primary} 0%, ${EDUCASSOL_COLORS.accent} 100%)` }}
              />
              
              {/* Main card */}
              <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 border-b border-slate-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-white rounded-md px-3 py-1 text-xs text-slate-400 max-w-xs mx-auto">
                      educassol.pages.dev/dashboard
                    </div>
                  </div>
                </div>
                
                {/* Dashboard preview content */}
                <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-50 to-white min-h-[300px] sm:min-h-[400px]">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {/* Stat cards */}
                    {[
                      { label: "Planos Criados", value: "127", color: EDUCASSOL_COLORS.primary },
                      { label: "Atividades Geradas", value: "384", color: EDUCASSOL_COLORS.success },
                      { label: "Tempo Economizado", value: "48h", color: EDUCASSOL_COLORS.accent },
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + i * 0.1 }}
                        className="bg-white rounded-xl p-4 shadow-sm border border-slate-100"
                      >
                        <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* AI Generation preview */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="bg-white rounded-xl p-4 shadow-sm border border-slate-100"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: `${EDUCASSOL_COLORS.accent}20` }}
                      >
                        <Sparkles className="h-4 w-4" style={{ color: EDUCASSOL_COLORS.accent }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Gerando plano de aula...</p>
                        <p className="text-xs text-slate-500">Matemática 5º Ano - Frações</p>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "85%" }}
                        transition={{ delay: 1.3, duration: 1.5, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${EDUCASSOL_COLORS.primary} 0%, ${EDUCASSOL_COLORS.accent} 100%)` }}
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

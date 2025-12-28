import { Button } from "@/components/ui/button";
import { Sparkles, Upload, FileCheck, MessageSquare, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FADE_UP_ITEM, EDUCASSOL_SPRING } from "@/lib/motion";
import { EDUCASSOL_COLORS } from "@/lib/colors";

const GradingSection = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: Upload,
      title: "Envie as provas",
      description: "Faça upload de PDFs ou fotos das provas manuscritas dos alunos.",
      color: EDUCASSOL_COLORS.primary,
    },
    {
      icon: Sparkles,
      title: "IA corrige",
      description: "Nossa IA analisa cada resposta usando sua rubrica e critérios.",
      color: EDUCASSOL_COLORS.accent,
    },
    {
      icon: MessageSquare,
      title: "Feedback detalhado",
      description: "Cada aluno recebe feedback personalizado e construtivo.",
      color: EDUCASSOL_COLORS.success,
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-slate-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(${EDUCASSOL_COLORS.accent} 1px, transparent 1px), linear-gradient(90deg, ${EDUCASSOL_COLORS.accent} 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${EDUCASSOL_COLORS.accent}20 0%, transparent 70%)` }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span 
              className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6"
              style={{ background: `${EDUCASSOL_COLORS.accent}20`, color: EDUCASSOL_COLORS.accent }}
            >
              ✨ Correção Mágica
            </span>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Corrija provas em{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                segundos
              </span>
              , não horas
            </h2>
            
            <p className="text-lg text-slate-300 mb-10 leading-relaxed">
              Envie uma pilha de provas — manuscritas ou digitais. Nossa IA lê, 
              analisa e corrige cada resposta seguindo sua rubrica. Feedback justo 
              e consistente para todos os alunos, mesmo com letra difícil.
            </p>

            {/* Steps */}
            <div className="space-y-6 mb-10">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="flex items-start gap-4"
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${step.color}20` }}
                  >
                    <step.icon className="h-6 w-6" style={{ color: step.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>
                    <p className="text-slate-400">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={EDUCASSOL_SPRING}
            >
              <Button
                size="lg"
                className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900"
                onClick={() => navigate('/assessments')}
              >
                Experimentar Correção
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Right - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Grading Interface Preview */}
            <div className="relative bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900/50 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-medium text-white">Correção em Andamento</span>
                </div>
                <span className="text-xs text-emerald-400 font-medium">98% confiança</span>
              </div>

              {/* Split View */}
              <div className="grid grid-cols-2 divide-x divide-slate-700/50">
                {/* Left - Student Paper */}
                <div className="p-4">
                  <p className="text-xs text-slate-500 mb-3 uppercase tracking-wide">Prova do Aluno</p>
                  <div className="bg-white rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-600">João Silva</span>
                      <span className="text-xs text-slate-400">5º Ano</span>
                    </div>
                    <div className="border-t border-slate-100 pt-3">
                      <p className="text-xs text-slate-500 mb-1">Questão 1:</p>
                      <div className="h-2 w-full bg-slate-100 rounded mb-1" />
                      <div className="h-2 w-4/5 bg-slate-100 rounded mb-1" />
                      <div className="h-2 w-3/4 bg-slate-100 rounded" />
                    </div>
                    {/* Highlight annotation */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="bg-amber-100 border-l-2 border-amber-400 p-2 rounded-r"
                    >
                      <div className="h-2 w-full bg-amber-200 rounded" />
                    </motion.div>
                  </div>
                </div>

                {/* Right - AI Feedback */}
                <div className="p-4 bg-slate-800/50">
                  <p className="text-xs text-slate-500 mb-3 uppercase tracking-wide">Feedback da IA</p>
                  <div className="space-y-3">
                    {/* Score */}
                    <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <span className="text-sm text-emerald-400">Questão 1</span>
                      <span className="text-lg font-bold text-emerald-400">8/10</span>
                    </div>

                    {/* Feedback text */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                      className="p-3 bg-slate-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-3 w-3 text-amber-400" />
                        <span className="text-xs text-amber-400 font-medium">Análise</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2 w-full bg-slate-600 rounded" />
                        <div className="h-2 w-5/6 bg-slate-600 rounded" />
                        <div className="h-2 w-4/5 bg-slate-600 rounded" />
                      </div>
                    </motion.div>

                    {/* Suggestion */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.4 }}
                      className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20"
                    >
                      <p className="text-xs text-blue-400 mb-1">💡 Sugestão para o aluno:</p>
                      <div className="h-2 w-full bg-blue-500/20 rounded" />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-slate-900/50 border-t border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400">12 de 25 provas</span>
                  <div className="w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "48%" }}
                      transition={{ delay: 0.5, duration: 1.5 }}
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    />
                  </div>
                </div>
                <span className="text-xs text-emerald-400">~3 min restantes</span>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 bg-white text-slate-900 text-sm font-bold px-4 py-2 rounded-xl shadow-xl flex items-center gap-2"
            >
              <span className="text-2xl">📝</span>
              <div>
                <p className="text-xs text-slate-500">Tempo economizado</p>
                <p className="font-bold">4h por turma</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GradingSection;

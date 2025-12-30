import { Button } from "@/components/ui/button";
import { Sparkles, Upload, FileCheck, MessageSquare, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const GradingSection = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: Upload,
      title: "Envie as provas",
      description: "Faça upload de PDFs ou fotos das provas manuscritas dos alunos.",
      color: "#a855f7",
    },
    {
      icon: Sparkles,
      title: "IA corrige",
      description: "Nossa IA analisa cada resposta usando sua rubrica e critérios.",
      color: "#f59e0b",
    },
    {
      icon: MessageSquare,
      title: "Feedback detalhado",
      description: "Cada aluno recebe feedback personalizado e construtivo.",
      color: "#22c55e",
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-[#080a0f] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(245, 158, 11, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.5) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full blur-[120px] bg-amber-500/20"
        />
        <motion.div 
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-1/4 -left-20 w-[400px] h-[400px] rounded-full blur-[100px] bg-examai-purple-500/15"
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
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-amber-500/10 border border-amber-500/20 text-amber-400">
              ✨ Correção Mágica
            </span>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Corrija provas em{" "}
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                segundos
              </span>
              , não horas
            </h2>
            
            <p className="text-lg text-gray-400 mb-10 leading-relaxed">
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
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border"
                    style={{ background: `${step.color}15`, borderColor: `${step.color}30` }}
                  >
                    <step.icon className="h-6 w-6" style={{ color: step.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>
                    <p className="text-gray-400">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button
              size="lg"
              className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 shadow-lg shadow-amber-500/25 hover:-translate-y-0.5 transition-all"
              onClick={() => navigate('/assessments')}
            >
              Experimentar Correção
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
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
            <div className="relative bg-[#0f1219]/90 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#080a0f]/80 border-b border-gray-700/50">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-medium text-white">Correção em Andamento</span>
                </div>
                <span className="text-xs text-emerald-400 font-medium">98% confiança</span>
              </div>

              {/* Split View */}
              <div className="grid grid-cols-2 divide-x divide-gray-700/50">
                {/* Left - Student Paper */}
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide">Prova do Aluno</p>
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
                <div className="p-4 bg-[#0a0d14]/50">
                  <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide">Feedback da IA</p>
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
                      className="p-3 bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-3 w-3 text-amber-400" />
                        <span className="text-xs text-amber-400 font-medium">Análise</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2 w-full bg-gray-600 rounded" />
                        <div className="h-2 w-5/6 bg-gray-600 rounded" />
                        <div className="h-2 w-4/5 bg-gray-600 rounded" />
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
              <div className="px-4 py-3 bg-[#080a0f]/80 border-t border-gray-700/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400">12 de 25 provas</span>
                  <div className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
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
              className="absolute -bottom-4 -left-4 bg-white text-gray-900 text-sm font-bold px-4 py-2 rounded-xl shadow-xl flex items-center gap-2"
            >
              <span className="text-2xl">📝</span>
              <div>
                <p className="text-xs text-gray-500">Tempo economizado</p>
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

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  QrCode, 
  ScanLine, 
  Brain, 
  CheckCircle2, 
  ArrowRight,
  FileCheck,
  Sparkles,
  PenTool
} from "lucide-react";

interface GradingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const GRADING_STEPS: GradingStep[] = [
  { 
    id: 'print', 
    title: 'Imprima com QR Code', 
    description: 'Cada prova tem identificação única do aluno',
    icon: QrCode,
    color: 'from-orange-500 to-amber-500',
  },
  { 
    id: 'scan', 
    title: 'Escaneie as Provas', 
    description: 'Use scanner ou câmera do celular',
    icon: ScanLine,
    color: 'from-teal-500 to-emerald-500',
  },
  { 
    id: 'ai', 
    title: 'IA Analisa Respostas', 
    description: 'Reconhecimento de escrita manual',
    icon: Brain,
    color: 'from-purple-500 to-violet-500',
  },
  { 
    id: 'grade', 
    title: 'Notas Instantâneas', 
    description: 'Feedback detalhado automático',
    icon: CheckCircle2,
    color: 'from-green-500 to-emerald-500',
  },
];

function AnimatedExamPaper() {
  const [showMarks, setShowMarks] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setShowMarks(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  const questions = [
    { id: 1, correct: true, score: '2.0' },
    { id: 2, correct: true, score: '2.0' },
    { id: 3, correct: false, score: '0.5' },
    { id: 4, correct: true, score: '2.0' },
    { id: 5, correct: true, score: '1.5' },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, rotateX: 10 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="relative w-full max-w-sm mx-auto"
    >
      {/* Paper shadow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-amber-500/10 rounded-2xl blur-2xl transform translate-y-4" />
      
      {/* Exam paper */}
      <div className="relative bg-card border border-border rounded-2xl p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <div>
            <h4 className="font-semibold text-foreground text-sm">Prova de Matemática</h4>
            <p className="text-xs text-muted-foreground">5º Ano • Frações</p>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.3, type: "spring" }}
            className="p-2 rounded-lg bg-muted"
          >
            <QrCode className="h-8 w-8 text-muted-foreground" />
          </motion.div>
        </div>

        {/* Student info */}
        <div className="mb-4 p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 text-sm">
            <PenTool className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Aluno:</span>
            <span className="font-medium text-foreground">Maria Silva</span>
          </div>
        </div>

        {/* Questions with marks */}
        <div className="space-y-3">
          {questions.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground w-6">Q{q.id}</span>
                <div className="h-2 bg-muted rounded w-24" />
              </div>
              
              {/* Animated mark */}
              {showMarks && (
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.15, type: "spring", stiffness: 300 }}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${
                    q.correct 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-amber-500/20 text-amber-500'
                  }`}
                >
                  {q.correct ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <span className="text-[10px]">parcial</span>
                  )}
                  {q.score}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Total score */}
        {showMarks && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-4 pt-4 border-t border-border flex items-center justify-between"
          >
            <span className="text-sm font-medium text-muted-foreground">Nota Final</span>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: "spring" }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-amber-500 text-white font-bold"
            >
              <Sparkles className="h-4 w-4" />
              8.0 / 10
            </motion.div>
          </motion.div>
        )}

        {/* Floating badge */}
        <motion.div
          initial={{ scale: 0, y: 20 }}
          animate={showMarks ? { scale: 1, y: 0 } : {}}
          transition={{ delay: 1.2, type: "spring" }}
          className="absolute -bottom-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5"
        >
          <FileCheck className="h-4 w-4" />
          Corrigido em 3s
        </motion.div>
      </div>
    </motion.div>
  );
}

function StepCard({ step, index }: { step: GradingStep; index: number }) {
  const Icon = step.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15 }}
      whileHover={{ y: -5 }}
      className="relative text-center"
    >
      {/* Connector line */}
      {index < GRADING_STEPS.length - 1 && (
        <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-border to-transparent" />
      )}
      
      <motion.div
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400 }}
        className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} shadow-lg mb-4`}
      >
        <Icon className="h-9 w-9 text-white" />
      </motion.div>
      
      <div className="text-xs font-bold text-primary mb-2">Passo {index + 1}</div>
      <h4 className="font-bold text-foreground mb-1">{step.title}</h4>
      <p className="text-sm text-muted-foreground">{step.description}</p>
    </motion.div>
  );
}

export function ExamGradingShowcase() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section 
      ref={sectionRef}
      className="py-24 lg:py-32 bg-gradient-to-b from-muted/30 to-background dark:from-[#0c1018] dark:to-[#0a0d14] relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0">
        <motion.div 
          animate={{ opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full blur-[150px] bg-purple-500/20"
        />
        <motion.div 
          animate={{ opacity: [0.03, 0.08, 0.03] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-1/4 -right-40 w-[600px] h-[600px] rounded-full blur-[150px] bg-teal-500/15"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-purple-500/10 border border-purple-500/20 text-purple-500 dark:text-purple-400"
          >
            Correção Automática
          </motion.span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Corrija provas em{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-violet-500">
              segundos
            </span>
            , não horas
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nossa IA reconhece escrita manual e corrige automaticamente. 
            Feedback instantâneo para você e seus alunos.
          </p>
        </motion.div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
          {/* Animated exam paper */}
          <AnimatedExamPaper />

          {/* Benefits list */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Por que usar correção automática?
            </h3>
            
            {[
              { icon: QrCode, title: 'Identificação por QR Code', desc: 'Cada prova tem código único que identifica o aluno automaticamente' },
              { icon: PenTool, title: 'Reconhecimento de Escrita', desc: 'IA avançada que lê e interpreta respostas manuscritas' },
              { icon: Brain, title: 'Análise Inteligente', desc: 'Entende contexto e aceita respostas equivalentes' },
              { icon: Sparkles, title: 'Feedback Detalhado', desc: 'Comentários automáticos explicando erros e acertos' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
              >
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {GRADING_STEPS.map((step, index) => (
            <StepCard key={step.id} step={step} index={index} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-400 hover:to-violet-400 shadow-xl shadow-purple-500/25 group"
          >
            Experimentar Correção Automática
            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            Disponível no plano Premium • Teste grátis por 7 dias
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default ExamGradingShowcase;

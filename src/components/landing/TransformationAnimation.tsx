import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { FileText, Calendar, Sparkles, CheckCircle2, Upload, Wand2 } from "lucide-react";

/**
 * TransformationAnimation component
 * Clean, smooth animation showing document upload → AI processing → calendar result
 */

export function TransformationAnimation() {
  const [phase, setPhase] = useState<'upload' | 'processing' | 'complete'>('upload');

  useEffect(() => {
    const cycle = () => {
      setPhase('upload');
      
      const processingTimer = setTimeout(() => setPhase('processing'), 3000);
      const completeTimer = setTimeout(() => setPhase('complete'), 5500);
      const resetTimer = setTimeout(() => setPhase('upload'), 9000);

      return () => {
        clearTimeout(processingTimer);
        clearTimeout(completeTimer);
        clearTimeout(resetTimer);
      };
    };

    cycle();
    const interval = setInterval(cycle, 9000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Subtle background glow */}
      <motion.div
        animate={{
          opacity: phase === 'processing' ? 0.4 : 0.2,
          scale: phase === 'processing' ? 1.1 : 1,
        }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 -m-8 rounded-3xl bg-gradient-to-br from-primary/20 via-orange-500/10 to-teal-500/10 blur-3xl"
      />

      {/* Main card container */}
      <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl shadow-primary/5 overflow-hidden">
        
        {/* Card header */}
        <div className="px-5 py-4 border-b border-border/50 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                animate={{ 
                  backgroundColor: phase === 'complete' 
                    ? 'rgb(20 184 166)' 
                    : phase === 'processing' 
                    ? 'rgb(251 146 60)' 
                    : 'rgb(239 68 68)'
                }}
                className="p-2 rounded-lg shadow-lg"
              >
                {phase === 'complete' ? (
                  <Calendar className="h-4 w-4 text-white" />
                ) : phase === 'processing' ? (
                  <Wand2 className="h-4 w-4 text-white" />
                ) : (
                  <FileText className="h-4 w-4 text-white" />
                )}
              </motion.div>
              <div>
                <motion.div 
                  key={phase}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-semibold text-foreground"
                >
                  {phase === 'complete' ? 'Plano Semanal' : phase === 'processing' ? 'Processando...' : 'curriculo_bncc.pdf'}
                </motion.div>
                <div className="text-xs text-muted-foreground">
                  {phase === 'complete' ? '5 aulas geradas' : phase === 'processing' ? 'IA analisando conteúdo' : '2.4 MB • PDF'}
                </div>
              </div>
            </div>
            
            {/* Status badge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                  phase === 'complete' 
                    ? 'bg-teal-500/20 text-teal-500' 
                    : phase === 'processing'
                    ? 'bg-orange-500/20 text-orange-500'
                    : 'bg-blue-500/20 text-blue-500'
                }`}
              >
                {phase === 'complete' ? (
                  <><CheckCircle2 className="h-3 w-3" /> Pronto</>
                ) : phase === 'processing' ? (
                  <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Sparkles className="h-3 w-3" /></motion.div> IA</>
                ) : (
                  <><Upload className="h-3 w-3" /> Upload</>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Card content */}
        <div className="p-5 min-h-[280px] relative">
          <AnimatePresence mode="wait">
            {phase === 'upload' && <UploadPhase key="upload" />}
            {phase === 'processing' && <ProcessingPhase key="processing" />}
            {phase === 'complete' && <CompletePhase key="complete" />}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted/50">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-amber-500"
            initial={{ width: '0%' }}
            animate={{ 
              width: phase === 'upload' ? '33%' : phase === 'processing' ? '66%' : '100%'
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Phase indicators */}
      <div className="flex justify-center gap-8 mt-6">
        {[
          { id: 'upload', label: 'Upload', icon: Upload },
          { id: 'processing', label: 'IA', icon: Sparkles },
          { id: 'complete', label: 'Pronto', icon: CheckCircle2 },
        ].map((p, i) => (
          <motion.div
            key={p.id}
            className="flex flex-col items-center gap-2"
            animate={{ 
              opacity: phase === p.id ? 1 : 0.4,
              scale: phase === p.id ? 1.05 : 1,
            }}
          >
            <motion.div
              className={`p-2 rounded-full transition-colors ${
                phase === p.id 
                  ? 'bg-primary text-white' 
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <p.icon className="h-4 w-4" />
            </motion.div>
            <span className={`text-xs font-medium ${
              phase === p.id ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {p.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function UploadPhase() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Document preview lines */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
            <FileText className="h-5 w-5 text-red-500" />
          </div>
          <div className="flex-1">
            <div className="h-3 bg-muted rounded w-3/4 mb-2" />
            <div className="h-2 bg-muted/60 rounded w-1/2" />
          </div>
        </div>
        
        {[100, 85, 100, 70, 90, 60, 100, 75].map((width, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="h-2.5 bg-muted/50 rounded"
            style={{ width: `${width}%` }}
          />
        ))}
      </div>

      {/* Upload indicator */}
      <motion.div 
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4"
      >
        <Upload className="h-4 w-4" />
        <span>Documento carregado</span>
      </motion.div>
    </motion.div>
  );
}

function ProcessingPhase() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center h-full py-8"
    >
      {/* Central processing animation */}
      <div className="relative mb-6">
        {/* Outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 rounded-full border-2 border-dashed border-primary/30"
        />
        
        {/* Inner ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border-2 border-orange-500/40"
        />
        
        {/* Center icon */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="p-4 rounded-full bg-gradient-to-br from-primary to-orange-500 shadow-lg shadow-primary/30">
            <Wand2 className="h-6 w-6 text-white" />
          </div>
        </motion.div>

        {/* Orbiting dots */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary"
            style={{ top: '50%', left: '50%' }}
            animate={{
              x: [0, 40, 0, -40, 0],
              y: [-40, 0, 40, 0, -40],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.66,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Processing text */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-center"
      >
        <p className="text-sm font-medium text-foreground mb-1">Analisando conteúdo...</p>
        <p className="text-xs text-muted-foreground">Identificando objetivos e competências BNCC</p>
      </motion.div>

      {/* Progress items */}
      <div className="mt-6 space-y-2 w-full max-w-xs">
        {['Extraindo tópicos', 'Alinhando à BNCC', 'Gerando plano'].map((item, i) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.4 }}
            className="flex items-center gap-2 text-xs"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.4 }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
            <span className="text-muted-foreground">{item}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function CompletePhase() {
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
  const lessons = [
    { title: 'Intro', color: 'bg-primary/20 text-primary border-primary/30' },
    { title: 'Teoria', color: 'bg-blue-500/20 text-blue-500 border-blue-500/30' },
    { title: 'Prática', color: 'bg-teal-500/20 text-teal-500 border-teal-500/30' },
    { title: 'Revisão', color: 'bg-amber-500/20 text-amber-500 border-amber-500/30' },
    { title: 'Avaliação', color: 'bg-purple-500/20 text-purple-500 border-purple-500/30' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Calendar grid */}
      <div className="grid grid-cols-5 gap-2">
        {days.map((day, i) => (
          <motion.div
            key={day}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </motion.div>
        ))}
        
        {lessons.map((lesson, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 200 }}
            className={`p-3 rounded-xl border text-center ${lesson.color}`}
          >
            <div className="text-xs font-semibold">{lesson.title}</div>
          </motion.div>
        ))}
      </div>

      {/* Summary stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-3 gap-3 pt-4 border-t border-border/50"
      >
        {[
          { label: 'Aulas', value: '5' },
          { label: 'Atividades', value: '12' },
          { label: 'Habilidades', value: '8' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
            className="text-center"
          >
            <div className="text-lg font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Success message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="flex items-center justify-center gap-2 text-sm text-teal-500 font-medium pt-2"
      >
        <CheckCircle2 className="h-4 w-4" />
        <span>Plano gerado com sucesso!</span>
      </motion.div>
    </motion.div>
  );
}

export default TransformationAnimation;

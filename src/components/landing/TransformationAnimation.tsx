import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  FileText, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Wand2, 
  Sun,
  PenTool,
  BookOpen,
  ClipboardList,
  GraduationCap,
  ArrowRight
} from "lucide-react";

/**
 * TransformationAnimation component
 * Shows: Create (wizard) → AI Processing (sun) → Calendar Result
 * With wow-factor animations and smooth transitions
 */

export function TransformationAnimation() {
  const [phase, setPhase] = useState<'create' | 'processing' | 'complete'>('create');

  useEffect(() => {
    const cycle = () => {
      setPhase('create');
      
      const processingTimer = setTimeout(() => setPhase('processing'), 3500);
      const completeTimer = setTimeout(() => setPhase('complete'), 7000);
      const resetTimer = setTimeout(() => setPhase('create'), 11000);

      return () => {
        clearTimeout(processingTimer);
        clearTimeout(completeTimer);
        clearTimeout(resetTimer);
      };
    };

    cycle();
    const interval = setInterval(cycle, 11000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square flex items-center justify-center">
      {/* Outer glow effect - intensifies during processing */}
      <motion.div
        animate={{
          scale: phase === 'processing' ? [1, 1.5, 1] : [1, 1.15, 1],
          opacity: phase === 'processing' ? [0.3, 0.6, 0.3] : [0.15, 0.3, 0.15],
        }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/50 via-amber-500/40 to-teal-500/30 blur-3xl"
      />

      {/* Orbiting icons - speed up during processing */}
      <OrbitingIcons phase={phase} />

      {/* Glowing particles */}
      <GlowingParticles phase={phase} />

      {/* Pulsing rings during transformation */}
      <AnimatePresence>
        {phase === 'processing' && (
          <>
            <PulsingRing delay={0} maxRadius={220} />
            <PulsingRing delay={0.4} maxRadius={280} />
            <PulsingRing delay={0.8} maxRadius={340} />
          </>
        )}
      </AnimatePresence>

      {/* Connection lines between phases */}
      <AnimatePresence>
        {(phase === 'create' || phase === 'processing') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'processing' ? 0.8 : 0.3 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Energy flow lines */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute left-1/2 top-1/2 w-1 h-20 origin-bottom"
                style={{ 
                  rotate: `${i * 60}deg`,
                  transformOrigin: 'bottom center'
                }}
                animate={{
                  scaleY: phase === 'processing' ? [0.5, 1, 0.5] : 0.3,
                  opacity: phase === 'processing' ? [0.3, 0.8, 0.3] : 0.2,
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              >
                <div className="w-full h-full bg-gradient-to-t from-primary/60 to-transparent rounded-full blur-sm" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content with improved transitions */}
      <AnimatePresence mode="wait">
        {phase === 'create' && <CreatePhase key="create" />}
        {phase === 'processing' && <ProcessingPhase key="processing" />}
        {phase === 'complete' && <CompletePhase key="complete" />}
      </AnimatePresence>

      {/* Phase indicator with progress line */}
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {[
          { id: 'create', label: 'Criar', icon: PenTool },
          { id: 'processing', label: 'IA', icon: Sparkles },
          { id: 'complete', label: 'Pronto', icon: CheckCircle2 },
        ].map((p, index) => (
          <div key={p.id} className="flex items-center">
            <motion.div
              className="flex flex-col items-center gap-1.5"
              animate={{
                scale: phase === p.id ? 1.1 : 1,
                opacity: phase === p.id ? 1 : 0.5,
              }}
            >
              <motion.div
                animate={{
                  backgroundColor: phase === p.id ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                  boxShadow: phase === p.id ? '0 0 20px hsl(var(--primary) / 0.5)' : 'none',
                }}
                className="p-2 rounded-full"
              >
                <p.icon className={`h-4 w-4 ${phase === p.id ? 'text-white' : 'text-muted-foreground'}`} />
              </motion.div>
              <span className={`text-xs font-medium ${phase === p.id ? 'text-primary' : 'text-muted-foreground'}`}>
                {p.label}
              </span>
            </motion.div>
            
            {/* Connector arrow between phases */}
            {index < 2 && (
              <motion.div 
                className="mx-2"
                animate={{
                  opacity: (phase === 'processing' && index === 0) || (phase === 'complete' && index === 1) ? 1 : 0.3,
                  scale: (phase === 'processing' && index === 0) || (phase === 'complete' && index === 1) ? 1.2 : 1,
                }}
              >
                <ArrowRight className="h-3 w-3 text-primary/50" />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function OrbitingIcons({ phase }: { phase: string }) {
  const icons = [
    { icon: FileText, color: 'from-orange-500 to-amber-500', delay: 0 },
    { icon: Calendar, color: 'from-teal-500 to-emerald-500', delay: 2 },
    { icon: BookOpen, color: 'from-purple-500 to-violet-500', delay: 4 },
    { icon: ClipboardList, color: 'from-blue-500 to-cyan-500', delay: 6 },
    { icon: GraduationCap, color: 'from-pink-500 to-rose-500', delay: 8 },
    { icon: Wand2, color: 'from-amber-500 to-yellow-500', delay: 10 },
  ];

  return (
    <div className="absolute inset-0">
      {/* Orbit rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute w-[280px] h-[280px] rounded-full border border-dashed border-primary/20" 
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="absolute w-[200px] h-[200px] rounded-full border border-dashed border-violet-500/15" 
        />
      </div>

      {/* Outer orbit - 6 icons */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: phase === 'processing' ? 8 : 20, repeat: Infinity, ease: "linear" }}
      >
        {icons.map((item, i) => {
          const angle = (i * 60) * (Math.PI / 180);
          const radius = 140;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{ transform: `translate(${x}px, ${y}px)` }}
              animate={{ 
                rotate: phase === 'processing' ? -360 : 0,
                scale: phase === 'processing' ? [1, 1.2, 1] : 1,
              }}
              transition={{ 
                rotate: { duration: phase === 'processing' ? 8 : 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 1.5, repeat: Infinity, delay: i * 0.2 }
              }}
            >
              <motion.div
                className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color} shadow-lg`}
                animate={{
                  boxShadow: phase === 'processing' 
                    ? ['0 0 15px rgba(251, 146, 60, 0.3)', '0 0 30px rgba(251, 146, 60, 0.6)', '0 0 15px rgba(251, 146, 60, 0.3)']
                    : '0 0 15px rgba(251, 146, 60, 0.3)',
                }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
              >
                <item.icon className="h-4 w-4 text-white" />
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

function GlowingParticles({ phase }: { phase: string }) {
  return (
    <div className="absolute inset-0">
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30) * (Math.PI / 180);
        const radius = 100 + (i % 3) * 20;
        
        return (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2"
            animate={{
              x: [Math.cos(angle) * radius, Math.cos(angle + Math.PI) * radius],
              y: [Math.sin(angle) * radius, Math.sin(angle + Math.PI) * radius],
              opacity: phase === 'processing' ? [0.4, 1, 0.4] : [0.2, 0.6, 0.2],
              scale: phase === 'processing' ? [1, 1.5, 1] : [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: phase === 'processing' ? 2 : 4,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          >
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-amber-300 blur-[1px]" />
          </motion.div>
        );
      })}
    </div>
  );
}

function PulsingRing({ delay, maxRadius }: { delay: number; maxRadius: number }) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary/40"
      initial={{ width: 80, height: 80, opacity: 0.8 }}
      animate={{
        width: [80, maxRadius],
        height: [80, maxRadius],
        opacity: [0.8, 0],
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 2,
        repeat: Infinity,
        delay,
        ease: "easeOut",
      }}
    />
  );
}

function CreatePhase() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ 
        opacity: 0, 
        scale: 0.5, 
        y: -20,
        filter: "blur(10px)",
        transition: { duration: 0.4 }
      }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      className="relative z-10"
    >
      <div className="relative w-72 bg-card/95 dark:bg-card/90 backdrop-blur-xl rounded-2xl border border-border/60 dark:border-border/50 p-5 shadow-2xl shadow-primary/15 dark:shadow-primary/10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/50">
          <motion.div 
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-orange-500 shadow-lg shadow-primary/25"
          >
            <PenTool className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <div className="text-sm font-semibold text-foreground">Criar Conteúdo</div>
            <div className="text-xs text-muted-foreground">Assistente de Planejamento</div>
          </div>
        </div>

        {/* Wizard steps preview */}
        <div className="space-y-3">
          {[
            { label: 'Série e Disciplina', done: true },
            { label: 'Tema e Objetivos', done: true },
            { label: 'Metodologia', done: false },
            { label: 'Configurações', done: false },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.12, type: "spring" }}
              className={`flex items-center gap-3 p-2.5 rounded-lg ${
                step.done ? 'bg-primary/15 dark:bg-primary/10' : 'bg-muted/40 dark:bg-muted/30'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                step.done ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {step.done ? <CheckCircle2 className="h-3 w-3" /> : <span className="text-xs">{i + 1}</span>}
              </div>
              <span className={`text-xs font-medium ${step.done ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Floating badge */}
        <motion.div
          animate={{ y: [0, -6, 0], scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-3 -right-3 bg-gradient-to-r from-primary to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-primary/35 flex items-center gap-1.5"
        >
          <PenTool className="h-3 w-3" />
          Criar
        </motion.div>
      </div>
    </motion.div>
  );
}

function ProcessingPhase() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 1.5,
        filter: "blur(20px)",
        transition: { duration: 0.5 }
      }}
      transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
      className="relative z-10 flex items-center justify-center"
    >
      {/* Central sun with intense glow */}
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.12, 1],
        }}
        transition={{ 
          rotate: { duration: 3, repeat: Infinity, ease: "linear" },
          scale: { duration: 1.5, repeat: Infinity },
        }}
        className="relative"
      >
        {/* Outer glow layers */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="absolute -inset-10 rounded-full bg-gradient-to-br from-orange-500/50 to-amber-400/40 blur-2xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1.6, 1.2], opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 0.2 }}
          className="absolute -inset-16 rounded-full bg-gradient-to-br from-primary/40 to-orange-500/30 blur-3xl"
        />
        
        {/* Main sun */}
        <motion.div 
          className="relative p-8 rounded-full bg-gradient-to-br from-primary via-orange-500 to-amber-500 shadow-2xl"
          animate={{
            boxShadow: [
              '0 0 60px rgba(251, 146, 60, 0.6), 0 0 120px rgba(251, 146, 60, 0.4)',
              '0 0 80px rgba(251, 146, 60, 0.8), 0 0 160px rgba(251, 146, 60, 0.5)',
              '0 0 60px rgba(251, 146, 60, 0.6), 0 0 120px rgba(251, 146, 60, 0.4)',
            ]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Sun className="h-14 w-14 text-white" />
          
          {/* Inner glow ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-white/50"
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        </motion.div>

        {/* Orbiting sparkles around sun */}
        {[...Array(8)].map((_, idx) => (
          <motion.div
            key={idx}
            className="absolute"
            style={{
              width: 110,
              height: 110,
              left: '50%',
              top: '50%',
              marginLeft: -55,
              marginTop: -55,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear", delay: idx * 0.15 }}
          >
            <motion.div
              animate={{ scale: [1, 2, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: idx * 0.08 }}
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gradient-to-r from-amber-300 to-orange-400"
              style={{
                boxShadow: '0 0 20px rgba(251, 191, 36, 1)',
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Processing text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute -bottom-24 left-0 right-0 text-center"
      >
        <motion.div 
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="flex items-center justify-center gap-2 text-primary font-semibold mb-1"
        >
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
            <Wand2 className="h-4 w-4" />
          </motion.div>
          <span>Processando com IA...</span>
        </motion.div>
        <p className="text-xs text-muted-foreground">Gerando plano alinhado à BNCC</p>
      </motion.div>
    </motion.div>
  );
}

function CompletePhase() {
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
  const lessons = [
    { title: 'Intro', color: 'bg-primary/20 border-primary/40 text-primary dark:text-primary' },
    { title: 'Teoria', color: 'bg-blue-500/20 border-blue-500/40 text-blue-600 dark:text-blue-400' },
    { title: 'Prática', color: 'bg-teal-500/20 border-teal-500/40 text-teal-600 dark:text-teal-400' },
    { title: 'Revisão', color: 'bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-400' },
    { title: 'Avaliação', color: 'bg-purple-500/20 border-purple-500/40 text-purple-600 dark:text-purple-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ 
        opacity: 0, 
        scale: 0.8, 
        y: -30,
        transition: { duration: 0.3 }
      }}
      transition={{ duration: 0.7, type: "spring", stiffness: 90 }}
      className="relative z-10"
    >
      <div className="relative w-80 bg-card/95 dark:bg-card/90 backdrop-blur-xl rounded-2xl border border-border/60 dark:border-border/50 p-5 shadow-2xl shadow-secondary/15 dark:shadow-secondary/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <motion.div 
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg shadow-teal-500/25"
            >
              <Calendar className="h-4 w-4 text-white" />
            </motion.div>
            <span className="text-sm font-semibold text-foreground">Plano Semanal</span>
          </div>
          <motion.div 
            initial={{ scale: 0, x: 20 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            className="flex items-center gap-1.5 text-xs text-secondary font-medium bg-secondary/15 dark:bg-secondary/10 px-2.5 py-1 rounded-full"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Gerado</span>
          </motion.div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-5 gap-2">
          {days.map((day, i) => (
            <motion.div 
              key={day} 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="text-center text-xs font-medium text-muted-foreground pb-2"
            >
              {day}
            </motion.div>
          ))}

          {lessons.map((lesson, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 180 }}
              className={`p-2.5 rounded-xl border ${lesson.color} text-center`}
            >
              <div className="text-xs font-semibold truncate">{lesson.title}</div>
            </motion.div>
          ))}
        </div>

        {/* Success badge */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 180 }}
          className="absolute -top-3 -right-3 bg-gradient-to-r from-secondary to-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-secondary/35 flex items-center gap-1.5"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: 3 }}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
          </motion.div>
          Pronto!
        </motion.div>
      </div>
    </motion.div>
  );
}

export default TransformationAnimation;

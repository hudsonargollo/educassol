import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { FileText, Calendar, Sparkles, CheckCircle2, Wand2, Sun } from "lucide-react";

/**
 * TransformationAnimation component
 * Animates a PDF document transforming into a calendar view
 * with orbiting icons and glowing particle effects
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

interface OrbitingIconProps {
  icon: React.ElementType;
  color: string;
  delay: number;
  radius: number;
  duration: number;
  size?: number;
}

function OrbitingIcon({ icon: Icon, color, delay, radius, duration, size = 40 }: OrbitingIconProps) {
  return (
    <motion.div
      className="absolute"
      style={{
        width: radius * 2,
        height: radius * 2,
        left: '50%',
        top: '50%',
        marginLeft: -radius,
        marginTop: -radius,
      }}
      animate={{ rotate: 360 }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
        delay,
      }}
    >
      <motion.div
        className={`absolute flex items-center justify-center rounded-xl shadow-lg ${color}`}
        style={{
          width: size,
          height: size,
          top: 0,
          left: '50%',
          marginLeft: -size / 2,
        }}
        animate={{
          scale: [1, 1.15, 1],
          boxShadow: [
            '0 0 20px rgba(251, 146, 60, 0.3)',
            '0 0 35px rgba(251, 146, 60, 0.5)',
            '0 0 20px rgba(251, 146, 60, 0.3)',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: delay * 0.5,
        }}
      >
        <Icon className="h-5 w-5 text-white" />
      </motion.div>
    </motion.div>
  );
}

function GlowingParticle({ delay, radius }: { delay: number; radius: number }) {
  return (
    <motion.div
      className="absolute"
      style={{
        width: radius * 2,
        height: radius * 2,
        left: '50%',
        top: '50%',
        marginLeft: -radius,
        marginTop: -radius,
      }}
      animate={{ rotate: -360 }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "linear",
        delay,
      }}
    >
      <motion.div
        className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-amber-300"
        style={{
          top: 0,
          left: '50%',
          marginLeft: -4,
        }}
        animate={{
          opacity: [0.3, 1, 0.3],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay,
        }}
      />
    </motion.div>
  );
}

function PulsingRing({ delay, maxRadius }: { delay: number; maxRadius: number }) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary/30"
      initial={{ width: 60, height: 60, opacity: 0.8 }}
      animate={{
        width: [60, maxRadius],
        height: [60, maxRadius],
        opacity: [0.6, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        delay,
        ease: "easeOut",
      }}
    />
  );
}

export function TransformationAnimation() {
  const [phase, setPhase] = useState<'pdf' | 'transforming' | 'calendar'>('pdf');

  useEffect(() => {
    const cycle = () => {
      setPhase('pdf');
      
      const transformTimer = setTimeout(() => {
        setPhase('transforming');
      }, 2500);

      const calendarTimer = setTimeout(() => {
        setPhase('calendar');
      }, 4000);

      const resetTimer = setTimeout(() => {
        setPhase('pdf');
      }, 7000);

      return () => {
        clearTimeout(transformTimer);
        clearTimeout(calendarTimer);
        clearTimeout(resetTimer);
      };
    };

    cycle();
    const interval = setInterval(cycle, 7000);
    return () => clearInterval(interval);
  }, []);

  // Orbiting icons configuration
  const orbitingIcons = [
    { icon: FileText, color: 'bg-gradient-to-br from-orange-500 to-amber-500', delay: 0, radius: 130, duration: 12 },
    { icon: Calendar, color: 'bg-gradient-to-br from-teal-500 to-emerald-500', delay: 3, radius: 130, duration: 12 },
    { icon: Sparkles, color: 'bg-gradient-to-br from-purple-500 to-violet-500', delay: 6, radius: 130, duration: 12 },
    { icon: CheckCircle2, color: 'bg-gradient-to-br from-green-500 to-emerald-500', delay: 9, radius: 130, duration: 12 },
  ];

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square flex items-center justify-center">
      {/* Outer glow effect */}
      <motion.div
        animate={{
          scale: phase === 'transforming' ? [1, 1.3, 1] : [1, 1.1, 1],
          opacity: phase === 'transforming' ? [0.2, 0.4, 0.2] : [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 via-amber-500/20 to-teal-500/20 blur-3xl"
      />

      {/* Orbiting icons - always visible */}
      <div className="absolute inset-0">
        {orbitingIcons.map((config, i) => (
          <OrbitingIcon key={i} {...config} />
        ))}
      </div>

      {/* Glowing particles - smaller orbit */}
      <div className="absolute inset-0">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <GlowingParticle key={i} delay={i * 1.3} radius={100} />
        ))}
      </div>

      {/* Pulsing rings during transformation */}
      {phase === 'transforming' && (
        <div className="absolute inset-0">
          <PulsingRing delay={0} maxRadius={200} />
          <PulsingRing delay={0.5} maxRadius={250} />
          <PulsingRing delay={1} maxRadius={300} />
        </div>
      )}

      <AnimatePresence mode="wait">
        {phase === 'pdf' && (
          <motion.div
            key="pdf"
            initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateY: 15 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <PDFDocument />
          </motion.div>
        )}

        {phase === 'transforming' && (
          <motion.div
            key="transforming"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex items-center justify-center"
          >
            <TransformingState />
          </motion.div>
        )}

        {phase === 'calendar' && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, scale: 0.8, rotateY: 15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateY: -15 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <CalendarView />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase indicator */}
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
        {[
          { id: 'pdf', label: 'Upload' },
          { id: 'transforming', label: 'IA' },
          { id: 'calendar', label: 'Pronto' },
        ].map((p) => (
          <motion.div
            key={p.id}
            className="flex flex-col items-center gap-1"
          >
            <motion.div
              animate={{
                scale: phase === p.id ? 1.3 : 1,
                backgroundColor: phase === p.id ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.3)',
              }}
              className="w-2.5 h-2.5 rounded-full"
            />
            <span className={`text-xs ${phase === p.id ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              {p.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PDFDocument() {
  return (
    <div className="relative w-72 bg-card/90 backdrop-blur-xl rounded-2xl border border-border/50 p-6 shadow-2xl shadow-primary/10">
      {/* PDF Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/50">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/20">
          <FileText className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">curriculo_bncc.pdf</div>
          <div className="text-xs text-muted-foreground">2.4 MB • PDF</div>
        </div>
      </div>

      {/* PDF Content Lines */}
      <div className="space-y-3">
        {[100, 80, 100, 60, 100, 80, 50].map((width, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="h-3 bg-muted/60 rounded"
            style={{ width: `${width}%` }}
          />
        ))}
      </div>

      {/* Floating badge */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute -top-3 -right-3 bg-gradient-to-r from-primary to-amber-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-primary/30"
      >
        📄 Upload
      </motion.div>
    </div>
  );
}

function TransformingState() {
  return (
    <div className="relative">
      {/* Central icon with glow */}
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          rotate: { duration: 4, repeat: Infinity, ease: "linear" },
          scale: { duration: 1.5, repeat: Infinity },
        }}
        className="relative p-8 rounded-full bg-gradient-to-br from-primary via-orange-500 to-amber-500 shadow-2xl"
        style={{
          boxShadow: '0 0 60px rgba(251, 146, 60, 0.5), 0 0 100px rgba(251, 146, 60, 0.3)',
        }}
      >
        <Sun className="h-14 w-14 text-white" />
        
        {/* Inner glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-white/30"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </motion.div>

      {/* Orbiting sparkles around center */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: 80,
            height: 80,
            left: '50%',
            top: '50%',
            marginLeft: -40,
            marginTop: -40,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: i * 0.33 }}
        >
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gradient-to-r from-amber-300 to-orange-400"
            style={{
              boxShadow: '0 0 10px rgba(251, 191, 36, 0.8)',
            }}
          />
        </motion.div>
      ))}

      {/* Processing text */}
      <motion.div
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute -bottom-14 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm text-primary font-semibold flex items-center gap-2"
      >
        <Wand2 className="h-4 w-4" />
        Processando com IA...
      </motion.div>
    </div>
  );
}

function CalendarView() {
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
  const lessons = [
    { day: 0, title: 'Introdução', color: 'bg-primary/20 border-primary/40 text-primary' },
    { day: 1, title: 'Prática', color: 'bg-blue-500/20 border-blue-500/40 text-blue-400' },
    { day: 2, title: 'Atividade', color: 'bg-teal-500/20 border-teal-500/40 text-teal-400' },
    { day: 3, title: 'Revisão', color: 'bg-amber-500/20 border-amber-500/40 text-amber-400' },
    { day: 4, title: 'Avaliação', color: 'bg-purple-500/20 border-purple-500/40 text-purple-400' },
  ];

  return (
    <div className="relative w-80 bg-card/90 backdrop-blur-xl rounded-2xl border border-border/50 p-5 shadow-2xl shadow-primary/10">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg shadow-teal-500/20">
            <Calendar className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-foreground">Plano Semanal</span>
        </div>
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="flex items-center gap-1.5 text-xs text-secondary font-medium bg-secondary/10 px-2.5 py-1 rounded-full"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Gerado</span>
        </motion.div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-5 gap-2">
        {/* Day headers */}
        {days.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground pb-2">
            {day}
          </div>
        ))}

        {/* Lesson cards */}
        {lessons.map((lesson, i) => (
          <motion.div
            key={lesson.day}
            initial={{ opacity: 0, y: 15, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.1, type: "spring", stiffness: 200 }}
            className={`p-2.5 rounded-xl border ${lesson.color} text-center`}
          >
            <div className="text-xs font-semibold truncate">{lesson.title}</div>
          </motion.div>
        ))}
      </div>

      {/* Success badge */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        className="absolute -top-3 -right-3 bg-gradient-to-r from-secondary to-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-secondary/30 flex items-center gap-1.5"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Pronto!
      </motion.div>
    </div>
  );
}

export default TransformationAnimation;

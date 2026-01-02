import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { FileText, Calendar, Sparkles, CheckCircle2 } from "lucide-react";

/**
 * TransformationAnimation component
 * Animates a PDF document transforming into a calendar view
 * Uses Framer Motion for smooth transitions
 * Requirements: 6.5
 */
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

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center">
      {/* Glow effect behind */}
      <motion.div
        animate={{
          scale: phase === 'transforming' ? [1, 1.2, 1] : 1,
          opacity: phase === 'transforming' ? [0.3, 0.6, 0.3] : 0.2,
        }}
        transition={{ duration: 1.5, repeat: phase === 'transforming' ? Infinity : 0 }}
        className="absolute inset-0 rounded-3xl bg-gradient-to-br from-examai-purple-500/30 to-violet-500/20 blur-3xl"
      />

      <AnimatePresence mode="wait">
        {phase === 'pdf' && (
          <motion.div
            key="pdf"
            initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateY: 15 }}
            transition={{ duration: 0.5 }}
            className="relative"
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
            className="relative flex items-center justify-center"
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
            className="relative"
          >
            <CalendarView />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase indicator */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {['pdf', 'transforming', 'calendar'].map((p) => (
          <motion.div
            key={p}
            animate={{
              scale: phase === p ? 1.2 : 1,
              backgroundColor: phase === p ? 'rgb(168, 85, 247)' : 'rgb(168, 85, 247, 0.3)',
            }}
            className="w-2 h-2 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}

function PDFDocument() {
  return (
    <div className="relative w-72 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 shadow-2xl">
      {/* PDF Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
        <div className="p-2 rounded-lg bg-red-500/20">
          <FileText className="h-5 w-5 text-red-400" />
        </div>
        <div>
          <div className="text-sm font-medium text-white">curriculum.pdf</div>
          <div className="text-xs text-gray-500">2.4 MB</div>
        </div>
      </div>

      {/* PDF Content Lines */}
      <div className="space-y-3">
        <div className="h-3 bg-white/10 rounded w-full" />
        <div className="h-3 bg-white/10 rounded w-4/5" />
        <div className="h-3 bg-white/10 rounded w-full" />
        <div className="h-3 bg-white/10 rounded w-3/5" />
        <div className="h-3 bg-white/10 rounded w-full" />
        <div className="h-3 bg-white/10 rounded w-4/5" />
      </div>

      {/* Floating badge */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute -top-3 -right-3 bg-examai-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
      >
        Upload
      </motion.div>
    </div>
  );
}

function TransformingState() {
  return (
    <div className="relative">
      {/* Central sparkle icon */}
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
        transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" }, scale: { duration: 1, repeat: Infinity } }}
        className="p-6 rounded-full bg-gradient-to-br from-examai-purple-500 to-violet-600 shadow-2xl shadow-examai-purple-500/50"
      >
        <Sparkles className="h-12 w-12 text-white" />
      </motion.div>

      {/* Orbiting particles */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: i * 0.25 }}
          className="absolute inset-0"
          style={{ transformOrigin: 'center' }}
        >
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.25 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-examai-purple-400"
          />
        </motion.div>
      ))}

      {/* Processing text */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm text-examai-purple-400 font-medium"
      >
        AI Processing...
      </motion.div>
    </div>
  );
}

function CalendarView() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const lessons = [
    { day: 0, title: 'Intro', color: 'bg-examai-purple-500/30 border-examai-purple-500/50' },
    { day: 1, title: 'Practice', color: 'bg-blue-500/30 border-blue-500/50' },
    { day: 2, title: 'Activity', color: 'bg-green-500/30 border-green-500/50' },
    { day: 3, title: 'Review', color: 'bg-amber-500/30 border-amber-500/50' },
    { day: 4, title: 'Assessment', color: 'bg-violet-500/30 border-violet-500/50' },
  ];

  return (
    <div className="relative w-80 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 shadow-2xl">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-examai-purple-400" />
          <span className="text-sm font-medium text-white">Week Plan</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-green-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Generated</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-5 gap-2">
        {/* Day headers */}
        {days.map((day) => (
          <div key={day} className="text-center text-xs text-gray-500 pb-2">
            {day}
          </div>
        ))}

        {/* Lesson cards */}
        {lessons.map((lesson, i) => (
          <motion.div
            key={lesson.day}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-2 rounded-lg border ${lesson.color} text-center`}
          >
            <div className="text-xs text-white font-medium truncate">{lesson.title}</div>
          </motion.div>
        ))}
      </div>

      {/* Success badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1"
      >
        <CheckCircle2 className="h-3 w-3" />
        Ready
      </motion.div>
    </div>
  );
}

export default TransformationAnimation;

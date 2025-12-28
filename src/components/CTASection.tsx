import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { EDUCASSOL_SPRING } from "@/lib/motion";
import { EDUCASSOL_COLORS } from "@/lib/colors";

const CTASection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-24 lg:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${EDUCASSOL_COLORS.primary}30 0%, transparent 70%)` }}
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${EDUCASSOL_COLORS.accent}25 0%, transparent 70%)` }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-amber-500/30"
          >
            <Sun className="h-10 w-10 text-white" />
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
            Pronto para transformar{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              sua rotina?
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Junte-se a centenas de educadores que já economizam horas toda semana 
            com EducaSol. Comece grátis, sem cartão de crédito.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={EDUCASSOL_SPRING}
            >
              <Button
                size="lg"
                className="h-16 px-10 text-lg font-semibold shadow-2xl shadow-amber-500/30 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900"
                onClick={() => navigate('/auth')}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Começar Grátis Agora
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </motion.div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Setup em 2 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Alinhado à BNCC</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Suporte em português</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;

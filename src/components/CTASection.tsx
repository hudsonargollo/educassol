import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const CTASection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-[#0a0d14]">
      {/* Gradient background elements */}
      <div className="absolute inset-0">
        {/* Purple gradient orb - top left */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] bg-examai-purple-500/25"
        />
        {/* Blue gradient orb - bottom right */}
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[120px] bg-blue-500/20"
        />
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
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
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-examai-purple-500 to-violet-600 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-examai-purple-500/30"
          >
            <GraduationCap className="h-10 w-10 text-white" />
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
            Pronto para transformar{" "}
            <span className="bg-gradient-to-r from-examai-purple-400 via-violet-400 to-examai-purple-500 bg-clip-text text-transparent">
              sua rotina?
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Junte-se a centenas de educadores que já economizam horas toda semana 
            com Educa Sol. Comece grátis, sem cartão de crédito.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="h-16 px-10 text-lg font-semibold bg-gradient-to-r from-examai-purple-500 to-violet-500 hover:from-examai-purple-400 hover:to-violet-400 shadow-lg shadow-examai-purple-500/25 hover:-translate-y-0.5 transition-all"
              onClick={() => navigate('/auth')}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Começar Grátis Agora
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span>Setup em 2 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-examai-purple-400" />
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

import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Sun, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const CTASection = () => {
  const navigate = useNavigate();
  
  const benefits = [
    "Setup em 2 minutos",
    "Sem cartão de crédito",
    "Cancele quando quiser"
  ];
  
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-gradient-to-b from-muted/30 to-background dark:from-[#0c1018] dark:to-[#0a0d14]">
      {/* Gradient background elements */}
      <div className="absolute inset-0">
        {/* Primary gradient orb */}
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1], 
            opacity: [0.15, 0.25, 0.15],
            x: [0, 30, 0]
          }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] bg-gradient-to-br from-primary/30 to-amber-500/20"
        />
        {/* Secondary gradient orb */}
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2], 
            opacity: [0.1, 0.2, 0.1],
            x: [0, -20, 0]
          }}
          transition={{ duration: 14, repeat: Infinity }}
          className="absolute bottom-0 right-1/4 w-[700px] h-[700px] rounded-full blur-[150px] bg-gradient-to-br from-secondary/25 to-teal-500/15"
        />
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary) / 0.4) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.4) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/30"
          >
            <Sun className="h-10 w-10 text-white" />
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6 leading-tight"
          >
            Pronto para transformar{" "}
            <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
              sua rotina?
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Junte-se a milhares de educadores que já economizam horas toda semana 
            com o Educa Sol. Comece grátis hoje mesmo.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
          >
            <Button
              size="lg"
              className="h-16 px-10 text-lg font-semibold bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 group"
              onClick={() => navigate('/auth')}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Começar Grátis Agora
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            {benefits.map((benefit, index) => (
              <motion.div 
                key={benefit}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                <span>{benefit}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;

import { motion } from "framer-motion";
import { FileText, Wand2, Download, Sparkles } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Escolha o Tema",
    description: "Selecione a disciplina, série e tema que deseja trabalhar. A IA já conhece a BNCC.",
    icon: FileText,
    color: "orange",
  },
  {
    number: "02",
    title: "Gere com IA",
    description: "Em segundos, receba um plano de aula completo com objetivos, metodologia e atividades.",
    icon: Wand2,
    color: "teal",
  },
  {
    number: "03",
    title: "Personalize",
    description: "Ajuste o conteúdo ao seu estilo. Adicione, remova ou modifique qualquer parte.",
    icon: Sparkles,
    color: "purple",
  },
  {
    number: "04",
    title: "Exporte e Use",
    description: "Baixe em PDF, DOCX ou apresentação. Pronto para usar na sua aula!",
    icon: Download,
    color: "amber",
  },
];

const colorStyles = {
  orange: {
    bg: "bg-orange-500/10 dark:bg-orange-500/15",
    border: "border-orange-500/30",
    text: "text-orange-500",
    glow: "shadow-orange-500/20",
  },
  teal: {
    bg: "bg-teal-500/10 dark:bg-teal-500/15",
    border: "border-teal-500/30",
    text: "text-teal-500",
    glow: "shadow-teal-500/20",
  },
  purple: {
    bg: "bg-purple-500/10 dark:bg-purple-500/15",
    border: "border-purple-500/30",
    text: "text-purple-500",
    glow: "shadow-purple-500/20",
  },
  amber: {
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    border: "border-amber-500/30",
    text: "text-amber-500",
    glow: "shadow-amber-500/20",
  },
};

export function HowItWorksSection() {
  return (
    <section className="py-24 lg:py-32 bg-background dark:bg-[#0a0d14] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <motion.div 
          animate={{ opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[200px] bg-primary/10"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-primary/10 border border-primary/20 text-primary"
          >
            Como Funciona
          </motion.span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Simples como{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">
              1, 2, 3, 4
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Do tema à aula pronta em menos de um minuto. Veja como é fácil.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const styles = colorStyles[step.color as keyof typeof colorStyles];
            const Icon = step.icon;
            
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="relative"
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-border to-transparent" />
                )}
                
                <motion.div 
                  className="text-center"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Step number */}
                  <motion.div
                    className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl ${styles.bg} border ${styles.border} mb-6 shadow-lg ${styles.glow}`}
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Icon className={`h-10 w-10 ${styles.text}`} />
                  </motion.div>
                  
                  {/* Step number badge */}
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${styles.bg} ${styles.text}`}>
                    Passo {step.number}
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;

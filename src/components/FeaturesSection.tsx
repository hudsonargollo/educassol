import { FileText, ClipboardList, Target, BookOpen, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: FileText,
    title: "Planos de Aula Inteligentes",
    description: "Envie uma foto do quadro, suas anotações ou um PDF. A IA gera um plano completo com objetivos, metodologia e recursos — tudo alinhado à BNCC.",
    items: ["Objetivos de aprendizagem", "Metodologia detalhada", "Habilidades BNCC"],
    color: "purple",
  },
  {
    icon: ClipboardList,
    title: "Atividades Personalizadas",
    description: "Gere exercícios, jogos educativos e atividades práticas adaptadas ao nível da turma. Diversifique suas aulas sem esforço.",
    items: ["Exercícios graduados", "Atividades lúdicas", "Material imprimível"],
    color: "green",
  },
  {
    icon: Target,
    title: "Avaliações com Rubrica",
    description: "Crie provas, quizzes e avaliações diagnósticas. A IA gera rubricas automáticas para garantir correção justa e consistente.",
    items: ["Rubricas automáticas", "Questões variadas", "Gabarito incluso"],
    color: "amber",
  },
  {
    icon: BookOpen,
    title: "Recursos Multimodais",
    description: "Sugestões de vídeos, jogos, experimentos e materiais complementares para enriquecer suas aulas e engajar os alunos.",
    items: ["Vídeos educativos", "Jogos interativos", "Links verificados"],
    color: "blue",
  },
];

const colorStyles = {
  purple: {
    icon: "bg-gradient-to-br from-examai-purple-500 to-violet-600",
    border: "border-examai-purple-500/30 hover:border-examai-purple-500/50",
    glow: "group-hover:shadow-examai-purple-500/20",
  },
  green: {
    icon: "bg-gradient-to-br from-green-500 to-emerald-600",
    border: "border-green-500/30 hover:border-green-500/50",
    glow: "group-hover:shadow-green-500/20",
  },
  amber: {
    icon: "bg-gradient-to-br from-amber-500 to-orange-600",
    border: "border-amber-500/30 hover:border-amber-500/50",
    glow: "group-hover:shadow-amber-500/20",
  },
  blue: {
    icon: "bg-gradient-to-br from-blue-500 to-cyan-600",
    border: "border-blue-500/30 hover:border-blue-500/50",
    glow: "group-hover:shadow-blue-500/20",
  },
};

const FeaturesSection = () => {
  return (
    <section className="py-24 lg:py-32 bg-[#0a0d14] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(rgba(168, 85, 247, 0.5) 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/3 -left-40 w-[600px] h-[600px] rounded-full blur-[120px] bg-examai-purple-500/20"
        />
        <motion.div 
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.08, 0.12, 0.08] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] rounded-full blur-[120px] bg-blue-500/15"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-examai-purple-500/10 border border-examai-purple-500/20 text-examai-purple-400">
            Funcionalidades
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white">
            Tudo que você precisa em{" "}
            <span className="bg-gradient-to-r from-examai-purple-400 via-violet-400 to-examai-purple-500 bg-clip-text text-transparent">
              um só lugar
            </span>
          </h2>
          <p className="text-lg sm:text-xl leading-relaxed text-gray-400">
            Da criação de conteúdo à análise de desempenho, Educa Sol automatiza 
            as tarefas que consomem seu tempo.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const style = colorStyles[feature.color as keyof typeof colorStyles];
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group"
              >
                <div className={`h-full p-8 rounded-2xl bg-[#0f1219]/80 backdrop-blur-sm border ${style.border} transition-all duration-300 hover:bg-[#12161f] group-hover:shadow-xl ${style.glow}`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${style.icon}`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 text-white">
                    {feature.title}
                  </h3>
                  
                  <p className="text-base leading-relaxed mb-6 text-gray-400">
                    {feature.description}
                  </p>

                  <div className="space-y-2">
                    {feature.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "Eu costumava passar o domingo inteiro planejando aulas. Agora faço em 30 minutos e ainda sobra tempo para a família.",
    author: "Profa. Maria Santos",
    role: "Matemática • 5º Ano",
    initials: "MS",
    rating: 5,
  },
  {
    quote: "A correção automática mudou minha vida. Feedback consistente para 120 alunos sem perder noites de sono.",
    author: "Prof. Carlos Oliveira",
    role: "História • Ensino Médio",
    initials: "CO",
    rating: 5,
  },
  {
    quote: "Finalmente uma ferramenta que entende a BNCC de verdade. As atividades geradas são criativas e engajam os alunos.",
    author: "Ana Paula Lima",
    role: "Coordenadora Pedagógica",
    initials: "AL",
    rating: 5,
  },
];

const stats = [
  { value: "5,000+", label: "Planos criados" },
  { value: "500+", label: "Professores ativos" },
  { value: "98%", label: "Satisfação" },
  { value: "15h", label: "Economizadas/semana" },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 lg:py-32 bg-[#0a0d14] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(rgba(34, 197, 94, 0.5) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/4 -right-40 w-[500px] h-[500px] rounded-full blur-[120px] bg-green-500/15"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-green-500/10 border border-green-500/20 text-green-400">
            Depoimentos
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white">
            Amado por{" "}
            <span className="bg-gradient-to-r from-examai-purple-400 via-violet-400 to-examai-purple-500 bg-clip-text text-transparent">
              educadores
            </span>
          </h2>
          <p className="text-lg sm:text-xl leading-relaxed text-gray-400">
            Veja como Educa Sol está transformando a rotina de professores em todo o Brasil.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className="h-full p-8 rounded-2xl bg-[#0f1219]/80 backdrop-blur-sm border border-gray-700/50 hover:border-examai-purple-500/30 transition-all duration-300 flex flex-col">
                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star 
                      key={i} 
                      className="h-5 w-5 fill-current text-amber-400" 
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-lg leading-relaxed flex-1 mb-8 text-gray-300">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="text-white font-semibold bg-gradient-to-br from-examai-purple-500 to-violet-600">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-white">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="p-8 md:p-12 max-w-4xl mx-auto rounded-2xl bg-[#0f1219]/80 backdrop-blur-sm border border-gray-700/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-examai-purple-400 to-violet-400 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-gray-400">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

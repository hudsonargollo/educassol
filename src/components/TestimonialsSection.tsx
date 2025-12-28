import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { STAGGER_PARENT, FADE_UP_ITEM } from "@/lib/motion";
import { EDUCASSOL_COLORS } from "@/lib/colors";

const testimonials = [
  {
    quote: "Eu costumava passar horas planejando aulas. Agora crio um plano completo em 5 minutos. Sobra tempo para o que realmente importa: meus alunos.",
    author: "Profa. Maria Santos",
    role: "Professora de Matemática",
    initials: "MS",
    rating: 5,
  },
  {
    quote: "As atividades geradas são criativas e engajantes. Meus alunos adoram! E o melhor: tudo já vem alinhado à BNCC.",
    author: "Prof. Carlos Oliveira",
    role: "Professor de Português",
    initials: "CO",
    rating: 5,
  },
  {
    quote: "Finalmente uma ferramenta que entende a realidade do professor brasileiro. Simples, rápida e eficiente.",
    author: "Ana Paula Lima",
    role: "Coordenadora Pedagógica",
    initials: "AL",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.02]">
          <div className="absolute top-20 left-20 text-[200px] font-serif" style={{ color: EDUCASSOL_COLORS.primary }}>
            "
          </div>
          <div className="absolute bottom-20 right-20 text-[200px] font-serif rotate-180" style={{ color: EDUCASSOL_COLORS.primary }}>
            "
          </div>
        </div>
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
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
            style={{ color: EDUCASSOL_COLORS.textMain }}
          >
            Amado por{" "}
            <span style={{ color: EDUCASSOL_COLORS.primary }}>educadores</span>
          </h2>
          <p 
            className="text-lg sm:text-xl leading-relaxed"
            style={{ color: EDUCASSOL_COLORS.textMuted }}
          >
            Veja o que professores estão dizendo sobre como o Educassol 
            transformou suas rotinas.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={STAGGER_PARENT}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={FADE_UP_ITEM}>
              <Card className="h-full bg-slate-50 border-slate-200/50 shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden group">
                <CardContent className="p-6 lg:p-8 h-full flex flex-col">
                  {/* Quote Icon */}
                  <div className="mb-4">
                    <Quote 
                      className="h-8 w-8 opacity-20" 
                      style={{ color: EDUCASSOL_COLORS.primary }}
                    />
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star 
                        key={i} 
                        className="h-4 w-4 fill-current" 
                        style={{ color: EDUCASSOL_COLORS.accent }}
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote 
                    className="text-base lg:text-lg leading-relaxed flex-1 mb-6"
                    style={{ color: EDUCASSOL_COLORS.textMain }}
                  >
                    "{testimonial.quote}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback 
                        className="text-white font-medium"
                        style={{ background: EDUCASSOL_COLORS.primary }}
                      >
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p 
                        className="font-semibold text-sm"
                        style={{ color: EDUCASSOL_COLORS.textMain }}
                      >
                        {testimonial.author}
                      </p>
                      <p 
                        className="text-xs"
                        style={{ color: EDUCASSOL_COLORS.textMuted }}
                      >
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          {[
            { value: "5,000+", label: "Planos Criados" },
            { value: "500+", label: "Professores Ativos" },
            { value: "98%", label: "Satisfação" },
            { value: "15h", label: "Economizadas/Semana" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <p 
                className="text-3xl lg:text-4xl font-bold mb-1"
                style={{ color: EDUCASSOL_COLORS.primary }}
              >
                {stat.value}
              </p>
              <p 
                className="text-sm"
                style={{ color: EDUCASSOL_COLORS.textMuted }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

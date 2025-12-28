import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { STAGGER_PARENT, FADE_UP_ITEM } from "@/lib/motion";

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
    <section className="py-24 lg:py-32 bg-muted/30 dark:bg-muted/10 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-green-500/10 text-green-600 dark:text-green-400">
            Depoimentos
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-foreground">
            Amado por{" "}
            <span className="bg-gradient-to-r from-examai-purple-500 to-examai-purple-400 bg-clip-text text-transparent">
              educadores
            </span>
          </h2>
          <p className="text-lg sm:text-xl leading-relaxed text-muted-foreground">
            Veja como ExamAI está transformando a rotina de professores em todo o Brasil.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={STAGGER_PARENT}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={FADE_UP_ITEM}>
              <Card className="h-full hover:border-primary/40 transition-all duration-300">
                <CardContent className="p-8 h-full flex flex-col">
                  {/* Rating */}
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star 
                        key={i} 
                        className="h-5 w-5 fill-current text-examai-amber-500" 
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-lg leading-relaxed flex-1 mb-8 text-foreground">
                    "{testimonial.quote}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-white font-semibold gradient-purple-solid">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">
                        {testimonial.author}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="p-8 md:p-12 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-examai-purple-500 to-examai-purple-400 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "Eu costumava passar o domingo inteiro planejando aulas. Agora faço em 30 minutos e ainda sobra tempo para a família. Mudou minha vida!",
    author: "Profa. Maria Santos",
    role: "Matemática • 5º Ano • São Paulo",
    initials: "MS",
    rating: 5,
  },
  {
    quote: "A qualidade dos planos de aula é impressionante. Alinhados à BNCC e com atividades criativas que engajam meus alunos de verdade.",
    author: "Prof. Carlos Oliveira",
    role: "História • Ensino Médio • Rio de Janeiro",
    initials: "CO",
    rating: 5,
  },
  {
    quote: "Como coordenadora, recomendo para toda a equipe. A padronização e qualidade do material pedagógico melhorou muito.",
    author: "Ana Paula Lima",
    role: "Coordenadora Pedagógica • Belo Horizonte",
    initials: "AL",
    rating: 5,
  },
  {
    quote: "Finalmente uma ferramenta que entende o contexto brasileiro. As atividades são culturalmente relevantes e os alunos adoram.",
    author: "Prof. Roberto Mendes",
    role: "Português • 8º Ano • Salvador",
    initials: "RM",
    rating: 5,
  },
  {
    quote: "Economizo pelo menos 10 horas por semana. O tempo que sobra uso para dar atenção individual aos alunos que mais precisam.",
    author: "Profa. Juliana Costa",
    role: "Ciências • 6º Ano • Curitiba",
    initials: "JC",
    rating: 5,
  },
  {
    quote: "A geração de avaliações é perfeita. Questões bem elaboradas, com diferentes níveis de dificuldade. Recomendo demais!",
    author: "Prof. Fernando Silva",
    role: "Geografia • Ensino Médio • Recife",
    initials: "FS",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 lg:py-32 bg-gradient-to-b from-background to-muted/30 dark:from-[#0a0d14] dark:to-[#0c1018] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(hsl(var(--secondary)) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-1/4 -right-40 w-[500px] h-[500px] rounded-full blur-[150px] bg-secondary/20"
        />
        <motion.div 
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.06, 0.12, 0.06] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-1/4 -left-40 w-[400px] h-[400px] rounded-full blur-[120px] bg-primary/15"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-6 bg-secondary/10 border border-secondary/20 text-secondary"
          >
            Depoimentos
          </motion.span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-foreground">
            Amado por{" "}
            <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
              educadores
            </span>{" "}
            de todo o Brasil
          </h2>
          <p className="text-lg sm:text-xl leading-relaxed text-muted-foreground">
            Veja como o Educa Sol está transformando a rotina de professores em todo o país.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
            >
              <div className="h-full p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 flex flex-col relative group">
                {/* Quote icon */}
                <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10 group-hover:text-primary/20 transition-colors" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 + i * 0.05 }}
                      viewport={{ once: true }}
                    >
                      <Star className="h-4 w-4 fill-current text-amber-400" />
                    </motion.div>
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-base leading-relaxed flex-1 mb-6 text-muted-foreground">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-white text-sm font-semibold bg-gradient-to-br from-primary to-amber-500">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {testimonial.author}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

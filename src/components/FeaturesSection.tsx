import { Card, CardContent } from "@/components/ui/card";
import { Brain, FileText, ClipboardCheck, Clock, Zap, BookOpen } from "lucide-react";
const FeaturesSection = () => {
  const features = [{
    icon: FileText,
    title: "Planos de Aula Inteligentes",
    description: "Crie planos de aula completos e detalhados em minutos, sempre alinhados aos objetivos da BNCC."
  }, {
    icon: ClipboardCheck,
    title: "Atividades Personalizadas",
    description: "Gere atividades envolventes e adequadas ao nível de desenvolvimento dos seus alunos."
  }, {
    icon: BookOpen,
    title: "Avaliações Eficazes",
    description: "Desenvolva instrumentos de avaliação diversificados e formativos para acompanhar o progresso."
  }, {
    icon: Zap,
    title: "Recursos Multimodais",
    description: "Conte com sugestões de vídeos, jogos, exercícios práticos e materiais didáticos variados."
  }];
  return <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-background via-background to-primary/5 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 right-1/4 w-64 h-64 bg-gradient-sun rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-accent rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 sm:mb-6">
            <div className="p-3 bg-gradient-sun rounded-xl shadow-warm animate-glow-pulse">
              <Brain className="h-7 w-7 sm:h-8 sm:w-8 text-primary-foreground" />
            </div>
            <h2 className="font-bold bg-gradient-sun bg-clip-text text-transparent" style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)'
          }}>
              O Poder da IA ao Seu Alcance
            </h2>
          </div>
          
          <p className="text-foreground/80 leading-relaxed px-4 font-medium" style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.125rem)'
        }}>
            IA especializada em educação primária que transforma suas ideias em conteúdo educacional de qualidade. <span className="text-primary font-semibold">Mais tempo para seus alunos.</span>
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
          {features.map((feature, index) => <Card key={index} className="group hover:shadow-glow transition-all duration-500 border-border/50 hover:border-primary/50 bg-card/50 backdrop-blur-sm hover:scale-105 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-4 sm:p-6 lg:p-8 relative overflow-hidden">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="flex items-start gap-3 sm:gap-4 relative z-10">
                  <div className="p-2 sm:p-3 bg-gradient-sun rounded-xl shrink-0 group-hover:shadow-warm group-hover:scale-110 transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center">
                    <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                  </div>
                  <div className="space-y-2 min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors" style={{
                  fontSize: 'clamp(1rem, 2.5vw, 1.25rem)'
                }}>
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed" style={{
                  fontSize: 'clamp(0.875rem, 2vw, 1rem)'
                }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>

        {/* Core Benefit Highlight */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/10 via-background to-accent/5 border-primary/30 shadow-glow hover:shadow-warm transition-all duration-500 hover:scale-105 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-sun opacity-5"></div>
            <CardContent className="p-6 sm:p-8 relative z-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-2 bg-gradient-sun rounded-full animate-pulse">
                  <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold bg-gradient-sun bg-clip-text text-transparent">
                  Mais Tempo Para o Que Importa
                </h3>
              </div>
              <p className="text-base sm:text-lg text-foreground/90 font-medium">
                Recupere até <span className="font-bold text-primary text-xl">15 horas semanais</span> de preparação. 
                Dedique-se aos seus alunos e à sua vida.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Product Visual Placeholder */}
        <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '600ms' }}>
          <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto border border-primary/20 shadow-warm hover:shadow-glow transition-all duration-500 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-sun rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent rounded-full blur-2xl"></div>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 sm:p-8 min-h-[300px] flex items-center justify-center relative z-10 border border-border/30">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-sun rounded-full flex items-center justify-center mx-auto animate-glow-pulse hover:scale-110 transition-transform duration-300">
                  <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground" />
                </div>
                <p className="text-foreground font-semibold text-lg sm:text-xl">
                  Geração Inteligente de Conteúdo
                </p>
                <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                  IA que transforma suas ideias em conteúdo pronto para usar em segundos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default FeaturesSection;
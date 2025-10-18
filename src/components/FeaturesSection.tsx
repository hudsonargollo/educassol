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
  return <section className="py-12 sm:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-4 sm:mb-6">
            <Brain className="h-8 w-8 text-primary" />
            <h2 className="font-bold text-foreground" style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)'
          }}>
              O Poder da IA ao Seu Alcance
            </h2>
          </div>
          
          <p className="text-muted-foreground leading-relaxed px-4" style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.125rem)'
        }}>EDUCA SOL é uma plataforma de inteligência artificial especializada em educação primária. Nossa IA trabalha incansavelmente para transformar suas ideias em conteúdo educacional de alta qualidade, liberando seu tempo e energia para que você possa se dedicar ao que verdadeiramente importa: seus alunos.</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
          {features.map((feature, index) => <Card key={index} className="group hover:shadow-warm transition-all duration-300 border-border/50 hover:border-primary/30">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-gradient-warm rounded-xl shrink-0 group-hover:shadow-glow transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center">
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
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-hero border-primary/20 shadow-warm">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Clock className="h-8 w-8 text-primary" />
                <h3 className="text-2xl font-bold bg-gradient-sun bg-clip-text text-transparent">
                  Economia de Tempo e Energia
                </h3>
              </div>
              <p className="text-lg text-foreground/80">
                Recupere até <span className="font-bold text-primary">15 horas semanais</span> que 
                você gastaria preparando materiais. Use esse tempo para estar presente com seus 
                alunos, família e para seu desenvolvimento pessoal.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Product Visual Placeholder */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-hero rounded-2xl p-8 max-w-4xl mx-auto border border-border/30 shadow-warm">
            <div className="bg-card/50 rounded-xl p-8 min-h-[300px] flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-sun rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-8 w-8 text-primary-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">
                  Demonstração da Geração de Conteúdo
                </p>
                <p className="text-sm text-muted-foreground/70 max-w-md mx-auto">
                  {/* Placeholder for product visual - GIF of content generation process */}
                  Aqui será exibido um GIF mostrando como a IA gera conteúdo educacional 
                  em tempo real, desde a inserção dos parâmetros até o resultado final.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default FeaturesSection;
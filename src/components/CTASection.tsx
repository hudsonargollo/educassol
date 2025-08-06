import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sun, Users, Heart, Sparkles, ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-hero">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Header */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <h2 className="font-bold text-foreground text-center" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                O Futuro da Educação{" "}
                <span className="bg-gradient-sun bg-clip-text text-transparent">
                  Começa Agora
                </span>
              </h2>
            </div>
            
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto text-center px-4" style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>
              Junte-se aos educadores de Jequié que já estão transformando suas práticas 
              pedagógicas com a inteligência artificial. Seja parte desta revolução.
            </p>
          </div>

          {/* Community Benefits */}
          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <Card className="border-primary/20 bg-card/70 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 bg-gradient-sun rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sun className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Inovação Local</h3>
                <p className="text-sm text-muted-foreground">
                  Desenvolvido especificamente para as necessidades dos professores de Jequié
                </p>
              </CardContent>
            </Card>

            <Card className="border-accent/20 bg-card/70 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 bg-gradient-warm rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Impacto Real</h3>
                <p className="text-sm text-muted-foreground">
                  Melhore a qualidade do ensino e o engajamento dos seus alunos
                </p>
              </CardContent>
            </Card>

            <Card className="border-secondary/30 bg-card/70 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Crescimento Contínuo</h3>
                <p className="text-sm text-muted-foreground">
                  Evolua constantemente com novas funcionalidades e melhorias
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Impact Statement */}
          <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-2xl p-8 shadow-warm">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-foreground">
                Transforme Sua Prática Educacional Hoje
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                Não espere mais para revolucionar sua forma de ensinar. Com EDUCA SOL, 
                você terá mais tempo para se dedicar ao que realmente importa: conectar-se 
                com seus alunos, inspirá-los e acompanhar seu desenvolvimento único.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Cadastro gratuito</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Sem compromisso inicial</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span>Suporte especializado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="space-y-4 sm:space-y-6">
            <Button 
              variant="hero" 
              size="xl" 
              className="group px-6 sm:px-8 lg:px-12 py-3 sm:py-4 w-full sm:w-auto min-h-[52px] text-sm sm:text-base lg:text-lg"
              onClick={() => window.open('https://educa-sol-dashboard.lovable.app', '_blank')}
            >
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 group-hover:animate-spin" />
              <span className="truncate">Comece agora!</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <p className="text-muted-foreground text-center px-4" style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
              Comece sua jornada rumo a uma educação mais eficiente e impactante.
              <br />
              <span className="text-primary font-medium">Jequié merece o melhor da educação. Você também.</span>
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="relative">
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
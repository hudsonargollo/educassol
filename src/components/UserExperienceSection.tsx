import { Card, CardContent } from "@/components/ui/card";
import { Zap, Palette, Globe, Smartphone } from "lucide-react";

const UserExperienceSection = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Visual Side */}
          <div className="relative order-2 lg:order-1">
            {/* Placeholder for UI screenshot */}
            <div className="bg-card rounded-2xl p-6 shadow-warm border border-border/30">
              <div className="bg-gradient-hero rounded-xl p-6 min-h-[400px] flex items-center justify-center">
                <div className="text-center space-y-6 max-w-sm">
                  <div className="w-20 h-20 bg-gradient-sun rounded-xl flex items-center justify-center mx-auto">
                    <Palette className="h-10 w-10 text-primary-foreground" />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-muted-foreground font-medium">
                      Interface Intuitiva
                    </p>
                    <p className="text-sm text-muted-foreground/70">
                      {/* Placeholder for UI screenshot or ease-of-use graphic */}
                      Screenshot da interface amigável da plataforma EDUCA SOL, 
                      demonstrando a simplicidade e organização visual.
                    </p>
                  </div>

                  {/* Mock interface elements */}
                  <div className="space-y-3">
                    <div className="bg-primary/10 rounded-lg p-3 text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span className="text-xs font-medium">Criar Plano de Aula</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Interface simples e intuitiva
                      </div>
                    </div>
                    
                    <div className="bg-accent/10 rounded-lg p-3 text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-accent rounded-full"></div>
                        <span className="text-xs font-medium">Gerar Atividades</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Poucos cliques, resultados incríveis
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-primary/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-accent/20 rounded-full blur-2xl"></div>
          </div>

          {/* Content Side */}
          <div className="space-y-8 order-1 lg:order-2">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
                <h2 className="font-bold text-foreground" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                  Uma Experiência de Uso que{" "}
                  <span className="bg-gradient-sun bg-clip-text text-transparent">
                    Ilumina
                  </span>
                </h2>
              </div>
              
              <p className="text-muted-foreground leading-relaxed" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.125rem)' }}>
                Desenvolvemos EDUCA SOL pensando em você, professor. Nossa interface 
                foi cuidadosamente projetada para ser intuitiva, rápida e acessível, 
                funcionando perfeitamente em qualquer dispositivo.
              </p>
            </div>

            <div className="space-y-6">
              <p className="text-foreground/80 leading-relaxed">
                Construído com tecnologias modernas, 
                nossa plataforma oferece uma experiência fluida e responsiva. 
                A infraestrutura garante velocidade e confiabilidade, 
                para que você tenha acesso instantâneo aos recursos quando precisar.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Card className="border-primary/20 bg-card/50">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      <span className="font-semibold text-foreground text-sm sm:text-base">Responsivo</span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Funciona perfeitamente em celular, tablet e computador
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-accent/20 bg-card/50">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground" />
                      <span className="font-semibold text-foreground text-sm sm:text-base">Sempre Online</span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Acesse de qualquer lugar, a qualquer hora do dia
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-gradient-hero border border-primary/20 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <Zap className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Tecnologia de Ponta a Seu Favor:
                    </h4>
                    <ul className="space-y-1 text-sm text-foreground/80">
                      <li>• Design moderno e intuitivo</li>
                      <li>• Velocidade e confiabilidade</li>
                      <li>• Experiência fluida e responsiva</li>
                      <li>• Sempre a versão mais recente</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground italic">
                  "Simplicidade é a sofisticação suprema" - Nossa filosofia de design 
                  garante que a tecnologia nunca seja um obstáculo entre você e seus objetivos educacionais.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserExperienceSection;
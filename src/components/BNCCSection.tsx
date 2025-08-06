import { Card, CardContent } from "@/components/ui/card";
import { Shield, CheckCircle, BookOpen, Target } from "lucide-react";

const BNCCSection = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Side */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  Conteúdo de Qualidade, Sempre em{" "}
                  <span className="bg-gradient-sun bg-clip-text text-transparent">
                    Conformidade
                  </span>
                </h2>
              </div>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Nossa integração profunda com a Base Nacional Comum Curricular (BNCC) 
                garante que todo conteúdo gerado esteja perfeitamente alinhado às competências 
                e habilidades exigidas para cada ano do ensino fundamental.
              </p>
            </div>

            <div className="space-y-6">
              <p className="text-foreground/80 leading-relaxed">
                Você não precisa mais se preocupar em verificar se suas atividades atendem 
                aos requisitos curriculares. A Manus AI conhece cada código, cada objetivo 
                de aprendizagem e cada competência específica, construindo automaticamente 
                conexões pedagógicas sólidas e fundamentadas.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="border-primary/20 bg-card/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-foreground">100% Alinhado</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Todo conteúdo segue rigorosamente as diretrizes da BNCC
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-accent/20 bg-card/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="h-5 w-5 text-accent-foreground" />
                      <span className="font-semibold text-foreground">Objetivos Claros</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Competências e habilidades específicas são sempre identificadas
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-gradient-warm/20 border border-primary/20 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <BookOpen className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Benefícios para o Professor:
                    </h4>
                    <ul className="space-y-1 text-sm text-foreground/80">
                      <li>• Conformidade automática com documentos oficiais</li>
                      <li>• Segurança pedagógica em todas as atividades</li>
                      <li>• Facilita relatórios e documentação escolar</li>
                      <li>• Suporte na progressão curricular dos alunos</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Side */}
          <div className="relative">
            {/* Placeholder for BNCC alignment illustration */}
            <div className="bg-card rounded-2xl p-8 shadow-warm border border-border/30">
              <div className="bg-gradient-hero rounded-xl p-8 min-h-[400px] flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-sun rounded-full flex items-center justify-center mx-auto">
                      <Shield className="h-12 w-12 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-accent-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-muted-foreground font-medium">
                      Visualização da Integração BNCC
                    </p>
                    <p className="text-sm text-muted-foreground/70 max-w-sm mx-auto">
                      {/* Placeholder for illustrative graphic related to curriculum alignment */}
                      Gráfico ilustrativo mostrando como cada atividade gerada 
                      conecta-se automaticamente aos códigos e competências da BNCC.
                    </p>
                  </div>

                  {/* Sample BNCC codes visualization */}
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="bg-primary/10 rounded-lg p-3 text-xs">
                      <div className="font-mono text-primary">EF02LP01</div>
                      <div className="text-muted-foreground mt-1">Leitura/Escuta</div>
                    </div>
                    <div className="bg-accent/10 rounded-lg p-3 text-xs">
                      <div className="font-mono text-accent-foreground">EF02MA15</div>
                      <div className="text-muted-foreground mt-1">Geometria</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-accent/10 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BNCCSection;
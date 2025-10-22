import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { WizardData } from "../ContentWizard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface StepFourProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
  contentType: string;
}

export const StepFour = ({ data, onUpdate, onNext, onBack, contentType }: StepFourProps) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const { toast } = useToast();

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("Sessão inválida. Por favor, faça login novamente.");
      }

      // For now, generate mock suggestions since we'd need an AI endpoint
      // In production, this would call an edge function to get AI suggestions
      const mockSuggestions = [
        {
          id: 1,
          title: `${data.topics[0]} - Abordagem Prática`,
          description: `Uma atividade interativa focada em ${data.topics[0]} para ${data.grade}`,
          methodology: data.methodologies[0] || "Metodologia Ativa",
        },
        {
          id: 2,
          title: `Explorando ${data.topics[0]}`,
          description: `Atividade exploratória usando ${data.subject} como base`,
          methodology: "Aprendizagem por Descoberta",
        },
        {
          id: 3,
          title: `${data.topics[0]} na Prática`,
          description: `Aplicação prática dos conceitos de ${data.topics[0]}`,
          methodology: "Projeto Prático",
        },
      ];

      setSuggestions(mockSuggestions);
      
    } catch (error: any) {
      console.error("Error generating suggestions:", error);
      toast({
        title: "Erro ao gerar sugestões",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (suggestions.length === 0) {
      generateSuggestions();
    }
  }, []);

  const handleSelectActivity = (suggestion: any) => {
    onUpdate({ selectedActivity: suggestion });
    onNext();
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Criando seu plano de aula: Etapa 4 de 5</p>
        <h2 className="text-3xl font-bold">Selecione a atividade que mais combina com sua turma</h2>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-muted rounded-lg animate-pulse" />
            <Loader2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground text-center">
            Aguarde enquanto suas sugestões de aulas são<br />
            geradas pela Inteligência Artificial
          </p>
        </div>
      ) : suggestions.length > 0 ? (
        <div className="space-y-6">
          <div className="grid gap-4">
            {suggestions.map((suggestion) => (
              <Card
                key={suggestion.id}
                className="cursor-pointer hover:border-primary transition-all hover:shadow-md"
                onClick={() => handleSelectActivity(suggestion)}
              >
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{suggestion.title}</h3>
                  <p className="text-muted-foreground mb-3">{suggestion.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {suggestion.methodology}
                    </span>
                    <span className="text-xs bg-muted px-3 py-1 rounded-full">
                      {data.durationPerLesson} minutos
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">Não gostou das sugestões geradas?</p>
            <Button variant="outline" onClick={generateSuggestions} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Gerar novas sugestões
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    </div>
  );
};

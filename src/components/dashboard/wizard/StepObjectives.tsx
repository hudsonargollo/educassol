import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Sparkles, Loader2, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useWizard, BnccSkill } from "./WizardContext";
import { useWizardNavigation } from "./hooks/useWizardNavigation";
import { BnccChips } from "./components/BnccChips";

export const StepObjectives = () => {
  const { toast } = useToast();
  const { state, updateState } = useWizard();
  const { handleNext, handleBack, canProceed } = useWizardNavigation();
  
  const [bnccSuggestions, setBnccSuggestions] = useState<BnccSkill[]>([]);
  const [loadingBncc, setLoadingBncc] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Debounced BNCC suggestion trigger
  const triggerBnccSuggestion = useCallback(async () => {
    if (!state.grade || !state.subject || !state.topic.trim()) {
      return;
    }

    setLoadingBncc(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Sessão expirada",
          description: "Por favor, faça login novamente.",
          variant: "destructive",
        });
        return;
      }

      const { data: result, error } = await supabase.functions.invoke("suggest-bncc-skills", {
        body: {
          grade: state.grade,
          subject: state.subject,
          topic: state.topic,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      // Handle edge function errors
      if (error) {
        console.error("Edge function error:", error);
        toast({
          title: "Erro ao buscar sugestões BNCC",
          description: error.message || "Tente novamente mais tarde",
          variant: "destructive",
        });
        return;
      }

      // Handle response with error field (non-2xx responses)
      if (result?.error) {
        console.error("BNCC suggestion error:", result.error);
        toast({
          title: "Erro ao buscar sugestões BNCC",
          description: result.error,
          variant: "destructive",
        });
        // Still set empty skills array if provided
        setBnccSuggestions(result.skills || []);
        return;
      }

      // Success - set suggestions
      setBnccSuggestions(result?.skills || []);
      
      if (result?.skills?.length === 0) {
        toast({
          title: "Nenhuma sugestão encontrada",
          description: "Tente ajustar o tema ou disciplina",
        });
      }
    } catch (error: any) {
      console.error("Error suggesting BNCC:", error);
      toast({
        title: "Erro ao buscar sugestões BNCC",
        description: error.message || "Erro de conexão. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingBncc(false);
    }
  }, [state.grade, state.subject, state.topic, toast]);

  // Handle topic change with debounce
  const handleTopicChange = (value: string) => {
    updateState({ topic: value });

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new debounce timer (500ms)
    if (value.trim().length > 3) {
      const timer = setTimeout(() => {
        triggerBnccSuggestion();
      }, 500);
      setDebounceTimer(timer);
    }
  };

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // Select a BNCC skill
  const handleSelectBncc = (skill: BnccSkill) => {
    const isAlreadySelected = state.selectedBnccCodes.some(
      (s) => s.code === skill.code
    );

    if (!isAlreadySelected) {
      updateState({
        selectedBnccCodes: [...state.selectedBnccCodes, skill],
      });
    }
  };

  // Remove a BNCC skill
  const handleRemoveBncc = (code: string) => {
    updateState({
      selectedBnccCodes: state.selectedBnccCodes.filter((s) => s.code !== code),
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          Etapa 2 de 5 • Objetivos
        </p>
        <h2 className="text-3xl font-bold">Defina o Tema e Objetivos</h2>
        <p className="text-muted-foreground mt-2">
          Digite o tema da aula e selecione as habilidades BNCC relacionadas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Input */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="topic" className="text-base font-semibold">
              Tema da Aula *
            </Label>
            <p className="text-xs text-muted-foreground mb-3">
              Descreva o tema ou conteúdo que será abordado na aula
            </p>
            <Textarea
              id="topic"
              placeholder="Ex: Frações e números decimais, Revolução Industrial, Ecossistemas brasileiros..."
              value={state.topic}
              onChange={(e) => handleTopicChange(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {state.topic.length}/500 caracteres
            </p>
          </div>

          {/* Selected BNCC Skills */}
          {state.selectedBnccCodes.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Habilidades BNCC Selecionadas
              </Label>
              <BnccChips
                skills={state.selectedBnccCodes}
                onRemove={handleRemoveBncc}
              />
            </div>
          )}
        </div>

        {/* BNCC Suggestions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">
                Sugestões de Habilidades BNCC
              </Label>
              <p className="text-xs text-muted-foreground">
                Baseadas no tema, ano e disciplina selecionados
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={triggerBnccSuggestion}
              disabled={loadingBncc || !state.topic.trim()}
            >
              {loadingBncc ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {loadingBncc ? (
              // Skeleton loaders
              <>
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-3">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-3/4" />
                  </Card>
                ))}
              </>
            ) : bnccSuggestions.length > 0 ? (
              bnccSuggestions.map((skill) => {
                const isSelected = state.selectedBnccCodes.some(
                  (s) => s.code === skill.code
                );
                return (
                  <Card
                    key={skill.code}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => handleSelectBncc(skill)}
                  >
                    <CardHeader className="p-3 pb-1">
                      <div className="flex items-start justify-between">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {skill.code}
                        </Badge>
                        {isSelected && (
                          <Badge className="bg-primary text-xs">
                            Selecionada
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-1">
                      <CardDescription className="text-xs">
                        {skill.description}
                      </CardDescription>
                      {skill.relevance && (
                        <p className="text-xs text-muted-foreground italic mt-2">
                          💡 {skill.relevance}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  {state.topic.trim()
                    ? 'Clique em "Buscar" para receber sugestões de habilidades BNCC'
                    : "Digite um tema para receber sugestões de habilidades BNCC"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button onClick={handleNext} disabled={!canProceed}>
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default StepObjectives;

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWizard, METHODOLOGY_OPTIONS } from "./WizardContext";
import { useWizardNavigation } from "./hooks/useWizardNavigation";
import { MethodologyCard } from "./components/MethodologyCard";
import TemplateSelector from "./TemplateSelector";

export const StepStrategy = () => {
  const { state, updateState } = useWizard();
  const { handleNext, handleBack } = useWizardNavigation();

  const toggleMethodology = (methodId: string) => {
    const current = state.methodologies;
    if (current.includes(methodId)) {
      updateState({
        methodologies: current.filter((m) => m !== methodId),
      });
    } else {
      updateState({
        methodologies: [...current, methodId],
      });
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    updateState({ templateId: templateId || undefined });
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          Etapa 3 de 5 • Estratégia
        </p>
        <h2 className="text-3xl font-bold">Escolha a Estratégia Pedagógica</h2>
        <p className="text-muted-foreground mt-2">
          Selecione metodologias ativas e templates para estruturar sua aula.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Methodologies */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Metodologias Ativas</CardTitle>
              <Badge variant="secondary" className="text-xs">
                opcional
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Selecione uma ou mais metodologias para aplicar na aula
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {METHODOLOGY_OPTIONS.map((method) => (
                <MethodologyCard
                  key={method.id}
                  id={method.id}
                  name={method.name}
                  icon={method.icon}
                  description={method.description}
                  isSelected={state.methodologies.includes(method.id)}
                  onToggle={toggleMethodology}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Templates and Teacher Notes */}
        <div className="space-y-6">
          {/* Template Selector */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Templates de Aula</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  opcional
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Escolha um template otimizado para {state.grade || "seu ano"} -{" "}
                {state.subject || "sua disciplina"}
              </p>
            </CardHeader>
            <CardContent>
              <TemplateSelector
                contentType={state.contentType}
                currentGrade={state.grade}
                currentSubject={state.subject}
                onSelectTemplate={handleTemplateSelect}
                selectedTemplateId={state.templateId}
              />
            </CardContent>
          </Card>

          {/* Teacher Notes / Specific Ideas */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Instruções para a IA
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  opcional
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Adicione instruções específicas ou ideias que você gostaria de
                incluir na aula
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Textarea
                  placeholder="Ex: Gostaria que os alunos construíssem uma horta durante a atividade, ou que a aula incluísse uma dinâmica de grupo..."
                  value={state.specificIdea}
                  onChange={(e) => updateState({ specificIdea: e.target.value })}
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {200 - state.specificIdea.length} caracteres restantes
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Selection Summary */}
      {(state.methodologies.length > 0 || state.templateId) && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium mb-2">Seleção atual:</p>
          <div className="flex flex-wrap gap-2">
            {state.methodologies.map((methodId) => {
              const method = METHODOLOGY_OPTIONS.find((m) => m.id === methodId);
              return method ? (
                <Badge key={methodId} variant="secondary">
                  {method.name}
                </Badge>
              ) : null;
            })}
            {state.templateId && (
              <Badge variant="outline">Template selecionado</Badge>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button onClick={handleNext}>
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default StepStrategy;

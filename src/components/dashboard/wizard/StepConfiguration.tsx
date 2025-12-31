import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  Users,
  BookOpen,
  Accessibility,
  Laptop,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useWizard, ACCESSIBILITY_OPTIONS } from "./WizardContext";
import { useWizardNavigation } from "./hooks/useWizardNavigation";

export const StepConfiguration = () => {
  const { state, updateState } = useWizard();
  const { handleNext, handleBack } = useWizardNavigation();
  
  // Auto-expand accessibility if class has ANE students
  const [accessibilityOpen, setAccessibilityOpen] = useState(
    state.classContext?.possui_ane || false
  );

  // Auto-expand on mount if class has ANE
  useEffect(() => {
    if (state.classContext?.possui_ane) {
      setAccessibilityOpen(true);
    }
  }, [state.classContext?.possui_ane]);

  const toggleAccessibility = (optionId: string) => {
    const current = state.accessibilityOptions;
    if (current.includes(optionId)) {
      updateState({
        accessibilityOptions: current.filter((id) => id !== optionId),
      });
    } else {
      updateState({
        accessibilityOptions: [...current, optionId],
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          Etapa 4 de 5 • Configuração
        </p>
        <h2 className="text-3xl font-bold">Configure os Detalhes</h2>
        <p className="text-muted-foreground mt-2">
          Ajuste a duração, número de alunos e opções de acessibilidade.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logistics Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Logística
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure tempo e tamanho da turma
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Students per class */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Alunos por turma
                </Label>
                <span className="text-2xl font-bold text-primary">
                  {state.studentsPerClass}
                </span>
              </div>
              <Slider
                value={[state.studentsPerClass]}
                onValueChange={([value]) =>
                  updateState({ studentsPerClass: value })
                }
                min={10}
                max={50}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                {state.classContext?.total_alunos
                  ? `Baseado na turma selecionada (${state.classContext.total_alunos} alunos)`
                  : "Ajuste conforme o tamanho da sua turma"}
              </p>
            </div>

            {/* Number of lessons */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Número de aulas
                </Label>
                <span className="text-2xl font-bold text-primary">
                  {state.numberOfLessons}
                </span>
              </div>
              <Slider
                value={[state.numberOfLessons]}
                onValueChange={([value]) =>
                  updateState({ numberOfLessons: value })
                }
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Selecione o número total de aulas para este conteúdo
              </p>
            </div>

            {/* Duration per lesson */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Duração de cada aula
                </Label>
                <span className="text-2xl font-bold text-primary">
                  {state.durationPerLesson}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    min
                  </span>
                </span>
              </div>
              <Slider
                value={[state.durationPerLesson]}
                onValueChange={([value]) =>
                  updateState({ durationPerLesson: value })
                }
                min={30}
                max={120}
                step={15}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Tempo de duração de cada aula, em minutos
              </p>
            </div>

            {/* Low Tech Mode */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Laptop className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Modo Baixa Tecnologia
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Não utilizar recursos digitais (tablets, computadores)
                    </p>
                  </div>
                </div>
                <Switch
                  checked={state.noDigitalResources}
                  onCheckedChange={(checked) =>
                    updateState({ noDigitalResources: checked })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Accessibility className="h-5 w-5 text-primary" />
                Inclusão e Acessibilidade
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                opcional
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Selecione características específicas da sua turma para
              personalizar o conteúdo
            </p>
            {state.classContext?.possui_ane && (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 mt-2">
                Turma com alunos com necessidades especiais
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <Collapsible open={accessibilityOpen} onOpenChange={setAccessibilityOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between mb-4"
                >
                  <span className="flex items-center gap-2">
                    {state.accessibilityOptions.length > 0 ? (
                      <>
                        <Badge variant="secondary">
                          {state.accessibilityOptions.length} selecionadas
                        </Badge>
                      </>
                    ) : (
                      "Expandir opções de acessibilidade"
                    )}
                  </span>
                  {accessibilityOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {ACCESSIBILITY_OPTIONS.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={option.id}
                        checked={state.accessibilityOptions.includes(option.id)}
                        onCheckedChange={() => toggleAccessibility(option.id)}
                      />
                      <Label
                        htmlFor={option.id}
                        className="text-sm cursor-pointer font-normal leading-tight"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-sm font-medium mb-2">Resumo da configuração:</p>
        <p className="text-muted-foreground text-sm">
          {state.numberOfLessons} aula{state.numberOfLessons > 1 ? "s" : ""} de{" "}
          {state.durationPerLesson} minutos • {state.studentsPerClass} alunos
          {state.noDigitalResources && " • Sem recursos digitais"}
          {state.accessibilityOptions.length > 0 &&
            ` • ${state.accessibilityOptions.length} opções de acessibilidade`}
        </p>
      </div>

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

export default StepConfiguration;

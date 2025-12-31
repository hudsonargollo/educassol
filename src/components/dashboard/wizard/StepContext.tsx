import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, AlertCircle, GraduationCap, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWizard, GRADE_OPTIONS, SUBJECT_OPTIONS } from "./WizardContext";
import { useWizardNavigation } from "./hooks/useWizardNavigation";

interface ClassOption {
  id: string;
  subject: string;
  grade: string;
  total_alunos: number | null;
  possui_ane: boolean;
  detalhes_ane: string | null;
}

const fundamentalYears = GRADE_OPTIONS.slice(0, 9);
const medioYears = GRADE_OPTIONS.slice(9);

export const StepContext = () => {
  const { toast } = useToast();
  const { state, updateState } = useWizard();
  const { handleNext, canProceed } = useWizardNavigation();
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoadingClasses(true);
      const { data: classesData, error } = await supabase
        .from("classes")
        .select("*")
        .order("grade", { ascending: true });

      if (error) throw error;
      setClasses(classesData || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar turmas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleClassSelect = (classId: string) => {
    const classData = classes.find((c) => c.id === classId);
    if (classData) {
      updateState({
        classId: classData.id,
        grade: classData.grade,
        subject: classData.subject,
        classContext: {
          total_alunos: classData.total_alunos,
          possui_ane: classData.possui_ane,
          detalhes_ane: classData.detalhes_ane,
        },
        // Auto-populate students if available
        studentsPerClass: classData.total_alunos || state.studentsPerClass,
      });
    }
  };

  const handleGradeSelect = (grade: string) => {
    updateState({
      grade,
      classId: undefined,
      classContext: undefined,
    });
  };

  const handleSubjectSelect = (subject: string) => {
    updateState({ subject });
  };

  const clearClassSelection = () => {
    updateState({
      classId: undefined,
      classContext: undefined,
      grade: "",
      subject: "",
    });
  };

  const selectedClass = classes.find((c) => c.id === state.classId);
  const isManualMode = !state.classId;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          Etapa 1 de 5 • Contexto
        </p>
        <h2 className="text-3xl font-bold">Defina o Contexto da Aula</h2>
        <p className="text-muted-foreground mt-2">
          Selecione uma turma existente ou configure manualmente o ano e disciplina.
        </p>
      </div>

      {classes.length === 0 && !loadingClasses && (
        <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            Você ainda não tem turmas cadastradas. Crie uma turma na página
            "Turmas" para personalização automática, ou continue com seleção
            manual abaixo.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Selection Card */}
        {classes.length > 0 && (
          <Card className={`${!isManualMode ? "border-primary bg-primary/5" : ""}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                Selecionar Turma
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Escolha uma turma para preencher automaticamente ano, disciplina
                e informações de acessibilidade.
              </p>
              <Select
                value={state.classId || ""}
                onValueChange={handleClassSelect}
                disabled={loadingClasses}
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Selecione uma turma..." />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{classItem.subject}</span>
                        <span className="text-muted-foreground">
                          - {classItem.grade}
                        </span>
                        {classItem.possui_ane && (
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedClass && (
                <div className="p-3 bg-background rounded-lg border space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {selectedClass.total_alunos || "Não especificado"} alunos
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearClassSelection}
                    >
                      Limpar
                    </Button>
                  </div>
                  {selectedClass.possui_ane && (
                    <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">
                        Turma com alunos com necessidades especiais - opções de
                        acessibilidade serão pré-selecionadas
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Manual Selection Card */}
        <Card className={`${isManualMode && (state.grade || state.subject) ? "border-primary bg-primary/5" : ""}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5 text-primary" />
              Seleção Manual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              {classes.length > 0
                ? "Ou configure manualmente o ano e disciplina."
                : "Configure o ano e disciplina para sua aula."}
            </p>

            {/* Grade Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Ano Escolar
              </label>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Ensino Fundamental
                  </p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {fundamentalYears.map((year) => (
                      <Button
                        key={year}
                        variant={state.grade === year ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleGradeSelect(year)}
                        className="h-9 text-xs"
                        disabled={!isManualMode}
                      >
                        {year.split(" ")[0]}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Ensino Médio
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {medioYears.map((year) => (
                      <Button
                        key={year}
                        variant={state.grade === year ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleGradeSelect(year)}
                        className="h-9 text-xs"
                        disabled={!isManualMode}
                      >
                        {year.split(" ")[0]}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Subject Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Disciplina
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SUBJECT_OPTIONS.map((subject) => (
                  <Button
                    key={subject}
                    variant={state.subject === subject ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSubjectSelect(subject)}
                    className="h-auto py-2 px-3 text-xs whitespace-normal text-center"
                    disabled={!isManualMode}
                  >
                    {subject}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Selection Summary */}
      {(state.grade || state.subject) && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium mb-1">Seleção atual:</p>
          <p className="text-muted-foreground">
            {state.grade || "Ano não selecionado"} •{" "}
            {state.subject || "Disciplina não selecionada"}
            {state.classId && " (via turma)"}
          </p>
        </div>
      )}

      <div className="flex justify-end pt-6">
        <Button onClick={handleNext} disabled={!canProceed}>
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default StepContext;

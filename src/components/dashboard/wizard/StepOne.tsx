import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, AlertCircle } from "lucide-react";
import { WizardData } from "../ContentWizard";
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

interface StepOneProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface ClassOption {
  id: string;
  subject: string;
  grade: string;
  total_alunos: number | null;
  possui_ane: boolean;
  detalhes_ane: string | null;
}

export const StepOne = ({ data, onUpdate, onNext, onBack }: StepOneProps) => {
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassOption | null>(null);
  
  const fundamentalYears = ["1º ano", "2º ano", "3º ano", "4º ano", "5º ano", "6º ano", "7º ano", "8º ano", "9º ano"];
  const medioYears = ["1º ano EM", "2º ano EM", "3º ano EM"];

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (data.classId && classes.length > 0) {
      const classData = classes.find(c => c.id === data.classId);
      setSelectedClass(classData || null);
    }
  }, [data.classId, classes]);

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
    const classData = classes.find(c => c.id === classId);
    if (classData) {
      setSelectedClass(classData);
      onUpdate({
        classId: classData.id,
        grade: classData.grade,
        classContext: {
          total_alunos: classData.total_alunos,
          possui_ane: classData.possui_ane,
          detalhes_ane: classData.detalhes_ane,
        },
      });
    }
  };

  const canProceed = data.classId !== undefined || data.grade !== "";

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Criando seu plano de aula: Etapa 1 de 5</p>
        <h2 className="text-3xl font-bold">Selecione uma Turma</h2>
      </div>

      {classes.length === 0 && !loadingClasses && (
        <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            Você ainda não tem turmas cadastradas. Crie uma turma primeiro na página "Turmas" para poder gerar conteúdo personalizado.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Seleção de Turma Existente */}
        {classes.length > 0 && (
          <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
            <div className="flex items-start gap-3 mb-4">
              <Users className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Selecione uma turma existente</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Escolha uma turma para que a IA personalize o conteúdo com base nas informações da turma
                </p>
                <Select
                  value={data.classId || ""}
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
                          <span className="text-muted-foreground">- {classItem.grade}</span>
                          {classItem.possui_ane && (
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedClass && (
                  <div className="mt-3 p-3 bg-background rounded border">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {selectedClass.total_alunos || "Não especificado"} alunos
                      </span>
                    </div>
                    {selectedClass.possui_ane && (
                      <Alert className="mt-2 bg-amber-50 dark:bg-amber-950 border-amber-200">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">
                          Turma com alunos com necessidades especiais - conteúdo será adaptado
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {classes.length > 0 ? "Ou selecione manualmente" : "Selecione o ano"}
            </span>
          </div>
        </div>

        {/* Seleção Manual de Ano */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Selecione o ano:</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-3">Ensino Fundamental</p>
              <div className="grid grid-cols-9 gap-2">
                {fundamentalYears.map((year) => (
                  <Button
                    key={year}
                    variant={data.grade === year ? "default" : "outline"}
                    onClick={() => onUpdate({ grade: year, classId: undefined, classContext: undefined })}
                    className="h-12"
                  >
                    {year.split(" ")[0]}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-3">Ensino Médio</p>
              <div className="grid grid-cols-3 gap-2 max-w-xs">
                {medioYears.map((year) => (
                  <Button
                    key={year}
                    variant={data.grade === year ? "default" : "outline"}
                    onClick={() => onUpdate({ grade: year, classId: undefined, classContext: undefined })}
                    className="h-12"
                  >
                    {year.split(" ")[0]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Cancelar
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { WizardData } from "../ContentWizard";

interface StepOneProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepOne = ({ data, onUpdate, onNext, onBack }: StepOneProps) => {
  const fundamentalYears = ["1º ano", "2º ano", "3º ano", "4º ano", "5º ano", "6º ano", "7º ano", "8º ano", "9º ano"];
  const medioYears = ["1º ano EM", "2º ano EM", "3º ano EM"];

  const canProceed = data.grade !== "";

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Criando seu plano de aula: Etapa 1 de 5</p>
        <h2 className="text-3xl font-bold">Ano, Disciplina e Temática</h2>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Selecione o ano da sua turma:</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-3">Ensino Fundamental</p>
              <div className="grid grid-cols-9 gap-2">
                {fundamentalYears.map((year) => (
                  <Button
                    key={year}
                    variant={data.grade === year ? "default" : "outline"}
                    onClick={() => onUpdate({ grade: year })}
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
                    onClick={() => onUpdate({ grade: year })}
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

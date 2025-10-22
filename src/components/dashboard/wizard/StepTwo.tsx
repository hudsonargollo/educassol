import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { WizardData } from "../ContentWizard";

interface StepTwoProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepTwo = ({ data, onUpdate, onNext, onBack }: StepTwoProps) => {
  const subjects = [
    { name: "Língua Portuguesa", color: "bg-yellow-100 hover:bg-yellow-200 border-yellow-300" },
    { name: "Matemática", color: "bg-yellow-100 hover:bg-yellow-200 border-yellow-300" },
    { name: "Ciências", color: "bg-yellow-100 hover:bg-yellow-200 border-yellow-300" },
    { name: "História", color: "bg-yellow-100 hover:bg-yellow-200 border-yellow-300" },
    { name: "Geografia", color: "bg-yellow-100 hover:bg-yellow-200 border-yellow-300" },
    { name: "Língua Inglesa", color: "bg-yellow-100 hover:bg-yellow-200 border-yellow-300" },
    { name: "Artes", color: "bg-yellow-100 hover:bg-yellow-200 border-yellow-300" },
    { name: "Educação Física", color: "bg-yellow-100 hover:bg-yellow-200 border-yellow-300" },
    { name: "Ensino Religioso", color: "bg-yellow-100 hover:bg-yellow-200 border-yellow-300" },
  ];

  const canProceed = data.subject !== "";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Selecione uma disciplina:</h2>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <button
            key={subject.name}
            onClick={() => onUpdate({ subject: subject.name })}
            className={`p-6 rounded-lg border-2 transition-all text-center font-medium ${
              data.subject === subject.name
                ? "border-primary bg-primary/10 scale-105"
                : subject.color
            }`}
          >
            {subject.name}
          </button>
        ))}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

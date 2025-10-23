import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { StepOne } from "./wizard/StepOne";
import { StepTwo } from "./wizard/StepTwo";
import { StepThree } from "./wizard/StepThree";
import { StepFour } from "./wizard/StepFour";
import { StepFive } from "./wizard/StepFive";

interface ContentWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: string;
  prefilledTopic?: string;
}

export interface WizardData {
  grade: string;
  subject: string;
  topics: string[];
  specificIdea: string;
  noDigitalResources: boolean;
  studentsPerClass: number;
  numberOfLessons: number;
  durationPerLesson: number;
  methodologies: string[];
  accessibilityOptions: string[];
  selectedActivity?: any;
  classId?: string;
  classContext?: {
    total_alunos: number | null;
    possui_ane: boolean;
    detalhes_ane: string | null;
  };
}

const ContentWizard = ({ open, onOpenChange, contentType, prefilledTopic = "" }: ContentWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    grade: "",
    subject: "",
    topics: prefilledTopic ? [prefilledTopic] : [],
    specificIdea: "",
    noDigitalResources: false,
    studentsPerClass: 40,
    numberOfLessons: 1,
    durationPerLesson: 60,
    methodologies: [],
    accessibilityOptions: [],
    classId: undefined,
    classContext: undefined,
  });

  // Update topics when prefilledTopic changes
  useEffect(() => {
    if (prefilledTopic) {
      setWizardData(prev => ({ ...prev, topics: [prefilledTopic] }));
    }
  }, [prefilledTopic]);

  const steps = [
    { number: 1, label: "Temática" },
    { number: 2, label: "BNCC" },
    { number: 3, label: "Ideias" },
    { number: 4, label: "Sugestões" },
    { number: 5, label: "Plano de Aula" },
  ];

  const updateWizardData = (data: Partial<WizardData>) => {
    setWizardData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setWizardData({
      grade: "",
      subject: "",
      topics: [],
      specificIdea: "",
      noDigitalResources: false,
      studentsPerClass: 40,
      numberOfLessons: 1,
      durationPerLesson: 60,
      methodologies: [],
      accessibilityOptions: [],
      classId: undefined,
      classContext: undefined,
    });
    onOpenChange(false);
  };

  const progress = (currentStep / 5) * 100;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="px-8 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, idx) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        currentStep >= step.number
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.number}
                    </div>
                    <span className="text-xs mt-2 font-medium">{step.label}</span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`w-20 h-1 mx-2 ${currentStep > step.number ? "bg-primary" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="px-8 py-6">
          {currentStep === 1 && (
            <StepOne
              data={wizardData}
              onUpdate={updateWizardData}
              onNext={handleNext}
              onBack={handleClose}
            />
          )}
          {currentStep === 2 && (
            <StepTwo
              data={wizardData}
              onUpdate={updateWizardData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <StepThree
              data={wizardData}
              onUpdate={updateWizardData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 4 && (
            <StepFour
              data={wizardData}
              onUpdate={updateWizardData}
              onNext={handleNext}
              onBack={handleBack}
              contentType={contentType}
            />
          )}
          {currentStep === 5 && (
            <StepFive
              data={wizardData}
              onClose={handleClose}
              contentType={contentType}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentWizard;

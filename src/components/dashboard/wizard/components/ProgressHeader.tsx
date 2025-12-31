import { Progress } from "@/components/ui/progress";
import { useWizard, WIZARD_STEPS } from "../WizardContext";
import { Check } from "lucide-react";

interface ProgressHeaderProps {
  className?: string;
}

export const ProgressHeader = ({ className = "" }: ProgressHeaderProps) => {
  const { state } = useWizard();
  const currentStep = state.currentStep;
  const currentStepInfo = WIZARD_STEPS.find((s) => s.number === currentStep);
  const progress = (currentStep / WIZARD_STEPS.length) * 100;

  return (
    <div className={`sticky top-0 z-10 bg-background border-b ${className}`}>
      <div className="px-8 pt-6 pb-4">
        {/* Phase label */}
        <p className="text-sm text-muted-foreground mb-4 text-center">
          {currentStepInfo?.phase}
        </p>

        {/* Step indicators */}
        <div className="flex items-center justify-between mb-4">
          {WIZARD_STEPS.map((step, idx) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    currentStep > step.number
                      ? "bg-primary text-primary-foreground"
                      : currentStep === step.number
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    currentStep >= step.number
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < WIZARD_STEPS.length - 1 && (
                <div
                  className={`w-20 h-1 mx-2 transition-colors ${
                    currentStep > step.number ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
};

export default ProgressHeader;

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { WizardProvider } from "./wizard/WizardProvider";
import { useWizard } from "./wizard/WizardContext";
import { ProgressHeader } from "./wizard/components/ProgressHeader";
import { StepContext } from "./wizard/StepContext";
import { StepObjectives } from "./wizard/StepObjectives";
import { StepStrategy } from "./wizard/StepStrategy";
import { StepConfiguration } from "./wizard/StepConfiguration";
import { StepReview } from "./wizard/StepReview";

interface ContentWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: string;
  prefilledTopic?: string;
}

// Inner component that uses the wizard context
const WizardContent = ({ onClose }: { onClose: () => void }) => {
  const { state, resetWizard } = useWizard();

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  return (
    <>
      <ProgressHeader />
      <div className="px-8 py-6">
        {state.currentStep === 1 && <StepContext />}
        {state.currentStep === 2 && <StepObjectives />}
        {state.currentStep === 3 && <StepStrategy />}
        {state.currentStep === 4 && <StepConfiguration />}
        {state.currentStep === 5 && <StepReview onClose={handleClose} />}
      </div>
    </>
  );
};

const ContentWizard = ({
  open,
  onOpenChange,
  contentType,
  prefilledTopic = "",
}: ContentWizardProps) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0">
        <WizardProvider contentType={contentType} prefilledTopic={prefilledTopic}>
          <WizardContent onClose={handleClose} />
        </WizardProvider>
      </DialogContent>
    </Dialog>
  );
};

export default ContentWizard;

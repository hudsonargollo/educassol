import { useCallback } from "react";
import { useWizard } from "../WizardContext";
import { WIZARD_STEPS } from "../WizardContext";

export interface StepValidation {
  isValid: boolean;
  errors: string[];
}

export const useWizardNavigation = () => {
  const { state, updateState, goToStep, nextStep, prevStep, canProceed } = useWizard();

  // Get current step info
  const currentStepInfo = WIZARD_STEPS.find((s) => s.number === state.currentStep);
  const isFirstStep = state.currentStep === 1;
  const isLastStep = state.currentStep === WIZARD_STEPS.length;

  // Validate specific step with detailed errors
  const validateStep = useCallback((stepNumber: number): StepValidation => {
    const errors: string[] = [];

    switch (stepNumber) {
      case 1: // Context
        if (!state.classId && !state.grade) {
          errors.push("Selecione uma turma ou um ano escolar");
        }
        if (!state.classId && !state.subject) {
          errors.push("Selecione uma disciplina");
        }
        break;

      case 2: // Objectives
        if (!state.topic.trim()) {
          errors.push("Digite um tema para a aula");
        }
        break;

      case 3: // Strategy
        // Optional step - no required fields
        break;

      case 4: // Configuration
        // Optional step - has defaults
        if (state.studentsPerClass < 1) {
          errors.push("Número de alunos deve ser maior que zero");
        }
        if (state.numberOfLessons < 1) {
          errors.push("Número de aulas deve ser maior que zero");
        }
        if (state.durationPerLesson < 15) {
          errors.push("Duração mínima de 15 minutos por aula");
        }
        break;

      case 5: // Review
        // Validate all required fields for generation
        if (!state.grade && !state.classId) {
          errors.push("Contexto incompleto: selecione turma ou ano");
        }
        if (!state.subject && !state.classId) {
          errors.push("Contexto incompleto: selecione disciplina");
        }
        if (!state.topic.trim()) {
          errors.push("Objetivos incompletos: digite um tema");
        }
        break;

      default:
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [state]);

  // Check if current step is valid
  const currentStepValidation = validateStep(state.currentStep);

  // Navigate to next step if valid
  const handleNext = useCallback(() => {
    if (currentStepValidation.isValid && !isLastStep) {
      nextStep();
    }
  }, [currentStepValidation.isValid, isLastStep, nextStep]);

  // Navigate to previous step
  const handleBack = useCallback(() => {
    if (!isFirstStep) {
      prevStep();
    }
  }, [isFirstStep, prevStep]);

  // Navigate to specific step (for review click-to-edit)
  const handleGoToStep = useCallback((step: number) => {
    if (step >= 1 && step <= WIZARD_STEPS.length) {
      goToStep(step);
    }
  }, [goToStep]);

  // Check if a specific step has been completed (all required fields filled)
  const isStepComplete = useCallback((stepNumber: number): boolean => {
    return validateStep(stepNumber).isValid;
  }, [validateStep]);

  // Get progress percentage
  const progressPercentage = (state.currentStep / WIZARD_STEPS.length) * 100;

  return {
    // Current state
    currentStep: state.currentStep,
    currentStepInfo,
    isFirstStep,
    isLastStep,
    progressPercentage,

    // Validation
    currentStepValidation,
    validateStep,
    isStepComplete,
    canProceed: canProceed(),

    // Navigation actions
    handleNext,
    handleBack,
    handleGoToStep,
    goToStep,
    nextStep,
    prevStep,

    // All steps info
    steps: WIZARD_STEPS,
  };
};

export default useWizardNavigation;

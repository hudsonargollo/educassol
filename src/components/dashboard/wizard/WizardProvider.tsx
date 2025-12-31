import { useState, useCallback, useEffect, useRef, ReactNode } from "react";
import {
  WizardContext,
  WizardState,
  DEFAULT_WIZARD_STATE,
  WIZARD_STEPS,
} from "./WizardContext";

// Persisted state structure with timestamp for expiration
interface PersistedWizardState {
  state: WizardState;
  timestamp: number;
  contentType: string;
}

// 24 hours in milliseconds
const EXPIRATION_MS = 24 * 60 * 60 * 1000;
const STORAGE_KEY_PREFIX = "wizard_draft_";
const DEBOUNCE_MS = 500;

interface WizardProviderProps {
  children: ReactNode;
  contentType?: string;
  prefilledTopic?: string;
  onClose?: () => void;
}

export const WizardProvider = ({
  children,
  contentType = "lesson_plan",
  prefilledTopic = "",
}: WizardProviderProps) => {
  const storageKey = `${STORAGE_KEY_PREFIX}${contentType}`;
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize state from localStorage or defaults
  const initializeState = useCallback((): WizardState => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed: PersistedWizardState = JSON.parse(stored);
        const now = Date.now();
        
        // Check if draft has expired (24 hours)
        if (now - parsed.timestamp < EXPIRATION_MS) {
          return {
            ...parsed.state,
            contentType,
            // Override topic if prefilled
            topic: prefilledTopic || parsed.state.topic,
          };
        } else {
          // Draft expired, clear it
          localStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      // Corrupted localStorage, clear it
      console.warn("Failed to restore wizard state:", error);
      localStorage.removeItem(storageKey);
    }

    // Return default state with prefilled values
    return {
      ...DEFAULT_WIZARD_STATE,
      contentType,
      topic: prefilledTopic,
    };
  }, [storageKey, contentType, prefilledTopic]);

  const [state, setState] = useState<WizardState>(initializeState);

  // Save to localStorage with debounce
  const saveToStorage = useCallback((newState: WizardState) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        const persisted: PersistedWizardState = {
          state: newState,
          timestamp: Date.now(),
          contentType: newState.contentType,
        };
        localStorage.setItem(storageKey, JSON.stringify(persisted));
      } catch (error) {
        console.warn("Failed to save wizard state:", error);
      }
    }, DEBOUNCE_MS);
  }, [storageKey]);

  // Update state and trigger save
  const updateState = useCallback((updates: Partial<WizardState>) => {
    setState((prev) => {
      const newState = { ...prev, ...updates };
      saveToStorage(newState);
      return newState;
    });
  }, [saveToStorage]);

  // Set content type
  const setContentType = useCallback((newContentType: string) => {
    updateState({ contentType: newContentType });
  }, [updateState]);

  // Validation logic for each step
  const canProceed = useCallback((): boolean => {
    switch (state.currentStep) {
      case 1: // Context
        // Requires either classId OR (grade AND subject)
        return !!(state.classId || (state.grade && state.subject));
      case 2: // Objectives
        // Requires topic to be non-empty
        return state.topic.trim().length > 0;
      case 3: // Strategy
        // Optional - can proceed without selections
        return true;
      case 4: // Configuration
        // Optional - can proceed with defaults
        return true;
      case 5: // Review
        // Final step - always can "proceed" (generate)
        return true;
      default:
        return false;
    }
  }, [state]);

  // Navigation functions
  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= WIZARD_STEPS.length) {
      updateState({ currentStep: step });
    }
  }, [updateState]);

  const nextStep = useCallback(() => {
    if (canProceed() && state.currentStep < WIZARD_STEPS.length) {
      updateState({ currentStep: state.currentStep + 1 });
    }
  }, [canProceed, state.currentStep, updateState]);

  const prevStep = useCallback(() => {
    if (state.currentStep > 1) {
      updateState({ currentStep: state.currentStep - 1 });
    }
  }, [state.currentStep, updateState]);

  // Reset wizard to initial state
  const resetWizard = useCallback(() => {
    localStorage.removeItem(storageKey);
    setState({
      ...DEFAULT_WIZARD_STATE,
      contentType,
    });
  }, [storageKey, contentType]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Update topic when prefilledTopic changes
  useEffect(() => {
    if (prefilledTopic && prefilledTopic !== state.topic) {
      updateState({ topic: prefilledTopic });
    }
  }, [prefilledTopic]);

  const contextValue = {
    state,
    updateState,
    goToStep,
    nextStep,
    prevStep,
    canProceed,
    resetWizard,
    setContentType,
  };

  return (
    <WizardContext.Provider value={contextValue}>
      {children}
    </WizardContext.Provider>
  );
};

export default WizardProvider;

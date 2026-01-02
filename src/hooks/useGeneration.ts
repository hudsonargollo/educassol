import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Quiz } from '@/lib/instructional/quiz';
import type { Worksheet } from '@/lib/instructional/worksheet';
import type { LeveledReading } from '@/lib/instructional/leveled-reading';
import type { SlideOutline } from '@/lib/instructional/slide-outline';
import type { LimitCategory } from '@/hooks/useUsage';

/**
 * Activity types supported by the generation hook
 */
export type ActivityType = 'quiz' | 'worksheet' | 'reading' | 'slides' | 'lesson-plan';

/**
 * Generated activity content types
 */
export type GeneratedContent = Quiz | Worksheet | LeveledReading | SlideOutline;

/**
 * Limit exceeded information from 402 response
 * Requirements: 4.1, 2.5
 */
export interface LimitExceededInfo {
  limitType: LimitCategory;
  currentUsage: number;
  limit: number;
  tier: string;
}

/**
 * Generation state
 */
export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  data: GeneratedContent | null;
  retryCount: number;
  limitExceeded: LimitExceededInfo | null;
}

/**
 * Quiz generation options
 */
export interface QuizGenerationOptions {
  lessonPlanId: string;
  numberOfQuestions?: number;
  questionTypes?: ('multiple-choice' | 'true-false' | 'short-answer')[];
  bloomLevels?: ('apply' | 'analyze' | 'evaluate' | 'create')[];
  title?: string;
  instructions?: string;
}

/**
 * Worksheet generation options
 */
export interface WorksheetGenerationOptions {
  lessonPlanId: string;
  sectionTypes?: ('vocabulary-matching' | 'cloze' | 'diagram-labeling' | 'short-answer')[];
  title?: string;
  includeAnswerKey?: boolean;
}

/**
 * Leveled reading generation options
 */
export interface ReadingGenerationOptions {
  lessonPlanId: string;
  topic?: string;
  easyLexile?: number;
  mediumLexile?: number;
  hardLexile?: number;
}

/**
 * Slide outline generation options
 */
export interface SlidesGenerationOptions {
  lessonPlanId: string;
  title?: string;
  numberOfSlides?: number;
  includeActivities?: boolean;
}


/**
 * Lesson plan generation options
 */
export interface LessonPlanGenerationOptions {
  grade: string;
  subject: string;
  topic: string;
  bnccCode?: string;
  duration?: number;
  templateId?: string;
  methodology?: string;
  durationMinutes?: number;
  accessibilityOptions?: string[];
  difficultyLevel?: 'easy' | 'intermediate' | 'advanced';
  specificIdea?: string;
  studentsPerClass?: number;
  numberOfLessons?: number;
  classId?: string;
  classContext?: {
    total_alunos?: number | null;
    possui_ane?: boolean;
    detalhes_ane?: string | null;
  };
}

/**
 * Differentiation types supported by the engine
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */
export type DifferentiationType = 'ell' | 'advanced' | 'adhd' | 'visual';

/**
 * Refinement action types
 * Requirements: 10.1, 10.2, 10.3
 */
export type RefinementAction = 'rewrite' | 'simplify' | 'engage' | 'expand';

/**
 * Refinement options
 */
export interface RefinementOptions {
  selectedText: string;
  action: RefinementAction;
  context?: string;
  contentType?: 'lesson-plan' | 'quiz' | 'worksheet' | 'reading' | 'slides';
}

/**
 * Refinement result
 */
export interface RefinementResult {
  originalText: string;
  refinedText: string;
  action: RefinementAction;
  timestamp: string;
}

/**
 * Differentiation options
 */
export interface DifferentiationOptions {
  contentId: string;
  contentType: 'lesson-plan' | 'quiz' | 'worksheet';
  differentiationTypes: DifferentiationType[];
}

/**
 * Differentiation result
 */
export interface DifferentiationResult<T> {
  original: T;
  differentiated: T;
  modificationsApplied: DifferentiationType[];
  preservedObjective: string;
  contentType: string;
  contentId: string;
}

/**
 * Union type for all generation options
 */
export type GenerationOptions = 
  | QuizGenerationOptions 
  | WorksheetGenerationOptions 
  | ReadingGenerationOptions 
  | SlidesGenerationOptions
  | LessonPlanGenerationOptions;

/**
 * Maximum retry attempts for failed generations
 * Requirement 9.4: Retry with exponential backoff up to 3 attempts
 */
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Base delay for exponential backoff (in milliseconds)
 */
const BASE_RETRY_DELAY = 1000;

/**
 * Calculate exponential backoff delay
 */
function getRetryDelay(attempt: number): number {
  return BASE_RETRY_DELAY * Math.pow(2, attempt);
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Maps limit_type from API response to LimitCategory
 */
function mapLimitTypeToCategory(limitType: string): LimitCategory {
  switch (limitType) {
    case 'lessonPlans':
      return 'lessonPlans';
    case 'activities':
      return 'activities';
    case 'assessments':
      return 'assessments';
    case 'fileUploads':
      return 'fileUploads';
    default:
      return 'activities';
  }
}

/**
 * Map activity type to Edge Function name
 */
function getEdgeFunctionName(type: ActivityType): string {
  switch (type) {
    case 'quiz':
      return 'generate-quiz';
    case 'worksheet':
      return 'generate-worksheet';
    case 'reading':
      return 'generate-reading';
    case 'slides':
      return 'generate-slides';
    case 'lesson-plan':
      return 'generate-lesson-plan';
    default:
      throw new Error(`Unknown activity type: ${type}`);
  }
}


/**
 * Custom hook for AI content generation
 * 
 * Requirements:
 * - 9.1: Stream response with sub-second time-to-first-token
 * - 9.4: Retry with exponential backoff up to 3 attempts
 * 
 * @returns Generation state and control functions
 */
export function useGeneration() {
  const [state, setState] = useState<GenerationState>({
    isLoading: false,
    error: null,
    data: null,
    retryCount: 0,
    limitExceeded: null,
  });

  // Abort controller for cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Reset the generation state
   */
  const reset = useCallback(() => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState({
      isLoading: false,
      error: null,
      data: null,
      retryCount: 0,
      limitExceeded: null,
    });
  }, []);

  /**
   * Dismiss the limit exceeded modal
   * Requirement 4.6: Include "Maybe Later" dismissal option
   */
  const dismissLimitExceeded = useCallback(() => {
    setState(prev => ({
      ...prev,
      limitExceeded: null,
    }));
  }, []);

  /**
   * Generate content with retry logic
   * Requirement 9.4: Retry with exponential backoff up to 3 attempts
   * Requirements 4.1, 2.5: Detect 402 responses and trigger UpgradeModal
   */
  const generate = useCallback(async <T extends GeneratedContent>(
    type: ActivityType,
    options: GenerationOptions
  ): Promise<T | null> => {
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      retryCount: 0,
      limitExceeded: null,
    }));

    const functionName = getEdgeFunctionName(type);
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        // Update retry count
        if (attempt > 0) {
          setState(prev => ({ ...prev, retryCount: attempt }));
          
          // Wait with exponential backoff before retry
          await sleep(getRetryDelay(attempt));
        }

        // Check if request was cancelled
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Request cancelled');
        }

        console.log(`Calling ${functionName} (attempt ${attempt + 1}/${MAX_RETRY_ATTEMPTS})`);

        const { data, error } = await supabase.functions.invoke(functionName, {
          body: options,
        });

        // Check for 402 Payment Required (limit exceeded)
        // Requirement 4.1: Display immediately when limit exceeded
        if (error && error.message?.includes('402')) {
          // Try to parse the error context for limit details
          let limitInfo: LimitExceededInfo | null = null;
          
          try {
            // The error context may contain the limit details
            const errorContext = error.context;
            if (errorContext && typeof errorContext === 'object') {
              limitInfo = {
                limitType: mapLimitTypeToCategory(errorContext.limit_type || 'activities'),
                currentUsage: errorContext.current_usage || 0,
                limit: errorContext.limit || 0,
                tier: errorContext.tier || 'free',
              };
            }
          } catch {
            // If parsing fails, use defaults based on activity type
            limitInfo = {
              limitType: type === 'lesson-plan' ? 'lessonPlans' : 'activities',
              currentUsage: 0,
              limit: 0,
              tier: 'free',
            };
          }

          setState({
            isLoading: false,
            error: 'Usage limit exceeded',
            data: null,
            retryCount: attempt,
            limitExceeded: limitInfo,
          });

          return null;
        }

        if (error) {
          throw new Error(error.message || 'Generation failed');
        }

        if (!data) {
          throw new Error('No data returned from generation');
        }

        // Extract content from the response
        const content = data.content as T;

        setState({
          isLoading: false,
          error: null,
          data: content,
          retryCount: attempt,
          limitExceeded: null,
        });

        return content;

      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown error');
        
        // Don't retry if request was cancelled
        if (lastError.message === 'Request cancelled') {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Request cancelled',
          }));
          return null;
        }

        // Don't retry on 402 errors (limit exceeded)
        if (lastError.message?.includes('402') || lastError.message?.includes('limit exceeded')) {
          break;
        }

        console.error(`Generation attempt ${attempt + 1} failed:`, lastError.message);
      }
    }

    // All retries exhausted
    const errorMessage = lastError?.message || 'Generation failed after multiple attempts';
    setState(prev => ({
      isLoading: false,
      error: errorMessage,
      data: null,
      retryCount: MAX_RETRY_ATTEMPTS,
      limitExceeded: prev.limitExceeded,
    }));

    return null;
  }, []);


  /**
   * Generate a quiz from a lesson plan
   */
  const generateQuiz = useCallback(async (options: QuizGenerationOptions): Promise<Quiz | null> => {
    return generate<Quiz>('quiz', options);
  }, [generate]);

  /**
   * Generate a worksheet from a lesson plan
   */
  const generateWorksheet = useCallback(async (options: WorksheetGenerationOptions): Promise<Worksheet | null> => {
    return generate<Worksheet>('worksheet', options);
  }, [generate]);

  /**
   * Generate leveled reading passages from a lesson plan
   */
  const generateReading = useCallback(async (options: ReadingGenerationOptions): Promise<LeveledReading | null> => {
    return generate<LeveledReading>('reading', options);
  }, [generate]);

  /**
   * Generate a slide outline from a lesson plan
   */
  const generateSlides = useCallback(async (options: SlidesGenerationOptions): Promise<SlideOutline | null> => {
    return generate<SlideOutline>('slides', options);
  }, [generate]);

  /**
   * Generate a lesson plan
   */
  const generateLessonPlan = useCallback(async (options: LessonPlanGenerationOptions): Promise<unknown> => {
    return generate<GeneratedContent>('lesson-plan', options);
  }, [generate]);

  /**
   * Differentiate content for diverse learners
   * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
   */
  const differentiateContent = useCallback(async <T>(
    options: DifferentiationOptions
  ): Promise<DifferentiationResult<T> | null> => {
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      retryCount: 0,
    }));

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        // Update retry count
        if (attempt > 0) {
          setState(prev => ({ ...prev, retryCount: attempt }));
          
          // Wait with exponential backoff before retry
          await sleep(getRetryDelay(attempt));
        }

        // Check if request was cancelled
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Request cancelled');
        }

        console.log(`Calling differentiate-content (attempt ${attempt + 1}/${MAX_RETRY_ATTEMPTS})`);

        const { data, error } = await supabase.functions.invoke('differentiate-content', {
          body: options,
        });

        if (error) {
          throw new Error(error.message || 'Differentiation failed');
        }

        if (!data) {
          throw new Error('No data returned from differentiation');
        }

        setState({
          isLoading: false,
          error: null,
          data: data.differentiated as GeneratedContent,
          retryCount: attempt,
          limitExceeded: null,
        });

        return data as DifferentiationResult<T>;

      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown error');
        
        // Don't retry if request was cancelled
        if (lastError.message === 'Request cancelled') {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Request cancelled',
          }));
          return null;
        }

        console.error(`Differentiation attempt ${attempt + 1} failed:`, lastError.message);
      }
    }

    // All retries exhausted
    const errorMessage = lastError?.message || 'Differentiation failed after multiple attempts';
    setState({
      isLoading: false,
      error: errorMessage,
      data: null,
      retryCount: MAX_RETRY_ATTEMPTS,
      limitExceeded: null,
    });

    return null;
  }, []);

  /**
   * Refine content with AI
   * Requirements: 10.1, 10.2, 10.3
   */
  const refineContent = useCallback(async (
    options: RefinementOptions
  ): Promise<RefinementResult | null> => {
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      retryCount: 0,
    }));

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        // Update retry count
        if (attempt > 0) {
          setState(prev => ({ ...prev, retryCount: attempt }));
          
          // Wait with exponential backoff before retry
          await sleep(getRetryDelay(attempt));
        }

        // Check if request was cancelled
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Request cancelled');
        }

        console.log(`Calling refine-content (attempt ${attempt + 1}/${MAX_RETRY_ATTEMPTS})`);

        const { data, error } = await supabase.functions.invoke('refine-content', {
          body: options,
        });

        if (error) {
          throw new Error(error.message || 'Refinement failed');
        }

        if (!data) {
          throw new Error('No data returned from refinement');
        }

        setState({
          isLoading: false,
          error: null,
          data: null,
          retryCount: attempt,
          limitExceeded: null,
        });

        return data as RefinementResult;

      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown error');
        
        // Don't retry if request was cancelled
        if (lastError.message === 'Request cancelled') {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Request cancelled',
          }));
          return null;
        }

        console.error(`Refinement attempt ${attempt + 1} failed:`, lastError.message);
      }
    }

    // All retries exhausted
    const errorMessage = lastError?.message || 'Refinement failed after multiple attempts';
    setState({
      isLoading: false,
      error: errorMessage,
      data: null,
      retryCount: MAX_RETRY_ATTEMPTS,
      limitExceeded: null,
    });

    return null;
  }, []);

  /**
   * Cancel any in-flight generation request
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: 'Request cancelled',
    }));
  }, []);

  return {
    // State
    isLoading: state.isLoading,
    error: state.error,
    data: state.data,
    retryCount: state.retryCount,
    limitExceeded: state.limitExceeded,

    // Actions
    generate,
    generateQuiz,
    generateWorksheet,
    generateReading,
    generateSlides,
    generateLessonPlan,
    differentiateContent,
    refineContent,
    cancel,
    reset,
    dismissLimitExceeded,
  };
}

/**
 * Hook for tracking generation progress
 * Useful for showing progress indicators during generation
 */
export function useGenerationProgress() {
  const [progress, setProgress] = useState<{
    stage: 'idle' | 'preparing' | 'generating' | 'processing' | 'complete' | 'error';
    message: string;
  }>({
    stage: 'idle',
    message: '',
  });

  const updateProgress = useCallback((
    stage: typeof progress.stage,
    message: string
  ) => {
    setProgress({ stage, message });
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({ stage: 'idle', message: '' });
  }, []);

  return {
    progress,
    updateProgress,
    resetProgress,
  };
}

export default useGeneration;

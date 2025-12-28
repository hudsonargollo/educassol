import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { GradingResult, QuestionResult } from '@/lib/assessment/grading-result';
import type { Rubric } from '@/lib/assessment/rubric';

/**
 * Grading status enum
 */
export type GradingStatus = 
  | 'idle' 
  | 'starting' 
  | 'processing' 
  | 'grading' 
  | 'complete' 
  | 'error';

/**
 * Streaming event types from the edge function
 */
interface StreamingProgressEvent {
  type: 'progress';
  data: {
    status: string;
    message: string;
  };
}

interface StreamingQuestionEvent {
  type: 'question';
  data: {
    number: string;
    topic: string;
    points_awarded: number;
    max_points: number;
    feedback: string;
    is_correct: boolean;
  };
}

interface StreamingCompleteEvent {
  type: 'complete';
  data: GradingResult;
}

interface StreamingErrorEvent {
  type: 'error';
  data: {
    message: string;
  };
}

type StreamingEvent = 
  | StreamingProgressEvent 
  | StreamingQuestionEvent 
  | StreamingCompleteEvent 
  | StreamingErrorEvent;

/**
 * Grading state interface
 */
export interface GradingState {
  /** Current grading status */
  status: GradingStatus;
  /** Grading progress percentage (0-100) */
  progress: number;
  /** Current status message for display */
  statusMessage: string;
  /** Streamed text during AI processing */
  streamedText: string;
  /** Partial question results as they stream in */
  partialResults: Partial<QuestionResult>[];
  /** Complete grading result when finished */
  gradingResult: GradingResult | null;
  /** Error message if grading failed */
  error: string | null;
  /** Confidence score from AI (0-100) */
  confidenceScore: number | null;
}

/**
 * Grading input options
 */
export interface GradingOptions {
  /** Submission ID for database lookup mode */
  submissionId?: string;
  /** Rubric for direct grading mode */
  rubric?: Rubric;
  /** Base64 encoded submission content for direct mode */
  submissionContent?: string;
  /** MIME type of submission for direct mode */
  submissionMimeType?: string;
  /** Enable streaming mode for real-time feedback */
  stream?: boolean;
}

/**
 * Return type for useGrading hook
 */
export interface UseGradingReturn {
  /** Current grading state */
  state: GradingState;
  /** Start grading with given options */
  startGrading: (options: GradingOptions) => Promise<void>;
  /** Reset grading state to initial */
  resetGrading: () => void;
  /** Cancel ongoing grading operation */
  cancelGrading: () => void;
  /** Whether grading is currently in progress */
  isGrading: boolean;
}

/**
 * Initial grading state
 */
const initialState: GradingState = {
  status: 'idle',
  progress: 0,
  statusMessage: '',
  streamedText: '',
  partialResults: [],
  gradingResult: null,
  error: null,
  confidenceScore: null,
};

/**
 * useGrading Hook
 * 
 * Manages AI grading workflow including:
 * - Streaming response handling from edge function
 * - Progress tracking and status updates
 * - Partial results as questions are graded
 * - Error handling and retry logic
 * 
 * Requirements: 3.1
 */
export function useGrading(): UseGradingReturn {
  const [state, setState] = useState<GradingState>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Reset grading state to initial
   */
  const resetGrading = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState(initialState);
  }, []);

  /**
   * Cancel ongoing grading operation
   */
  const cancelGrading = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState(prev => ({
      ...prev,
      status: 'idle',
      statusMessage: 'Correção cancelada',
    }));
  }, []);

  /**
   * Process streaming events from the edge function
   */
  const processStreamingEvent = useCallback((event: StreamingEvent) => {
    switch (event.type) {
      case 'progress':
        setState(prev => ({
          ...prev,
          status: event.data.status as GradingStatus,
          statusMessage: event.data.message,
          streamedText: prev.streamedText + (event.data.message ? `${event.data.message}\n` : ''),
          progress: event.data.status === 'starting' ? 10 : 
                   event.data.status === 'processing' ? 30 :
                   event.data.status === 'grading' ? 60 : prev.progress,
        }));
        break;

      case 'question':
        setState(prev => {
          const newPartialResults = [...prev.partialResults, event.data as Partial<QuestionResult>];
          const totalQuestions = newPartialResults.length;
          // Estimate progress based on questions processed (60-90% range)
          const questionProgress = 60 + (totalQuestions * 5);
          return {
            ...prev,
            partialResults: newPartialResults,
            progress: Math.min(questionProgress, 90),
            statusMessage: `Questão ${event.data.number} corrigida: ${event.data.points_awarded}/${event.data.max_points}`,
          };
        });
        break;

      case 'complete':
        setState(prev => ({
          ...prev,
          status: 'complete',
          progress: 100,
          statusMessage: 'Correção concluída',
          gradingResult: event.data,
          confidenceScore: event.data.confidenceScore ?? null,
          streamedText: '',
        }));
        break;

      case 'error':
        setState(prev => ({
          ...prev,
          status: 'error',
          error: event.data.message,
          statusMessage: `Erro: ${event.data.message}`,
        }));
        break;
    }
  }, []);

  /**
   * Handle streaming response from edge function
   */
  const handleStreamingResponse = useCallback(async (
    response: Response,
    signal: AbortSignal
  ) => {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        if (signal.aborted) {
          reader.cancel();
          break;
        }

        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process Server-Sent Events format
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6));
              processStreamingEvent(eventData as StreamingEvent);
            } catch {
              // Skip malformed events
              console.warn('Failed to parse streaming event:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }, [processStreamingEvent]);

  /**
   * Start grading with given options
   */
  const startGrading = useCallback(async (options: GradingOptions) => {
    // Cancel any existing operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    // Reset state and start
    setState({
      ...initialState,
      status: 'starting',
      progress: 5,
      statusMessage: 'Iniciando correção...',
    });

    try {
      // Get current session for auth
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Não autenticado. Por favor, faça login novamente.');
      }

      // Build request body
      const requestBody: Record<string, unknown> = {
        stream: options.stream ?? true,
      };

      if (options.submissionId) {
        requestBody.submission_id = options.submissionId;
      } else if (options.rubric && options.submissionContent && options.submissionMimeType) {
        requestBody.rubric = options.rubric;
        requestBody.submission_content = options.submissionContent;
        requestBody.submission_mime_type = options.submissionMimeType;
      } else {
        throw new Error('Forneça submission_id ou (rubric, submissionContent, submissionMimeType)');
      }

      // Call edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-exam`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(requestBody),
          signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // Check if streaming response
      const contentType = response.headers.get('Content-Type');
      if (contentType?.includes('text/event-stream')) {
        // Handle streaming response
        await handleStreamingResponse(response, signal);
      } else {
        // Handle non-streaming response
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        setState(prev => ({
          ...prev,
          status: 'complete',
          progress: 100,
          statusMessage: 'Correção concluída',
          gradingResult: data.ai_output,
          confidenceScore: data.confidenceScore ?? data.ai_output?.confidenceScore ?? null,
        }));
      }
    } catch (error) {
      if (signal.aborted) {
        // Cancelled by user, don't update state
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage,
        statusMessage: `Erro: ${errorMessage}`,
      }));
    } finally {
      abortControllerRef.current = null;
    }
  }, [handleStreamingResponse]);

  const isGrading = state.status === 'starting' || 
                    state.status === 'processing' || 
                    state.status === 'grading';

  return {
    state,
    startGrading,
    resetGrading,
    cancelGrading,
    isGrading,
  };
}

export default useGrading;

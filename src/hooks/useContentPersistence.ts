/**
 * useContentPersistence Hook
 * 
 * Handles manual edit persistence for generated content.
 * Saves changes on blur without triggering regeneration.
 * 
 * Requirements:
 * - 10.5: Save changes on blur without regeneration
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Content types that can be persisted
 */
export type PersistableContentType = 'lesson-plan' | 'quiz' | 'worksheet' | 'reading' | 'slides';

/**
 * Persistence state
 */
export interface PersistenceState {
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
}

/**
 * Options for the useContentPersistence hook
 */
export interface UseContentPersistenceOptions {
  /** The content ID */
  contentId: string;
  /** The content type */
  contentType: PersistableContentType;
  /** Auto-save delay in milliseconds (default: 1000) */
  autoSaveDelay?: number;
  /** Whether to enable auto-save on blur (default: true) */
  autoSaveOnBlur?: boolean;
  /** Callback when save is successful */
  onSaveSuccess?: () => void;
  /** Callback when save fails */
  onSaveError?: (error: string) => void;
}

/**
 * Return type for the useContentPersistence hook
 */
export interface UseContentPersistenceReturn {
  /** Current persistence state */
  state: PersistenceState;
  /** Mark content as dirty (modified) */
  markDirty: () => void;
  /** Mark content as clean (saved) */
  markClean: () => void;
  /** Save content manually */
  save: (content: Record<string, unknown>) => Promise<boolean>;
  /** Handle blur event - triggers save if dirty */
  handleBlur: (content: Record<string, unknown>) => void;
  /** Reset the persistence state */
  reset: () => void;
}

/**
 * Custom hook for content persistence
 * 
 * Requirement 10.5: Save changes on blur without regeneration
 */
export function useContentPersistence({
  contentId,
  contentType,
  autoSaveDelay = 1000,
  autoSaveOnBlur = true,
  onSaveSuccess,
  onSaveError,
}: UseContentPersistenceOptions): UseContentPersistenceReturn {
  const [state, setState] = useState<PersistenceState>({
    isDirty: false,
    isSaving: false,
    lastSaved: null,
    error: null,
  });

  // Debounce timer ref
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track if component is mounted
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  /**
   * Mark content as dirty (modified)
   */
  const markDirty = useCallback(() => {
    setState(prev => ({ ...prev, isDirty: true, error: null }));
  }, []);

  /**
   * Mark content as clean (saved)
   */
  const markClean = useCallback(() => {
    setState(prev => ({ ...prev, isDirty: false }));
  }, []);

  /**
   * Save content to database using RPC or direct table access
   */
  const save = useCallback(async (content: Record<string, unknown>): Promise<boolean> => {
    if (!contentId) {
      console.warn('Cannot save: no content ID provided');
      return false;
    }

    setState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      // Use generated_content table for all content types
      // This table exists in the schema and can store various content types
      const { error } = await supabase
        .from('generated_content')
        .update({
          content: JSON.stringify(content),
          updated_at: new Date().toISOString(),
        })
        .eq('id', contentId);

      if (error) {
        // If the table doesn't exist or update fails, try alternative approach
        console.warn('Direct update failed, content may need to be saved differently:', error);
        throw error;
      }

      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          isDirty: false,
          isSaving: false,
          lastSaved: new Date(),
          error: null,
        }));
      }

      onSaveSuccess?.();
      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save content';
      
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          isSaving: false,
          error: errorMessage,
        }));
      }

      onSaveError?.(errorMessage);
      return false;
    }
  }, [contentId, onSaveSuccess, onSaveError]);

  /**
   * Handle blur event - triggers save if dirty
   * Requirement 10.5: Save changes on blur without regeneration
   */
  const handleBlur = useCallback((content: Record<string, unknown>) => {
    if (!autoSaveOnBlur || !state.isDirty) {
      return;
    }

    // Clear any existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Debounce the save
    saveTimerRef.current = setTimeout(() => {
      save(content);
    }, autoSaveDelay);
  }, [autoSaveOnBlur, state.isDirty, autoSaveDelay, save]);

  /**
   * Reset the persistence state
   */
  const reset = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    setState({
      isDirty: false,
      isSaving: false,
      lastSaved: null,
      error: null,
    });
  }, []);

  return {
    state,
    markDirty,
    markClean,
    save,
    handleBlur,
    reset,
  };
}

/**
 * Hook for tracking content changes with auto-save
 */
export interface UseAutoSaveOptions<T> {
  /** Initial content value */
  initialContent: T;
  /** Content ID for persistence */
  contentId: string;
  /** Content type */
  contentType: PersistableContentType;
  /** Auto-save delay in milliseconds */
  autoSaveDelay?: number;
  /** Whether auto-save is enabled */
  enabled?: boolean;
}

export interface UseAutoSaveReturn<T> {
  /** Current content value */
  content: T;
  /** Update content (marks as dirty) */
  setContent: (content: T | ((prev: T) => T)) => void;
  /** Persistence state */
  persistenceState: PersistenceState;
  /** Save content manually */
  save: () => Promise<boolean>;
  /** Reset to initial content */
  reset: () => void;
}

export function useAutoSave<T extends Record<string, unknown>>({
  initialContent,
  contentId,
  contentType,
  autoSaveDelay = 2000,
  enabled = true,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn<T> {
  const [content, setContentState] = useState<T>(initialContent);
  const contentRef = useRef<T>(content);

  // Keep ref in sync
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const {
    state: persistenceState,
    markDirty,
    save: saveContent,
    reset: resetPersistence,
  } = useContentPersistence({
    contentId,
    contentType,
    autoSaveDelay,
    autoSaveOnBlur: enabled,
  });

  // Auto-save timer
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Update content and mark as dirty
   */
  const setContent = useCallback((newContent: T | ((prev: T) => T)) => {
    setContentState(prev => {
      const updated = typeof newContent === 'function' 
        ? (newContent as (prev: T) => T)(prev) 
        : newContent;
      return updated;
    });
    markDirty();

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new auto-save timer if enabled
    if (enabled) {
      autoSaveTimerRef.current = setTimeout(() => {
        saveContent(contentRef.current);
      }, autoSaveDelay);
    }
  }, [markDirty, enabled, autoSaveDelay, saveContent]);

  /**
   * Save content manually
   */
  const save = useCallback(async (): Promise<boolean> => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    return saveContent(content);
  }, [saveContent, content]);

  /**
   * Reset to initial content
   */
  const reset = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    setContentState(initialContent);
    resetPersistence();
  }, [initialContent, resetPersistence]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  return {
    content,
    setContent,
    persistenceState,
    save,
    reset,
  };
}

export default useContentPersistence;

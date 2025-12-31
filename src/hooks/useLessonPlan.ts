/**
 * useLessonPlan Hook
 * 
 * Handles CRUD operations for lesson plans with automatic timestamps.
 * 
 * Requirements:
 * - 13.1: Persist content to database with timestamp and user reference
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { LessonPlan, LessonStatus } from '@/lib/instructional/lesson-plan';

/**
 * Database row type for lesson_plans table
 */
export interface LessonPlanRow {
  id: string;
  unit_id: string | null;
  user_id: string;
  date: string;
  topic: string;
  grade_level: string;
  subject: string;
  duration: number;
  standards: string[];
  learning_objective: string;
  key_vocabulary: unknown;
  materials_needed: string[];
  phases: unknown;
  formative_assessment: unknown;
  status: LessonStatus;
  version: number;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

/**
 * Input type for creating a new lesson plan
 */
export interface CreateLessonPlanInput {
  unitId?: string;
  date: Date;
  topic: string;
  gradeLevel: string;
  subject: string;
  duration: number;
  standards: string[];
  learningObjective: string;
  keyVocabulary: Array<{ term: string; definition: string }>;
  materialsNeeded?: string[];
  phases: Array<{
    type: string;
    name: string;
    duration: number;
    teacherScript: string;
    studentAction: string;
    differentiationNotes?: { support: string; extension: string };
  }>;
  formativeAssessment: { type: string; question: string };
  status?: LessonStatus;
}

/**
 * Input type for updating a lesson plan
 */
export interface UpdateLessonPlanInput {
  topic?: string;
  date?: Date;
  duration?: number;
  standards?: string[];
  learningObjective?: string;
  keyVocabulary?: Array<{ term: string; definition: string }>;
  materialsNeeded?: string[];
  phases?: Array<{
    type: string;
    name: string;
    duration: number;
    teacherScript: string;
    studentAction: string;
    differentiationNotes?: { support: string; extension: string };
  }>;
  formativeAssessment?: { type: string; question: string };
  status?: LessonStatus;
}

/**
 * Filter options for listing lesson plans
 */
export interface LessonPlanFilters {
  unitId?: string;
  status?: LessonStatus;
  startDate?: Date;
  endDate?: Date;
  topic?: string;
  standard?: string;
  includeArchived?: boolean;
}

/**
 * Hook state
 */
export interface UseLessonPlanState {
  lessonPlan: LessonPlan | null;
  lessonPlans: LessonPlan[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook return type
 */
export interface UseLessonPlanReturn extends UseLessonPlanState {
  /** Create a new lesson plan */
  create: (input: CreateLessonPlanInput) => Promise<LessonPlan | null>;
  /** Get a lesson plan by ID */
  get: (id: string) => Promise<LessonPlan | null>;
  /** Update a lesson plan */
  update: (id: string, input: UpdateLessonPlanInput) => Promise<LessonPlan | null>;
  /** Archive a lesson plan (soft delete) */
  archive: (id: string) => Promise<boolean>;
  /** Restore an archived lesson plan */
  restore: (id: string) => Promise<boolean>;
  /** Permanently delete a lesson plan */
  permanentDelete: (id: string) => Promise<boolean>;
  /** List lesson plans with optional filters */
  list: (filters?: LessonPlanFilters) => Promise<LessonPlan[]>;
  /** Clear current lesson plan */
  clear: () => void;
  /** Refresh the current lesson plan */
  refresh: () => Promise<void>;
}

/**
 * Convert database row to LessonPlan type
 */
function rowToLessonPlan(row: LessonPlanRow): LessonPlan {
  return {
    id: row.id,
    unitId: row.unit_id || undefined,
    date: new Date(row.date),
    topic: row.topic,
    gradeLevel: row.grade_level,
    subject: row.subject,
    duration: row.duration,
    standards: row.standards,
    learningObjective: row.learning_objective,
    keyVocabulary: row.key_vocabulary as Array<{ term: string; definition: string }>,
    materialsNeeded: row.materials_needed,
    phases: row.phases as LessonPlan['phases'],
    formativeAssessment: row.formative_assessment as LessonPlan['formativeAssessment'],
    status: row.status,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    createdBy: row.user_id,
  };
}

/**
 * Custom hook for lesson plan CRUD operations
 * Requirement 13.1: Handle CRUD with automatic timestamps
 */
export function useLessonPlan(initialId?: string): UseLessonPlanReturn {
  const [state, setState] = useState<UseLessonPlanState>({
    lessonPlan: null,
    lessonPlans: [],
    isLoading: false,
    error: null,
  });

  /**
   * Set loading state
   */
  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading, error: isLoading ? null : prev.error }));
  }, []);

  /**
   * Set error state
   */
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
  }, []);

  /**
   * Create a new lesson plan
   * Requirement 13.1: Persist with timestamp and user reference
   */
  const create = useCallback(async (input: CreateLessonPlanInput): Promise<LessonPlan | null> => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return null;
      }

      const insertData = {
        unit_id: input.unitId || null,
        user_id: user.id,
        date: input.date.toISOString().split('T')[0],
        topic: input.topic,
        grade_level: input.gradeLevel,
        subject: input.subject,
        duration: input.duration,
        standards: input.standards,
        learning_objective: input.learningObjective,
        key_vocabulary: input.keyVocabulary,
        materials_needed: input.materialsNeeded || [],
        phases: input.phases,
        formative_assessment: input.formativeAssessment,
        status: input.status || 'draft',
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('lesson_plans')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      const lessonPlan = rowToLessonPlan(data as LessonPlanRow);
      setState(prev => ({ 
        ...prev, 
        lessonPlan, 
        isLoading: false, 
        error: null 
      }));
      
      return lessonPlan;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create lesson plan';
      setError(message);
      return null;
    }
  }, [setLoading, setError]);

  /**
   * Get a lesson plan by ID
   */
  const get = useCallback(async (id: string): Promise<LessonPlan | null> => {
    setLoading(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('lesson_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const lessonPlan = rowToLessonPlan(data as LessonPlanRow);
      setState(prev => ({ 
        ...prev, 
        lessonPlan, 
        isLoading: false, 
        error: null 
      }));
      
      return lessonPlan;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get lesson plan';
      setError(message);
      return null;
    }
  }, [setLoading, setError]);

  /**
   * Update a lesson plan
   * Requirement 13.1: Automatic timestamp update via database trigger
   */
  const update = useCallback(async (
    id: string, 
    input: UpdateLessonPlanInput
  ): Promise<LessonPlan | null> => {
    setLoading(true);

    try {
      const updateData: Record<string, unknown> = {};
      
      if (input.topic !== undefined) updateData.topic = input.topic;
      if (input.date !== undefined) updateData.date = input.date.toISOString().split('T')[0];
      if (input.duration !== undefined) updateData.duration = input.duration;
      if (input.standards !== undefined) updateData.standards = input.standards;
      if (input.learningObjective !== undefined) updateData.learning_objective = input.learningObjective;
      if (input.keyVocabulary !== undefined) updateData.key_vocabulary = input.keyVocabulary;
      if (input.materialsNeeded !== undefined) updateData.materials_needed = input.materialsNeeded;
      if (input.phases !== undefined) updateData.phases = input.phases;
      if (input.formativeAssessment !== undefined) updateData.formative_assessment = input.formativeAssessment;
      if (input.status !== undefined) updateData.status = input.status;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('lesson_plans')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const lessonPlan = rowToLessonPlan(data as LessonPlanRow);
      setState(prev => ({ 
        ...prev, 
        lessonPlan, 
        isLoading: false, 
        error: null 
      }));
      
      return lessonPlan;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update lesson plan';
      setError(message);
      return null;
    }
  }, [setLoading, setError]);

  /**
   * Archive a lesson plan (soft delete)
   * Requirement 13.5: Archive instead of permanently delete
   */
  const archive = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('lesson_plans')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setState(prev => ({
        ...prev,
        lessonPlan: prev.lessonPlan?.id === id ? null : prev.lessonPlan,
        lessonPlans: prev.lessonPlans.filter(lp => lp.id !== id),
        isLoading: false,
        error: null,
      }));

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to archive lesson plan';
      setError(message);
      return false;
    }
  }, [setLoading, setError]);

  /**
   * Restore an archived lesson plan
   */
  const restore = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('lesson_plans')
        .update({ archived_at: null })
        .eq('id', id);

      if (error) throw error;

      setState(prev => ({ ...prev, isLoading: false, error: null }));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to restore lesson plan';
      setError(message);
      return false;
    }
  }, [setLoading, setError]);

  /**
   * Permanently delete a lesson plan
   */
  const permanentDelete = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('lesson_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        lessonPlan: prev.lessonPlan?.id === id ? null : prev.lessonPlan,
        lessonPlans: prev.lessonPlans.filter(lp => lp.id !== id),
        isLoading: false,
        error: null,
      }));

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete lesson plan';
      setError(message);
      return false;
    }
  }, [setLoading, setError]);

  /**
   * List lesson plans with optional filters
   * Requirement 13.4: Support searching by topic, standard, date range
   */
  const list = useCallback(async (filters?: LessonPlanFilters): Promise<LessonPlan[]> => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return [];
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from('lesson_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      // Apply filters
      if (filters) {
        if (filters.unitId) {
          query = query.eq('unit_id', filters.unitId);
        }
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.startDate) {
          query = query.gte('date', filters.startDate.toISOString().split('T')[0]);
        }
        if (filters.endDate) {
          query = query.lte('date', filters.endDate.toISOString().split('T')[0]);
        }
        if (filters.topic) {
          query = query.ilike('topic', `%${filters.topic}%`);
        }
        if (filters.standard) {
          query = query.contains('standards', [filters.standard]);
        }
        if (!filters.includeArchived) {
          query = query.is('archived_at', null);
        }
      } else {
        // Default: exclude archived
        query = query.is('archived_at', null);
      }

      const { data, error } = await query;

      if (error) throw error;

      const lessonPlans = ((data as LessonPlanRow[]) || []).map(rowToLessonPlan);
      setState(prev => ({ 
        ...prev, 
        lessonPlans, 
        isLoading: false, 
        error: null 
      }));
      
      return lessonPlans;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to list lesson plans';
      setError(message);
      return [];
    }
  }, [setLoading, setError]);

  /**
   * Clear current lesson plan
   */
  const clear = useCallback(() => {
    setState(prev => ({ ...prev, lessonPlan: null }));
  }, []);

  /**
   * Refresh the current lesson plan
   */
  const refresh = useCallback(async () => {
    if (state.lessonPlan?.id) {
      await get(state.lessonPlan.id);
    }
  }, [state.lessonPlan?.id, get]);

  // Load initial lesson plan if ID provided
  useEffect(() => {
    if (initialId) {
      get(initialId);
    }
  }, [initialId, get]);

  return {
    ...state,
    create,
    get,
    update,
    archive,
    restore,
    permanentDelete,
    list,
    clear,
    refresh,
  };
}

export default useLessonPlan;

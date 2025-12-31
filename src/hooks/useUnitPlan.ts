import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { UnitPlan, LessonOutline, SubSkill } from '@/lib/instructional/unit-plan';

/**
 * Unit plan input for creation
 */
export interface UnitPlanInput {
  title: string;
  gradeLevel: string;
  subject: string;
  topic: string;
  standards: string[];
  durationDays: number;
  startDate: Date;
}

/**
 * Unit plan state
 */
export interface UnitPlanState {
  unitPlans: UnitPlan[];
  currentUnitPlan: UnitPlan | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Return type for useUnitPlan hook
 */
export interface UseUnitPlanReturn {
  state: UnitPlanState;
  createUnitPlan: (input: UnitPlanInput) => Promise<UnitPlan | null>;
  updateUnitPlan: (id: string, updates: Partial<UnitPlanInput>) => Promise<UnitPlan | null>;
  deleteUnitPlan: (id: string) => Promise<boolean>;
  fetchUnitPlans: () => Promise<void>;
  fetchUnitPlanById: (id: string) => Promise<UnitPlan | null>;
  archiveUnitPlan: (id: string) => Promise<boolean>;
  clearError: () => void;
}

/**
 * Initial state
 */
const initialState: UnitPlanState = {
  unitPlans: [],
  currentUnitPlan: null,
  isLoading: false,
  error: null,
};

/**
 * Calculate end date from start date and duration (excluding weekends)
 */
function calculateEndDate(startDate: Date, durationDays: number): Date {
  const endDate = new Date(startDate);
  let daysAdded = 0;
  
  while (daysAdded < durationDays - 1) {
    endDate.setDate(endDate.getDate() + 1);
    const dayOfWeek = endDate.getDay();
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysAdded++;
    }
  }
  
  return endDate;
}

/**
 * Generate lesson outlines for a unit plan
 */
function generateLessonOutlines(
  startDate: Date,
  durationDays: number,
  topic: string
): LessonOutline[] {
  const outlines: LessonOutline[] = [];
  let currentDate = new Date(startDate);
  let dayNumber = 1;
  
  while (dayNumber <= durationDays) {
    const dayOfWeek = currentDate.getDay();
    
    // Skip weekends
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      outlines.push({
        dayNumber,
        date: new Date(currentDate),
        topic: `${topic} - Dia ${dayNumber}`,
        objective: `Objetivo do dia ${dayNumber}`,
        lessonPlanId: undefined,
      });
      dayNumber++;
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return outlines;
}

/**
 * Transform database row to UnitPlan type
 */
function transformDbToUnitPlan(row: any): UnitPlan {
  return {
    id: row.id,
    title: row.title,
    gradeLevel: row.grade_level,
    subject: row.subject,
    topic: row.topic,
    standards: row.standards || [],
    durationDays: row.duration_days,
    startDate: new Date(row.start_date),
    endDate: new Date(row.end_date),
    subSkills: (row.sub_skills || []) as SubSkill[],
    lessonOutlines: ((row.lesson_outlines || []) as any[]).map((lo: any) => ({
      ...lo,
      date: new Date(lo.date),
    })) as LessonOutline[],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    createdBy: row.user_id,
  };
}

/**
 * useUnitPlan Hook
 * 
 * Manages unit plan CRUD operations with Supabase.
 * Tracks modification timestamps for Requirement 2.7.
 * 
 * Requirements: 2.7
 */
export function useUnitPlan(): UseUnitPlanReturn {
  const [state, setState] = useState<UnitPlanState>(initialState);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Fetch all unit plans for the current user
   */
  const fetchUnitPlans = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Não autenticado. Por favor, faça login novamente.');
      }

      const { data, error } = await supabase
        .from('unit_plans')
        .select('*')
        .is('archived_at', null)
        .order('start_date', { ascending: false });

      if (error) throw error;

      const unitPlans = (data || []).map(transformDbToUnitPlan);

      setState(prev => ({
        ...prev,
        unitPlans,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar planos de unidade';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, []);

  /**
   * Fetch a single unit plan by ID
   */
  const fetchUnitPlanById = useCallback(async (id: string): Promise<UnitPlan | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('unit_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const unitPlan = transformDbToUnitPlan(data);

      setState(prev => ({
        ...prev,
        currentUnitPlan: unitPlan,
        isLoading: false,
      }));

      return unitPlan;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar plano de unidade';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  /**
   * Create a new unit plan
   * Requirement 2.7: Preserve unit identifier and update timestamp
   */
  const createUnitPlan = useCallback(async (input: UnitPlanInput): Promise<UnitPlan | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Não autenticado. Por favor, faça login novamente.');
      }

      const endDate = calculateEndDate(input.startDate, input.durationDays);
      const lessonOutlines = generateLessonOutlines(
        input.startDate,
        input.durationDays,
        input.topic
      );

      // Serialize dates for JSON storage
      const serializedOutlines = lessonOutlines.map(lo => ({
        ...lo,
        date: lo.date.toISOString(),
      }));

      const { data, error } = await supabase
        .from('unit_plans')
        .insert({
          user_id: session.user.id,
          title: input.title,
          grade_level: input.gradeLevel,
          subject: input.subject,
          topic: input.topic,
          standards: input.standards,
          duration_days: input.durationDays,
          start_date: input.startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          sub_skills: [],
          lesson_outlines: serializedOutlines,
        })
        .select()
        .single();

      if (error) throw error;

      const unitPlan = transformDbToUnitPlan(data);

      setState(prev => ({
        ...prev,
        unitPlans: [unitPlan, ...prev.unitPlans],
        currentUnitPlan: unitPlan,
        isLoading: false,
      }));

      return unitPlan;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar plano de unidade';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  /**
   * Update an existing unit plan
   * Requirement 2.7: Preserve unit identifier and update timestamp
   */
  const updateUnitPlan = useCallback(async (
    id: string,
    updates: Partial<UnitPlanInput>
  ): Promise<UnitPlan | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Build update object with snake_case keys
      const updateData: Record<string, any> = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.gradeLevel !== undefined) updateData.grade_level = updates.gradeLevel;
      if (updates.subject !== undefined) updateData.subject = updates.subject;
      if (updates.topic !== undefined) updateData.topic = updates.topic;
      if (updates.standards !== undefined) updateData.standards = updates.standards;
      
      // If duration or start date changes, recalculate end date and lesson outlines
      if (updates.durationDays !== undefined || updates.startDate !== undefined) {
        // Fetch current unit plan to get existing values
        const { data: current, error: fetchError } = await supabase
          .from('unit_plans')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        const startDate = updates.startDate || new Date(current.start_date);
        const durationDays = updates.durationDays || current.duration_days;
        const topic = updates.topic || current.topic;

        const endDate = calculateEndDate(startDate, durationDays);
        const lessonOutlines = generateLessonOutlines(startDate, durationDays, topic);

        updateData.duration_days = durationDays;
        updateData.start_date = startDate.toISOString().split('T')[0];
        updateData.end_date = endDate.toISOString().split('T')[0];
        updateData.lesson_outlines = lessonOutlines.map(lo => ({
          ...lo,
          date: lo.date.toISOString(),
        }));
      }

      // updated_at is handled by database trigger
      const { data, error } = await supabase
        .from('unit_plans')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const unitPlan = transformDbToUnitPlan(data);

      setState(prev => ({
        ...prev,
        unitPlans: prev.unitPlans.map(up => up.id === id ? unitPlan : up),
        currentUnitPlan: prev.currentUnitPlan?.id === id ? unitPlan : prev.currentUnitPlan,
        isLoading: false,
      }));

      return unitPlan;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar plano de unidade';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  /**
   * Archive a unit plan (soft delete)
   * Requirement 13.5: Archive rather than permanently delete
   */
  const archiveUnitPlan = useCallback(async (id: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { error } = await supabase
        .from('unit_plans')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        unitPlans: prev.unitPlans.filter(up => up.id !== id),
        currentUnitPlan: prev.currentUnitPlan?.id === id ? null : prev.currentUnitPlan,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao arquivar plano de unidade';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  /**
   * Permanently delete a unit plan
   */
  const deleteUnitPlan = useCallback(async (id: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { error } = await supabase
        .from('unit_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        unitPlans: prev.unitPlans.filter(up => up.id !== id),
        currentUnitPlan: prev.currentUnitPlan?.id === id ? null : prev.currentUnitPlan,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir plano de unidade';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  return {
    state,
    createUnitPlan,
    updateUnitPlan,
    deleteUnitPlan,
    fetchUnitPlans,
    fetchUnitPlanById,
    archiveUnitPlan,
    clearError,
  };
}

export default useUnitPlan;

/**
 * useLessonWithActivities Hook
 * 
 * Fetches a lesson plan with all associated activities (quizzes, worksheets, readings, slides).
 * 
 * Requirements:
 * - 13.3: Return the complete plan with all associated activities
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { LessonPlan } from '@/lib/instructional/lesson-plan';
import type { Quiz } from '@/lib/instructional/quiz';
import type { Worksheet } from '@/lib/instructional/worksheet';
import type { LeveledReading } from '@/lib/instructional/leveled-reading';
import type { SlideOutline } from '@/lib/instructional/slide-outline';

/**
 * Activity types
 */
export type ActivityType = 'quiz' | 'worksheet' | 'reading' | 'slides';

/**
 * Generated activity from database
 */
export interface GeneratedActivity {
  id: string;
  lessonPlanId: string;
  type: ActivityType;
  title: string;
  content: Quiz | Worksheet | LeveledReading | SlideOutline;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Database row types
 */
interface LessonPlanRow {
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
  status: 'draft' | 'planned' | 'in-progress' | 'completed';
  version: number;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

interface ActivityRow {
  id: string;
  lesson_plan_id: string;
  user_id: string;
  type: ActivityType;
  title: string;
  content: unknown;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

/**
 * Lesson plan with all associated activities
 */
export interface LessonWithActivities {
  lessonPlan: LessonPlan;
  activities: {
    quizzes: GeneratedActivity[];
    worksheets: GeneratedActivity[];
    readings: GeneratedActivity[];
    slides: GeneratedActivity[];
  };
  totalActivities: number;
}

/**
 * Hook state
 */
export interface UseLessonWithActivitiesState {
  data: LessonWithActivities | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook return type
 */
export interface UseLessonWithActivitiesReturn extends UseLessonWithActivitiesState {
  /** Fetch lesson with activities */
  fetch: (lessonPlanId: string) => Promise<LessonWithActivities | null>;
  /** Refresh current data */
  refresh: () => Promise<void>;
  /** Clear current data */
  clear: () => void;
  /** Add an activity to the current lesson */
  addActivity: (activity: Omit<GeneratedActivity, 'id' | 'createdAt' | 'updatedAt'>) => Promise<GeneratedActivity | null>;
  /** Remove an activity */
  removeActivity: (activityId: string) => Promise<boolean>;
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
    keyVocabulary: row.key_vocabulary as LessonPlan['keyVocabulary'],
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
 * Convert database row to GeneratedActivity type
 */
function rowToActivity(row: ActivityRow): GeneratedActivity {
  return {
    id: row.id,
    lessonPlanId: row.lesson_plan_id,
    type: row.type,
    title: row.title,
    content: row.content as GeneratedActivity['content'],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Custom hook for fetching lesson plans with all associated activities
 * Requirement 13.3: Return complete plan with all associated activities
 */
export function useLessonWithActivities(initialLessonPlanId?: string): UseLessonWithActivitiesReturn {
  const [state, setState] = useState<UseLessonWithActivitiesState>({
    data: null,
    isLoading: false,
    error: null,
  });

  const [currentLessonPlanId, setCurrentLessonPlanId] = useState<string | undefined>(initialLessonPlanId);

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
   * Fetch lesson plan with all associated activities
   * Requirement 13.3: Return complete plan with all associated activities
   */
  const fetch = useCallback(async (lessonPlanId: string): Promise<LessonWithActivities | null> => {
    setLoading(true);
    setCurrentLessonPlanId(lessonPlanId);

    try {
      // Fetch lesson plan
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: lessonData, error: lessonError } = await (supabase as any)
        .from('lesson_plans')
        .select('*')
        .eq('id', lessonPlanId)
        .single();

      if (lessonError) throw lessonError;
      if (!lessonData) throw new Error('Lesson plan not found');

      const lessonPlan = rowToLessonPlan(lessonData as LessonPlanRow);

      // Fetch all associated activities
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: activitiesData, error: activitiesError } = await (supabase as any)
        .from('generated_activities')
        .select('*')
        .eq('lesson_plan_id', lessonPlanId)
        .is('archived_at', null)
        .order('created_at', { ascending: false });

      if (activitiesError) {
        // If table doesn't exist yet, just return empty activities
        if (activitiesError.code === '42P01') {
          console.log('generated_activities table not yet created');
        } else {
          throw activitiesError;
        }
      }

      const activities = ((activitiesData as ActivityRow[]) || []).map(rowToActivity);

      // Group activities by type
      const groupedActivities = {
        quizzes: activities.filter(a => a.type === 'quiz'),
        worksheets: activities.filter(a => a.type === 'worksheet'),
        readings: activities.filter(a => a.type === 'reading'),
        slides: activities.filter(a => a.type === 'slides'),
      };

      const result: LessonWithActivities = {
        lessonPlan,
        activities: groupedActivities,
        totalActivities: activities.length,
      };

      setState({
        data: result,
        isLoading: false,
        error: null,
      });

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch lesson with activities';
      setError(message);
      return null;
    }
  }, [setLoading, setError]);

  /**
   * Refresh current data
   */
  const refresh = useCallback(async () => {
    if (currentLessonPlanId) {
      await fetch(currentLessonPlanId);
    }
  }, [currentLessonPlanId, fetch]);

  /**
   * Clear current data
   */
  const clear = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
    });
    setCurrentLessonPlanId(undefined);
  }, []);

  /**
   * Add an activity to the current lesson
   */
  const addActivity = useCallback(async (
    activity: Omit<GeneratedActivity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<GeneratedActivity | null> => {
    if (!currentLessonPlanId) {
      setError('No lesson plan loaded');
      return null;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return null;
      }

      const insertData = {
        lesson_plan_id: activity.lessonPlanId,
        user_id: user.id,
        type: activity.type,
        title: activity.title,
        content: activity.content,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('generated_activities')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      const newActivity = rowToActivity(data as ActivityRow);

      // Update local state
      setState(prev => {
        if (!prev.data) return prev;

        const typeKey = `${activity.type}${activity.type === 'quiz' ? 'zes' : 's'}` as keyof typeof prev.data.activities;
        
        return {
          ...prev,
          data: {
            ...prev.data,
            activities: {
              ...prev.data.activities,
              [typeKey]: [newActivity, ...prev.data.activities[typeKey]],
            },
            totalActivities: prev.data.totalActivities + 1,
          },
        };
      });

      return newActivity;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add activity';
      setError(message);
      return null;
    }
  }, [currentLessonPlanId, setError]);

  /**
   * Remove an activity (soft delete)
   */
  const removeActivity = useCallback(async (activityId: string): Promise<boolean> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('generated_activities')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', activityId);

      if (error) throw error;

      // Update local state
      setState(prev => {
        if (!prev.data) return prev;

        const removeFromArray = (arr: GeneratedActivity[]) => 
          arr.filter(a => a.id !== activityId);

        return {
          ...prev,
          data: {
            ...prev.data,
            activities: {
              quizzes: removeFromArray(prev.data.activities.quizzes),
              worksheets: removeFromArray(prev.data.activities.worksheets),
              readings: removeFromArray(prev.data.activities.readings),
              slides: removeFromArray(prev.data.activities.slides),
            },
            totalActivities: prev.data.totalActivities - 1,
          },
        };
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove activity';
      setError(message);
      return false;
    }
  }, [setError]);

  // Load initial lesson plan if ID provided
  useEffect(() => {
    if (initialLessonPlanId) {
      fetch(initialLessonPlanId);
    }
  }, [initialLessonPlanId, fetch]);

  return {
    ...state,
    fetch,
    refresh,
    clear,
    addActivity,
    removeActivity,
  };
}

export default useLessonWithActivities;

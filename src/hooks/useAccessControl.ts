import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import {
  canViewExam,
  canUpdateExam,
  canViewSubmission,
  canCreateSubmission,
  canViewResult,
  type UserContext,
  type ExamAccessContext,
  type SubmissionAccessContext,
  type ResultAccessContext,
} from '@/lib/assessment/access-control';

type AppRole = Database['public']['Enums']['app_role'];

/**
 * Access control state
 */
export interface AccessControlState {
  /** Whether the user context is loading */
  isLoading: boolean;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Current user context */
  userContext: UserContext | null;
  /** Error message if any */
  error: string | null;
}

/**
 * Access check result
 */
export interface AccessCheckResult {
  /** Whether access is allowed */
  allowed: boolean;
  /** Reason for denial if not allowed */
  reason?: string;
}

/**
 * Return type for useAccessControl hook
 */
export interface UseAccessControlReturn {
  /** Current access control state */
  state: AccessControlState;
  /** Check if user can view an exam */
  checkExamViewAccess: (exam: ExamAccessContext) => AccessCheckResult;
  /** Check if user can update an exam */
  checkExamUpdateAccess: (exam: ExamAccessContext) => AccessCheckResult;
  /** Check if user can view a submission */
  checkSubmissionViewAccess: (submission: SubmissionAccessContext) => AccessCheckResult;
  /** Check if user can create a submission */
  checkSubmissionCreateAccess: (submission: SubmissionAccessContext) => AccessCheckResult;
  /** Check if user can view a result */
  checkResultViewAccess: (result: ResultAccessContext) => AccessCheckResult;
  /** Check if user has educator role (teacher or school_admin) */
  isEducator: () => boolean;
  /** Check if user is school admin */
  isSchoolAdmin: () => boolean;
  /** Refresh user context */
  refreshUserContext: () => Promise<void>;
}

/**
 * Initial access control state
 */
const initialState: AccessControlState = {
  isLoading: true,
  isAuthenticated: false,
  userContext: null,
  error: null,
};

/**
 * Educator roles that can access grading features
 * Requirements: 7.1 - Verify educator role before showing grading features
 */
const EDUCATOR_ROLES: AppRole[] = ['teacher', 'school_admin', 'district_admin', 'super_admin'];

/**
 * useAccessControl Hook
 * 
 * Provides access control utilities for grading components.
 * Uses existing access control functions from src/lib/assessment/access-control.ts.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */
export function useAccessControl(): UseAccessControlReturn {
  const [state, setState] = useState<AccessControlState>(initialState);

  /**
   * Fetch user context from Supabase
   */
  const fetchUserContext = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(sessionError.message);
      }

      if (!session?.user) {
        setState({
          isLoading: false,
          isAuthenticated: false,
          userContext: null,
          error: null,
        });
        return;
      }

      const userId = session.user.id;

      // Fetch user profile for school_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is okay for new users
        console.warn('Error fetching profile:', profileError);
      }

      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) {
        console.warn('Error fetching roles:', rolesError);
      }

      const roles: AppRole[] = userRoles?.map(r => r.role) || [];

      const userContext: UserContext = {
        userId,
        schoolId: profile?.school_id || null,
        roles,
      };

      setState({
        isLoading: false,
        isAuthenticated: true,
        userContext,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user context';
      setState({
        isLoading: false,
        isAuthenticated: false,
        userContext: null,
        error: errorMessage,
      });
    }
  }, []);

  /**
   * Refresh user context
   */
  const refreshUserContext = useCallback(async () => {
    await fetchUserContext();
  }, [fetchUserContext]);

  // Fetch user context on mount and auth state changes
  useEffect(() => {
    fetchUserContext();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserContext();
      } else {
        setState({
          isLoading: false,
          isAuthenticated: false,
          userContext: null,
          error: null,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserContext]);

  /**
   * Check if user has educator role
   * Requirements: 7.1 - Verify educator role before showing grading features
   */
  const isEducator = useCallback((): boolean => {
    if (!state.userContext) return false;
    return state.userContext.roles.some(role => EDUCATOR_ROLES.includes(role));
  }, [state.userContext]);

  /**
   * Check if user is school admin
   */
  const isSchoolAdmin = useCallback((): boolean => {
    if (!state.userContext) return false;
    return state.userContext.roles.includes('school_admin');
  }, [state.userContext]);

  /**
   * Check if user can view an exam
   * Requirements: 7.2 - Verify exam ownership before grading
   */
  const checkExamViewAccess = useCallback((exam: ExamAccessContext): AccessCheckResult => {
    if (!state.userContext) {
      return { allowed: false, reason: 'Usuário não autenticado' };
    }

    if (!isEducator()) {
      return { allowed: false, reason: 'Acesso restrito a educadores' };
    }

    const allowed = canViewExam(state.userContext, exam);
    if (!allowed) {
      return { allowed: false, reason: 'Você não tem permissão para visualizar esta prova' };
    }

    return { allowed: true };
  }, [state.userContext, isEducator]);

  /**
   * Check if user can update an exam
   * Requirements: 7.2 - Verify exam ownership before grading
   */
  const checkExamUpdateAccess = useCallback((exam: ExamAccessContext): AccessCheckResult => {
    if (!state.userContext) {
      return { allowed: false, reason: 'Usuário não autenticado' };
    }

    if (!isEducator()) {
      return { allowed: false, reason: 'Acesso restrito a educadores' };
    }

    const allowed = canUpdateExam(state.userContext, exam);
    if (!allowed) {
      return { allowed: false, reason: 'Você não tem permissão para editar esta prova' };
    }

    return { allowed: true };
  }, [state.userContext, isEducator]);

  /**
   * Check if user can view a submission
   */
  const checkSubmissionViewAccess = useCallback((submission: SubmissionAccessContext): AccessCheckResult => {
    if (!state.userContext) {
      return { allowed: false, reason: 'Usuário não autenticado' };
    }

    const allowed = canViewSubmission(state.userContext, submission);
    if (!allowed) {
      return { allowed: false, reason: 'Você não tem permissão para visualizar esta submissão' };
    }

    return { allowed: true };
  }, [state.userContext]);

  /**
   * Check if user can create a submission
   */
  const checkSubmissionCreateAccess = useCallback((submission: SubmissionAccessContext): AccessCheckResult => {
    if (!state.userContext) {
      return { allowed: false, reason: 'Usuário não autenticado' };
    }

    if (!isEducator()) {
      return { allowed: false, reason: 'Acesso restrito a educadores' };
    }

    const allowed = canCreateSubmission(state.userContext, submission);
    if (!allowed) {
      return { allowed: false, reason: 'Você não tem permissão para criar submissões nesta prova' };
    }

    return { allowed: true };
  }, [state.userContext, isEducator]);

  /**
   * Check if user can view a result
   * Requirements: 7.3 - Students can only view their own results
   */
  const checkResultViewAccess = useCallback((result: ResultAccessContext): AccessCheckResult => {
    if (!state.userContext) {
      return { allowed: false, reason: 'Usuário não autenticado' };
    }

    const allowed = canViewResult(state.userContext, result);
    if (!allowed) {
      return { allowed: false, reason: 'Você não tem permissão para visualizar este resultado' };
    }

    return { allowed: true };
  }, [state.userContext]);

  return {
    state,
    checkExamViewAccess,
    checkExamUpdateAccess,
    checkSubmissionViewAccess,
    checkSubmissionCreateAccess,
    checkResultViewAccess,
    isEducator,
    isSchoolAdmin,
    refreshUserContext,
  };
}

export default useAccessControl;

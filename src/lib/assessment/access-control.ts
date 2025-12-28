/**
 * Access Control Module for Automated Assessment
 * 
 * This module provides utilities for verifying and enforcing access control
 * for the assessment feature. It documents the expected RLS behavior and
 * provides application-level access control checks.
 * 
 * RLS Policies Summary:
 * 
 * EXAMS TABLE:
 * - Educators can create exams in their school (educator_id = auth.uid(), school_id matches)
 * - Educators can view/update/delete their own exams (educator_id = auth.uid())
 * - School admins can view all exams in their school (has_role('school_admin') AND school_id matches)
 * 
 * SUBMISSIONS TABLE:
 * - Educators can create/view/update/delete submissions for their exams
 * - School admins can view submissions for exams in their school
 * 
 * RESULTS TABLE:
 * - Educators can create/view/update results for their exam submissions
 * - School admins can view results for exams in their school
 * - Public (anon) can verify results by verification_token
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export interface UserContext {
  userId: string;
  schoolId: string | null;
  roles: AppRole[];
}

export interface ExamAccessContext {
  examId: string;
  educatorId: string;
  schoolId: string;
}

export interface SubmissionAccessContext {
  submissionId: string;
  examId: string;
  examEducatorId: string;
  examSchoolId: string;
}

export interface ResultAccessContext {
  resultId: string;
  verificationToken: string;
  submissionId: string;
  examEducatorId: string;
  examSchoolId: string;
}

/**
 * Check if a user can view an exam based on RLS policies
 * 
 * Rules:
 * - Educators can view their own exams (educator_id = user.userId)
 * - School admins can view all exams in their school (school_id = user.schoolId)
 * 
 * @param user - The user context
 * @param exam - The exam access context
 * @returns true if the user can view the exam
 */
export function canViewExam(user: UserContext, exam: ExamAccessContext): boolean {
  // Educators can view their own exams
  if (exam.educatorId === user.userId) {
    return true;
  }
  
  // School admins can view all exams in their school
  if (user.roles.includes('school_admin') && exam.schoolId === user.schoolId) {
    return true;
  }
  
  return false;
}

/**
 * Check if a user can create an exam based on RLS policies
 * 
 * Rules:
 * - User must be the educator (educator_id = user.userId)
 * - Exam must be in user's school (school_id = user.schoolId)
 * 
 * @param user - The user context
 * @param exam - The exam access context
 * @returns true if the user can create the exam
 */
export function canCreateExam(user: UserContext, exam: ExamAccessContext): boolean {
  return exam.educatorId === user.userId && exam.schoolId === user.schoolId;
}

/**
 * Check if a user can update an exam based on RLS policies
 * 
 * Rules:
 * - Only the educator who created the exam can update it
 * 
 * @param user - The user context
 * @param exam - The exam access context
 * @returns true if the user can update the exam
 */
export function canUpdateExam(user: UserContext, exam: ExamAccessContext): boolean {
  return exam.educatorId === user.userId;
}

/**
 * Check if a user can delete an exam based on RLS policies
 * 
 * Rules:
 * - Only the educator who created the exam can delete it
 * 
 * @param user - The user context
 * @param exam - The exam access context
 * @returns true if the user can delete the exam
 */
export function canDeleteExam(user: UserContext, exam: ExamAccessContext): boolean {
  return exam.educatorId === user.userId;
}

/**
 * Check if a user can view a submission based on RLS policies
 * 
 * Rules:
 * - Educators can view submissions for their exams
 * - School admins can view submissions for exams in their school
 * 
 * @param user - The user context
 * @param submission - The submission access context
 * @returns true if the user can view the submission
 */
export function canViewSubmission(user: UserContext, submission: SubmissionAccessContext): boolean {
  // Educators can view submissions for their exams
  if (submission.examEducatorId === user.userId) {
    return true;
  }
  
  // School admins can view submissions for exams in their school
  if (user.roles.includes('school_admin') && submission.examSchoolId === user.schoolId) {
    return true;
  }
  
  return false;
}

/**
 * Check if a user can create a submission based on RLS policies
 * 
 * Rules:
 * - Only the educator who owns the exam can create submissions
 * 
 * @param user - The user context
 * @param submission - The submission access context
 * @returns true if the user can create the submission
 */
export function canCreateSubmission(user: UserContext, submission: SubmissionAccessContext): boolean {
  return submission.examEducatorId === user.userId;
}

/**
 * Check if a user can view a result based on RLS policies
 * 
 * Rules:
 * - Educators can view results for their exam submissions
 * - School admins can view results for exams in their school
 * - Anyone can verify results by verification_token (handled separately)
 * 
 * @param user - The user context
 * @param result - The result access context
 * @returns true if the user can view the result
 */
export function canViewResult(user: UserContext, result: ResultAccessContext): boolean {
  // Educators can view results for their exam submissions
  if (result.examEducatorId === user.userId) {
    return true;
  }
  
  // School admins can view results for exams in their school
  if (user.roles.includes('school_admin') && result.examSchoolId === user.schoolId) {
    return true;
  }
  
  return false;
}

/**
 * Filter a list of exams to only include those the user can access
 * 
 * @param user - The user context
 * @param exams - List of exam access contexts
 * @returns Filtered list of exams the user can view
 */
export function filterAccessibleExams(
  user: UserContext,
  exams: ExamAccessContext[]
): ExamAccessContext[] {
  return exams.filter(exam => canViewExam(user, exam));
}

/**
 * Filter a list of submissions to only include those the user can access
 * 
 * @param user - The user context
 * @param submissions - List of submission access contexts
 * @returns Filtered list of submissions the user can view
 */
export function filterAccessibleSubmissions(
  user: UserContext,
  submissions: SubmissionAccessContext[]
): SubmissionAccessContext[] {
  return submissions.filter(submission => canViewSubmission(user, submission));
}

/**
 * Filter a list of results to only include those the user can access
 * 
 * @param user - The user context
 * @param results - List of result access contexts
 * @returns Filtered list of results the user can view
 */
export function filterAccessibleResults(
  user: UserContext,
  results: ResultAccessContext[]
): ResultAccessContext[] {
  return results.filter(result => canViewResult(user, result));
}

/**
 * Verify that access control returns only authorized data
 * This is a helper for testing Property 13
 * 
 * @param user - The user context
 * @param allExams - All exams in the system
 * @returns Object with authorized and unauthorized exam lists
 */
export function categorizeExamAccess(
  user: UserContext,
  allExams: ExamAccessContext[]
): { authorized: ExamAccessContext[]; unauthorized: ExamAccessContext[] } {
  const authorized: ExamAccessContext[] = [];
  const unauthorized: ExamAccessContext[] = [];
  
  for (const exam of allExams) {
    if (canViewExam(user, exam)) {
      authorized.push(exam);
    } else {
      unauthorized.push(exam);
    }
  }
  
  return { authorized, unauthorized };
}

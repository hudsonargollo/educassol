import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Loader2, LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccessControl, type AccessCheckResult } from '@/hooks/useAccessControl';
import type { ExamAccessContext, SubmissionAccessContext } from '@/lib/assessment/access-control';
import { EDUCASSOL_COLORS } from '@/lib/colors';
import { FADE_UP_ITEM } from '@/lib/motion';

/**
 * Props for AccessControlGuard component
 */
export interface AccessControlGuardProps {
  /** Children to render if access is granted */
  children: ReactNode;
  /** Require educator role */
  requireEducator?: boolean;
  /** Exam context for exam-level access checks */
  examContext?: ExamAccessContext;
  /** Submission context for submission-level access checks */
  submissionContext?: SubmissionAccessContext;
  /** Access type to check */
  accessType?: 'view' | 'update' | 'create';
  /** Custom loading component */
  loadingComponent?: ReactNode;
  /** Custom access denied component */
  accessDeniedComponent?: ReactNode;
  /** Callback when access is denied */
  onAccessDenied?: (reason: string) => void;
  /** Callback to navigate to login */
  onLoginRequired?: () => void;
  /** Optional class name */
  className?: string;
}

/**
 * Default loading skeleton
 */
function DefaultLoadingSkeleton() {
  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Default access denied component
 */
function DefaultAccessDenied({ 
  reason, 
  isAuthenticated,
  onLoginRequired 
}: { 
  reason: string; 
  isAuthenticated: boolean;
  onLoginRequired?: () => void;
}) {
  return (
    <motion.div
      variants={FADE_UP_ITEM}
      initial="hidden"
      animate="show"
    >
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center pb-2">
          <div 
            className="mx-auto rounded-full p-3 mb-2"
            style={{ backgroundColor: `${EDUCASSOL_COLORS.error}15` }}
          >
            <ShieldAlert 
              className="h-8 w-8" 
              style={{ color: EDUCASSOL_COLORS.error }}
              aria-hidden="true"
            />
          </div>
          <CardTitle className="text-lg">Acesso Negado</CardTitle>
          <CardDescription>{reason}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {!isAuthenticated && onLoginRequired && (
            <Button onClick={onLoginRequired} className="mt-2">
              <LogIn className="h-4 w-4 mr-2" aria-hidden="true" />
              Fazer Login
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * AccessControlGuard Component
 * 
 * Wraps grading components to enforce access control based on user roles
 * and resource ownership. Uses the useAccessControl hook and existing
 * access control functions from src/lib/assessment/access-control.ts.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4
 * - 7.1: Verify educator role before showing grading features
 * - 7.2: Verify exam ownership before grading
 * - 7.3: Students can only view their own results
 * - 7.4: Log unauthorized access attempts and return access denied error
 */
export function AccessControlGuard({
  children,
  requireEducator = false,
  examContext,
  submissionContext,
  accessType = 'view',
  loadingComponent,
  accessDeniedComponent,
  onAccessDenied,
  onLoginRequired,
  className,
}: AccessControlGuardProps) {
  const {
    state,
    isEducator,
    checkExamViewAccess,
    checkExamUpdateAccess,
    checkSubmissionViewAccess,
    checkSubmissionCreateAccess,
  } = useAccessControl();

  // Show loading state
  if (state.isLoading) {
    return (
      <div className={className} role="status" aria-label="Verificando permissões">
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin mr-2" style={{ color: EDUCASSOL_COLORS.primary }} />
          <span className="text-sm text-muted-foreground">Verificando permissões...</span>
        </div>
        {loadingComponent || <DefaultLoadingSkeleton />}
      </div>
    );
  }

  // Check authentication
  if (!state.isAuthenticated) {
    const reason = 'Você precisa estar autenticado para acessar este recurso';
    onAccessDenied?.(reason);
    
    // Log unauthorized access attempt (Requirement 7.4)
    console.warn('[AccessControl] Unauthorized access attempt: User not authenticated');
    
    return (
      <div className={className}>
        {accessDeniedComponent || (
          <DefaultAccessDenied 
            reason={reason} 
            isAuthenticated={false}
            onLoginRequired={onLoginRequired}
          />
        )}
      </div>
    );
  }

  // Check educator role if required (Requirement 7.1)
  if (requireEducator && !isEducator()) {
    const reason = 'Acesso restrito a educadores';
    onAccessDenied?.(reason);
    
    // Log unauthorized access attempt (Requirement 7.4)
    console.warn('[AccessControl] Unauthorized access attempt: User is not an educator', {
      userId: state.userContext?.userId,
      roles: state.userContext?.roles,
    });
    
    return (
      <div className={className}>
        {accessDeniedComponent || (
          <DefaultAccessDenied 
            reason={reason} 
            isAuthenticated={true}
          />
        )}
      </div>
    );
  }

  // Check exam-level access (Requirement 7.2)
  if (examContext) {
    let accessResult: AccessCheckResult;
    
    if (accessType === 'update') {
      accessResult = checkExamUpdateAccess(examContext);
    } else {
      accessResult = checkExamViewAccess(examContext);
    }

    if (!accessResult.allowed) {
      const reason = accessResult.reason || 'Acesso negado';
      onAccessDenied?.(reason);
      
      // Log unauthorized access attempt (Requirement 7.4)
      console.warn('[AccessControl] Unauthorized exam access attempt', {
        userId: state.userContext?.userId,
        examId: examContext.examId,
        accessType,
        reason,
      });
      
      return (
        <div className={className}>
          {accessDeniedComponent || (
            <DefaultAccessDenied 
              reason={reason} 
              isAuthenticated={true}
            />
          )}
        </div>
      );
    }
  }

  // Check submission-level access
  if (submissionContext) {
    let accessResult: AccessCheckResult;
    
    if (accessType === 'create') {
      accessResult = checkSubmissionCreateAccess(submissionContext);
    } else {
      accessResult = checkSubmissionViewAccess(submissionContext);
    }

    if (!accessResult.allowed) {
      const reason = accessResult.reason || 'Acesso negado';
      onAccessDenied?.(reason);
      
      // Log unauthorized access attempt (Requirement 7.4)
      console.warn('[AccessControl] Unauthorized submission access attempt', {
        userId: state.userContext?.userId,
        submissionId: submissionContext.submissionId,
        accessType,
        reason,
      });
      
      return (
        <div className={className}>
          {accessDeniedComponent || (
            <DefaultAccessDenied 
              reason={reason} 
              isAuthenticated={true}
            />
          )}
        </div>
      );
    }
  }

  // Access granted - render children
  return <>{children}</>;
}

export default AccessControlGuard;

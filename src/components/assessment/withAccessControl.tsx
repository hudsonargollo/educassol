import { ComponentType, ReactNode } from 'react';
import { AccessControlGuard, type AccessControlGuardProps } from './AccessControlGuard';
import type { ExamAccessContext, SubmissionAccessContext } from '@/lib/assessment/access-control';

/**
 * Options for withAccessControl HOC
 */
export interface WithAccessControlOptions {
  /** Require educator role */
  requireEducator?: boolean;
  /** Access type to check */
  accessType?: 'view' | 'update' | 'create';
  /** Custom loading component */
  loadingComponent?: ReactNode;
  /** Custom access denied component */
  accessDeniedComponent?: ReactNode;
}

/**
 * Props that will be injected by the HOC
 */
export interface AccessControlInjectedProps {
  /** Exam context for access checks (optional, can be passed at render time) */
  examContext?: ExamAccessContext;
  /** Submission context for access checks (optional, can be passed at render time) */
  submissionContext?: SubmissionAccessContext;
  /** Callback when access is denied */
  onAccessDenied?: (reason: string) => void;
  /** Callback to navigate to login */
  onLoginRequired?: () => void;
}

/**
 * Higher-Order Component for wrapping components with access control
 * 
 * Usage:
 * ```tsx
 * const ProtectedComponent = withAccessControl(MyComponent, {
 *   requireEducator: true,
 *   accessType: 'update',
 * });
 * 
 * // Then use it:
 * <ProtectedComponent 
 *   examContext={{ examId: '123', educatorId: 'abc', schoolId: 'xyz' }}
 *   {...otherProps}
 * />
 * ```
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */
export function withAccessControl<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAccessControlOptions = {}
) {
  const {
    requireEducator = false,
    accessType = 'view',
    loadingComponent,
    accessDeniedComponent,
  } = options;

  // Create the wrapped component
  function WithAccessControlComponent(
    props: P & AccessControlInjectedProps
  ) {
    const {
      examContext,
      submissionContext,
      onAccessDenied,
      onLoginRequired,
      ...restProps
    } = props;

    return (
      <AccessControlGuard
        requireEducator={requireEducator}
        examContext={examContext}
        submissionContext={submissionContext}
        accessType={accessType}
        loadingComponent={loadingComponent}
        accessDeniedComponent={accessDeniedComponent}
        onAccessDenied={onAccessDenied}
        onLoginRequired={onLoginRequired}
      >
        <WrappedComponent {...(restProps as P)} />
      </AccessControlGuard>
    );
  }

  // Set display name for debugging
  const wrappedName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithAccessControlComponent.displayName = `withAccessControl(${wrappedName})`;

  return WithAccessControlComponent;
}

export default withAccessControl;

/**
 * GenerationWithUpgrade Component
 * 
 * A wrapper component that integrates the UpgradeModal with generation functionality.
 * Automatically displays the upgrade modal when a 402 limit exceeded response is received.
 * 
 * Requirements: 4.1, 2.5
 */

import { ReactNode } from 'react';
import { UpgradeModal } from './UpgradeModal';
import type { LimitExceededInfo } from '@/hooks/useGeneration';

/**
 * Props for the GenerationWithUpgrade component
 */
export interface GenerationWithUpgradeProps {
  children: ReactNode;
  limitExceeded: LimitExceededInfo | null;
  onDismiss: () => void;
}

/**
 * GenerationWithUpgrade Component
 * 
 * Wraps children and displays the UpgradeModal when limit is exceeded.
 * 
 * @example
 * ```tsx
 * const { limitExceeded, dismissLimitExceeded } = useGeneration();
 * 
 * return (
 *   <GenerationWithUpgrade
 *     limitExceeded={limitExceeded}
 *     onDismiss={dismissLimitExceeded}
 *   >
 *     <GenerateButton />
 *   </GenerationWithUpgrade>
 * );
 * ```
 */
export function GenerationWithUpgrade({
  children,
  limitExceeded,
  onDismiss,
}: GenerationWithUpgradeProps) {
  return (
    <>
      {children}
      <UpgradeModal
        isOpen={limitExceeded !== null}
        onClose={onDismiss}
        limitType={limitExceeded?.limitType ?? 'activities'}
        currentUsage={limitExceeded?.currentUsage ?? 0}
        limit={limitExceeded?.limit ?? 0}
      />
    </>
  );
}

export default GenerationWithUpgrade;

/**
 * UsageRing Component
 * 
 * Displays a circular progress ring showing usage statistics.
 * Shows warning state at 80% threshold and "Unlimited" for premium users.
 * 
 * Requirements: 5.1, 5.4, 5.6
 */

import { cn } from '@/lib/utils';

export type UsageRingColor = 'purple' | 'blue' | 'amber' | 'green';

export interface UsageRingProps {
  /** Label displayed below the ring */
  label: string;
  /** Number of items used */
  used: number;
  /** Maximum limit, null for unlimited */
  limit: number | null;
  /** Color theme for the ring */
  color: UsageRingColor;
  /** Threshold (0-1) at which to show warning state. Default: 0.8 */
  warningThreshold?: number;
  /** Optional className for the container */
  className?: string;
}

/**
 * Maps color names to Tailwind classes
 */
const colorClasses: Record<UsageRingColor, string> = {
  purple: 'text-examai-purple-500',
  blue: 'text-blue-500',
  amber: 'text-amber-500',
  green: 'text-green-500',
};

/**
 * UsageRing component
 * 
 * Displays a circular progress indicator for usage tracking.
 * - Shows percentage filled for limited tiers
 * - Shows "∞" symbol for unlimited (premium) users
 * - Displays warning color when usage exceeds threshold
 * 
 * @example
 * ```tsx
 * <UsageRing
 *   label="Lesson Plans"
 *   used={3}
 *   limit={5}
 *   color="purple"
 * />
 * ```
 */
export function UsageRing({
  label,
  used,
  limit,
  color,
  warningThreshold = 0.8,
  className,
}: UsageRingProps) {
  const isUnlimited = limit === null;
  const percentage = isUnlimited ? 0 : Math.min(100, (used / limit) * 100);
  const isWarning = !isUnlimited && percentage >= warningThreshold * 100;

  // SVG circle calculations
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center p-4', className)}>
      {/* SVG Ring */}
      <div className="relative w-24 h-24">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 96 96"
          aria-hidden="true"
        >
          {/* Background circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted/20"
          />
          {/* Progress circle (only for limited users) */}
          {!isUnlimited && (
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className={cn(
                'transition-all duration-500 ease-out',
                isWarning ? 'text-amber-500' : colorClasses[color]
              )}
            />
          )}
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              'text-2xl font-bold',
              isWarning && !isUnlimited && 'text-amber-500'
            )}
            aria-label={isUnlimited ? 'Unlimited' : `${used} used`}
          >
            {isUnlimited ? '∞' : used}
          </span>
        </div>
      </div>

      {/* Label */}
      <p className="mt-2 font-medium text-foreground">{label}</p>

      {/* Usage text */}
      <p className="text-sm text-muted-foreground">
        {isUnlimited ? 'Ilimitado' : `${used} / ${limit}`}
      </p>
    </div>
  );
}

export default UsageRing;

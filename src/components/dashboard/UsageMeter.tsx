/**
 * UsageMeter Component
 * 
 * Displays a circular progress ring showing overall usage statistics
 * for the dashboard. Shows "X/Y Free Generations Used" for free tier
 * and links to the Usage page.
 * 
 * Requirements: 11.6, 11.7
 */

import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUsageContext } from '@/contexts/UsageContext';
import { Activity } from 'lucide-react';

export interface UsageMeterProps {
  /** Optional className for the container */
  className?: string;
}

/**
 * UsageMeter component
 * 
 * Displays a compact usage meter for the dashboard bento grid.
 * - Shows circular progress ring with total usage
 * - Displays "X/Y Free Generations Used" for free tier
 * - Shows "Unlimited" badge for premium users
 * - Links to the full Usage page
 * 
 * @example
 * ```tsx
 * <UsageMeter />
 * ```
 */
export function UsageMeter({ className }: UsageMeterProps) {
  const { tier, usage, isLoading } = useUsageContext();

  // Calculate total usage for free tier
  const totalUsed = 
    usage.lessonPlans.used + 
    usage.activities.used + 
    usage.assessments.used;

  // Calculate total limit for free tier (sum of all limits)
  const totalLimit = 
    (usage.lessonPlans.limit ?? 0) + 
    (usage.activities.limit ?? 0) + 
    (usage.assessments.limit ?? 0);

  const isUnlimited = tier !== 'free';
  const percentage = isUnlimited ? 0 : Math.min(100, (totalUsed / totalLimit) * 100);
  const isWarning = !isUnlimited && percentage >= 80;

  // SVG circle calculations
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Link
      to="/usage"
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card p-6',
        'border-border/60 dark:border-border/40',
        'hover:border-examai-purple-500/50 hover:shadow-lg dark:hover:shadow-examai-purple-500/10',
        'hover:-translate-y-1 active:translate-y-0 active:scale-[0.99]',
        'transition-all duration-300 ease-out',
        'bg-gradient-to-br from-examai-purple-500/10 to-violet-500/5',
        'dark:from-examai-purple-500/20 dark:to-violet-500/10',
        'hover:from-examai-purple-500/20 hover:to-violet-500/10',
        'dark:hover:from-examai-purple-500/30 dark:hover:to-violet-500/20',
        className
      )}
    >
      {/* Animated background decoration */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-0 right-0 w-24 h-24 bg-examai-purple-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-violet-500/5 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="flex items-center gap-4 relative z-10">
        {/* Circular Progress Ring */}
        <div className="relative w-20 h-20 flex-shrink-0">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-muted/20 border-t-examai-purple-500 animate-spin" />
            </div>
          ) : (
            <>
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 80 80"
                aria-hidden="true"
              >
                {/* Background circle */}
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-muted/20"
                />
                {/* Progress circle (only for limited users) */}
                {!isUnlimited && (
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className={cn(
                      'transition-all duration-500 ease-out',
                      isWarning ? 'text-amber-500' : 'text-examai-purple-500'
                    )}
                  />
                )}
              </svg>
              {/* Center content */}
              <div className="absolute inset-0 flex items-center justify-center">
                {isUnlimited ? (
                  <span className="text-xl font-bold text-examai-purple-500">∞</span>
                ) : (
                  <span
                    className={cn(
                      'text-lg font-bold',
                      isWarning ? 'text-amber-500' : 'text-foreground'
                    )}
                  >
                    {totalUsed}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={cn(
              'p-1.5 rounded-lg transition-all duration-300',
              'bg-examai-purple-500/15 text-examai-purple-600 dark:text-examai-purple-400',
              'group-hover:bg-examai-purple-500/25 group-hover:scale-110'
            )}>
              <Activity className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-foreground group-hover:text-examai-purple-600 dark:group-hover:text-examai-purple-400 transition-colors duration-300">
              Uso Mensal
            </h3>
          </div>
          
          {isLoading ? (
            <div className="h-4 w-24 bg-muted/30 rounded animate-pulse" />
          ) : isUnlimited ? (
            <p className="text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-examai-purple-500/20 text-examai-purple-600 dark:text-examai-purple-400 text-xs font-medium">
                Premium
              </span>
              {' '}Ilimitado
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              <span className={cn(
                'font-medium',
                isWarning ? 'text-amber-500' : 'text-foreground'
              )}>
                {totalUsed}/{totalLimit}
              </span>
              {' '}Gerações Grátis
            </p>
          )}
        </div>
      </div>

      {/* Arrow indicator */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
        <svg className="w-5 h-5 text-examai-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

export default UsageMeter;

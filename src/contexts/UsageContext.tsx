/**
 * UsageContext Provider
 * 
 * Provides usage state to all components in the application.
 * Wraps the useUsage hook in a React context for global access.
 * 
 * Requirements: 5.1
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useUsage, UseUsageReturn } from '@/hooks/useUsage';

/**
 * Context type - same as UseUsageReturn
 */
type UsageContextType = UseUsageReturn | null;

/**
 * Create the context with null default
 */
const UsageContext = createContext<UsageContextType>(null);

/**
 * Props for the UsageProvider component
 */
interface UsageProviderProps {
  children: ReactNode;
}

/**
 * UsageProvider component
 * 
 * Wraps the application with usage state context.
 * Should be placed near the root of the app, inside auth providers.
 * 
 * @example
 * ```tsx
 * <UsageProvider>
 *   <App />
 * </UsageProvider>
 * ```
 */
export function UsageProvider({ children }: UsageProviderProps) {
  const usage = useUsage();

  return (
    <UsageContext.Provider value={usage}>
      {children}
    </UsageContext.Provider>
  );
}

/**
 * Hook to access usage context
 * 
 * @throws Error if used outside of UsageProvider
 * @returns Usage state and control functions
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { tier, usage, checkLimit } = useUsageContext();
 *   
 *   if (!checkLimit('lessonPlans')) {
 *     return <UpgradeModal />;
 *   }
 *   
 *   return <GenerateButton />;
 * }
 * ```
 */
export function useUsageContext(): UseUsageReturn {
  const context = useContext(UsageContext);
  
  if (context === null) {
    throw new Error('useUsageContext must be used within a UsageProvider');
  }
  
  return context;
}

/**
 * Export the context for advanced use cases
 */
export { UsageContext };

export default UsageProvider;

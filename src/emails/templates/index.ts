/**
 * Email Templates - Templates de email do Educa Sol
 * 
 * Cada template usa os componentes base de src/emails/components
 * e aplica estilos inline para compatibilidade com clientes de email.
 */

export { ExampleEmail } from './example';

// Transactional Templates (Requirements 4.1, 4.2, 4.3)
export { ResetPasswordEmail } from './reset-password';
export { PremiumWelcomeEmail } from './premium-welcome';
export { PaymentFailedEmail } from './payment-failed';

// Usage Alert Templates (Requirements 5.1, 5.2, 5.3)
export { UsageLimitWarningEmail } from './usage-limit-warning';
export { UsageFollowupEmail } from './usage-followup';

// Onboarding Templates (Requirements 6.1, 6.2, 6.3)
export { WelcomeEmail } from './welcome-email';
export { OnboardingDay1Email } from './onboarding-day1';
export { OnboardingDay3Email } from './onboarding-day3';

// Activity Summary Template (Requirements 9.1, 9.2)
export { ActivitySummaryEmail } from './activity-summary';

// Re-engagement Template (Requirements 7.1, 7.2)
export { ReengagementEmail } from './reengagement';

// Churn Survey Template (Requirements 8.1, 8.2, 8.3)
export { ChurnSurveyEmail } from './churn-survey';

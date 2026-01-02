# Implementation Plan: Freemium Platform Pivot

## Overview

This implementation plan transforms Educasol into a freemium platform with usage-based limits, MercadoPago subscription integration, and planning-centric landing page messaging. The approach prioritizes backend infrastructure first (database, Edge Functions), then frontend components (usage tracking, upgrade modal), and finally landing page updates.

## Tasks

- [x] 1. Set up usage tracking database infrastructure
  - [x] 1.1 Create usage_logs table migration
    - Create Supabase migration file for usage_logs table
    - Add indexes for user_id + month and generation_type
    - Add RLS policies for user access
    - _Requirements: 1.1, 1.4_

  - [x] 1.2 Extend profiles table for tier and MercadoPago data
    - Add tier column with default 'free'
    - Add mp_customer_id and mp_subscription_id columns
    - Add subscription_status column
    - _Requirements: 10.6_

  - [x] 1.3 Update Supabase types
    - Regenerate TypeScript types from database schema
    - Add UsageLog and Tier types to types.ts
    - _Requirements: 1.1_

- [x] 2. Implement usage tracking Edge Function middleware
  - [x] 2.1 Create shared usage-limits module
    - Create supabase/functions/_shared/usage-limits.ts
    - Implement checkUsageLimit function
    - Implement recordUsage function
    - Implement TIER_LIMITS configuration
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4_

  - [x] 2.2 Write property test for Free tier limit enforcement
    - **Property 4: Free Tier Limit Enforcement**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

  - [x] 2.3 Write property test for Premium tier unlimited access
    - **Property 5: Premium Tier Unlimited Access**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

  - [x] 2.4 Integrate limit checks into generate-lesson-plan Edge Function
    - Add limit check before generation
    - Return 402 with limit details when exceeded
    - Record usage after successful generation
    - Add rate limit headers to response
    - _Requirements: 12.1, 12.2, 12.3, 12.5_

  - [x] 2.5 Integrate limit checks into remaining generate-* Edge Functions
    - Update generate-quiz, generate-worksheet, generate-reading, generate-slides, generate-activity
    - Apply same pattern as generate-lesson-plan
    - _Requirements: 12.1, 12.2, 12.3, 12.5_

  - [x]* 2.6 Write property test for counter increment on success only
    - **Property 7: Counter Increment on Success Only**
    - **Validates: Requirements 12.3, 12.4**

- [x] 3. Checkpoint - Verify usage tracking infrastructure
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement useUsage hook for frontend
  - [x] 4.1 Create useUsage hook
    - Create src/hooks/useUsage.ts
    - Implement usage state management
    - Implement checkLimit function
    - Implement getUsagePercentage function
    - Query usage_logs for current month counts
    - _Requirements: 1.3, 5.1_

  - [x]* 4.2 Write property test for usage aggregation correctness
    - **Property 3: Usage Aggregation Correctness**
    - **Validates: Requirements 1.3**

  - [x] 4.3 Create UsageContext provider
    - Create src/contexts/UsageContext.tsx
    - Wrap app with UsageProvider
    - Expose usage state to all components
    - _Requirements: 5.1_

- [x] 5. Implement Upgrade Modal component
  - [x] 5.1 Create UpgradeModal component
    - Create src/components/billing/UpgradeModal.tsx
    - Display limit type and current usage
    - Show pricing tier comparison cards
    - Highlight Premium as recommended
    - Add "Upgrade to Premium" and "Maybe Later" buttons
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x]* 5.2 Write property test for upgrade modal trigger
    - **Property 10: Upgrade Modal Trigger**
    - **Validates: Requirements 4.1**

  - [x] 5.3 Integrate UpgradeModal with useGeneration hook
    - Detect 402 responses in useGeneration
    - Trigger UpgradeModal display on limit exceeded
    - Pass limit_type and current_usage to modal
    - _Requirements: 4.1, 2.5_

- [x] 6. Implement Usage Page
  - [x] 6.1 Create UsageRing component
    - Create src/components/usage/UsageRing.tsx
    - Implement circular progress SVG
    - Show warning state at 80% threshold
    - Display "Unlimited" for premium users
    - _Requirements: 5.1, 5.4, 5.6_

  - [x] 6.2 Create Usage page
    - Create src/pages/Usage.tsx
    - Display usage rings for all generation types
    - Show billing period and days until reset
    - Display tier badge
    - Add upgrade CTA for free users
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [x] 6.3 Add Usage page route
    - Add /usage route to App.tsx
    - Add Usage link to dashboard navigation
    - _Requirements: 5.1_

- [x] 7. Checkpoint - Verify frontend usage tracking
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement MercadoPago integration
  - [x] 8.1 Create MercadoPago preference Edge Function
    - Create supabase/functions/create-mp-preference/index.ts
    - Create or get MercadoPago customer
    - Create subscription preapproval
    - Return init_point URL for redirect
    - _Requirements: 10.1_

  - [x] 8.2 Create MercadoPago webhook Edge Function
    - Create supabase/functions/mp-webhook/index.ts
    - Handle subscription_preapproval IPN events
    - Update tier on authorized status
    - Downgrade tier on cancelled/paused status
    - _Requirements: 10.2, 10.4, 10.5_

  - [x]* 8.3 Write property test for tier state machine transitions
    - **Property 8: Tier State Machine Transitions**
    - **Validates: Requirements 10.2, 10.3, 10.4, 10.5, 10.6**

  - [x] 8.4 Create useSubscription hook
    - Create src/hooks/useSubscription.ts
    - Implement createCheckoutSession function
    - Handle redirect to MercadoPago
    - Handle success/cancel URL params
    - _Requirements: 10.1, 10.3_

- [x] 9. Update Landing Page with planning-centric messaging
  - [x] 9.1 Create PlanningHeroSection component
    - Create src/components/landing/PlanningHeroSection.tsx
    - Implement headline and sub-headline copy
    - Add "Start Planning Free" and "View Features" CTAs
    - Add gradient background and floating elements
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 9.2 Create TransformationAnimation component
    - Create src/components/landing/TransformationAnimation.tsx
    - Animate PDF to calendar view transformation
    - Use Framer Motion for smooth transitions
    - _Requirements: 6.5_

  - [x] 9.3 Create FeaturePillars component
    - Create src/components/landing/FeaturePillars.tsx
    - Implement bento grid layout
    - Add Magic Planner, Instant Activity, Differentiation pillars
    - Include icons and gradient backgrounds
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 9.4 Create SocialProofStrip component
    - Create src/components/landing/SocialProofStrip.tsx
    - Add animated counters for metrics
    - Display standards alignment trust signal
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 9.5 Create PricingSection component
    - Create src/components/landing/PricingSection.tsx
    - Display Free, Premium, Enterprise cards
    - Highlight Premium as recommended
    - Wire up CTAs to signup/checkout/contact
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

  - [x] 9.6 Update Index page with new landing sections
    - Replace existing hero with PlanningHeroSection
    - Add FeaturePillars section
    - Add SocialProofStrip section
    - Add PricingSection section
    - _Requirements: 6.1, 7.1, 8.1, 9.1_

- [x] 10. Update Dashboard with usage meter
  - [x] 10.1 Create DashboardUsageMeter component
    - Create src/components/dashboard/UsageMeter.tsx
    - Display circular progress ring
    - Show "X/Y Free Generations Used" for free tier
    - Link to Usage page
    - _Requirements: 11.6, 11.7_

  - [x] 10.2 Integrate UsageMeter into Dashboard
    - Add UsageMeter to dashboard bento grid
    - Position in quick stats section
    - _Requirements: 11.6_

- [x] 11. Final checkpoint - Complete freemium system verification
  - Ensure all tests pass, ask the user if questions arise.
  - Verify usage limits are enforced across all generation types
  - Verify MercadoPago checkout flow works end-to-end
  - Verify landing page displays correctly with new messaging

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- The implementation uses TypeScript with React and Supabase Edge Functions
- Testing framework: Vitest with fast-check for property-based tests
- MercadoPago integration requires MERCADOPAGO_ACCESS_TOKEN and MERCADOPAGO_PREMIUM_PLAN_ID environment variables

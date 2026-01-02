# Requirements Document

## Introduction

This specification defines the requirements for implementing the freemium business model and "Planning-First" messaging pivot for Educasol. The system will transform the platform's value proposition from grading-focused to instructional design-focused, implement usage-based limits with a tiered subscription model, and provide visual usage tracking. This aligns with the ExamAI-inspired UX while positioning Educasol as the AI-powered curriculum planning solution.

## Glossary

- **Usage_Tracker**: The system component that monitors and enforces generation limits per user tier
- **Generation_Counter**: A per-user, per-month counter tracking AI content generation calls
- **Tier**: The user's subscription level (Free, Premium, Enterprise)
- **Usage_Log**: A database record tracking each generation event with timestamp, type, and user reference
- **Upgrade_Modal**: The UI component displayed when a free user exceeds their generation limit
- **Landing_Page**: The public-facing marketing page at the root URL
- **Hero_Section**: The primary above-the-fold content area on the landing page
- **Feature_Pillar**: A key value proposition displayed in the bento grid layout
- **Usage_Page**: The dashboard view showing current usage statistics and limits
- **Context_Window**: The AI model's input capacity (Standard for Flash, Extended for Pro)

## Requirements

### Requirement 1: Usage Tracking Infrastructure

**User Story:** As a platform operator, I want to track all AI generation events, so that I can enforce tier-based limits and analyze usage patterns.

#### Acceptance Criteria

1. WHEN a user triggers any AI generation (lesson plan, activity, quiz, worksheet, reading, slides, assessment), THE Usage_Tracker SHALL create a Usage_Log entry with user_id, generation_type, timestamp, and tier
2. THE Usage_Tracker SHALL maintain a Generation_Counter per user that resets on the first day of each calendar month
3. WHEN querying usage, THE Usage_Tracker SHALL return the current month's count grouped by generation_type
4. THE Usage_Tracker SHALL store usage data in a `usage_logs` table in Supabase with appropriate indexes
5. WHEN a user's tier changes, THE Usage_Tracker SHALL preserve historical usage data while applying new limits going forward

### Requirement 2: Free Tier Limits

**User Story:** As a free user, I want to understand my usage limits clearly, so that I can plan my content generation accordingly.

#### Acceptance Criteria

1. THE Usage_Tracker SHALL enforce a limit of 5 lesson plan generations per month for Free tier users
2. THE Usage_Tracker SHALL enforce a limit of 10 activity/worksheet generations per month for Free tier users
3. THE Usage_Tracker SHALL enforce a limit of 3 AI assessment generations per month for Free tier users
4. THE Usage_Tracker SHALL enforce a limit of 2 file uploads (max 15MB each) for Free tier users
5. WHEN a Free tier user reaches their limit for any generation type, THE Usage_Tracker SHALL return a 402 Payment Required status
6. THE Usage_Tracker SHALL restrict Free tier users to PDF-only export format

### Requirement 3: Premium Tier Features

**User Story:** As a premium subscriber, I want unlimited generation capabilities and enhanced features, so that I can plan my entire curriculum without restrictions.

#### Acceptance Criteria

1. THE Usage_Tracker SHALL allow unlimited lesson plan generations for Premium tier users
2. THE Usage_Tracker SHALL allow unlimited activity/worksheet generations for Premium tier users
3. THE Usage_Tracker SHALL allow unlimited AI assessment generations for Premium tier users
4. THE Usage_Tracker SHALL allow unlimited file uploads for Premium tier users
5. THE Usage_Tracker SHALL enable PDF, DOCX, and Google Slides export formats for Premium tier users
6. THE Usage_Tracker SHALL route Premium tier requests to Gemini 1.5 Pro (1M token context window)

### Requirement 4: Upgrade Modal

**User Story:** As a free user who has reached my limit, I want a clear path to upgrade, so that I can continue using the platform without interruption.

#### Acceptance Criteria

1. WHEN a Free tier user exceeds any generation limit, THE Upgrade_Modal SHALL display immediately with the specific limit reached
2. THE Upgrade_Modal SHALL display the three pricing tiers (Free, Premium $20/mo, Enterprise) in a card layout
3. THE Upgrade_Modal SHALL highlight the Premium tier as the recommended option
4. THE Upgrade_Modal SHALL display a comparison of features between tiers
5. WHEN a user clicks "Upgrade to Premium", THE Upgrade_Modal SHALL redirect to the Stripe checkout flow
6. THE Upgrade_Modal SHALL include a "Maybe Later" dismissal option that returns the user to their previous view

### Requirement 5: Usage Page Dashboard

**User Story:** As a user, I want to see my current usage statistics visually, so that I can track my remaining generations and plan accordingly.

#### Acceptance Criteria

1. THE Usage_Page SHALL display circular progress rings for each generation type showing used/total
2. THE Usage_Page SHALL display the current billing period dates (month start to month end)
3. THE Usage_Page SHALL display the user's current tier with a badge indicator
4. WHEN usage exceeds 80% of any limit, THE Usage_Page SHALL display a warning indicator
5. THE Usage_Page SHALL display a "Days until reset" countdown
6. FOR Premium users, THE Usage_Page SHALL display "Unlimited" instead of progress rings
7. THE Usage_Page SHALL include a prominent "Upgrade" CTA for Free tier users

### Requirement 6: Landing Page Hero Section

**User Story:** As a visitor, I want to immediately understand that Educasol is for curriculum planning, so that I know if the product solves my problem.

#### Acceptance Criteria

1. THE Hero_Section SHALL display the headline: "Plan Your Entire Curriculum in Seconds, Not Weekends."
2. THE Hero_Section SHALL display the sub-headline: "Transform your teaching with the AI-powered instructional design platform. Generate standards-aligned lesson plans, activities, and assessments in one click."
3. THE Hero_Section SHALL display a primary CTA button labeled "Start Planning Free"
4. THE Hero_Section SHALL display a secondary CTA button labeled "View Features"
5. THE Hero_Section SHALL display a split-screen animation showing a curriculum PDF transforming into a calendar view
6. WHEN a user clicks "Start Planning Free", THE Hero_Section SHALL navigate to the signup flow

### Requirement 7: Feature Pillars (Bento Grid)

**User Story:** As a visitor, I want to see the key features presented visually, so that I understand the platform's capabilities at a glance.

#### Acceptance Criteria

1. THE Landing_Page SHALL display three Feature_Pillars in a bento grid layout
2. Feature Pillar 1 ("The Magic Planner") SHALL display headline "Let AI design your week." with copy about unit plan generation
3. Feature Pillar 2 ("Instant Activity Generation") SHALL display headline "From Plan to Handout in a click." with copy about resource creation
4. Feature Pillar 3 ("Differentiation Engine") SHALL display headline "Personalize for every student." with copy about scaffolding and translation
5. EACH Feature_Pillar SHALL include an illustrative icon or animation
6. EACH Feature_Pillar SHALL link to the relevant feature section or demo

### Requirement 8: Social Proof Strip

**User Story:** As a visitor, I want to see evidence of platform adoption, so that I trust the product is effective.

#### Acceptance Criteria

1. THE Landing_Page SHALL display a social proof strip below the hero section
2. THE Social_Proof_Strip SHALL display "50,000+ Lessons Planned" metric
3. THE Social_Proof_Strip SHALL display "500+ Hours Saved per Teacher/Year" metric
4. THE Social_Proof_Strip SHALL display "Aligned with Common Core & NGSS Standards" trust signal
5. THE Social_Proof_Strip SHALL use animated counters that increment on scroll into view

### Requirement 9: Pricing Section

**User Story:** As a visitor, I want to see pricing options clearly in Brazilian Reais, so that I can decide which plan fits my needs.

#### Acceptance Criteria

1. THE Pricing_Section SHALL display three pricing cards: Free (R$0/mês), Premium (R$99,90/mês), Enterprise (Fale Conosco)
2. THE Free card SHALL list: 5 planos de aula/mês, 10 atividades/mês, 3 avaliações/mês, 2 arquivos (15MB), exportação PDF, suporte comunidade
3. THE Premium card SHALL list: Gerações ilimitadas, Arquivos ilimitados, Exportação PDF/DOCX/Slides, Contexto Gemini Pro, Suporte prioritário
4. THE Enterprise card SHALL list: Tudo do Premium, Limites personalizados, Integração LMS, Agente dedicado, Contexto AI personalizado
5. THE Premium card SHALL be visually highlighted as the recommended option
6. WHEN a user clicks "Começar Grátis" on Free, THE Pricing_Section SHALL navigate to signup
7. WHEN a user clicks "Assinar" on Premium, THE Pricing_Section SHALL navigate to MercadoPago checkout
8. WHEN a user clicks "Falar com Vendas" on Enterprise, THE Pricing_Section SHALL open a contact form

### Requirement 10: MercadoPago Integration

**User Story:** As a user upgrading to Premium, I want a seamless checkout experience with MercadoPago, so that I can start using premium features immediately.

#### Acceptance Criteria

1. WHEN a user initiates Premium subscription, THE System SHALL create a MercadoPago preapproval (subscription) with the Premium plan ID
2. WHEN MercadoPago subscription is authorized, THE System SHALL update the user's tier to Premium in the database
3. WHEN MercadoPago subscription is authorized, THE System SHALL redirect the user to the dashboard with a success message
4. THE System SHALL handle MercadoPago IPN webhooks for subscription_preapproval events (authorized, cancelled, paused, pending)
5. WHEN a subscription is cancelled or paused, THE System SHALL downgrade the user to Free tier
6. THE System SHALL store the MercadoPago customer_id and subscription_id in the user's profile

### Requirement 11: Dashboard Bento Grid Layout

**User Story:** As a logged-in user, I want a visually organized dashboard, so that I can quickly access the features I need.

#### Acceptance Criteria

1. THE Dashboard SHALL display a bento grid layout with feature cards
2. THE Dashboard SHALL display a hero card (double width) labeled "Plan Next Week's Lessons" with purple gradient
3. THE Dashboard SHALL display quick action cards for "Create Activity" and "Generate Assessment"
4. THE Dashboard SHALL display a "Curriculum Coverage" stats card showing percentage of standards addressed
5. THE Dashboard SHALL display a "Recent Files" section with the last 5 generated items
6. THE Dashboard SHALL display a usage meter showing current generation usage (circular progress ring)
7. FOR Free tier users, THE Dashboard usage meter SHALL show "X/Y Free Generations Used"

### Requirement 12: Generation Limit Enforcement

**User Story:** As a platform operator, I want generation limits enforced at the API level, so that users cannot bypass limits through direct API calls.

#### Acceptance Criteria

1. WHEN any generate-* Edge Function is called, THE Function SHALL first check the user's current usage against their tier limits
2. IF the user has exceeded their limit, THE Function SHALL return 402 Payment Required with a JSON body containing limit_type and current_usage
3. THE Function SHALL increment the usage counter only after successful generation completion
4. IF generation fails, THE Function SHALL NOT increment the usage counter
5. THE Function SHALL include rate limiting headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)


# Design Document: Freemium Platform Pivot

## Overview

This design document defines the technical implementation of the freemium business model, usage tracking system, and "Planning-First" landing page pivot for Educasol. The system integrates with the existing Supabase backend, adds a new `usage_logs` table, implements tier-based limit enforcement at the Edge Function level, and updates the landing page with planning-centric messaging.

## Architecture

The freemium system follows a layered architecture that integrates with existing components:

```
┌─────────────────────────────────────────────────────────────────┐
│                      Presentation Layer                          │
│   (Landing Page, Dashboard, Usage Page, Upgrade Modal)           │
├─────────────────────────────────────────────────────────────────┤
│                      Application Layer                           │
│   (useUsage Hook, useGeneration Hook with limits)                │
├─────────────────────────────────────────────────────────────────┤
│                      Service Layer                               │
│   (Edge Functions with limit checks, Stripe webhooks)            │
├─────────────────────────────────────────────────────────────────┤
│                      Data Layer                                  │
│   (usage_logs table, profiles.tier, Stripe customer data)        │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Usage Tracker Hook

```typescript
interface UsageState {
  tier: 'free' | 'premium' | 'enterprise';
  currentPeriod: {
    start: Date;
    end: Date;
    daysRemaining: number;
  };
  usage: {
    lessonPlans: { used: number; limit: number | null };
    activities: { used: number; limit: number | null };
    assessments: { used: number; limit: number | null };
    fileUploads: { used: number; limit: number | null };
  };
  isLoading: boolean;
  error: string | null;
}

interface UseUsageReturn extends UsageState {
  checkLimit: (type: GenerationType) => boolean;
  refreshUsage: () => Promise<void>;
  getUsagePercentage: (type: GenerationType) => number;
}
```

### Tier Limits Configuration

```typescript
interface TierLimits {
  lessonPlans: number | null;  // null = unlimited
  activities: number | null;
  assessments: number | null;
  fileUploads: number | null;
  maxFileSizeMB: number;
  exportFormats: ('pdf' | 'docx' | 'pptx' | 'google-slides')[];
  aiModel: 'gemini-flash' | 'gemini-pro';
}

const TIER_LIMITS: Record<string, TierLimits> = {
  free: {
    lessonPlans: 5,
    activities: 10,
    assessments: 3,
    fileUploads: 2,
    maxFileSizeMB: 15,
    exportFormats: ['pdf'],
    aiModel: 'gemini-flash',
  },
  premium: {
    lessonPlans: null,
    activities: null,
    assessments: null,
    fileUploads: null,
    maxFileSizeMB: 100,
    exportFormats: ['pdf', 'docx', 'pptx', 'google-slides'],
    aiModel: 'gemini-pro',
  },
  enterprise: {
    lessonPlans: null,
    activities: null,
    assessments: null,
    fileUploads: null,
    maxFileSizeMB: 500,
    exportFormats: ['pdf', 'docx', 'pptx', 'google-slides'],
    aiModel: 'gemini-pro',
  },
};
```

### Upgrade Modal Component

```typescript
interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: 'lessonPlans' | 'activities' | 'assessments' | 'fileUploads';
  currentUsage: number;
  limit: number;
}
```

### Usage Page Component

```typescript
interface UsagePageProps {
  // Uses useUsage hook internally
}

interface UsageRingProps {
  label: string;
  used: number;
  limit: number | null;
  color: string;
  warningThreshold?: number; // default 0.8
}
```

## Data Models

### Usage Log Table Schema

```sql
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_type TEXT NOT NULL CHECK (generation_type IN (
    'lesson-plan', 'activity', 'worksheet', 'quiz', 
    'reading', 'slides', 'assessment', 'file-upload'
  )),
  tier TEXT NOT NULL CHECK (tier IN ('free', 'premium', 'enterprise')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for efficient monthly queries
CREATE INDEX idx_usage_logs_user_month ON usage_logs (
  user_id, 
  DATE_TRUNC('month', created_at)
);

-- Index for generation type filtering
CREATE INDEX idx_usage_logs_type ON usage_logs (generation_type);
```

### Profile Table Extension

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'free' 
  CHECK (tier IN ('free', 'premium', 'enterprise'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mp_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mp_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT 
  CHECK (subscription_status IN ('active', 'pending', 'paused', 'cancelled', NULL));
```

### TypeScript Types

```typescript
interface UsageLog {
  id: string;
  user_id: string;
  generation_type: GenerationType;
  tier: Tier;
  created_at: string;
  metadata: Record<string, unknown>;
}

type GenerationType = 
  | 'lesson-plan' 
  | 'activity' 
  | 'worksheet' 
  | 'quiz' 
  | 'reading' 
  | 'slides' 
  | 'assessment' 
  | 'file-upload';

type Tier = 'free' | 'premium' | 'enterprise';

interface MonthlyUsage {
  lessonPlans: number;
  activities: number;
  assessments: number;
  fileUploads: number;
}
```

## Edge Function Limit Enforcement

### Limit Check Middleware

```typescript
// supabase/functions/_shared/usage-limits.ts

interface LimitCheckResult {
  allowed: boolean;
  currentUsage: number;
  limit: number | null;
  tier: Tier;
}

async function checkUsageLimit(
  supabase: SupabaseClient,
  userId: string,
  generationType: GenerationType
): Promise<LimitCheckResult> {
  // Get user's tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', userId)
    .single();

  const tier = profile?.tier || 'free';
  const limits = TIER_LIMITS[tier];
  
  // Map generation type to limit category
  const limitCategory = mapGenerationTypeToCategory(generationType);
  const limit = limits[limitCategory];

  // If unlimited, allow
  if (limit === null) {
    return { allowed: true, currentUsage: 0, limit: null, tier };
  }

  // Count current month's usage
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('generation_type', getTypesForCategory(limitCategory))
    .gte('created_at', startOfMonth.toISOString());

  const currentUsage = count || 0;

  return {
    allowed: currentUsage < limit,
    currentUsage,
    limit,
    tier,
  };
}

async function recordUsage(
  supabase: SupabaseClient,
  userId: string,
  generationType: GenerationType,
  tier: Tier,
  metadata?: Record<string, unknown>
): Promise<void> {
  await supabase.from('usage_logs').insert({
    user_id: userId,
    generation_type: generationType,
    tier,
    metadata: metadata || {},
  });
}
```

### Modified Edge Function Pattern

```typescript
// Example: supabase/functions/generate-lesson-plan/index.ts

import { checkUsageLimit, recordUsage } from '../_shared/usage-limits.ts';

Deno.serve(async (req) => {
  const supabase = createClient(/* ... */);
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // Check usage limit BEFORE generation
  const limitCheck = await checkUsageLimit(supabase, user.id, 'lesson-plan');
  
  if (!limitCheck.allowed) {
    return new Response(JSON.stringify({
      error: 'Usage limit exceeded',
      limit_type: 'lessonPlans',
      current_usage: limitCheck.currentUsage,
      limit: limitCheck.limit,
      tier: limitCheck.tier,
    }), { 
      status: 402,
      headers: {
        'X-RateLimit-Limit': String(limitCheck.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': getEndOfMonth().toISOString(),
      }
    });
  }

  // Proceed with generation...
  const result = await generateLessonPlan(/* ... */);

  // Record usage AFTER successful generation
  await recordUsage(supabase, user.id, 'lesson-plan', limitCheck.tier);

  return new Response(JSON.stringify(result), { status: 200 });
});
```

## MercadoPago Integration

### Preference Creation (Checkout)

```typescript
// supabase/functions/create-mp-preference/index.ts

const MP_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
const PREMIUM_PLAN_ID = Deno.env.get('MERCADOPAGO_PREMIUM_PLAN_ID');

Deno.serve(async (req) => {
  const supabase = createClient(/* ... */);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('mp_customer_id, email, name')
    .eq('id', user.id)
    .single();

  // Create or get MercadoPago customer
  let customerId = profile?.mp_customer_id;
  
  if (!customerId) {
    const customerResponse = await fetch('https://api.mercadopago.com/v1/customers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: profile?.email || user.email,
        first_name: profile?.name?.split(' ')[0] || '',
        last_name: profile?.name?.split(' ').slice(1).join(' ') || '',
      }),
    });
    const customer = await customerResponse.json();
    customerId = customer.id;
    
    await supabase
      .from('profiles')
      .update({ mp_customer_id: customerId })
      .eq('id', user.id);
  }

  // Create subscription preapproval (recurring payment)
  const preapprovalResponse = await fetch('https://api.mercadopago.com/preapproval', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      preapproval_plan_id: PREMIUM_PLAN_ID,
      payer_email: profile?.email || user.email,
      external_reference: user.id,
      back_url: `${req.headers.get('origin')}/dashboard`,
      status: 'pending',
    }),
  });
  
  const preapproval = await preapprovalResponse.json();

  return new Response(JSON.stringify({ 
    init_point: preapproval.init_point,
    preapproval_id: preapproval.id,
  }), { status: 200 });
});
```

### Webhook Handler (IPN - Instant Payment Notification)

```typescript
// supabase/functions/mp-webhook/index.ts

Deno.serve(async (req) => {
  const supabase = createClient(/* ... */);
  const MP_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
  
  const body = await req.json();
  const { type, data } = body;

  // Verify webhook authenticity by fetching the resource
  if (type === 'subscription_preapproval') {
    const preapprovalResponse = await fetch(
      `https://api.mercadopago.com/preapproval/${data.id}`,
      {
        headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
      }
    );
    const preapproval = await preapprovalResponse.json();
    const userId = preapproval.external_reference;

    switch (preapproval.status) {
      case 'authorized': {
        // Subscription activated
        await supabase
          .from('profiles')
          .update({
            tier: 'premium',
            mp_subscription_id: preapproval.id,
            subscription_status: 'active',
          })
          .eq('id', userId);
        break;
      }
      
      case 'cancelled':
      case 'paused': {
        // Subscription cancelled or paused
        await supabase
          .from('profiles')
          .update({
            tier: 'free',
            subscription_status: preapproval.status,
          })
          .eq('mp_subscription_id', preapproval.id);
        break;
      }
      
      case 'pending': {
        // Payment pending
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'pending',
          })
          .eq('id', userId);
        break;
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
```

### MercadoPago Plan Setup (One-time)

```typescript
// Script to create the Premium subscription plan in MercadoPago
// Run once during setup

const createPremiumPlan = async () => {
  const response = await fetch('https://api.mercadopago.com/preapproval_plan', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reason: 'Educasol Premium - Plano Mensal',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 99.90, // R$ 99,90/mês
        currency_id: 'BRL',
      },
      back_url: 'https://educasol.com.br/dashboard',
    }),
  });
  
  const plan = await response.json();
  console.log('Premium Plan ID:', plan.id);
  // Save this ID as MERCADOPAGO_PREMIUM_PLAN_ID env var
};
```

## Landing Page Components

### Hero Section Structure

```tsx
// src/components/landing/PlanningHeroSection.tsx

interface PlanningHeroSectionProps {
  onStartPlanning: () => void;
  onViewFeatures: () => void;
}

export function PlanningHeroSection({ onStartPlanning, onViewFeatures }: PlanningHeroSectionProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-hero-gradient" />
      
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingElement className="top-20 left-10" delay={0} />
        <FloatingElement className="top-40 right-20" delay={0.5} />
        <FloatingElement className="bottom-20 left-1/4" delay={1} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Copy */}
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground">
              Plan Your Entire Curriculum in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-examai-purple-500 to-violet-500">
                Seconds
              </span>
              , Not Weekends.
            </h1>
            <p className="text-xl text-muted-foreground">
              Transform your teaching with the AI-powered instructional design platform. 
              Generate standards-aligned lesson plans, activities, and assessments in one click.
            </p>
            <div className="flex gap-4">
              <Button size="lg" onClick={onStartPlanning} className="bg-gradient-cta">
                Start Planning Free
              </Button>
              <Button size="lg" variant="outline" onClick={onViewFeatures}>
                View Features
              </Button>
            </div>
          </div>

          {/* Animation: PDF → Calendar transformation */}
          <div className="relative">
            <TransformationAnimation />
          </div>
        </div>
      </div>
    </section>
  );
}
```

### Feature Pillars (Bento Grid)

```tsx
// src/components/landing/FeaturePillars.tsx

const FEATURE_PILLARS = [
  {
    id: 'magic-planner',
    headline: 'Let AI design your week.',
    copy: 'Select your topic and grade level. Watch as Educasol generates a complete 5-day unit plan with objectives, hooks, and materials instantly.',
    icon: CalendarDays,
    gradient: 'purple',
  },
  {
    id: 'instant-activity',
    headline: 'From Plan to Handout in a click.',
    copy: "Don't just plan it—create it. Automatically generate worksheets, slide decks, and reading passages that match your lesson perfectly.",
    icon: Wand2,
    gradient: 'blue',
  },
  {
    id: 'differentiation',
    headline: 'Personalize for every student.',
    copy: "One click to 'Scaffold', 'Enrich', or 'Translate' any resource. Ensure every student accesses the same high-quality curriculum.",
    icon: Users,
    gradient: 'green',
  },
];

export function FeaturePillars() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {FEATURE_PILLARS.map((pillar) => (
            <FeaturePillarCard key={pillar.id} {...pillar} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Social Proof Strip

```tsx
// src/components/landing/SocialProofStrip.tsx

const METRICS = [
  { value: 50000, suffix: '+', label: 'Lessons Planned' },
  { value: 500, suffix: '+', label: 'Hours Saved per Teacher/Year' },
];

export function SocialProofStrip() {
  return (
    <section className="py-12 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-12">
          {METRICS.map((metric) => (
            <AnimatedCounter key={metric.label} {...metric} />
          ))}
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Aligned with Common Core & NGSS Standards</span>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### Pricing Section

```tsx
// src/components/landing/PricingSection.tsx

const PRICING_TIERS = [
  {
    name: 'Grátis',
    price: 'R$0',
    period: '/mês',
    features: [
      '5 planos de aula/mês',
      '10 atividades/mês',
      '3 avaliações/mês',
      '2 uploads de arquivo (15MB máx)',
      'Exportação apenas PDF',
      'Suporte comunidade',
    ],
    cta: 'Começar Grátis',
    ctaVariant: 'outline' as const,
    highlighted: false,
  },
  {
    name: 'Premium',
    price: 'R$99,90',
    period: '/mês',
    features: [
      'Planos de aula ilimitados',
      'Atividades ilimitadas',
      'Avaliações ilimitadas',
      'Uploads ilimitados',
      'Exportação PDF, DOCX, Google Slides',
      'Gemini Pro (contexto 1M tokens)',
      'Suporte prioritário por email',
    ],
    cta: 'Assinar',
    ctaVariant: 'default' as const,
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Personalizado',
    period: '',
    features: [
      'Tudo do Premium',
      'Limites de uso personalizados',
      'Integração LMS (Canvas, Google Classroom)',
      'Agente de sucesso dedicado',
      'Contexto AI personalizado',
      'SSO & segurança avançada',
    ],
    cta: 'Falar com Vendas',
    ctaVariant: 'outline' as const,
    highlighted: false,
  },
];
```

## Usage Page Design

### Usage Dashboard Layout

```tsx
// src/pages/Usage.tsx

export function UsagePage() {
  const { tier, usage, currentPeriod, isLoading } = useUsage();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Usage Dashboard</h1>
          <p className="text-muted-foreground">
            {currentPeriod.daysRemaining} days until reset
          </p>
        </div>
        <Badge variant={tier === 'premium' ? 'default' : 'secondary'}>
          {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
        </Badge>
      </div>

      {/* Usage Rings Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <UsageRing
          label="Lesson Plans"
          used={usage.lessonPlans.used}
          limit={usage.lessonPlans.limit}
          color="purple"
        />
        <UsageRing
          label="Activities"
          used={usage.activities.used}
          limit={usage.activities.limit}
          color="blue"
        />
        <UsageRing
          label="Assessments"
          used={usage.assessments.used}
          limit={usage.assessments.limit}
          color="amber"
        />
        <UsageRing
          label="File Uploads"
          used={usage.fileUploads.used}
          limit={usage.fileUploads.limit}
          color="green"
        />
      </div>

      {/* Upgrade CTA for Free users */}
      {tier === 'free' && (
        <Card className="bg-gradient-to-r from-examai-purple-500/10 to-violet-500/10 border-examai-purple-500/20">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="font-semibold">Unlock Unlimited Access</h3>
              <p className="text-muted-foreground">
                Upgrade to Premium for unlimited generations and advanced features.
              </p>
            </div>
            <Button className="bg-gradient-cta">Upgrade to Premium</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### Usage Ring Component

```tsx
// src/components/usage/UsageRing.tsx

interface UsageRingProps {
  label: string;
  used: number;
  limit: number | null;
  color: 'purple' | 'blue' | 'amber' | 'green';
  warningThreshold?: number;
}

export function UsageRing({ 
  label, 
  used, 
  limit, 
  color, 
  warningThreshold = 0.8 
}: UsageRingProps) {
  const isUnlimited = limit === null;
  const percentage = isUnlimited ? 0 : (used / limit) * 100;
  const isWarning = !isUnlimited && percentage >= warningThreshold * 100;

  return (
    <Card className="p-6 text-center">
      <div className="relative w-24 h-24 mx-auto mb-4">
        {/* SVG circular progress */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted/20"
          />
          {!isUnlimited && (
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${percentage * 2.51} 251`}
              className={cn(
                isWarning ? 'text-amber-500' : `text-examai-${color}-500`
              )}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">
            {isUnlimited ? '∞' : used}
          </span>
        </div>
      </div>
      <p className="font-medium">{label}</p>
      <p className="text-sm text-muted-foreground">
        {isUnlimited ? 'Unlimited' : `${used} / ${limit}`}
      </p>
    </Card>
  );
}
```

## Error Handling

| Error Scenario | Handling Strategy |
|----------------|-------------------|
| Usage limit exceeded | Return 402 with limit details, trigger Upgrade Modal |
| Stripe checkout fails | Show error toast, log to monitoring, allow retry |
| Webhook signature invalid | Return 400, log security event |
| Database query fails | Retry with backoff, fall back to cached usage |
| User tier not found | Default to 'free' tier |
| Usage count race condition | Use database transaction for increment |

## Testing Strategy

### Unit Tests
- Tier limit configuration validation
- Usage calculation functions
- Date range calculations for billing periods
- Stripe webhook event parsing

### Property-Based Tests
- Usage counter consistency
- Limit enforcement correctness
- Tier upgrade/downgrade transitions
- Monthly reset behavior



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Usage Log Creation

*For any* AI generation event (lesson-plan, activity, worksheet, quiz, reading, slides, assessment, file-upload) triggered by any user, a corresponding usage_log entry SHALL be created with the correct user_id, generation_type, tier, and timestamp.

**Validates: Requirements 1.1**

### Property 2: Monthly Usage Reset

*For any* user and any two timestamps where the second timestamp is in a different calendar month than the first, the usage count query for the second month SHALL return 0 for all generation types (assuming no generations in the new month).

**Validates: Requirements 1.2**

### Property 3: Usage Aggregation Correctness

*For any* set of usage_log entries for a user within a calendar month, the usage query SHALL return counts that exactly match the number of entries for each generation_type.

**Validates: Requirements 1.3**

### Property 4: Free Tier Limit Enforcement

*For any* Free tier user and any generation type with limit L, the (L+1)th generation attempt within a calendar month SHALL be rejected with a 402 status code, while all attempts 1 through L SHALL succeed (assuming no other failures).

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

### Property 5: Premium Tier Unlimited Access

*For any* Premium tier user and any generation type, all generation attempts SHALL succeed regardless of the number of previous generations in the current month (assuming no other failures).

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 6: Tier Change Preserves History

*For any* user with existing usage_log entries, changing the user's tier SHALL NOT delete, modify, or affect any existing usage_log entries.

**Validates: Requirements 1.5**

### Property 7: Counter Increment on Success Only

*For any* generation attempt, the usage counter SHALL increment if and only if the generation completes successfully. Failed generations SHALL NOT increment the counter.

**Validates: Requirements 12.3, 12.4**

### Property 8: Tier State Machine Transitions

*For any* MercadoPago IPN webhook event sequence, the user's tier SHALL transition according to the state machine: status='authorized' → tier='premium', status='cancelled' or 'paused' → tier='free', and the tier SHALL remain consistent with the subscription_status.

**Validates: Requirements 10.2, 10.3, 10.4, 10.5, 10.6**

### Property 9: Rate Limit Headers Presence

*For any* response from a generate-* Edge Function, the response SHALL include X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset headers with valid values.

**Validates: Requirements 12.5**

### Property 10: Upgrade Modal Trigger

*For any* 402 response received by the frontend due to limit exceeded, the Upgrade Modal SHALL be displayed with the correct limit_type and current_usage values from the response.

**Validates: Requirements 4.1**

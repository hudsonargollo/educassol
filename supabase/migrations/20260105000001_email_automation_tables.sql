-- Migration: Email Automation System Tables
-- Requirements: 1.2, 2.1

-- ============================================
-- Table: email_logs
-- Stores all sent emails for auditing and spam prevention
-- ============================================
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'bounced', 'delivered', 'opened', 'clicked')),
  resend_message_id TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for email_logs
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_template_id ON public.email_logs(template_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON public.email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);

-- RLS for email_logs
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own email logs
CREATE POLICY "Users can view own email logs"
  ON public.email_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert/update email logs
CREATE POLICY "Service role can manage email logs"
  ON public.email_logs
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- Table: marketing_preferences
-- Stores user communication preferences (LGPD compliance)
-- ============================================
CREATE TABLE IF NOT EXISTS public.marketing_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  lgpd_consent BOOLEAN DEFAULT FALSE,
  newsletter BOOLEAN DEFAULT FALSE,
  product_updates BOOLEAN DEFAULT FALSE,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for marketing_preferences
CREATE INDEX IF NOT EXISTS idx_marketing_preferences_user_id ON public.marketing_preferences(user_id);

-- RLS for marketing_preferences
ALTER TABLE public.marketing_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own preferences
CREATE POLICY "Users can view own marketing preferences"
  ON public.marketing_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own marketing preferences"
  ON public.marketing_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can manage all preferences
CREATE POLICY "Service role can manage marketing preferences"
  ON public.marketing_preferences
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- Table: automation_queue
-- Stores scheduled/delayed email automations
-- ============================================
CREATE TABLE IF NOT EXISTS public.automation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'cancelled')),
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for automation_queue (only pending items)
CREATE INDEX IF NOT EXISTS idx_automation_queue_scheduled 
  ON public.automation_queue(scheduled_for) 
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_automation_queue_user_id ON public.automation_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_queue_status ON public.automation_queue(status);

-- RLS for automation_queue
ALTER TABLE public.automation_queue ENABLE ROW LEVEL SECURITY;

-- Users can view their own queued automations
CREATE POLICY "Users can view own automation queue"
  ON public.automation_queue
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage automation queue
CREATE POLICY "Service role can manage automation queue"
  ON public.automation_queue
  FOR ALL
  USING (auth.role() = 'service_role');

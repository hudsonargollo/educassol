# Database Webhooks Setup

## Overview

The email automation system uses database webhooks to trigger Edge Functions when certain events occur:

1. **auth.users INSERT** → Triggers `user.created` event for welcome emails
2. **usage_logs INSERT** → Triggers `usage.updated` event for usage alerts

## Required Configuration

### 1. Configure App Settings (Required)

The webhooks need the service role key to authenticate with Edge Functions. You have two options:

#### Option A: Using Supabase Vault (Recommended for Production)

```sql
-- Store the service role key in Vault
SELECT vault.create_secret(
  'service_role_key',
  'your-service-role-key-here'
);

-- Create a function to retrieve it
CREATE OR REPLACE FUNCTION get_service_role_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  secret_value TEXT;
BEGIN
  SELECT decrypted_secret INTO secret_value
  FROM vault.decrypted_secrets
  WHERE name = 'service_role_key';
  RETURN secret_value;
END;
$$;
```

#### Option B: Using Database Configuration (Simpler)

Run this SQL in the Supabase SQL Editor:

```sql
-- Set the Supabase URL (optional, has fallback)
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://ydktfxspjdggyeqhgvnv.supabase.co';

-- Set the service role key (REQUIRED)
ALTER DATABASE postgres SET app.settings.service_role_key = 'your-service-role-key-here';
```

**Important**: Replace `your-service-role-key-here` with your actual service role key from:
Supabase Dashboard → Settings → API → service_role key

### 2. Verify pg_net Extension

The migration enables the `pg_net` extension automatically. Verify it's enabled:

```sql
SELECT * FROM pg_extension WHERE extname = 'pg_net';
```

### 3. Test the Webhooks

#### Test User Created Webhook

Create a test user and check the logs:

```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created_webhook';

-- Check pg_net request queue
SELECT * FROM net._http_response ORDER BY created DESC LIMIT 5;
```

#### Test Usage Log Webhook

Insert a test usage log:

```sql
-- Insert a test usage log (replace with a valid user_id)
INSERT INTO public.usage_logs (user_id, generation_type, tier)
VALUES ('your-user-id', 'lesson-plan', 'free');

-- Check pg_net request queue
SELECT * FROM net._http_response ORDER BY created DESC LIMIT 5;
```

## Troubleshooting

### Webhook Not Firing

1. Check if triggers exist:
```sql
SELECT tgname, tgrelid::regclass, tgenabled 
FROM pg_trigger 
WHERE tgname LIKE '%webhook%';
```

2. Check for errors in PostgreSQL logs (Supabase Dashboard → Logs → Postgres)

3. Verify service role key is configured:
```sql
SELECT current_setting('app.settings.service_role_key', true);
```

### HTTP Requests Failing

1. Check pg_net response queue:
```sql
SELECT * FROM net._http_response 
WHERE status_code != 200 
ORDER BY created DESC LIMIT 10;
```

2. Verify Edge Function is deployed:
```bash
supabase functions list
```

## Security Notes

- The service role key should NEVER be exposed to clients
- The trigger functions use `SECURITY DEFINER` to run with elevated privileges
- All webhook calls are made server-side within PostgreSQL

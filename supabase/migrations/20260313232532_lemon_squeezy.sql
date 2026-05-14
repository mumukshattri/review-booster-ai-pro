ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS lemon_squeezy_subscription_id text,
  ADD COLUMN IF NOT EXISTS lemon_squeezy_customer_id text,
  ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz;

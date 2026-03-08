
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS sequence_step integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_send_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS sequence_stopped boolean NOT NULL DEFAULT false;

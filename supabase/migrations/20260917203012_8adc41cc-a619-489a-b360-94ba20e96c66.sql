ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS verify_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS token_expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days');

CREATE INDEX IF NOT EXISTS leads_verify_token_idx ON public.leads (verify_token);
CREATE TABLE public.kit_leads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name text NOT NULL,
  email text NOT NULL,
  business_name text,
  verified boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  verify_token uuid NOT NULL DEFAULT gen_random_uuid(),
  token_expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  download_count integer NOT NULL DEFAULT 0,
  device text,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX kit_leads_email_key ON public.kit_leads (lower(email));
CREATE INDEX kit_leads_verify_token_idx ON public.kit_leads (verify_token);

GRANT ALL ON public.kit_leads TO service_role;

ALTER TABLE public.kit_leads ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.assessment_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_token text NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(24), 'hex'),
  unsub_token uuid NOT NULL DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text,
  email text NOT NULL,
  phone text,
  sms_consent boolean NOT NULL DEFAULT false,
  score int NOT NULL,
  tier text NOT NULL,
  pillars jsonb NOT NULL,
  gap text NOT NULL,
  answers jsonb NOT NULL,
  site_origin text,
  report_views int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  purchased_at timestamptz,
  unsubscribed_at timestamptz
);
GRANT ALL ON public.assessment_results TO service_role;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
CREATE INDEX assessment_results_email_idx ON public.assessment_results (lower(email), created_at DESC);

CREATE TABLE public.consent_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  phone text,
  email_consent boolean NOT NULL,
  sms_consent boolean NOT NULL,
  consent_text text NOT NULL,
  consent_version text NOT NULL,
  consent_at timestamptz NOT NULL DEFAULT now(),
  page_url text,
  user_agent text,
  ip text
);
GRANT ALL ON public.consent_log TO service_role;
ALTER TABLE public.consent_log ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.sms_opt_outs (
  phone text PRIMARY KEY,
  opted_out_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.sms_opt_outs TO service_role;
ALTER TABLE public.sms_opt_outs ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.training_messages
  ADD COLUMN sequence text NOT NULL DEFAULT 'training',
  ADD COLUMN assessment_email text,
  ALTER COLUMN registration_id DROP NOT NULL;
CREATE INDEX training_messages_assess_idx ON public.training_messages (assessment_email) WHERE assessment_email IS NOT NULL;
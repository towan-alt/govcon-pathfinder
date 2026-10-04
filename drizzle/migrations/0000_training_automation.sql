CREATE TABLE public.training_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  email text NOT NULL,
  phone text,
  sms_consent boolean NOT NULL DEFAULT false,
  session_type text NOT NULL CHECK (session_type IN ('showing','live','instant')),
  session_start timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  attended_at timestamptz,
  watch_seconds integer NOT NULL DEFAULT 0,
  max_progress_pct integer NOT NULL DEFAULT 0,
  cta_clicked_at timestamptz,
  assessment_completed_at timestamptz,
  assessment_score integer,
  assessment_tier text,
  assessment_gap text,
  checkout_started_at timestamptz,
  purchased_at timestamptz,
  unsubscribed_at timestamptz,
  unsub_token uuid NOT NULL DEFAULT gen_random_uuid(),
  site_origin text,
  source text,
  device text
);
GRANT ALL ON public.training_registrations TO service_role;
ALTER TABLE public.training_registrations ENABLE ROW LEVEL SECURITY;
CREATE INDEX training_registrations_email_idx ON public.training_registrations (lower(email));
CREATE UNIQUE INDEX training_registrations_unsub_idx ON public.training_registrations (unsub_token);

CREATE TABLE public.training_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.training_registrations(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('email','sms')),
  template_key text NOT NULL,
  send_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','skipped','failed')),
  status_reason text,
  sent_template text,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.training_messages TO service_role;
ALTER TABLE public.training_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX training_messages_due_idx ON public.training_messages (send_at) WHERE status = 'queued';
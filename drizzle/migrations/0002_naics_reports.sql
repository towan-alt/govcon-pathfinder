CREATE TABLE public.naics_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text,
  email text NOT NULL,
  naics text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  status_reason text,
  opportunity_count int,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);
GRANT ALL ON public.naics_reports TO service_role;
ALTER TABLE public.naics_reports ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  business_name TEXT,
  industry TEXT,
  sam_status TEXT,
  certifications TEXT[] NOT NULL DEFAULT '{}',
  journey_stage TEXT,
  revenue TEXT,
  contract_size TEXT,
  contract_strategy TEXT,
  target_agencies TEXT,
  biggest_challenge TEXT,
  referral_source TEXT,
  recommendation TEXT,
  device TEXT,
  source TEXT,
  notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.funnel_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  cta_id TEXT,
  path TEXT,
  device TEXT,
  source TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX funnel_events_created_at_idx ON public.funnel_events (created_at DESC);

GRANT SELECT, INSERT ON public.funnel_events TO anon;
GRANT SELECT, INSERT ON public.funnel_events TO authenticated;
GRANT ALL ON public.funnel_events TO service_role;
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record a funnel event"
  ON public.funnel_events FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can read funnel events"
  ON public.funnel_events FOR SELECT TO anon, authenticated USING (true);
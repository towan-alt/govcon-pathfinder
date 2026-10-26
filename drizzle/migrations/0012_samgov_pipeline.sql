CREATE TABLE public.samgov_pipeline_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'running',
  stage text NOT NULL DEFAULT 'fetch',
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  fetched integer NOT NULL DEFAULT 0,
  new_opportunities integer NOT NULL DEFAULT 0,
  descriptions_fetched integer NOT NULL DEFAULT 0,
  matched integer NOT NULL DEFAULT 0,
  ai_scored integer NOT NULL DEFAULT 0,
  ai_skipped integer NOT NULL DEFAULT 0,
  ai_failed integer NOT NULL DEFAULT 0,
  warnings text[] NOT NULL DEFAULT '{}',
  error_message text,
  started_by uuid,
  started_at timestamptz NOT NULL DEFAULT now(),
  heartbeat_at timestamptz NOT NULL DEFAULT now(),
  lease_until timestamptz,
  completed_at timestamptz
);
GRANT SELECT ON public.samgov_pipeline_runs TO authenticated;
GRANT ALL ON public.samgov_pipeline_runs TO service_role;
ALTER TABLE public.samgov_pipeline_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read pipeline runs" ON public.samgov_pipeline_runs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.samgov_pipeline_secret (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  token text NOT NULL DEFAULT encode(extensions.gen_random_bytes(32), 'hex')
);
GRANT ALL ON public.samgov_pipeline_secret TO service_role;
ALTER TABLE public.samgov_pipeline_secret ENABLE ROW LEVEL SECURITY;
INSERT INTO public.samgov_pipeline_secret (id) VALUES (1);
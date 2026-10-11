ALTER TABLE public.samgov_opportunities
  ADD COLUMN filter_status text NOT NULL DEFAULT 'pending_filter' CHECK (filter_status IN ('pending_filter','matched','not_matched','filter_failed')),
  ADD COLUMN naics_match boolean,
  ADD COLUMN matched_naics_code text,
  ADD COLUMN keyword_match boolean,
  ADD COLUMN matched_keywords text[] NOT NULL DEFAULT '{}',
  ADD COLUMN matched_keyword_groups text[] NOT NULL DEFAULT '{}',
  ADD COLUMN filtered_at timestamptz,
  ADD COLUMN filter_config_version text,
  ADD COLUMN filter_error text;
CREATE INDEX samgov_opps_filter_status_idx ON public.samgov_opportunities (filter_status);

CREATE TABLE public.samgov_filter_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dry_run boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running','completed','completed_with_errors','failed')),
  config_version text NOT NULL,
  total_opportunities integer NOT NULL DEFAULT 0,
  processed integer NOT NULL DEFAULT 0,
  naics_only integer NOT NULL DEFAULT 0,
  keyword_only integer NOT NULL DEFAULT 0,
  both_match integer NOT NULL DEFAULT 0,
  neither integer NOT NULL DEFAULT 0,
  failed integer NOT NULL DEFAULT 0,
  error_message text,
  started_at timestamptz NOT NULL DEFAULT now(),
  heartbeat_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
GRANT SELECT ON public.samgov_filter_runs TO authenticated;
GRANT ALL ON public.samgov_filter_runs TO service_role;
ALTER TABLE public.samgov_filter_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read filter runs" ON public.samgov_filter_runs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
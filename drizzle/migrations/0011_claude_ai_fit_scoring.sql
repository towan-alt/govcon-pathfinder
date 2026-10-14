ALTER TABLE public.samgov_settings
  ADD COLUMN ai_model text NOT NULL DEFAULT 'claude-haiku-5-5' CHECK (ai_model IN ('claude-haiku-5-5','claude-sonnet-5-5')),
  ADD COLUMN ai_max_per_run integer NOT NULL DEFAULT 20 CHECK (ai_max_per_run BETWEEN 1 AND 200),
  ADD COLUMN ai_auto_scoring boolean NOT NULL DEFAULT false,
  ADD COLUMN ai_input_price_cents_per_mtok integer CHECK (ai_input_price_cents_per_mtok >= 0),
  ADD COLUMN ai_output_price_cents_per_mtok integer CHECK (ai_output_price_cents_per_mtok >= 0);
UPDATE public.samgov_settings SET ai_fit_threshold = 5 WHERE id = 1;

ALTER TABLE public.samgov_opportunities
  ADD COLUMN ai_status text NOT NULL DEFAULT 'not_scored' CHECK (ai_status IN ('not_scored','pending','scored','failed')),
  ADD COLUMN ai_score integer CHECK (ai_score BETWEEN 1 AND 10),
  ADD COLUMN ai_category text,
  ADD COLUMN ai_analysis jsonb,
  ADD COLUMN ai_error text,
  ADD COLUMN ai_model text,
  ADD COLUMN ai_scored_at timestamptz,
  ADD COLUMN ai_profile_hash text,
  ADD COLUMN ai_input_hash text,
  ADD COLUMN ai_limited_info boolean;
CREATE INDEX samgov_opp_ai_score_idx ON public.samgov_opportunities (ai_score DESC NULLS LAST);

CREATE TABLE public.samgov_ai_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES public.samgov_opportunities(id) ON DELETE CASCADE,
  run_id uuid,
  status text NOT NULL,
  fit_score integer, fit_category text, analysis jsonb, error text,
  model text NOT NULL, profile_hash text, input_hash text, limited_info boolean,
  input_tokens integer, output_tokens integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.samgov_ai_evaluations TO authenticated;
GRANT ALL ON public.samgov_ai_evaluations TO service_role;
ALTER TABLE public.samgov_ai_evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read ai evaluations" ON public.samgov_ai_evaluations FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE INDEX samgov_ai_eval_opp_idx ON public.samgov_ai_evaluations (opportunity_id, created_at DESC);

CREATE TABLE public.samgov_ai_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'running',
  mode text NOT NULL DEFAULT 'batch',
  queued integer NOT NULL DEFAULT 0, scored integer NOT NULL DEFAULT 0, failed integer NOT NULL DEFAULT 0,
  input_tokens integer NOT NULL DEFAULT 0, output_tokens integer NOT NULL DEFAULT 0,
  model text, error_message text,
  started_at timestamptz NOT NULL DEFAULT now(), heartbeat_at timestamptz NOT NULL DEFAULT now(), finished_at timestamptz
);
GRANT SELECT ON public.samgov_ai_runs TO authenticated;
GRANT ALL ON public.samgov_ai_runs TO service_role;
ALTER TABLE public.samgov_ai_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read ai runs" ON public.samgov_ai_runs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

UPDATE public.samgov_ai_profile SET profile_text = 'IGS is a strategic communications, marketing, public relations, event production, and government contracting company with 30+ years of experience.
Core services include strategic communications, public affairs, marketing, advertising, branding, digital campaigns, community outreach, stakeholder engagement, event planning, conference production, graphic design, video production, multimedia, livestreaming, and enrollment campaigns.
Past performance includes work with government and healthcare organizations such as USMC, SBA, MBDA, NPS, HHS/CDC/FDA, HRSA, and MedStar.
IGS primarily operates in the DMV region but may pursue suitable national opportunities.', updated_at = now() WHERE id = 1;
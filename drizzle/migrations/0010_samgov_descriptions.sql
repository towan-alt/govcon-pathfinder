ALTER TABLE public.samgov_opportunities
  ADD COLUMN description_text text,
  ADD COLUMN description_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN description_fetched_at timestamptz,
  ADD COLUMN description_error text,
  ADD COLUMN description_source_url text,
  ADD COLUMN description_attempted_at timestamptz,
  ADD COLUMN description_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN keyword_match_fields jsonb NOT NULL DEFAULT '{}'::jsonb;
UPDATE public.samgov_opportunities SET description_status = 'unavailable'
  WHERE description IS NULL OR description !~* '^https?://';
ALTER TABLE public.samgov_opportunities ADD CONSTRAINT samgov_opps_description_status_chk
  CHECK (description_status IN ('pending','fetched','unavailable','failed','retry_pending'));
CREATE INDEX samgov_opps_description_status_idx ON public.samgov_opportunities (description_status);

ALTER TABLE public.samgov_opportunities DROP CONSTRAINT samgov_opportunities_filter_status_check;
ALTER TABLE public.samgov_opportunities ADD CONSTRAINT samgov_opportunities_filter_status_check
  CHECK (filter_status IN ('pending_filter','matched','not_matched','filter_incomplete','filter_failed'));

ALTER TABLE public.samgov_filter_runs ADD COLUMN incomplete integer NOT NULL DEFAULT 0;

CREATE TABLE public.samgov_description_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mode text NOT NULL CHECK (mode IN ('missing','failed')),
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running','completed','completed_with_errors','stopped','failed')),
  total integer NOT NULL DEFAULT 0,
  processed integer NOT NULL DEFAULT 0,
  fetched integer NOT NULL DEFAULT 0,
  unavailable integer NOT NULL DEFAULT 0,
  failed integer NOT NULL DEFAULT 0,
  retry_pending integer NOT NULL DEFAULT 0,
  error_message text,
  started_at timestamptz NOT NULL DEFAULT now(),
  heartbeat_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
GRANT SELECT ON public.samgov_description_runs TO authenticated;
GRANT ALL ON public.samgov_description_runs TO service_role;
ALTER TABLE public.samgov_description_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read description runs" ON public.samgov_description_runs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
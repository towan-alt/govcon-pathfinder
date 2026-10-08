ALTER TABLE public.samgov_settings ADD COLUMN custom_posted_from date, ADD COLUMN custom_posted_to date;

CREATE TABLE public.samgov_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id text NOT NULL UNIQUE,
  solicitation_number text,
  title text,
  posted_date date,
  response_deadline timestamptz,
  naics_code text,
  type text,
  type_of_set_aside text,
  type_of_set_aside_description text,
  active text,
  organization text,
  full_parent_path_name text,
  department text,
  sub_tier text,
  office text,
  description text,
  ui_link text,
  point_of_contact jsonb NOT NULL DEFAULT '[]'::jsonb,
  raw_data jsonb NOT NULL,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX samgov_opps_last_seen_idx ON public.samgov_opportunities (last_seen_at DESC);
GRANT SELECT ON public.samgov_opportunities TO authenticated;
GRANT ALL ON public.samgov_opportunities TO service_role;
ALTER TABLE public.samgov_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read opportunities" ON public.samgov_opportunities FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER samgov_opps_touch BEFORE UPDATE ON public.samgov_opportunities FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.samgov_fetch_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running','completed','completed_with_errors','failed')),
  date_from date NOT NULL,
  date_to date NOT NULL,
  naics_codes_requested text[] NOT NULL DEFAULT '{}',
  total_api_requests integer NOT NULL DEFAULT 0,
  total_records_received integer NOT NULL DEFAULT 0,
  new_opportunities integer NOT NULL DEFAULT 0,
  updated_opportunities integer NOT NULL DEFAULT 0,
  duplicate_records integer NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.samgov_fetch_runs TO authenticated;
GRANT ALL ON public.samgov_fetch_runs TO service_role;
ALTER TABLE public.samgov_fetch_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read fetch runs" ON public.samgov_fetch_runs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
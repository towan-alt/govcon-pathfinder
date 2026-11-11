-- 1. Dynamic opportunity status derived from response deadline + SAM.gov active flag
ALTER TABLE public.samgov_opportunities ADD COLUMN computed_status text;

CREATE OR REPLACE FUNCTION public.samgov_opp_status(_deadline timestamptz, _samgov_active text)
RETURNS text LANGUAGE sql STABLE AS $$
  SELECT CASE
    WHEN _samgov_active IS NOT NULL AND _samgov_active <> 'Yes' THEN 'inactive'
    WHEN _deadline IS NULL THEN 'unknown'
    WHEN _deadline > now() THEN 'active'
    ELSE 'expired'
  END
$$;

UPDATE public.samgov_opportunities
SET computed_status = public.samgov_opp_status(response_deadline, active);

CREATE OR REPLACE FUNCTION public.samgov_opp_status_touch()
RETURNS trigger LANGUAGE plpgsql AS $fn$
BEGIN
  NEW.computed_status := public.samgov_opp_status(NEW.response_deadline, NEW.active);
  RETURN NEW;
END
$fn$;

CREATE TRIGGER samgov_opp_status_touch
BEFORE INSERT OR UPDATE OF response_deadline, active ON public.samgov_opportunities
FOR EACH ROW EXECUTE FUNCTION public.samgov_opp_status_touch();

-- Hourly recompute so deadlines that pass without a row update still flip to expired
SELECT cron.schedule('samgov-status-refresh', '17 * * * *', $job$
  UPDATE public.samgov_opportunities
  SET computed_status = public.samgov_opp_status(response_deadline, active)
  WHERE computed_status IS DISTINCT FROM public.samgov_opp_status(response_deadline, active);
$job$);

-- 2. Opportunity report subscriptions (guest, email-verified; service-role only)
CREATE TABLE public.opportunity_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  frequency text NOT NULL DEFAULT 'weekly',
  naics_codes text[] NOT NULL DEFAULT '{}',
  keywords text[] NOT NULL DEFAULT '{}',
  min_ai_score integer,
  verify_token uuid NOT NULL DEFAULT gen_random_uuid(),
  unsub_token uuid NOT NULL DEFAULT gen_random_uuid(),
  verified_at timestamptz,
  last_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email)
);
GRANT ALL ON public.opportunity_subscriptions TO service_role;
ALTER TABLE public.opportunity_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.opportunity_report_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.opportunity_subscriptions(id) ON DELETE CASCADE,
  report_type text NOT NULL,
  opportunity_ids uuid[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'sent',
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.opportunity_report_sends TO service_role;
ALTER TABLE public.opportunity_report_sends ENABLE ROW LEVEL SECURITY;

-- 3. Token for the hourly digest runner (same pattern as samgov_pipeline_secret)
CREATE TABLE public.opportunity_digest_secret (
  id integer PRIMARY KEY DEFAULT 1,
  token text NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex')
);
INSERT INTO public.opportunity_digest_secret (id) VALUES (1);
GRANT ALL ON public.opportunity_digest_secret TO service_role;
ALTER TABLE public.opportunity_digest_secret ENABLE ROW LEVEL SECURITY;

SELECT cron.schedule('opportunity-digest-runner', '43 * * * *', $job$
  select net.http_post(
    url := 'https://qjvctpmpxeadawbigroz.supabase.co/functions/v1/opportunity-digest',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || (select token from public.opportunity_digest_secret where id = 1)),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000);
$job$);
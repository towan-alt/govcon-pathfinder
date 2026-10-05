CREATE TABLE public.naics_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  email text NOT NULL,
  naics text NOT NULL,
  unsub_token uuid NOT NULL DEFAULT gen_random_uuid(),
  last_sent_at timestamptz,
  last_status text,
  send_count integer NOT NULL DEFAULT 0,
  unsubscribed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email, naics)
);
GRANT ALL ON public.naics_subscriptions TO service_role;
ALTER TABLE public.naics_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.naics_digest_state (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  locked_until timestamptz,
  paused_reason text,
  last_run_at timestamptz
);
GRANT ALL ON public.naics_digest_state TO service_role;
ALTER TABLE public.naics_digest_state ENABLE ROW LEVEL SECURITY;
INSERT INTO public.naics_digest_state (id) VALUES (1);
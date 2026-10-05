CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_token text NOT NULL DEFAULT encode(extensions.gen_random_bytes(24), 'hex'),
  email text NOT NULL,
  first_name text,
  product text NOT NULL,
  intake jsonb NOT NULL DEFAULT '{}'::jsonb,
  intake_submitted_at timestamptz,
  credit_expires_at timestamptz,
  credit_redeemed_at timestamptz,
  plan_delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX clients_portal_token_idx ON public.clients (portal_token);
CREATE INDEX clients_email_idx ON public.clients (email);
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.client_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients (id) ON DELETE CASCADE,
  label text NOT NULL,
  file_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.client_documents TO service_role;
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.samgov_api_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'samgov' UNIQUE,
  api_key_encrypted text NOT NULL,
  api_key_last4 text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  last_test_status text NOT NULL DEFAULT 'not_tested' CHECK (last_test_status IN ('not_tested','success','failed')),
  last_tested_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.samgov_api_credentials TO service_role;
ALTER TABLE public.samgov_api_credentials ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER samgov_creds_touch BEFORE UPDATE ON public.samgov_api_credentials FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
COMMENT ON TABLE public.samgov_api_credentials IS 'Service-role only. Access via samgov-credentials edge function (admin-checked). Key is AES-GCM encrypted.';
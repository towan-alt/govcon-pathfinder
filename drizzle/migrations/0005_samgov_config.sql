DO $$ BEGIN CREATE TYPE public.app_role AS ENUM ('admin', 'user'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TABLE public.samgov_naics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE CHECK (code ~ '^[0-9]{2,6}$'),
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.samgov_keyword_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.samgov_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.samgov_keyword_groups(id) ON DELETE CASCADE,
  keyword text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, keyword)
);
CREATE TABLE public.samgov_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  ai_scoring_enabled boolean NOT NULL DEFAULT true,
  ai_fit_threshold integer NOT NULL DEFAULT 5 CHECK (ai_fit_threshold BETWEEN 1 AND 10),
  default_date_range text NOT NULL DEFAULT '7' CHECK (default_date_range IN ('7','14','30','60','90','custom')),
  results_per_request integer NOT NULL DEFAULT 100 CHECK (results_per_request BETWEEN 1 AND 1000),
  auto_pagination boolean NOT NULL DEFAULT true,
  match_title boolean NOT NULL DEFAULT true,
  match_description boolean NOT NULL DEFAULT true,
  match_additional_description boolean NOT NULL DEFAULT true,
  match_solicitation_information boolean NOT NULL DEFAULT true,
  case_insensitive boolean NOT NULL DEFAULT true,
  partial_phrase_matching boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.samgov_ai_profile (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  profile_text text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.samgov_naics, public.samgov_keyword_groups, public.samgov_keywords, public.samgov_settings, public.samgov_ai_profile TO authenticated;
GRANT ALL ON public.samgov_naics, public.samgov_keyword_groups, public.samgov_keywords, public.samgov_settings, public.samgov_ai_profile TO service_role;

ALTER TABLE public.samgov_naics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.samgov_keyword_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.samgov_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.samgov_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.samgov_ai_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage naics" ON public.samgov_naics FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage keyword groups" ON public.samgov_keyword_groups FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage keywords" ON public.samgov_keywords FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage settings" ON public.samgov_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage ai profile" ON public.samgov_ai_profile FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER samgov_naics_touch BEFORE UPDATE ON public.samgov_naics FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER samgov_groups_touch BEFORE UPDATE ON public.samgov_keyword_groups FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER samgov_keywords_touch BEFORE UPDATE ON public.samgov_keywords FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER samgov_settings_touch BEFORE UPDATE ON public.samgov_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER samgov_profile_touch BEFORE UPDATE ON public.samgov_ai_profile FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
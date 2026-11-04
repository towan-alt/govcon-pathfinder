DROP POLICY IF EXISTS "Anyone can read funnel events" ON public.funnel_events;
DROP POLICY IF EXISTS "Anyone can record a funnel event" ON public.funnel_events;
CREATE POLICY "Admins can read funnel events" ON public.funnel_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Visitors can record valid funnel events" ON public.funnel_events FOR INSERT TO anon, authenticated WITH CHECK (
  length(event_name) BETWEEN 1 AND 100
  AND (cta_id IS NULL OR length(cta_id) <= 200)
  AND (path IS NULL OR length(path) <= 500)
  AND (device IS NULL OR length(device) <= 50)
  AND (source IS NULL OR length(source) <= 200)
  AND (session_id IS NULL OR length(session_id) <= 100)
);
ALTER TABLE public.opportunity_subscriptions ADD COLUMN user_id uuid, ADD COLUMN next_send_at timestamptz NOT NULL DEFAULT now(), ADD COLUMN lease_until timestamptz, ADD COLUMN verify_expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours');
CREATE UNIQUE INDEX opportunity_subscription_user ON public.opportunity_subscriptions(user_id) WHERE user_id IS NOT NULL;
GRANT SELECT ON public.opportunity_subscriptions TO authenticated;
CREATE POLICY "Owners read subscriptions" ON public.opportunity_subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid());
ALTER TABLE public.opportunity_report_sends ADD COLUMN sent_at timestamptz, ADD COLUMN attempts integer NOT NULL DEFAULT 0, ADD COLUMN retry_at timestamptz, ADD COLUMN payload jsonb, ADD COLUMN idempotency_key uuid NOT NULL DEFAULT gen_random_uuid();
GRANT SELECT ON public.opportunity_report_sends TO authenticated;
CREATE POLICY "Owners read report history" ON public.opportunity_report_sends FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.opportunity_subscriptions s WHERE s.id = subscription_id AND s.user_id = auth.uid()));
CREATE INDEX opportunity_subscription_due ON public.opportunity_subscriptions(next_send_at) WHERE status = 'active';
COMMENT ON COLUMN public.opportunity_subscriptions.user_id IS 'Verified account owner; assigned only by authenticated subscription function.';
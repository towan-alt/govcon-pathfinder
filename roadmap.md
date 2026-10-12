# Roadmap

## Eduardo feedback (2026-10-12)
- [x] Simplify webinar choices to on-demand and one clearly labeled recorded showing; reserve only after confirmation (a3c2dc2c-7234-431d-9a92-1d0c0331ee7e).
- [x] Clarify the offer ladder and verify $2,500 VIP pricing (b9fafce4-5af7-4f1d-b5d3-0c3bbeeeba2c, d9f91e30-f1a6-4f99-9800-f3b3a0665076).
- [x] Highlight Review deliverables and explain the credit without misstating its current purchase-based expiry (8055a8bb-771c-48f0-bc2d-2e8cb1505f2e).
- [ ] Start credit after the session — needs an approved reliable session-completion signal; current expiry remains purchase-based.
- [x] Lead VIP with the whole engagement, not just session length (31533276-6546-4dca-8575-f836202f2c5d).
- [ ] Define VIP support duration, channel use and plan-delivery timeline — needs owner terms and approved sample deliverable.
- [x] Clarify payment-to-session steps and wire the provided Zoom scheduler (fda4c6ad-5907-450e-8cf2-93509a714631).
- [ ] Live payment-to-session validation — needs Payhip checkout URLs/product mappings and configured email sender; public browser checks and four regression tests passed.
- [ ] Finished captioned introduction, method and testimonial videos require owner assets (d9f01bb2-27b5-4860-9225-e9bb1f7b1f98).

## New
- [ ] Switch payments from Square to Payhip (user request 2026-10-05) — Payhip is not a Lovable-managed provider; needs BYOK API integration or reconsideration
- [ ] Webinar page: free registration + live date, awareness funnel ends there (not the training banner)
- [x] Point NAICS + training scheduling buttons to real booking link — shared BOOKING_URL now uses the provided Zoom scheduler

## Funnel restructure (approved plan 2026-10-05)
- [x] Homepage: new section order, hero primary CTA = "Get My NAICS Codes + Report", nav = About / How It Works / Services / Resources + free-report button
- [x] /naics rebuild: full intake form (name, email, business, description, website, industries), on-screen suggested-codes report, Launch Kit next step
- [x] $19 Launch Kit: Square product launch_kit, sales page /launch-kit, confirmed page /launch-kit/confirmed, receipt + download email (booklet PDF still needed)
- [x] $497 Readiness Review copy: 10 review areas, one 60-minute planning session, new deliverables list
- [x] $2,500 VIP page: 2-hour intensive, 9 inclusions, $497 vs $2,500 distinction
- [x] Client portal: clients + client_documents tables, private client-documents bucket, portal edge function, /portal page (save-and-resume intake, uploads, "I don't have this yet", status, credit expiry)
- [x] Post-purchase onboarding: square-verify creates portal record, sends intake email ("Complete My Intake & Upload Documents"), 14-day $497 to VIP credit with single redemption
- [ ] Member resources library (monthly session recordings by topic/date) — needs access duration + Slack/WhatsApp invite links
- [ ] Stage-based email sequences beyond purchase confirmation (free-report → kit → review → VIP) — needs approved copy
- [ ] Still needed from owner: Square keys, Resend key + verified gogovcon.com domain, Twilio keys, SAM_GOV_API_KEY, gold Capitol logo PNG, BOOKING_URL, booklet PDF, mailing address, member access terms, opportunity-email frequency
- [x] Wire real booklet PDF as the Launch Kit download (CDN asset, STARTER_KIT_URL)

- [x] Webinar form: last name, business name, required mobile
- [x] Center step numbers on registration confirmation
- [x] Email sequences: webinar follow-ups, assessment invites, 14-day $497 credit offer (send once Resend key is added)
- [x] SEO pass (canonical domain, Event schema)

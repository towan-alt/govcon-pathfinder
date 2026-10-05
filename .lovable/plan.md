# GoGovCon Funnel Restructure

Implement the uploaded spec: Marketing → Free NAICS Report → $19 Launch Kit → $497 Readiness Review → $2,500 VIP. Confirmed decisions: NAICS report is the homepage primary CTA, the free assessment moves inside the $497 service, the $19 Launch Kit is built.

## 1. Homepage reorganization
- New section order: Hero → Credibility/past performance → Free NAICS report explainer → Three paid offers comparison ($19 / $497 / $2,500) → Sample deliverables & outcomes → Towan intro → FAQ → Final CTA.
- Hero keeps "Sell to the Government. Grow Your Business."; primary button "Get My NAICS Codes + Report" → /naics; secondary "Compare Services" → #services.
- Nav: About, How It Works, Services, Resources, plus prominent free-report button. Free Training stays as a supporting resource (menu/footer/training pages), no longer the primary CTA.
- Update memory: homepage primary CTA is now the NAICS report.

## 2. Free NAICS Codes + Report (rebuild /naics)
- Form: name, email, business name, products/services description, website (optional), customer types/industries.
- Report: suggested NAICS codes with plain-language descriptions, explanation tying codes to their description, clear next step. Wording: "suggestions", never an official classification.
- Report shows on-screen after submission and is emailed (Resend, when key exists).
- Report + email end with: "Ready to get started? Put your business foundation in place with the GovCon Launch Kit." + button "Get the Launch Kit — $19".
- Keep existing SAM.gov opportunity list and weekly digest as part of the report.

## 3. $19 GovCon Launch Kit
- New Square product `launch_kit` ($19, one-time) in src/lib/funnel.ts + supabase/functions/_shared/square.ts, returnPath /launch-kit/confirmed.
- Sales section/page: "Get your business foundation in place." Includes approved booklet, EIN/banking/NAICS/SAM.gov guidance, setup roadmap, official resource links. No consultation included.
- After verified payment: download access on confirmation page, receipt + download link email, Launch Kit follow-up sequence (reuses training_messages engine with sequence="launchkit"), acquisition emails stop on purchase.
- Next-offer message: "You have the roadmap. Now find out how ready your business is—and which agencies you should target." + "Get My Comprehensive Readiness Review — $497".
- Booklet file is missing: download stays a placeholder until the PDF is supplied.

## 4. $497 Readiness Review updates
- Promise copy updated to the spec's sentence; ten review areas listed.
- Deliverables updated: scorecard, executive summary, 5 target agencies, 90-day plan, ONE 60-minute planning session + recording, Slack + WhatsApp access, matched opportunity emails, monthly on-demand sessions, $497 VIP credit within 14 days of the session.
- Replace any "two 30-minute sessions" references with one 60-minute session.
- Free assessment removed as a public funnel step: /assessment becomes part of the $497 onboarding (scorecard input); homepage/nav/footer already point elsewhere. Assessment follow-up emails keep working for existing leads.

## 5. Client portal (intake + documents)
- New tables: clients (token, email, product, status), intake_submissions, client_documents (private storage bucket).
- Portal at /portal?t=<token>: email verification, expiring invitation link, save-and-resume intake, document uploads ("I don't have this yet" options), submission status, final plan/recordings access.
- Server-enforced access: clients see only their own records; service-role staff access.
- Post-purchase email: confirmation + "Complete My Intake & Upload Documents" button, materials list, scheduling instructions, deadline.
- Intake confirmation email, stop reminders on submit, reviewer notification email to Towan's address.

## 6. $2,500 VIP updates
- Copy: "Build a deeper strategy for pursuing the right federal opportunities." Add capture priorities, past-performance strategy, defined follow-up support; same community/opportunity-email benefits.
- Clarify distinction $497 vs $2,500; direct VIP purchase = 2-hour intensive only, no extra $497 session.

## 7. Upgrade credit
- $497 credit window starts at completed planning session; expiration shown in portal + follow-up email; VIP checkout shows $2,500 − $497 = $2,003; single redemption enforced server-side; reminders stop after redemption/expiration.

## 8. Member resources
- Portal section: Slack/WhatsApp invites, monthly session library (topic/date, recording, summary, resources), matched opportunity emails (title, org, source link, deadline, relevance, next action; expired screened out).
- Access duration and email frequency are configurable constants — left as clearly marked placeholders until terms are supplied.

## 9. Email workflows by stage
- Sequences via existing training_messages engine: free-report, launchkit, readiness (intake/reminders/delivery/upgrade), VIP onboarding, member announcements. Action-based sends, no duplicates, stop on purchase.

## 10. Verification
- Playwright pass: homepage order, NAICS form→report, each checkout (sandbox), portal access isolation, mobile 390px layouts.

## Blocked on user-supplied items
- Square keys (all checkouts), Resend key + verified gogovcon.com domain (all email), Twilio keys (SMS), SAM.gov key (opportunity data), the Launch Kit booklet PDF, booking/scheduling URL, Slack/WhatsApp invite links, mailing address, membership access duration + opportunity-email frequency terms.

## Technical notes
- Payments stay Square (square-checkout/square-verify); new product keys added to both catalogs.
- All follow-up copy lives in _shared template files; no em-dashes in new copy.
- Stats from src/lib/brand.ts; colors/fonts from index.css tokens; headings keep !leading-[x].
- New tables get GRANTs + RLS in the same migration; portal data is service-role only behind token-gated edge function.

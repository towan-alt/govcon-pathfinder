# AGENTS.md

## Rules

- Display headings must pair a responsive `text-*` size with an important leading utility (`!leading-[x]`). Responsive `text-*` utilities emit their own line-height inside a media query and silently override a plain `leading-*`, which made large headings render with line-height below font-size and overlap lines.
- All published credibility figures live in `src/lib/brand.ts` (`BRAND`, `STATS`, `FIGURES`) and components must read them from there. Hardcoded numbers in components drift and produce contradictory claims across pages.
- Colors and fonts come only from tokens in `src/index.css` (`--navy`, `--gold`, `--teal`, etc.); never hardcode hsl/hex in components. Hardcoded values drifted from the brand guide across pages.
- Training funnel config (offer list, Square product catalog and static Square link fallbacks, BOOKING_URL/STARTER_KIT_URL/REPLAY_VIDEO_URL, session scheduling, lead/result storage keys) lives in `src/lib/funnel.ts`; pages read from it so the offer stays consistent everywhere.
- Payments run through Square: `square-checkout` creates hosted payment links and `square-verify` confirms COMPLETED payments via the Orders/Payments APIs; server-side prices live in `supabase/functions/_shared/square.ts` mirroring `SQUARE_PRODUCTS` in `src/lib/funnel.ts`. The browser must never set its own price, and Stripe is no longer used.
- Evergreen training: registrations and the follow-up queue live in `training_registrations` / `training_messages` (service-role only, accessed through the `training` function); `training-automation` (pg_cron every 5 min, TRAINING_CRON_SECRET bearer) resolves each queued message at send time and skips it when its condition no longer holds. All follow-up copy lives in `supabase/functions/_shared/training-templates.ts`; channels without secrets are marked skipped, never failed.

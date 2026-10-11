# AGENTS.md

## Rules

- The SAM.gov API key lives AES-GCM encrypted (SAMGOV_KEY_ENCRYPTION_SECRET) in `samgov_api_credentials` (service-role only); only the admin-checked `samgov-credentials` function touches it and returns last4/status, never the key. Server code reads it via `_shared/samgov-key.ts` `getSamgovApiKey()`, so the secret never reaches the browser.
- SAM.gov retrieval is manual and step-based: `samgov-fetch` (admin-checked) runs start -> naics (one call per active code, paginated with per-run request cap) -> finish so the page shows real progress; it upserts raw notices into `samgov_opportunities` (unique notice_id, full raw_data) and logs each run in `samgov_fetch_runs`. Both tables are admin-read via RLS, written only by service role.
- Phase 3 rule filtering: `samgov-filter` (admin-checked, step-based start -> batch(200, keyset by id) -> finish) applies `naics_match OR keyword_match` from the live /samgov config tables and writes match reasons + `filter_status` onto `samgov_opportunities`; dry runs only update the `samgov_filter_runs` log. A config hash (`filter_config_version`) aborts runs whose settings change mid-run, and a heartbeat on running runs blocks concurrent processing.

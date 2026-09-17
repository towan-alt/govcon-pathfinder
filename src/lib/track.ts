import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "ggc_session_id";
const SOURCE_KEY = "ggc_source";

export function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function getDevice(): "mobile" | "tablet" | "desktop" {
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

export function getSource(): string {
  const stored = sessionStorage.getItem(SOURCE_KEY);
  if (stored) return stored;

  const params = new URLSearchParams(window.location.search);
  const utm = params.get("utm_source");
  let source = utm?.toLowerCase() ?? "";

  if (!source) {
    const ref = document.referrer;
    if (!ref) {
      source = "direct";
    } else {
      try {
        const host = new URL(ref).hostname.replace(/^www\./, "");
        source = host === window.location.hostname ? "direct" : host;
      } catch {
        source = "direct";
      }
    }
  }

  sessionStorage.setItem(SOURCE_KEY, source);
  return source;
}

export async function trackEvent(eventName: string, ctaId?: string) {
  try {
    await supabase.from("funnel_events").insert({
      event_name: eventName,
      cta_id: ctaId ?? null,
      path: window.location.pathname,
      device: getDevice(),
      source: getSource(),
      session_id: getSessionId(),
    });
  } catch {
    // tracking must never block the user
  }
}

/** Records a CTA click without delaying navigation. */
export function trackCta(ctaId: string) {
  void trackEvent("cta_click", ctaId);
}

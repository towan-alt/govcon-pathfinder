import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE = "https://govcon-pathfinder.lovable.app";
const BRAND = "GoGovCon";

type Meta = { title: string; description: string; noindex?: boolean };

const PAGES: Record<string, Meta> = {
  "/": {
    title: "GovCon Expert Towan Isom | GoGovCon Government Contracting Training",
    description:
      "Learn to sell to the government with GovCon expert Towan Isom and the GovCon Expert Method™. Free federal contracting training, NAICS lookup and readiness assessment for small businesses.",
  },
  "/about": {
    title: "About Towan Isom, GovCon Expert | GoGovCon",
    description:
      "Meet Towan Isom, GovCon expert and Founder, President & CEO of Isom Global Strategies. 74+ federal contracts across 76+ agencies and 9,000+ business owners trained.",
  },
  "/webinar": {
    title: "Free Government Contracting Webinar | GovCon Expert Method™",
    description:
      "Register for the free 30-minute government contracting webinar with GovCon expert Towan Isom. Pick a session time or watch the on-demand replay.",
  },
  "/training": {
    title: "Free Government Contracting Training | GovCon Expert Method™",
    description:
      "Watch the free 30-minute government contracting training from GovCon expert Towan Isom. Avoid the five mistakes that keep small businesses from winning federal contracts.",
  },
  "/naics": {
    title: "Free NAICS Code Lookup for Government Contracting | GoGovCon",
    description:
      "Find the right NAICS codes for your business and get open federal opportunities from SAM.gov sent to your inbox. Free tool from GovCon expert Towan Isom.",
  },
  "/assessment": {
    title: "Free GovCon Readiness Assessment | GoGovCon",
    description:
      "Score your federal contracting readiness in 3 minutes across five pillars and get a personalized Readiness Report from GovCon expert Towan Isom.",
  },
  "/launch-kit": {
    title: "GovCon Launch Kit — $19 | GoGovCon",
    description:
      "Get your business foundation in place: the GovCon Launch Kit booklet, EIN, banking, NAICS and SAM.gov guidance, and an organized setup roadmap.",
  },
  "/readiness-review": {
    title: "GovCon Readiness Review with Towan Isom | GoGovCon",
    description:
      "A 1:1 strategy session with GovCon expert Towan Isom, your Top 5 Target Agency List and a written 90-Day Federal Action Plan.",
  },
  "/vip-engagement": {
    title: "VIP Engagement: 2-Hour Virtual Intensive with Towan Isom | GoGovCon",
    description:
      "A 2-hour virtual 1:1 strategy intensive with GovCon expert Towan Isom: written action plan, session recording, teaming assistance and ongoing Slack, WhatsApp and email access.",
  },
  "/contact": { title: "Contact GoGovCon | Towan Isom", description: "Get in touch with GoGovCon and GovCon expert Towan Isom about federal contracting training and advisory." },
  "/privacy": { title: "Privacy Policy | GoGovCon", description: "How GoGovCon collects, uses and protects your information." },
  "/terms": { title: "Terms of Service | GoGovCon", description: "Terms for using GoGovCon training, tools and services." },
  "/accessibility": { title: "Accessibility | GoGovCon", description: "GoGovCon's commitment to an accessible website." },
  "/disclaimer": { title: "Disclaimer | GoGovCon", description: "Important disclaimers about GoGovCon training and results." },
};

const PRIVATE = ["/assessment/report", "/book", "/analytics", "/confirm", "/training/registered", "/training/watch", "/readiness-review/confirmed", "/vip-engagement/confirmed", "/launch-kit/confirmed", "/portal", "/unsubscribe"];

export default function RouteSeo() {
  const { pathname } = useLocation();
  const path = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  const meta: Meta = PAGES[path] ?? {
    title: `${BRAND} | GovCon Expert Towan Isom`,
    description: PAGES["/"].description,
    noindex: true,
  };
  const noindex = meta.noindex || PRIVATE.includes(path);
  const url = `${SITE}${path === "/" ? "/" : path}`;
  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      {noindex && <meta name="robots" content="noindex, follow" />}
    </Helmet>
  );
}

/**
 * Single source of truth for brand naming and verified credibility figures.
 * Every page must read numbers from here — no hardcoded stats in components.
 * Figures below come from Towan Isom's verified bio.
 */

export const BRAND = {
  platform: "GoGovCon",
  founder: "Towan Isom",
  founderRole: "Founder & Federal Contracting Strategist",
  method: "GovCon Expert Method™",
  firm: "Isom Global Strategies",
  tagline: "The GovCon Expert Method™, from GoGovCon — founded and led by Towan Isom.",
  email: "hello@gogovcon.com",
  social: {
    instagram: "https://instagram.com/towanisomceo/",
    youtube: "https://youtube.com/@towanisom5164",
    tiktok: "https://tiktok.com/@towanisomceo",
  },
} as const;

/** Verified headline figures. Distinctions are spelled out in the labels. */
export const STATS = [
  { value: "74+", label: "Federal Contracts Executed" },
  { value: "76+", label: "Federal Agencies Served" },
  { value: "$27M+", label: "In Contract Wins Supported" },
  { value: "9,000+", label: "Small Business Owners Trained" },
] as const;

export const FIGURES = {
  contracts: "74+",
  agencies: "76+",
  winsSupported: "$27M+",
  years: "30",
  thriveValue: "$3.9M",
  thriveTrained: "9,000+",
  thriveRate: "94%",
} as const;

export const SEAL_DISCLAIMER =
  "Agency seals shown as past-performance references only. They do not imply endorsement by any federal agency.";

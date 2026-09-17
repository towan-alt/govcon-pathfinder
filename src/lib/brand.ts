/**
 * Single source of truth for brand naming and verified credibility figures.
 * Every page must read numbers from here — no hardcoded stats in components.
 */

export const BRAND = {
  platform: "GoGovCon",
  founder: "Towan Isom",
  founderRole: "Founder & Federal Contracting Strategist",
  method: "The GovCon Blueprint",
  tagline: "The GovCon Blueprint, from GoGovCon — founded and led by Towan Isom.",
  email: "hello@gogovcon.com",
  social: {
    instagram: "https://instagram.com/towanisomceo/",
    youtube: "https://youtube.com/@towanisom5164",
    tiktok: "https://tiktok.com/@towanisomceo",
  },
} as const;

/** Verified headline figures. Distinctions are spelled out in the labels. */
export const STATS = [
  { value: "109+", label: "Contracts & Task Orders Managed" },
  { value: "$27M+", label: "In Federal Contract Value" },
  { value: "1,000+", label: "Businesses Directly Trained" },
  { value: "6,500+", label: "Coached Via National Programs" },
] as const;

export const FIGURES = {
  contracts: "109+",
  contractValue: "$27M+",
  companyRevenue: "$25M+",
  trained: "1,000+",
  coached: "6,500+",
  years: "25+",
  tasksDelivered: "5,893",
  applicationsGenerated: "4,348",
  cohorts: "50",
} as const;

export const SEAL_DISCLAIMER =
  "Agency seals shown as past-performance references only. They do not imply endorsement by any federal agency.";

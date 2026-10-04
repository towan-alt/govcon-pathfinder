# AGENTS.md

## Rules

- Display headings must pair a responsive `text-*` size with an important leading utility (`!leading-[x]`). Responsive `text-*` utilities emit their own line-height inside a media query and silently override a plain `leading-*`, which made large headings render with line-height below font-size and overlap lines.
- All published credibility figures live in `src/lib/brand.ts` (`BRAND`, `STATS`, `FIGURES`) and components must read them from there. Hardcoded numbers in components drift and produce contradictory claims across pages.
- Colors and fonts come only from tokens in `src/index.css` (`--navy`, `--gold`, `--teal`, etc.); never hardcode hsl/hex in components. Hardcoded values drifted from the brand guide across pages.

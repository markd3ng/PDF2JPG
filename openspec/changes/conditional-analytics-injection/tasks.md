## 1. Type Definitions & Environment Configuration

- [x] 1.1 Add all 7 analytics service type declarations to `src/env.d.ts` (`PUBLIC_CLARITY_ID`, `PUBLIC_GA_ID`, `PUBLIC_ADSENSE_PUBLISHER_ID`, `PUBLIC_PLAUSIBLE_DOMAIN`, `PUBLIC_PLAUSIBLE_SRC`, `PUBLIC_FATHOM_SITE_ID`, `PUBLIC_FATHOM_SRC`, `PUBLIC_UMAMI_WEBSITE_ID`, `PUBLIC_UMAMI_SRC`, `PUBLIC_MATOMO_SITE_ID`, `PUBLIC_MATOMO_URL`)
- [x] 1.2 Add all analytics service placeholder entries to `.env.example` with documentation comments

## 2. Conditional Script Injection

- [x] 2.1 Remove hardcoded Microsoft Clarity `<script>` block from `src/pages/index.astro` (lines 92-99)
- [x] 2.2 Add Microsoft Clarity conditional injection in `src/pages/index.astro` (gated by `PUBLIC_CLARITY_ID`)
- [x] 2.3 Add Google Analytics 4 conditional injection in `src/pages/index.astro` (gated by `PUBLIC_GA_ID`)
- [x] 2.4 Add Google AdSense conditional injection in `src/pages/index.astro`: no `PUBLIC_ADSENSE_PUBLISHER_ID` → render placeholder div; configured → inject adsbygoogle.js + render ad unit
- [x] 2.5 Add Plausible conditional injection in `src/pages/index.astro` (gated by `PUBLIC_PLAUSIBLE_DOMAIN`, optional `PUBLIC_PLAUSIBLE_SRC`)
- [x] 2.6 Add Fathom conditional injection in `src/pages/index.astro` (gated by `PUBLIC_FATHOM_SITE_ID`, optional `PUBLIC_FATHOM_SRC`)
- [x] 2.7 Add Umami conditional injection in `src/pages/index.astro` (gated by `PUBLIC_UMAMI_WEBSITE_ID`, optional `PUBLIC_UMAMI_SRC`)
- [x] 2.8 Add Matomo conditional injection in `src/pages/index.astro` (gated by `PUBLIC_MATOMO_SITE_ID` and `PUBLIC_MATOMO_URL`)

## 3. Footer Privacy Notice

- [x] 3.1 Update footer text in `src/components/converter-app.tsx` to generic privacy notice (remove "Microsoft Clarity" reference)

## 4. Build Verification

- [x] 4.1 Run `npx astro build` to verify clean build with no analytics env vars set (no analytics scripts, AdSense placeholder present, generic footer)
- [x] 4.2 Run `npx astro build` with `PUBLIC_CLARITY_ID=vtzz5hczt5` and verify Clarity script in output
- [x] 4.3 Run `npx astro build` with multiple services configured and verify all scripts present in output

## 5. Documentation

- [x] 5.1 Update `README.md` analytics section to document env-var-driven configuration for all 7 services
- [x] 5.2 Review entire `README.md` for outdated or incorrect content and fix any issues found

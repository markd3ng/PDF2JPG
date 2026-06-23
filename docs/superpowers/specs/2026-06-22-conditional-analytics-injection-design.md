---
comet_change: conditional-analytics-injection
role: technical-design
canonical_spec: openspec
---

# Conditional Analytics Injection — Technical Design

## Architecture

All 7 analytics/advertising services use **unified template conditional rendering** in `src/pages/index.astro`. Each service is gated by `{import.meta.env.PUBLIC_* && <script>...</script>}` — Astro inlines `PUBLIC_*` at build time, so unconfigured services produce zero output. This follows the existing `SITE_VERIFICATION_META` pattern.

```
src/pages/index.astro
├── frontmatter — declaration table (unchanged SITE_VERIFICATION_META pattern)
├── <head>
│   ├── {PUBLIC_GA_ID && <script async src=gtag> + inline config}
│   ├── {PUBLIC_CLARITY_ID && <script>IIFE</script>}
│   ├── {PUBLIC_PLAUSIBLE_DOMAIN && <script defer>}
│   ├── {PUBLIC_FATHOM_SITE_ID && <script>}
│   ├── {PUBLIC_UMAMI_WEBSITE_ID && <script defer>}
│   ├── {PUBLIC_MATOMO_SITE_ID && <script>}
│   └── {PUBLIC_ADSENSE_PUBLISHER_ID && <script async src=adsbygoogle>}
└── <body>
    └── <ConverterApp adsensePublisherId={…} client:load />
```

All scripts (including Clarity) use the same JSX-like conditional syntax. The existing hardcoded Clarity IIFE (lines 92–99) is removed and rewritten with `{import.meta.env.PUBLIC_CLARITY_ID}` in place of `"vtzz5hczt5"`.

## Service Injection Details

All `<script>` tags go in `<head>`, after the Twitter meta tags and before `</head>`. Order: GA4, Clarity, Plausible, Fathom, Umami, Matomo, AdSense.

### Microsoft Clarity

```astro
{import.meta.env.PUBLIC_CLARITY_ID && (
  <script>
    (function(c,l,a,r,i,t,y){{
      c[a]=c[a]||function(){{(c[a].q=c[a].q||[]).push(arguments)}};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    }})(window, document, "clarity", "script", import.meta.env.PUBLIC_CLARITY_ID);
  </script>
)}
```

**Implementation note**: Inside `<script>` tags without `is:inline`, Astro passes content to Vite as a JS module. Vite replaces `import.meta.env.PUBLIC_*` with the string value at build time. The `{{}}` double braces are Astro's escape for literal `{}` in template output — used here for the IIFE's function bodies.

### Google Analytics 4

```astro
{import.meta.env.PUBLIC_GA_ID && (
  <>
    <script async src={`https://www.googletagmanager.com/gtag/js?id=${import.meta.env.PUBLIC_GA_ID}`}></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());
      gtag('config', import.meta.env.PUBLIC_GA_ID);
    </script>
  </>
)}
```

### Plausible Analytics

```astro
{import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN && (
  <script defer
    data-domain={import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN}
    src={import.meta.env.PUBLIC_PLAUSIBLE_SRC || 'https://plausible.io/js/script.js'}>
  </script>
)}
```

`PUBLIC_PLAUSIBLE_SRC` optional — defaults to official CDN.

### Fathom Analytics

```astro
{import.meta.env.PUBLIC_FATHOM_SITE_ID && (
  <script
    src={import.meta.env.PUBLIC_FATHOM_SRC || 'https://cdn.usefathom.com/script.js'}
    data-site={import.meta.env.PUBLIC_FATHOM_SITE_ID}
    defer>
  </script>
)}
```

`PUBLIC_FATHOM_SRC` optional — defaults to official CDN.

### Umami Analytics

```astro
{import.meta.env.PUBLIC_UMAMI_WEBSITE_ID && (
  <script defer
    src={import.meta.env.PUBLIC_UMAMI_SRC || 'https://cloud.umami.is/script.js'}
    data-website-id={import.meta.env.PUBLIC_UMAMI_WEBSITE_ID}>
  </script>
)}
```

`PUBLIC_UMAMI_SRC` required when self-hosting. Defaults to Umami Cloud.

### Matomo Analytics

```astro
{import.meta.env.PUBLIC_MATOMO_SITE_ID && import.meta.env.PUBLIC_MATOMO_URL && (
  <script>
    var _paq = window._paq = window._paq || [];
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    (function() {{
      var u=import.meta.env.PUBLIC_MATOMO_URL;
      _paq.push(['setTrackerUrl', u+'matomo.php']);
      _paq.push(['setSiteId', import.meta.env.PUBLIC_MATOMO_SITE_ID]);
      var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
      g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
    }})();
  </script>
)}
```

Both `PUBLIC_MATOMO_SITE_ID` and `PUBLIC_MATOMO_URL` are required.

### Google AdSense (head script)

```astro
{import.meta.env.PUBLIC_ADSENSE_PUBLISHER_ID && (
  <script async
    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${import.meta.env.PUBLIC_ADSENSE_PUBLISHER_ID}`}
    crossorigin="anonymous">
  </script>
)}
```

The ad unit rendering is handled in the React component (see AdSense section below).

## AdSense Dual-Mode in React

AdSense has special behavior: ad unit visibility depends on whether `PUBLIC_ADSENSE_PUBLISHER_ID` is set. Since the ad unit sits inside `<ConverterApp>`, we pass it as a prop.

### Astro template change

```astro
<ConverterApp
  commitRef={commitRef}
  adsensePublisherId={import.meta.env.PUBLIC_ADSENSE_PUBLISHER_ID}
  client:load
/>
```

### React component change

`ConverterAppProps` gains `adsensePublisherId?: string`. The existing ad slot (currently a static placeholder at lines 257–266) becomes conditional:

```tsx
interface ConverterAppProps {
  commitRef: string;
  adsensePublisherId?: string;
}
```

In the JSX where the placeholder currently lives:

```tsx
{/* Google AdSense ad slot */}
{adsensePublisherId ? (
  <div className="rounded-xl bg-white p-4 shadow-sm">
    <div className="mb-2 text-center text-sm text-slate-500">Advertisement</div>
    <div className="flex justify-center">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adsensePublisherId}
        data-ad-slot="auto"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  </div>
) : (
  <div className="rounded-xl bg-white p-4 shadow-sm">
    <div className="mb-2 text-center text-sm text-slate-500">Advertisement</div>
    <div className="flex justify-center">
      <div className="w-full max-w-md h-32 bg-slate-100 rounded-lg flex items-center justify-center">
        <span className="text-sm text-slate-400">Google AdSense slot</span>
      </div>
    </div>
  </div>
)}
```

When `adsensePublisherId` is set, after the `<ins>` element mounts, AdSense auto-detects it (adsbygoogle.js is already loaded in `<head>`). No manual `(adsbygoogle = window.adsbygoogle || []).push({})` call is needed with the standard AdSense pattern.

**Note**: AdSense requires a valid `data-ad-slot` for real ads, not `"auto"`. The `data-ad-slot` value comes from the AdSense dashboard and needs a separate ENV var. To keep things simple initially, we use `data-ad-slot="auto"` which renders test/placeholder ads. Users who need real ads can set up a proper ad unit in AdSense dashboard and we can add `PUBLIC_ADSENSE_AD_SLOT` as a future enhancement.

## Footer Privacy Notice

In `src/components/converter-app.tsx`, replace the existing footer text at line 302:

**Before:**
> PDF files are processed locally in your browser and are not uploaded by this tool. This page loads Microsoft Clarity for anonymous usage analytics.

**After:**
> PDF files are processed locally in your browser. This page may load third-party analytics scripts for anonymous usage measurement. No personal data is collected or uploaded by this tool.

## ENV Variable Convention

All analytics variables use the `PUBLIC_` prefix (Astro client-side accessible):

| Variable | Service | Required |
|----------|---------|----------|
| `PUBLIC_CLARITY_ID` | Microsoft Clarity | Yes |
| `PUBLIC_GA_ID` | Google Analytics 4 | Yes |
| `PUBLIC_ADSENSE_PUBLISHER_ID` | Google AdSense | Yes (for real ads) |
| `PUBLIC_PLAUSIBLE_DOMAIN` | Plausible | Yes |
| `PUBLIC_PLAUSIBLE_SRC` | Plausible (custom src) | No |
| `PUBLIC_FATHOM_SITE_ID` | Fathom | Yes |
| `PUBLIC_FATHOM_SRC` | Fathom (custom src) | No |
| `PUBLIC_UMAMI_WEBSITE_ID` | Umami | Yes |
| `PUBLIC_UMAMI_SRC` | Umami (custom src) | No |
| `PUBLIC_MATOMO_SITE_ID` | Matomo | Yes |
| `PUBLIC_MATOMO_URL` | Matomo | Yes |

## Files Changed

| File | Change |
|------|--------|
| `src/pages/index.astro` | Remove hardcoded Clarity (lines 92–99), add 7 conditional script blocks in `<head>`, pass `adsensePublisherId` prop |
| `src/components/converter-app.tsx` | Add `adsensePublisherId` prop, conditional ad rendering, footer text update |
| `src/env.d.ts` | Add 10 `PUBLIC_*` type declarations |
| `.env.example` | Add 10 analytics placeholder entries with comments |
| `README.md` | Update analytics configuration section, fix outdated content |

## Testing Strategy

Three `npx astro build` scenarios, each inspected via `grep` on `dist/index.html`:

### Scenario 1: Zero config

```bash
PUBLIC_CLARITY_ID="" PUBLIC_GA_ID="" npx astro build
```

- `dist/index.html` contains zero analytics `<script>` tags
- AdSense placeholder div present ("Google AdSense slot")
- Footer contains generic privacy text

### Scenario 2: Single service (Clarity)

```bash
PUBLIC_CLARITY_ID=vtzz5hczt5 npx astro build
```

- `dist/index.html` contains Clarity IIFE with `vtzz5hczt5`
- No other analytics scripts present

### Scenario 3: Multiple services

```bash
PUBLIC_CLARITY_ID=vtzz5hczt5 PUBLIC_GA_ID=G-XXXXXXXXXX npx astro build
```

- Both Clarity and GA4 scripts present
- Each uses its configured ID
- Scripts are independent and non-interfering

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Clarity `{{}}` escaping produces malformed JS | `{{}}` is the documented Astro way to output literal `{}`. If issues arise, fall back to `{` and `}` string concatenation |
| AdSense `data-ad-slot="auto"` doesn't work in production | Accept as known limitation. Real ads require separate `PUBLIC_ADSENSE_AD_SLOT` env var — future enhancement |
| AdSense script blocks page rendering | `async` attribute on adsbygoogle.js prevents render-blocking |
| Multiple analytics scripts slow page load | All external scripts use `async` or `defer`; self-hosted services point to CDN defaults |

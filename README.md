# PDF Converter

A static, browser-based PDF to image converter built with Astro, React, and pdf.js.

PDF Converter renders files locally in the browser and exports PDF pages as `JPG`, `PNG`, `WebP`, or `BMP` images. The app does not upload PDF files to an application server.

## Features

- Batch drag-and-drop PDF upload
- Browser-local PDF rendering with `pdfjs-dist`
- Output format selector for `JPG`, `PNG`, `WebP`, and `BMP`
- `72 / 150 / 300 DPI` quality presets
- Per-page image preview, copy, and download
- Single-image direct download
- Multi-image ZIP export with `jszip`
- Static-site deployment with no backend, database, or API requirement
- SEO metadata, `robots.txt`, and `sitemap.xml` for `https://pdf.q9m3.com/`
- Search engine site verification (Google, Bing, Yandex, Baidu) via environment variables

## Privacy

PDF files are processed locally in the visitor's browser. This tool does not upload PDFs to an application backend for conversion.

The page loads Microsoft Clarity for anonymous usage analytics and experience improvement. Clarity is not part of the PDF conversion pipeline, but it does load analytics resources from Microsoft.

## Tech Stack

- `Astro 6`
- `React 18`
- `TypeScript`
- `Tailwind CSS 4`
- `pdf.js`
- `jszip`
- `Vitest`

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The default local URL is:

```text
http://localhost:4321
```

Run tests:

```bash
npm test
```

Run Astro and TypeScript checks:

```bash
npm run check
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run check
npm test
```

## Deployment

This project builds to a static site in `dist/`.

Recommended deployment settings:

- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`
- Node.js: `18+`, recommended `20+`

### Cloudflare Pages

1. Push the repository to GitHub.
2. Open Cloudflare Dashboard.
3. Go to `Workers & Pages` -> `Create application` -> `Pages` -> `Connect to Git`.
4. Select this repository.
5. Use:
   - Framework preset: `Astro`
   - Build command: `npm run build`
   - Build output directory: `dist`
6. Deploy.

Cloudflare Functions are not required for this app.

### Vercel

1. Push the repository to GitHub.
2. Open Vercel.
3. Import the repository with `Add New Project`.
4. Use:
   - Framework Preset: `Astro`
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Deploy.

### Netlify

1. Push the repository to GitHub.
2. Open Netlify.
3. Select `Add new site` -> `Import an existing project`.
4. Use:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Deploy.

## Environment Variables (Site Verification)

To verify site ownership in search engine webmaster tools, set the following environment variables in your deployment platform:

| Platform | Variable | Meta Tag |
|----------|----------|----------|
| Google   | `PUBLIC_GOOGLE_SITE_VERIFICATION` | `<meta name="google-site-verification" content="...">` |
| Bing     | `PUBLIC_BING_SITE_VERIFICATION` | `<meta name="msvalidate.01" content="...">` |
| Yandex   | `PUBLIC_YANDEX_SITE_VERIFICATION` | `<meta name="yandex-verification" content="...">` |
| Baidu    | `PUBLIC_BAIDU_SITE_VERIFICATION` | `<meta name="baidu-site-verification" content="...">` |

- When a variable is set to a non-empty value, the corresponding `<meta>` tag is injected into the HTML `<head>` at build time.
- When unset or empty, no tag is rendered.
- For local development, copy `.env.example` to `.env` and fill in the values.

Find the verification codes in each search engine's webmaster tools:
- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [Yandex Webmaster](https://webmaster.yandex.com/)
- [Baidu Zhanzhang](https://ziyuan.baidu.com/)

## Browser Notes

- Use a current version of Chrome, Edge, Firefox, or Safari.
- Large PDFs and high DPI settings can use significant memory.
- `WebP` export depends on browser canvas support.
- `BMP` export is encoded by the app from canvas pixels, so it does not rely on native `canvas.toBlob("image/bmp")` support.
- Clipboard image copy is converted to PNG because browser clipboard APIs primarily support PNG image data.
- Clipboard copy is most reliable on a deployed HTTPS URL.

## Project Structure

```text
src/
  components/
  lib/
  pages/
public/
```

## Google AdSense Placeholder

The app contains a visible placeholder for a Google AdSense slot in `src/components/converter-app.tsx`.

Replace this placeholder:

```tsx
<div className="w-full max-w-md h-32 bg-slate-100 rounded-lg flex items-center justify-center">
  <span className="text-sm text-slate-400">Google AdSense slot</span>
</div>
```

with your AdSense code when the ad unit is ready.

## Microsoft Clarity

Microsoft Clarity is configured in `src/pages/index.astro`.

To change the tracking ID, replace `vtzz5hczt5` in the Clarity script with your own project ID, then rebuild the site.

## Changelog

### v1.2.0

- Added site verification meta tags for Google, Bing, Yandex, and Baidu search engines
- Site verification codes are configurable via environment variables (`PUBLIC_*_SITE_VERIFICATION`)
- Added `.env.example` with documentation for local development
- Added environment variables section to README

### v1.1.0

- Rebranded the public UI to `PDF Converter`
- Translated the page UI and README to English
- Added output format selection for `JPG`, `PNG`, `WebP`, and `BMP`
- Added reliable BMP export through an in-app canvas encoder
- Updated SEO metadata for `https://pdf.q9m3.com/`
- Added `robots.txt` and `sitemap.xml`

### v1.0.1

- Added Google AdSense placeholder support
- Added Microsoft Clarity analytics
- Optimized the page layout
- Adjusted the convert button placement
- Improved SEO metadata

# PDF Converter English UI, Format Export, and SEO Design

## Context

The current app is an Astro + React single-page PDF-to-image converter. It renders PDFs locally in the browser with `pdfjs-dist`, exports each page through a canvas, and downloads individual images or ZIP archives. The current public page and README are primarily Chinese, the app title is `PDF2JPG`, and image export is hardcoded to JPEG.

The production domain is:

```text
https://pdf.q9m3.com/
```

## Goals

- Rename the public web title and visible product identity to a broader English PDF converter.
- Keep the default export format as JPG.
- Add a format dropdown with support for `JPG`, `PNG`, `WebP`, and `BMP`.
- Convert the full user-facing page UI to English.
- Rewrite the README in English and document the new output formats.
- Improve SEO metadata for the English page and the production domain.
- Add sitemap support if it is useful for this deployment.

## Non-Goals

- No server-side PDF processing.
- No file uploads to an application backend.
- No multi-page routing or blog/content expansion.
- No redesign beyond the controls needed for the format selector and English copy.
- No changes to the Microsoft Clarity tracking ID unless requested separately.

## Recommended Approach

Implement a focused update that keeps the current architecture:

- Add an `OutputFormat` type and format option metadata in the conversion layer.
- Store the selected output format in `ConverterApp`, defaulting to `jpg`.
- Add a compact dropdown selector near the DPI selector.
- Pass the selected format into `convertTaskFile` and `PdfWorkerClient.convert`.
- Export canvas blobs using the correct MIME type and filename extension.
- Use English copy throughout components and notices.
- Update Astro metadata with English SEO content, canonical URL, Open Graph tags, Twitter card tags, and JSON-LD structured data.
- Add static `public/robots.txt` and `public/sitemap.xml` for `https://pdf.q9m3.com/`.
- Rewrite `README.md` in English.

This is preferred because the app is a single static tool page, so the implementation can stay small and predictable while covering SEO and product clarity.

## Alternatives Considered

### Minimal Text-Only Update

Only change page copy, README, and title, while leaving export as JPG. This is too narrow because the requested WebP, PNG, and BMP formats are a core product change.

### Larger Rebrand and Layout Redesign

Create a more expansive landing page and reorganize the interface. This is unnecessary for a utility app and would add risk without improving the requested conversion workflow.

### Dynamic Sitemap Generation

Use an Astro sitemap integration. The site currently has one production URL and no content routes, so a static sitemap is simpler and easier to audit. If the app later gains multiple pages, the project can switch to generated sitemap output.

## UX Design

The first screen remains the working converter UI, not a marketing landing page.

Visible English product copy:

- Header title: `PDF Converter`
- Header subtitle: `Private browser-based PDF to image conversion`
- Dropzone title: `Upload PDFs`
- Dropzone description: `Drop one or more PDF files here, or click to choose files. Files are processed locally in your browser.`
- Main action: `Convert`
- DPI selector title: `Quality`
- Output selector title: `Output format`
- Queue title: `Conversion queue`
- Results title: `Converted images`
- Footer privacy note: `PDF files are processed locally in your browser and are not uploaded by this tool. This page loads Microsoft Clarity for anonymous usage analytics.`

The output format control should be a normal `select` dropdown, because the requested control is explicitly a dropdown and the option set is small.

## Conversion Design

Add:

```ts
export type OutputFormat = "jpg" | "png" | "webp" | "bmp";
```

Each format should have:

- value
- label
- MIME type
- file extension
- optional quality setting support

Canvas export behavior:

- `jpg`: `image/jpeg`, uses the existing DPI quality value, white background preserved.
- `png`: `image/png`, quality ignored by browsers, white background preserved for consistent PDF page rendering.
- `webp`: `image/webp`, uses the existing DPI quality value when supported by the browser.
- `bmp`: use `image/bmp` if browser `canvas.toBlob` supports it. If not supported and `toBlob` returns `null`, surface a clear error.

All output filenames should use the selected extension:

```text
source-file-p001.jpg
source-file-p001.png
source-file-p001.webp
source-file-p001.bmp
```

## Error Handling

- Oversized file message should be English.
- Conversion failure message should be English and mention damaged or encrypted PDFs.
- If a selected format cannot be exported by the browser, show an English error such as: `BMP export is not supported by this browser. Try JPG, PNG, or WebP.`
- Existing ZIP failure and module load failure messages should be translated to English.

## SEO Design

Use the production URL:

```text
https://pdf.q9m3.com/
```

Recommended `<title>`:

```text
PDF Converter | Convert PDF to JPG, PNG, WebP, or BMP
```

Recommended meta description:

```text
Convert PDF pages to JPG, PNG, WebP, or BMP images in your browser. Free, private, batch-friendly PDF conversion with no file uploads.
```

Recommended SEO additions:

- `<html lang="en">`
- canonical link to `https://pdf.q9m3.com/`
- English `description`, `keywords`, `robots`, and `author`
- Open Graph title, description, type, URL, and site name
- Twitter card title and description
- JSON-LD `WebApplication` schema with browser-based PDF-to-image conversion description

Because the site has a real stable production domain, add:

- `public/sitemap.xml`
- `public/robots.txt`

The sitemap only needs the homepage for now. This is useful enough because the site is public, SEO matters, and the canonical domain is now known.

## README Design

Rewrite README in English with:

- Project summary
- Feature list including JPG, PNG, WebP, and BMP output
- Privacy note explaining local browser processing and Microsoft Clarity analytics
- Tech stack
- Local development commands
- Build and preview commands
- Deployment notes for static hosting
- Browser support and caveats
- AdSense placeholder instructions
- Clarity tracking instructions
- Changelog entry for the English UI, SEO, sitemap, and format selector update

## Testing and Verification

Automated checks:

- Add or update unit tests around format metadata and output filename generation if the helpers are extractable.
- Run `npm test`.
- Run `npm run check`.
- Run `npm run build`.

Manual/browser verification:

- Start the dev server.
- Verify the page is English.
- Verify default output format is JPG.
- Convert a small PDF to each supported format where browser support allows it.
- Confirm result filenames and downloads use the selected extension.
- Confirm `/sitemap.xml` and `/robots.txt` are present in the production build output.

## Acceptance Criteria

- Browser title is `PDF Converter | Convert PDF to JPG, PNG, WebP, or BMP`.
- Page UI and runtime notices are English.
- README is English.
- Output format dropdown exists and defaults to JPG.
- JPG, PNG, WebP, and BMP are selectable.
- Converted image filenames match the selected format.
- SEO metadata uses `https://pdf.q9m3.com/`.
- `sitemap.xml` and `robots.txt` exist for the production domain.
- Build and tests pass.

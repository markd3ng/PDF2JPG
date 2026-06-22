## 1. Environment Setup

- [x] 1.1 Create `.env.example` with all four site verification variables documented
- [x] 1.2 Extend `src/env.d.ts` with `ImportMetaEnv` interface augmentation for the four env vars

## 2. Meta Tag Injection

- [x] 2.1 Add conditional meta tag injection logic in `src/pages/index.astro` for Google, Bing, Yandex, and Baidu verification codes

## 3. Verify

- [x] 3.1 Verify build output: no ENV set → no verification meta tags in dist HTML
- [x] 3.2 Verify build output: with ENV set → correct meta tags appear in dist HTML
- [x] 3.3 Verify TypeScript type checking passes (`npm run check`)
- [x] 3.4 Verify existing tests still pass (`npm run test`)

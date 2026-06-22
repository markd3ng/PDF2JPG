## Why

PDF Converter (pdf.q9m3.com) 是一个静态站点，需要在 Google、Bing、Yandex、Baidu 等搜索引擎的站长工具中验证站点所有权，以便获得搜索排名、索引状态监控和 SEO 优化能力。当前站点没有任何 site verification 机制，无法在搜索引擎站长工具中完成所有权验证。

## What Changes

- 新增四个搜索引擎的 site verification meta tag 注入能力
- 通过环境变量注入 verification code，构建时自动注入到 HTML `<head>` 中
- 支持 Cloudflare Pages、Vercel、Netlify 等平台部署
- 支持本地开发模式下通过 `.env` 文件设置

### Meta Tag 格式

| 平台 | Meta Name | ENV 变量 |
|------|-----------|----------|
| Google | `google-site-verification` | `PUBLIC_GOOGLE_SITE_VERIFICATION` |
| Bing | `msvalidate.01` | `PUBLIC_BING_SITE_VERIFICATION` |
| Yandex | `yandex-verification` | `PUBLIC_YANDEX_SITE_VERIFICATION` |
| Baidu | `baidu-site-verification` | `PUBLIC_BAIDU_SITE_VERIFICATION` |

## Capabilities

### New Capabilities
- `site-verification`: 通过环境变量配置多个搜索引擎的 site verification meta tag，在构建时按需注入

### Modified Capabilities

无。这是一个新增能力，不涉及现有 spec 的修改。

## Impact

- `src/pages/index.astro` — 在 `<head>` 中添加条件性 meta tag 注入逻辑
- `src/env.d.ts` — 扩展 `ImportMetaEnv` 接口以包含新的环境变量类型声明
- `.env.example` — 提供示例配置供开发者参考

无新增依赖、API 或系统变更。

# Comet Design Handoff

- Change: site-verification
- Phase: design
- Mode: compact
- Context hash: e0222725aa6300e8ed83c42a98be0d564d916ca753e41dabf19282ab0a9f3632

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/site-verification/proposal.md

- Source: openspec/changes/site-verification/proposal.md
- Lines: 1-36
- SHA256: d115172c3f2e85bf4583a27fbf4f0f52cd527cf3eb005deb8982ba44ab5cdaf4

```md
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
```

## openspec/changes/site-verification/design.md

- Source: openspec/changes/site-verification/design.md
- Lines: 1-69
- SHA256: 270d79c6f227e79ed0949bce154c7f056546af8b09fa2975675db0597ec90aea

```md
## Context

PDF Converter (pdf.q9m3.com) 是一个基于 Astro 6 构建的静态站点，部署在 Cloudflare Pages。当前站点已在 `index.astro` 中包含 SEO meta tags（Open Graph、Twitter Card、JSON-LD），但没有任何搜索引擎 site verification 支持。

该站点为纯静态站点，无后端服务，所有 meta tag 在构建时静态生成。目前支持以下四种搜索引擎的 site verification：Google Search Console、Bing Webmaster Tools、Yandex Webmaster、Baidu Zhanzhang。

## Goals / Non-Goals

**Goals:**
- 通过环境变量注入各平台 verification code，构建时自动生成对应的 `<meta>` 标签
- 支持四个搜索引擎：Google、Bing、Yandex、Baidu
- 兼容 Cloudflare Pages、Vercel、Netlify 等部署平台
- 支持本地开发模式通过 `.env` 文件设置
- 不设置任何环境变量时，页面不输出任何 verification meta tag

**Non-Goals:**
- DNS TXT/CNAME 记录验证方式（属 DNS 配置层面）
- HTML 文件验证方式（meta tag 已满足，无需额外文件）
- 各平台站长工具后台配置操作
- 环境变量的 GUI 管理面板
- 多个页面的分别验证（当前只有一个页面）

## Decisions

### 1. 采用 Astro 构建时 `Astro.locals` 或 `import.meta.env` 方式

**选择：** 使用 Astro 的 `import.meta.env.PUBLIC_*` 环境变量

**理由：**
- Astro 的 `PUBLIC_*` 前缀变量会自动暴露给客户端和构建时，在 `.astro` 文件中可直接通过 `import.meta.env` 访问
- Cloudflare Pages、Vercel、Netlify 均支持通过 Dashboard 或 CLI 设置 `PUBLIC_*` 环境变量
- 不需要额外 adapter 或 SSR 支持
- 无需添加 Astro 中间件或集成

**备选考虑：**
- 使用 `process.env` 直接读取 — 在 Astro 6 中不推荐的用法，且不兼容客户端代码
- 使用 Astro 集成（Integration）拦截 HTML — 过度设计，对于简单的 meta tag 注入不值得

### 2. 元数据结构设计

**选择：** 在 `src/pages/index.astro` 的 `<head>` 中直接条件式注入

**理由：**
- 该站点只有一个页面，无需抽离组件
- 现有 meta tags（OG、Twitter）已在 `index.astro` 中硬编码，保持一致性
- 注入逻辑简单：对每个平台，检查对应的 `import.meta.env` 是否有值，有则渲染 `<meta>` 标签

**备选考虑：**
- 抽取 `<Head>` 或 `<SEO>` Astro 组件 — 当站点未来有多页面时值得，当前过度设计
- 使用 Vite/Rollup 插件注入 — 对静态 HTML 操作来说太重了

### 3. 环境变量前缀约定

**选择：** 统一使用 `PUBLIC_` 前缀以兼容 Astro 的客户端暴露机制

**命名模式：** `PUBLIC_{PLATFORM}_SITE_VERIFICATION`

| 平台 | 环境变量名 | Meta Name |
|------|-----------|-----------|
| Google | `PUBLIC_GOOGLE_SITE_VERIFICATION` | `google-site-verification` |
| Bing | `PUBLIC_BING_SITE_VERIFICATION` | `msvalidate.01` |
| Yandex | `PUBLIC_YANDEX_SITE_VERIFICATION` | `yandex-verification` |
| Baidu | `PUBLIC_BAIDU_SITE_VERIFICATION` | `baidu-site-verification` |

## Risks / Trade-offs

- **[风险] PUBLIC_ 前缀暴露到客户端 JS** → Mitigation: verification code 本身就是公开信息（搜索引擎需要读取它），不存在安全风险
- **[风险] 环境变量为空字符串 vs. 未设置** → Mitigation: 使用 `if (value)` 同时处理 `undefined` 和空字符串情况
- **[风险] 未来站点增加页面** → Mitigation: 如需多页面，届时抽取专用 Astro 组件即可，当前单页面完全不必要
```

## openspec/changes/site-verification/tasks.md

- Source: openspec/changes/site-verification/tasks.md
- Lines: 1-15
- SHA256: 400b9c84e1922de7264e4036948e29d34a6e130c7215771060f55c0710870c5a

```md
## 1. Environment Setup

- [ ] 1.1 Create `.env.example` with all four site verification variables documented
- [ ] 1.2 Extend `src/env.d.ts` with `ImportMetaEnv` interface augmentation for the four env vars

## 2. Meta Tag Injection

- [ ] 2.1 Add conditional meta tag injection logic in `src/pages/index.astro` for Google, Bing, Yandex, and Baidu verification codes

## 3. Verify

- [ ] 3.1 Verify build output: no ENV set → no verification meta tags in dist HTML
- [ ] 3.2 Verify build output: with ENV set → correct meta tags appear in dist HTML
- [ ] 3.3 Verify TypeScript type checking passes (`npm run check`)
- [ ] 3.4 Verify existing tests still pass (`npm run test`)
```

## openspec/changes/site-verification/specs/site-verification/spec.md

- Source: openspec/changes/site-verification/specs/site-verification/spec.md
- Lines: 1-51
- SHA256: 081e984623fadafeca7e68ef596479f6620a105f89f16ccb41af05c0425e1708

```md
## ADDED Requirements

### Requirement: Search engine site verification via meta tags

The system SHALL support site ownership verification for Google, Bing, Yandex, and Baidu search engines by injecting HTML `<meta>` tags into the page `<head>` at build time.

Each verification code SHALL be configured via a corresponding environment variable with the `PUBLIC_` prefix. When an environment variable is set to a non-empty value, the corresponding `<meta>` tag SHALL be rendered. When the variable is unset or empty, no `<meta>` tag SHALL be rendered for that platform.

#### Scenario: Google verification meta tag is injected when env is set

- **WHEN** the environment variable `PUBLIC_GOOGLE_SITE_VERIFICATION` is set to `abc123` during build
- **THEN** the page `<head>` SHALL contain `<meta name="google-site-verification" content="abc123">`

#### Scenario: Google verification meta tag is omitted when env is not set

- **WHEN** `PUBLIC_GOOGLE_SITE_VERIFICATION` is not set or is empty during build
- **THEN** the page `<head>` SHALL NOT contain a `google-site-verification` meta tag

#### Scenario: Bing verification meta tag is injected when env is set

- **WHEN** the environment variable `PUBLIC_BING_SITE_VERIFICATION` is set to `def456` during build
- **THEN** the page `<head>` SHALL contain `<meta name="msvalidate.01" content="def456">`

#### Scenario: Yandex verification meta tag is injected when env is set

- **WHEN** the environment variable `PUBLIC_YANDEX_SITE_VERIFICATION` is set to `ghi789` during build
- **THEN** the page `<head>` SHALL contain `<meta name="yandex-verification" content="ghi789">`

#### Scenario: Baidu verification meta tag is injected when env is set

- **WHEN** the environment variable `PUBLIC_BAIDU_SITE_VERIFICATION` is set to `jkl012` during build
- **THEN** the page `<head>` SHALL contain `<meta name="baidu-site-verification" content="jkl012">`

#### Scenario: All four verification meta tags are injected simultaneously

- **WHEN** all four `PUBLIC_*_SITE_VERIFICATION` environment variables are set to non-empty values during build
- **THEN** the page `<head>` SHALL contain all four corresponding `<meta>` tags

#### Scenario: Verification meta tags are visible in development mode

- **WHEN** `npm run dev` is running and a `.env` file with `PUBLIC_GOOGLE_SITE_VERIFICATION=abc123` exists
- **THEN** the page `<head>` SHALL contain `<meta name="google-site-verification" content="abc123">`

### Requirement: Environment variable type declarations

The system SHALL provide TypeScript type declarations for all site verification environment variables in `src/env.d.ts`, ensuring type-safe access via `import.meta.env`.

#### Scenario: Type declarations exist for all four env vars

- **WHEN** `src/env.d.ts` is inspected
- **THEN** it SHALL contain `ImportMetaEnv` interface augmentations for `PUBLIC_GOOGLE_SITE_VERIFICATION`, `PUBLIC_BING_SITE_VERIFICATION`, `PUBLIC_YANDEX_SITE_VERIFICATION`, and `PUBLIC_BAIDU_SITE_VERIFICATION`, each typed as `string | undefined`
```


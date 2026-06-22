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

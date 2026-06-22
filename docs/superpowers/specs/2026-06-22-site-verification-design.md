---
comet_change: site-verification
role: technical-design
canonical_spec: openspec
---

# Site Verification — Technical Design Doc

## 概述

为 PDF Converter 静态站点添加 Google、Bing、Yandex、Baidu 四个搜索引擎的 site ownership verification 支持。通过环境变量注入 verification code，在 Astro 构建时自动注入对应的 `<meta>` 标签。

## 技术方案

### 架构

纯构建时注入，无运行时依赖。流程：

```
.env / Cloudflare ENV
       ↓
import.meta.env.PUBLIC_*   (Astro 构建时)
       ↓
index.astro frontmatter 过滤 + 映射
       ↓
<head> 中渲染 <meta> 标签
       ↓
静态 HTML (dist/)
```

### 核心实现

在 `src/pages/index.astro` 的 frontmatter 中添加配置映射和过滤逻辑：

```typescript
// 映射表：环境变量 → HTML meta name
const SITE_VERIFICATION_META = [
  { env: 'PUBLIC_GOOGLE_SITE_VERIFICATION', name: 'google-site-verification' },
  { env: 'PUBLIC_BING_SITE_VERIFICATION',   name: 'msvalidate.01' },
  { env: 'PUBLIC_YANDEX_SITE_VERIFICATION', name: 'yandex-verification' },
  { env: 'PUBLIC_BAIDU_SITE_VERIFICATION',  name: 'baidu-site-verification' },
];

// 过滤出有值的 env 并生成 meta 对象
const verificationMeta = SITE_VERIFICATION_META
  .filter(m => import.meta.env[m.env])
  .map(m => ({ name: m.name, content: import.meta.env[m.env] }));
```

在 `<head>` 模板中使用 Astro 的 JSX 语法渲染：

```astro
{verificationMeta.map(m => <meta name={m.name} content={m.content} />)}
```

### 环境变量映射

| 平台 | ENV 变量 | Meta Name | 示例值 |
|------|----------|-----------|--------|
| Google | `PUBLIC_GOOGLE_SITE_VERIFICATION` | `google-site-verification` | `abc123` |
| Bing | `PUBLIC_BING_SITE_VERIFICATION` | `msvalidate.01` | `def456` |
| Yandex | `PUBLIC_YANDEX_SITE_VERIFICATION` | `yandex-verification` | `ghi789` |
| Baidu | `PUBLIC_BAIDU_SITE_VERIFICATION` | `baidu-site-verification` | `jkl012` |

## 类型安全

在 `src/env.d.ts` 中扩展 `ImportMetaEnv` 接口：

```typescript
interface ImportMetaEnv {
  readonly PUBLIC_GOOGLE_SITE_VERIFICATION?: string;
  readonly PUBLIC_BING_SITE_VERIFICATION?: string;
  readonly PUBLIC_YANDEX_SITE_VERIFICATION?: string;
  readonly PUBLIC_BAIDU_SITE_VERIFICATION?: string;
}
```

## 部署配置

各平台设置环境变量的路径：

- **Cloudflare Pages**: Dashboard → 项目 → Settings → Environment Variables
- **Vercel**: Dashboard → 项目 → Settings → Environment Variables
- **Netlify**: Dashboard → 项目 → Site settings → Build & deploy → Environment variables
- **本地开发**: `.env` 文件（已加入 `.gitignore`），示例参考 `.env.example`

## 风险与缓解

| 风险 | 缓解措施 |
|------|---------|
| PUBLIC_ 前缀暴露到客户端 JS | Verification code 本身就是公开的（搜索引擎爬虫读取），无安全风险 |
| 空字符串 vs 未设置 | 统一用 `if (value)` 过滤 falsy 值 |
| 未来多页面场景 | 届时抽取 `<Head>` 组件，当前单页面无需抽取 |

## 测试策略

1. 不设 env 构建 → 确认 HTML 无 verification meta
2. 分别/同时设置 env 构建 → 确认对应 meta tags 存在
3. `npm run check` 通过 TypeScript 类型检查
4. `npm run test` 已有测试不回归

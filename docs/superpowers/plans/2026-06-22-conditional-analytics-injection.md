---
change: conditional-analytics-injection
design-doc: docs/superpowers/specs/2026-06-22-conditional-analytics-injection-design.md
base-ref: 9cea22e2378d805d2606aac876af789a9780f36a
---

I'm using the writing-plans skill to create the implementation plan.

# Conditional Analytics Injection — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 7 个分析/广告服务的条件脚本注入替换现有硬编码 Microsoft Clarity，所有服务通过 `PUBLIC_*` 环境变量控制开关。

**Architecture:** 所有 7 个服务在 `src/pages/index.astro` 的 `<head>` 中使用统一的条件渲染模式（`{import.meta.env.PUBLIC_* && <script>...<script>}`）。Astro 在构建时将未设置的 `PUBLIC_*` 变量视为 falsy，产生零输出。AdSense 有双重行为：未配置时渲染占位 div，配置后注入 adsbygoogle.js + `<ins>` 广告单元。AdSense publisher ID 通过 prop 传递给 React 组件 `<ConverterApp>`。

**Tech Stack:** Astro 6, React 18, TypeScript, Tailwind CSS 4

## Global Constraints

- 所有环境变量必须使用 `PUBLIC_` 前缀（Astro 客户端可访问）
- 所有外部脚本必须使用 `async` 或 `defer` 属性，防止阻塞渲染
- Clarity IIFE 中的 `{}` 必须使用 `{{}}` 转义（Astro 表达式定界符）
- Matomo 需要同时设置 `PUBLIC_MATOMO_SITE_ID` 和 `PUBLIC_MATOMO_URL` 才能生效
- Plausible/Fathom/Umami 的自定义 SRC 变量为可选项，缺失时使用官方 CDN 默认值
- 脚本注入顺序（按 `<head>` 中出现的顺序）：GA4, Clarity, Plausible, Fathom, Umami, Matomo, AdSense
- 构建命令：`npx astro build`，构建产物在 `dist/` 目录
- 测试方法：对 `dist/index.html` 执行 `grep` 验证脚本注入结果

---

## 文件结构

| 文件 | 变更类型 | 职责 |
|------|---------|------|
| `src/env.d.ts` | 修改 | 添加 10 个 `PUBLIC_*` 类型声明 |
| `.env.example` | 修改 | 添加 10 个分析服务占位变量及注释 |
| `src/pages/index.astro` | 修改 | 移除硬编码 Clarity（92-99 行），添加 7 个条件脚本块，传递 `adsensePublisherId` prop |
| `src/components/converter-app.tsx` | 修改 | 添加 `adsensePublisherId` prop，条件广告渲染，footer 文案修改 |
| `README.md` | 修改 | 更新分析/广告配置文档，修正过时内容 |

---

## 任务分解

### Task 1: 环境类型声明

**文件:**
- Modify: `src/env.d.ts`

**接口:**
- Produces: `ImportMetaEnv` 接口增加 10 个 `readonly PUBLIC_*?: string` 属性

- [x] **步骤 1: 添加 10 个分析服务类型声明**

  在 `src/env.d.ts` 的 `ImportMetaEnv` 接口中，在现有 site verification 声明之后添加 10 个分析服务变量：

  ```typescript
  readonly PUBLIC_CLARITY_ID?: string;
  readonly PUBLIC_GA_ID?: string;
  readonly PUBLIC_ADSENSE_PUBLISHER_ID?: string;
  readonly PUBLIC_PLAUSIBLE_DOMAIN?: string;
  readonly PUBLIC_PLAUSIBLE_SRC?: string;
  readonly PUBLIC_FATHOM_SITE_ID?: string;
  readonly PUBLIC_FATHOM_SRC?: string;
  readonly PUBLIC_UMAMI_WEBSITE_ID?: string;
  readonly PUBLIC_UMAMI_SRC?: string;
  readonly PUBLIC_MATOMO_SITE_ID?: string;
  readonly PUBLIC_MATOMO_URL?: string;
  ```

  **编辑操作:** 在 `src/env.d.ts` 第 7 行（`readonly PUBLIC_BAIDU_SITE_VERIFICATION?: string;`）之后、接口闭合 `}` 之前插入上述 11 行。

- [x] **步骤 2: 验证类型声明**

  运行: `npx astro check`（或 `npx tsc --noEmit`）
  预期: 无类型错误通过。

- [x] **步骤 3: 提交**

  ```bash
  git add src/env.d.ts
  git commit -m "feat: add analytics service PUBLIC_* type declarations"
  ```

---

### Task 2: 环境变量示例文件

**文件:**
- Modify: `.env.example`

- [x] **步骤 1: 添加 10 个分析服务占位变量**

  在 `.env.example` 现有内容之后追加 10 个分析服务环境变量条目，带注释说明用途。

  **追加内容：**

  ```bash
  # Analytics & Advertising Services
  # Set these in your deployment environment to enable analytics/ad services.
  # When a variable is unset or empty, its corresponding script is not injected.

  # Microsoft Clarity (analytics)
  # PUBLIC_CLARITY_ID=

  # Google Analytics 4 (analytics)
  # PUBLIC_GA_ID=

  # Google AdSense (advertising)
  # PUBLIC_ADSENSE_PUBLISHER_ID=

  # Plausible Analytics (self-hosted or cloud)
  # PUBLIC_PLAUSIBLE_DOMAIN=
  # PUBLIC_PLAUSIBLE_SRC=

  # Fathom Analytics (self-hosted or cloud)
  # PUBLIC_FATHOM_SITE_ID=
  # PUBLIC_FATHOM_SRC=

  # Umami Analytics (self-hosted or cloud)
  # PUBLIC_UMAMI_WEBSITE_ID=
  # PUBLIC_UMAMI_SRC=

  # Matomo Analytics (self-hosted only, URL + Site ID both required)
  # PUBLIC_MATOMO_SITE_ID=
  # PUBLIC_MATOMO_URL=
  ```

- [x] **步骤 2: 提交**

  ```bash
  git add .env.example
  git commit -m "chore: add analytics service env var placeholders"
  ```

---

### Task 3: Astro 条件脚本注入

**文件:**
- Modify: `src/pages/index.astro`

**接口:**
- Consumes: Task 1 的类型声明（`ImportMetaEnv` 中的 10 个 `PUBLIC_*` 属性）
- Produces: `<ConverterApp adsensePublisherId={...} client:load />`（供 Task 4 消费）

- [x] **步骤 1: 移除硬编码 Clarity 脚本**

  删除 `src/pages/index.astro` 第 92-99 行：

  ```
  <!-- Microsoft Clarity analytics -->
  <script is:inline type="text/javascript">
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "vtzz5hczt5");
  </script>
  ```

  使用 `delete_range`，起始锚点 `<!-- Microsoft Clarity analytics -->`，结束锚点 `</script>`，含两端。

- [x] **步骤 2: 添加 7 个条件脚本块**

  在删除 Clarity 的位置（Twitter meta 标签和 JSON-LD 之后、`</head>` 之前）插入以下 7 个条件脚本块，严格按此顺序。

  **插入的完整内容：**

  ```astro
    <!-- Google Analytics 4 -->
    {import.meta.env.PUBLIC_GA_ID && (
      <>
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${import.meta.env.PUBLIC_GA_ID}`}></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){{dataLayer.push(arguments);}}
          gtag('js', new Date());
          gtag('config', '{import.meta.env.PUBLIC_GA_ID}');
        </script>
      </>
    )}
    <!-- Microsoft Clarity -->
    {import.meta.env.PUBLIC_CLARITY_ID && (
      <script>
        (function(c,l,a,r,i,t,y){{
          c[a]=c[a]||function(){{(c[a].q=c[a].q||[]).push(arguments)}};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        }})(window, document, "clarity", "script", "{import.meta.env.PUBLIC_CLARITY_ID}");
      </script>
    )}
    <!-- Plausible Analytics -->
    {import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN && (
      <script defer
        data-domain={import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN}
        src={import.meta.env.PUBLIC_PLAUSIBLE_SRC || 'https://plausible.io/js/script.js'}>
      </script>
    )}
    <!-- Fathom Analytics -->
    {import.meta.env.PUBLIC_FATHOM_SITE_ID && (
      <script
        src={import.meta.env.PUBLIC_FATHOM_SRC || 'https://cdn.usefathom.com/script.js'}
        data-site={import.meta.env.PUBLIC_FATHOM_SITE_ID}
        defer>
      </script>
    )}
    <!-- Umami Analytics -->
    {import.meta.env.PUBLIC_UMAMI_WEBSITE_ID && (
      <script defer
        src={import.meta.env.PUBLIC_UMAMI_SRC || 'https://cloud.umami.is/script.js'}
        data-website-id={import.meta.env.PUBLIC_UMAMI_WEBSITE_ID}>
      </script>
    )}
    <!-- Matomo Analytics -->
    {import.meta.env.PUBLIC_MATOMO_SITE_ID && import.meta.env.PUBLIC_MATOMO_URL && (
      <script>
        var _paq = window._paq = window._paq || [];
        _paq.push(['trackPageView']);
        _paq.push(['enableLinkTracking']);
        (function() {{
          var u='{import.meta.env.PUBLIC_MATOMO_URL}';
          _paq.push(['setTrackerUrl', u+'matomo.php']);
          _paq.push(['setSiteId', '{import.meta.env.PUBLIC_MATOMO_SITE_ID}']);
          var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
          g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
        }})();
      </script>
    )}
    <!-- Google AdSense -->
    {import.meta.env.PUBLIC_ADSENSE_PUBLISHER_ID && (
      <script async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${import.meta.env.PUBLIC_ADSENSE_PUBLISHER_ID}`}
        crossorigin="anonymous">
      </script>
    )}
  ```

  插入位置：现有的 `</script>`（JSON-LD script 闭合标签，即原第 91 行）之后、`</head>`（原第 100 行）之前。

  > **注意:** Clarity IIFE 内部的 `{}` 使用 `{{}}` 转义，这是 Astro 将模板中的 `{{}}` 输出为字面量 `{}` 的标准方式。

- [x] **步骤 3: 传递 `adsensePublisherId` prop 给 ConverterApp**

  将第 102 行（删除后约第 93 行）的：

  ```astro
  <ConverterApp commitRef={commitRef} client:load />
  ```

  改为：

  ```astro
  <ConverterApp commitRef={commitRef} adsensePublisherId={import.meta.env.PUBLIC_ADSENSE_PUBLISHER_ID} client:load />
  ```

- [x] **步骤 4: 零配置构建验证**

  运行: `PUBLIC_CLARITY_ID="" PUBLIC_GA_ID="" npx astro build`

  验证: `grep -c '<script' dist/index.html` 应只返回 Astro 自身注入的脚本数（不含分析脚本）。`grep 'Clarity\|GA-\|plausible\|usefathom\|umami\|matomo\|adsbygoogle' dist/index.html` 应无输出。

- [x] **步骤 5: 单服务构建验证**

  运行: `PUBLIC_CLARITY_ID=vtzz5hczt5 npx astro build`

  验证: `grep 'clarity' dist/index.html` 应输出 Clarity IIFE 且包含 `vtzz5hczt5`。`grep 'GA-\|plausible\|usefathom\|umami\|matomo\|adsbygoogle' dist/index.html` 应无输出。

- [x] **步骤 6: 多服务构建验证**

  运行: `PUBLIC_CLARITY_ID=vtzz5hczt5 PUBLIC_GA_ID=G-XXXXXXXXXX npx astro build`

  验证: `grep 'vtzz5hczt5' dist/index.html` 应有输出。`grep 'G-XXXXXXXXXX' dist/index.html` 应有输出。两个脚本互不干扰。

- [x] **步骤 7: 提交**

  ```bash
  git add src/pages/index.astro
  git commit -m "feat: replace hardcoded Clarity with 7 conditional analytics scripts"
  ```

---

### Task 4: React 组件 AdSense 双模式 + Footer 文案更新

**文件:**
- Modify: `src/components/converter-app.tsx`

**接口:**
- Consumes: 来自 Astro 的 `adsensePublisherId?: string` prop
- Produces: 条件广告渲染（含配置/未配置两种状态）+ 更新后的 footer 文案

- [x] **步骤 1: 修改 `ConverterAppProps` 接口**

  在 `src/components/converter-app.tsx` 第 26-28 行：

  ```tsx
  interface ConverterAppProps {
    commitRef: string;
  }
  ```

  改为：

  ```tsx
  interface ConverterAppProps {
    commitRef: string;
    adsensePublisherId?: string;
  }
  ```

- [x] **步骤 2: 更新函数签名解构**

  在第 30 行：

  ```tsx
  export function ConverterApp({ commitRef }: ConverterAppProps) {
  ```

  改为：

  ```tsx
  export function ConverterApp({ commitRef, adsensePublisherId }: ConverterAppProps) {
  ```

- [x] **步骤 3: 替换 AdSense 占位为条件渲染**

  将第 257-266 行的现有静态占位：

  ```tsx
        {/* Google AdSense ad slot */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-2 text-center text-sm text-slate-500">Advertisement</div>
          <div className="flex justify-center">
            {/* Replace this placeholder with Google AdSense code. */}
            <div className="w-full max-w-md h-32 bg-slate-100 rounded-lg flex items-center justify-center">
              <span className="text-sm text-slate-400">Google AdSense slot</span>
            </div>
          </div>
        </div>
  ```

  替换为：

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

  > **说明:** 当 `adsensePublisherId` 有值时，渲染真实的 `<ins>` 广告单元（adsbygoogle.js 已在 `<head>` 中加载，自动检测此元素）。无值时渲染当前占位 div。

- [x] **步骤 4: 更新 Footer 隐私声明**

  将第 302 行的：

  ```
  PDF files are processed locally in your browser and are not uploaded by this tool. This page loads Microsoft Clarity for anonymous usage analytics.
  ```

  改为：

  ```
  PDF files are processed locally in your browser. This page may load third-party analytics scripts for anonymous usage measurement. No personal data is collected or uploaded by this tool.
  ```

- [x] **步骤 5: TypeScript 编译检查**

  运行: `npx astro check`（或 `npx tsc --noEmit`）
  预期: 无类型错误。

- [x] **步骤 6: 构建验证**

  运行: `npx astro build`
  验证: 构建成功，无报错。`grep 'data-ad-client\|adsbygoogle\|AdSense slot' dist/index.html` 应看到占位 div（因为构建时 `PUBLIC_ADSENSE_PUBLISHER_ID` 未设置）。

- [x] **步骤 7: 提交**

  ```bash
  git add src/components/converter-app.tsx
  git commit -m "feat: add conditional AdSense rendering and update footer privacy text"
  ```

---

### Task 5: 更新 README 文档

**文件:**
- Modify: `README.md`

- [x] **步骤 1: 更新 Privacy 部分**

  将第 21-25 行的隐私说明（目前提到 Microsoft Clarity）改为通用描述：

  **修改前:**
  ```
  PDF files are processed locally in the visitor's browser. This tool does not upload PDFs to an application backend for conversion.

  The page loads Microsoft Clarity for anonymous usage analytics and experience improvement. Clarity is not part of the PDF conversion pipeline, but it does load analytics resources from Microsoft.
  ```

  **修改后:**
  ```
  PDF files are processed locally in the visitor's browser. This tool does not upload PDFs to an application backend for conversion.

  The page may load third-party analytics scripts for anonymous usage measurement. Analytics services are configured through environment variables and are only loaded when their respective variables are set. No personal data is collected or uploaded by this tool.
  ```

- [x] **步骤 2: 将「Environment Variables (Site Verification)」扩展为包含分析服务**

  在第 137 行之后（现有 site verification 表格之后），追加分析服务配置表格：

  ```markdown
  ## Environment Variables (Analytics & Advertising)

  Analytics and advertising services are enabled or disabled at build time through environment variables.

  When a variable is set to a non-empty value, the corresponding `<script>` tag is injected into the HTML `<head>`.
  When unset or empty, no script is rendered.

  | Service | Variables | Required |
  |---------|-----------|----------|
  | Google Analytics 4 | `PUBLIC_GA_ID` | Yes |
  | Microsoft Clarity | `PUBLIC_CLARITY_ID` | Yes |
  | Plausible | `PUBLIC_PLAUSIBLE_DOMAIN`, `PUBLIC_PLAUSIBLE_SRC` | Domain required, SRC optional |
  | Fathom | `PUBLIC_FATHOM_SITE_ID`, `PUBLIC_FATHOM_SRC` | Site ID required, SRC optional |
  | Umami | `PUBLIC_UMAMI_WEBSITE_ID`, `PUBLIC_UMAMI_SRC` | Website ID required, SRC optional |
  | Matomo | `PUBLIC_MATOMO_SITE_ID`, `PUBLIC_MATOMO_URL` | Both required |
  | Google AdSense | `PUBLIC_ADSENSE_PUBLISHER_ID` | Yes (for real ads) |

  - AdSense uses `data-ad-slot="auto"` for test/placeholder ads. For production, configure a real ad unit in the AdSense dashboard.
  - Matomo requires both `PUBLIC_MATOMO_SITE_ID` and `PUBLIC_MATOMO_URL` — both must be set for the script to inject.
  - For local development, copy `.env.example` to `.env` and fill in the values.
  ```

- [x] **步骤 3: 更新「Google AdSense Placeholder」部分**

  将第 177-189 行的 AdSense 占位说明更新为条件注入说明：

  **修改后:**
  ```markdown
  ## Google AdSense

  Google AdSense is conditionally injected based on the `PUBLIC_ADSENSE_PUBLISHER_ID` environment variable.

  - When `PUBLIC_ADSENSE_PUBLISHER_ID` is set: the adsbygoogle.js script is loaded in `<head>`, and a real `<ins>` ad unit is rendered in the React component.
  - When unset: a placeholder div with "Google AdSense slot" text is shown.

  The ad slot uses `data-ad-slot="auto"` which renders test/placeholder ads. For real ads, configure an ad unit in the AdSense dashboard and set `PUBLIC_ADSENSE_PUBLISHER_ID` in your deployment environment.
  ```

- [x] **步骤 4: 更新「Microsoft Clarity」部分**

  将第 192-195 行的 Clarity 部分替换为通用分析配置说明：

  **修改后:**
  ```markdown
  ## Analytics Services

  Analytics services (Google Analytics 4, Microsoft Clarity, Plausible, Fathom, Umami, Matomo) are configured through environment variables in `src/pages/index.astro`.

  Each service uses the same conditional injection pattern — set the corresponding `PUBLIC_*` environment variable to enable it. See the [Environment Variables (Analytics & Advertising)](#environment-variables-analytics--advertising) section for the full list of supported services and their variables.
  ```

- [x] **步骤 5: 更新 Changelog**

  在 Changelog 顶部追加 v1.3.0 条目：

  ```markdown
  ### v1.3.0

  - Replaced hardcoded Microsoft Clarity with 7 conditional analytics/ad services (GA4, Clarity, Plausible, Fathom, Umami, Matomo, AdSense)
  - All analytics services are configurable via environment variables (`PUBLIC_*`)
  - Added conditional AdSense ad unit rendering in React component (real ad vs placeholder)
  - Updated footer privacy notice to be generic across all analytics services
  - Added analytics environment variables to `.env.example` and documentation
  ```

- [x] **步骤 6: 提交流程**

  ```bash
  git add README.md
  git commit -m "docs: update README with analytics service configuration"
  ```

---

## 自检清单

1. **Spec 覆盖:** 设计文档中的每项需求是否都有对应任务？
   - ✅ 环境变量类型声明 → Task 1
   - ✅ `.env.example` 占位 → Task 2
   - ✅ 移除硬编码 Clarity + 7 个条件脚本 → Task 3
   - ✅ AdSense 双模式（配置/未配置）→ Task 4
   - ✅ Footer 隐私声明更新 → Task 4
   - ✅ 构建验证（3 个场景）→ Task 3（步骤 4-6）
   - ✅ README 文档更新 → Task 5

2. **占位符检查:** 没有「TBD」「TODO」「implement later」等模式。所有代码块包含完整可执行内容。

3. **类型一致性:** `adsensePublisherId?: string` 在 Task 3（Astro prop 传递）和 Task 4（React 组件消费）中一致。所有 `PUBLIC_*` 变量名在 5 个任务间保持一致。

---

## 执行交接

Plan complete and saved to `docs/superpowers/plans/2026-06-22-conditional-analytics-injection.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**

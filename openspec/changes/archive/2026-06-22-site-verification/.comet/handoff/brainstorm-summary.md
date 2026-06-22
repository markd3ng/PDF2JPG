# Brainstorm Summary

- Change: site-verification
- Date: 2026-06-22

## 确认的技术方案

采用 **Astro frontmatter 条件注入** 方式：

1. 在 `src/pages/index.astro` 的 frontmatter (--- 代码块) 中定义一个 `SITE_VERIFICATION_META` 配置数组，将 4 个搜索引擎的 env var → meta name 映射为数据结构
2. 在 frontmatter 中基于 `import.meta.env` 过滤出有值的配置项，逐条生成 `<meta>` 标签
3. 在 HTML `<head>` 中使用 Astro 模板语法渲染这些标签

```typescript
// 核心逻辑示例
const SITE_VERIFICATION_META = [
  { env: 'PUBLIC_GOOGLE_SITE_VERIFICATION', name: 'google-site-verification' },
  { env: 'PUBLIC_BING_SITE_VERIFICATION', name: 'msvalidate.01' },
  { env: 'PUBLIC_YANDEX_SITE_VERIFICATION', name: 'yandex-verification' },
  { env: 'PUBLIC_BAIDU_SITE_VERIFICATION', name: 'baidu-site-verification' },
];

const verificationMeta = SITE_VERIFICATION_META
  .filter(m => import.meta.env[m.env])
  .map(m => ({ name: m.name, content: import.meta.env[m.env] }));
```

然后模板中遍历渲染：
```astro
{verificationMeta.map(m => <meta name={m.name} content={m.content} />)}
```

## 关键取舍与风险

| 决策 | 选择 | 备选 |
|------|------|------|
| 注入方式 | Astro frontmatter 直接条件注入 | Astro Integration / Vite 插件（过度设计） |
| 组件抽取 | 否，留在 index.astro | <Head> 组件（多页面时才值得） |

**风险**：
- `PUBLIC_` 前缀暴露到客户端 JS（mitigation: verification code 本身就是公开信息）
- 空字符串 vs 未设置（mitigation: 同时检查 falsy 值）

## 测试策略

- 构建后检查 dist HTML，确认 env 对应关系
- TypeScript 类型检查（`npm run check`）
- 手动测试：设置 env → 构建 → 验证 HTML

## Spec Patch

无。现有 delta spec 已覆盖所有场景。

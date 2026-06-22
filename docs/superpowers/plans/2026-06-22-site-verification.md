---
change: site-verification
design-doc: docs/superpowers/specs/2026-06-22-site-verification-design.md
base-ref: ac04ac01e0ecd5ed24fca87345e5868d0da5fe5b
---

# Site Verification — Implementation Plan

## 概述

为 PDF Converter 添加四个搜索引擎的 site verification meta tag 注入能力。改动范围小（3 文件，~30 行），复杂度低。

## 任务分解

### Task 1: 环境配置

**文件**: `.env.example`（新建）

创建 `.env.example`，提供四个环境变量的示例配置，注释说明用途。

### Task 2: 类型声明

**文件**: `src/env.d.ts`

在 `ImportMetaEnv` 接口中添加四个 `PUBLIC_*_SITE_VERIFICATION` 属性的类型声明，类型为 `string | undefined`。

### Task 3: Meta Tag 注入

**文件**: `src/pages/index.astro`

1. 在 frontmatter（`---` 代码块）中添加配置映射数组和过滤逻辑
2. 在 `<head>` 中添加条件渲染逻辑
3. 添加位置：放在现有 Open Graph meta tags 后面、Microsoft Clarity script 前面

### 任务执行顺序

3 个文件互相独立，可依次执行：`.env.example` → `env.d.ts` → `index.astro`

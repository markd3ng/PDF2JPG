# PDF2JPG

一个基于 `Astro + React + pdf.js` 的纯前端 PDF 转 JPG 工具。

- 全程浏览器本地处理，不上传文件
- 支持批量拖拽多个 PDF
- 支持 `72 / 150 / 300 DPI` 画质预设
- 支持逐页导出 JPG
- 当总图片数大于 `5` 时自动打包为 ZIP 下载
- 适合直接部署到静态托管平台

## 功能特性

- 批量拖拽上传：基于 `react-dropzone`
- PDF 渲染：基于 `pdfjs-dist`
- 下载打包：基于 `jszip`
- 响应式 UI：基于 `Tailwind CSS` + React 组件
- 无服务端依赖：构建后输出静态站点

## 技术栈

- `Astro 5`
- `React 18`
- `Tailwind CSS 4`
- `pdf.js`
- `jszip`
- `TypeScript`

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发环境

```bash
npm run dev
```

默认开发地址：`http://localhost:4321`

### 3. 构建生产版本

```bash
npm run build
```

构建产物输出到：`dist/`

### 4. 本地预览生产构建

```bash
npm run preview
```

## 项目脚本

```bash
npm run dev
npm run build
npm run preview
npm run check
```

## 部署说明

本项目是纯静态前端应用，无需数据库、无服务端接口、无环境变量依赖。部署时统一使用以下核心配置：

- 安装命令：`npm install`
- 构建命令：`npm run build`
- 输出目录：`dist`
- Node.js：建议 `18+`，推荐 `20`

---

## 部署到 Cloudflare Pages

### 方式一：Cloudflare Dashboard

1. 将仓库推送到 GitHub。
2. 登录 Cloudflare Dashboard。
3. 进入 `Workers & Pages` -> `Create application` -> `Pages` -> `Connect to Git`。
4. 选择本仓库 `PDF2JPG`。
5. 构建配置填写：
   - Framework preset：`Astro`
   - Build command：`npm run build`
   - Build output directory：`dist`
6. 点击部署。

### 方式二：Wrangler（可选）

如需使用 CLI，也可以先构建后发布静态目录：

```bash
npm run build
```

然后将 `dist/` 作为 Pages 静态产物发布。

> 注意：本项目不依赖 Cloudflare Functions，直接静态托管即可。

---

## 部署到 Vercel

1. 将仓库推送到 GitHub。
2. 登录 Vercel。
3. 选择 `Add New Project` 并导入仓库。
4. 配置构建参数：
   - Framework Preset：`Astro`
   - Install Command：`npm install`
   - Build Command：`npm run build`
   - Output Directory：`dist`
5. 点击部署。

如果 Vercel 已自动识别为 Astro，一般无需手动修改。

---

## 部署到 Netlify

1. 将仓库推送到 GitHub。
2. 登录 Netlify。
3. 选择 `Add new site` -> `Import an existing project`。
4. 选择 GitHub 仓库后填写：
   - Build command：`npm run build`
   - Publish directory：`dist`
5. 点击部署。

也可以使用 `netlify.toml` 进一步固化配置，但当前项目不是必须。

---

## 浏览器与使用说明

- 推荐使用最新版 `Chrome / Edge / Firefox`
- PDF 转换在浏览器端完成，文件不会上传到服务器
- 若在 IDE 内嵌预览中测试复制图片失败，通常是剪贴板权限限制；在正式 HTTPS 域名下访问更稳定
- 大文件或高 DPI 转换时会占用更多内存，建议分批处理

## 目录结构

```text
src/
  components/
  lib/
  pages/
public/
```

## 版本说明

当前可作为 `v1` 初版发布，适合先上线验证核心功能。

## Changelog

### v1.0.1
- 添加 Google AdSense 广告框支持
- 添加 Microsoft Clarity 统计代码
- 优化页面布局为单列布局
- 调整开始转换按钮位置
- 优化 SEO 元数据

## Google AdSense 使用说明

1. 打开 `src/components/converter-app.tsx` 文件
2. 找到 Google AdSense 广告框占位符（大约在第 243-245 行）
3. 将占位符内容替换为您的 Google AdSense 代码
4. 保存文件并重新构建项目

```jsx
// 替换前
<div className="w-full max-w-md h-32 bg-slate-100 rounded-lg flex items-center justify-center">
  <span className="text-sm text-slate-400">Google AdSense 广告位</span>
</div>

// 替换后（示例）
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="XXXXXXXXXX"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
```

## Microsoft Clarity 使用说明

1. 打开 `src/pages/index.astro` 文件
2. 找到 Microsoft Clarity 统计代码（大约在第 20-26 行）
3. 如果需要更改跟踪 ID，修改 `vtzz5hczt5` 为您的 Microsoft Clarity 项目 ID
4. 保存文件并重新构建项目

```javascript
// 示例代码
(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "vtzz5hczt5");
```

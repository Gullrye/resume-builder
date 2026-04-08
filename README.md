# Resume Builder

选模板，填内容，实时预览，一键导出 PDF。

无需注册，数据保存在本地浏览器。

## 功能

- **模板选择**：Modern（双栏）、Geek（雷达图）等模板
- **实时预览**：编辑表单内容，右侧即时渲染简历效果
- **PDF 导出**：一键生成高质量 PDF，支持多页简历
- **移动端适配**：手机上编辑/预览切换，底部操作栏
- **本地存储**：所有数据保存在浏览器 localStorage，隐私安全

## 技术栈

- **Next.js 16** (App Router) + **React 19**
- **Tailwind CSS 4**
- **Zustand** — 状态管理
- **Puppeteer** — 服务端 PDF 生成

## 开发

```bash
pnpm install
pnpm dev
```

手机 LAN 访问：`http://<电脑IP>:3000`，已自动配置 `allowedDevOrigins`。

## 项目结构

```
src/
├── app/
│   ├── page.tsx              # 首页（模板选择）
│   ├── editor/page.tsx       # 编辑器页面
│   ├── resume-print/page.tsx # 打印页面
│   └── api/export-pdf/       # PDF 导出 API
├── components/
│   ├── editor/               # 表单组件（basics, experience, education...）
│   ├── preview/              # 简历预览（多页分页）
│   └── templates/            # 模板组件（modern, geek）
└── lib/
    ├── store.ts              # Zustand store
    └── types.ts              # 类型定义
```

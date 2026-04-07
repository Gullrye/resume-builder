# 简历生成网站 — 设计文档

## 概述

面向通用求职者的简历生成网站。用户在左右分栏编辑器中填写内容，右侧实时预览简历效果，选择模板后导出 PDF。

## 目标用户

通用求职者，覆盖各行业。强调易上手、零门槛（无需注册）。

## 核心流程

1. 用户访问首页，浏览 3 个简历模板预览
2. 选择模板后进入编辑器
3. 左栏填写简历内容，右栏实时预览
4. 满意后点击导出 PDF

## 技术栈

- **框架**：Next.js App Router + TypeScript
- **样式**：Tailwind CSS
- **状态管理**：Zustand
- **PDF 生成**：Puppeteer（服务端）
- **持久化**：localStorage

## 架构

### 页面

| 路由 | 功能 |
|------|------|
| `/` | 首页，展示模板预览卡片，点击进入编辑 |
| `/editor` | 左右分栏编辑器（左 40% 表单，右 60% 预览） |
| `/api/export-pdf` | POST API，接收简历数据 + 模板 ID，返回 PDF |

### 数据流

```
用户填写 → Zustand store → localStorage (自动保存)
                        → 右栏预览 (实时渲染)
                        → /api/export-pdf (导出时 POST)
```

### 项目结构

```
src/
  app/
    page.tsx                    # 首页
    editor/page.tsx             # 编辑页
    api/export-pdf/route.ts     # PDF 导出 API
  components/
    editor/
      form-sections/            # 各表单区块组件
      toolbar.tsx               # 顶部工具栏
    preview/
      resume-preview.tsx        # 右栏预览容器
    templates/
      classic.tsx               # 经典模板
      modern.tsx                # 现代模板
      minimal.tsx               # 简约模板
      index.ts                  # 模板注册表
  lib/
    resume-store.ts             # Zustand store
    types.ts                    # 简历数据类型定义
```

## 简历数据模型

```typescript
interface ResumeData {
  basics: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    summary?: string;
  };

  experience: {
    company: string;
    position: string;
    startDate: string;          // YYYY-MM
    endDate: string | null;     // null = 至今
    description: string;        // 换行分隔的要点列表
  }[];

  education: {
    school: string;
    degree: string;
    major: string;
    startDate: string;
    endDate: string;
  }[];

  skills: string[];

  projects?: {
    name: string;
    description: string;
    url?: string;
  }[];

  languages?: string[];
}

interface EditorState {
  resumeData: ResumeData;
  templateId: string;           // 'classic' | 'modern' | 'minimal'
  setResumeData: (data: ResumeData) => void;
  setTemplateId: (id: string) => void;
  resetAll: () => void;
}
```

## 编辑器设计

### 布局

- **左栏（40%）**：可滚动的表单区，用折叠面板组织各模块
  - 基本信息（始终展开）
  - 工作经历（可动态添加/删除条目）
  - 教育背景（可动态添加/删除条目）
  - 技能（标签式输入）
  - 项目经历（可选，可动态添加/删除条目）
- **右栏（60%）**：A4 比例缩放的实时预览，内容随左栏输入实时更新
- **顶部工具栏**：模板切换下拉、缩放滑块、清空按钮、导出 PDF 按钮

### 移动端适配

- 改为上下布局
- 表单区在上
- 预览区在下，通过按钮切换显示/隐藏
- 底部固定导出按钮

## 模板系统

每个模板是一个 React 组件，统一接口：

```typescript
interface TemplateProps {
  data: ResumeData;
}
```

模板组件在预览和 PDF 导出中共用。预览时渲染在页面中，导出时在服务端渲染为 HTML 字符串。

### 首版 3 个模板

1. **经典 (classic)** — 单栏，黑白配色，传统排版。适合金融、政府、传统行业。
2. **现代 (modern)** — 双栏，左侧彩色侧边栏（姓名、联系方式、技能），右侧主要内容。适合互联网、科技行业。
3. **简约 (minimal)** — 单栏，大量留白，细线条分隔。适合设计、创意行业。

## PDF 导出

### API 设计

```
POST /api/export-pdf
Content-Type: application/json

{
  "resumeData": { ... },
  "templateId": "modern"
}

→ Response: application/pdf
  Content-Disposition: attachment; filename="resume.pdf"
```

### 实现方案

1. 接收简历数据和模板 ID
2. 用模板组件渲染为完整 HTML（注入样式）
3. Puppeteer 启动浏览器，加载 HTML
4. 设置 A4 纸张、无边距
5. 生成 PDF 并返回

## 状态管理 & 持久化

- Zustand store 管理简历数据和模板选择
- `useEffect` 监听 store 变化，debounce 300ms 后写入 localStorage
- 页面加载时检查 localStorage，有数据则自动恢复
- 提供「清空重置」按钮，清除 store 和 localStorage

## 非功能需求

- 首屏加载 < 2s
- 预览更新延迟 < 200ms（输入到渲染）
- PDF 生成 < 5s
- 移动端可用（响应式布局）

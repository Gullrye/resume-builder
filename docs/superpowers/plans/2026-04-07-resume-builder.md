# 简历生成网站 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个零门槛的简历生成网站，用户填写表单、实时预览、导出 PDF。

**Architecture:** Next.js App Router + Zustand 状态管理 + Puppeteer 服务端 PDF 生成。左右分栏编辑器，左栏表单右栏实时预览。数据存 localStorage，无需后端数据库。

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, Puppeteer

**Spec:** `docs/superpowers/specs/2026-04-07-resume-builder-design.md`

---

## File Structure

```
src/
  app/
    layout.tsx                       # 根布局，加载字体和全局样式
    page.tsx                         # 首页，模板选择
    globals.css                      # Tailwind 基础样式
    editor/
      page.tsx                       # 编辑器页面，左右分栏布局
    api/
      export-pdf/
        route.ts                     # POST API，Puppeteer 生成 PDF
    resume-print/
      page.tsx                       # PDF 渲染专用页面（读取 URL 参数渲染模板）
  lib/
    types.ts                         # ResumeData, TemplateProps 类型定义
    store.ts                         # Zustand store（resumeData + templateId + localStorage 持久化）
    templates.tsx                    # 服务端模板渲染 → HTML 字符串
  components/
    template-card.tsx                # 首页模板预览卡片
    template-card.helpers.ts         # 模板卡片示例数据
    editor/
      toolbar.tsx                    # 顶部工具栏（模板切换、缩放、导出、清空）
      basics-form.tsx                # 基本信息表单
      experience-form.tsx            # 工作经历表单（动态添加/删除）
      education-form.tsx             # 教育背景表单（动态添加/删除）
      skills-form.tsx                # 技能输入（标签式）
      projects-form.tsx              # 项目经历表单（动态添加/删除）
      form-panel.tsx                 # 左栏容器，组织所有表单模块
    preview/
      resume-preview.tsx             # 右栏预览容器，A4 缩放
    templates/
      index.ts                       # 模板注册表 + TemplateProps
      classic.tsx                    # 经典模板
      modern.tsx                     # 现代模板
      minimal.tsx                    # 简约模板
```

---

### Task 1: 项目初始化

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `src/app/layout.tsx`, `src/app/globals.css`

- [ ] **Step 1: 初始化 Next.js 项目**

```bash
cd /Users/gullrye/Documents/ai/how-021-test
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```

如果目录不为空，用 `--no-git` 并手动确认覆盖。安装额外依赖：

```bash
npm install zustand puppeteer
npm install -D @types/react @types/node
```

- [ ] **Step 2: 验证项目能启动**

```bash
npm run dev
```

访问 http://localhost:3000 确认默认页面正常显示。Ctrl+C 停止。

- [ ] **Step 3: 清理默认内容**

`src/app/page.tsx` 替换为最小内容：

```tsx
export default function Home() {
  return <main className="min-h-screen bg-gray-50" />;
}
```

`src/app/layout.tsx` 确认包含基本 meta：

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "简历生成器",
  description: "快速创建专业简历，实时预览，一键导出 PDF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git init
git add .
git commit -m "feat: initialize Next.js project with TypeScript and Tailwind"
```

---

### Task 2: 类型定义和状态管理

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/store.ts`

- [ ] **Step 1: 创建类型定义 `src/lib/types.ts`**

```typescript
export interface ResumeData {
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
    startDate: string;
    endDate: string | null;
    description: string;
  }[];
  education: {
    school: string;
    degree: string;
    major: string;
    startDate: string;
    endDate: string;
  }[];
  skills: string[];
  projects: {
    name: string;
    description: string;
    url?: string;
  }[];
  languages: string[];
}

export type TemplateId = "classic" | "modern" | "minimal";

export interface TemplateProps {
  data: ResumeData;
}
```

- [ ] **Step 2: 创建 Zustand store `src/lib/store.ts`**

```typescript
import { create } from "zustand";
import { ResumeData, TemplateId } from "./types";

const STORAGE_KEY = "resume-builder-data";
const TEMPLATE_KEY = "resume-builder-template";

const defaultResumeData: ResumeData = {
  basics: {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  languages: [],
};

function loadFromStorage(): { data: ResumeData; templateId: TemplateId } {
  if (typeof window === "undefined") {
    return { data: defaultResumeData, templateId: "classic" };
  }
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const savedTemplate = localStorage.getItem(TEMPLATE_KEY);
    return {
      data: savedData ? JSON.parse(savedData) : defaultResumeData,
      templateId: (savedTemplate as TemplateId) || "classic",
    };
  } catch {
    return { data: defaultResumeData, templateId: "classic" };
  }
}

interface ResumeStore {
  resumeData: ResumeData;
  templateId: TemplateId;
  hydrated: boolean;
  setResumeData: (data: ResumeData) => void;
  updateBasics: (basics: Partial<ResumeData["basics"]>) => void;
  setTemplateId: (id: TemplateId) => void;
  resetAll: () => void;
  hydrate: () => void;
}

export const useResumeStore = create<ResumeStore>((set, get) => ({
  resumeData: defaultResumeData,
  templateId: "classic",
  hydrated: false,

  setResumeData: (data) => {
    set({ resumeData: data });
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  },

  updateBasics: (basics) => {
    const newData = {
      ...get().resumeData,
      basics: { ...get().resumeData.basics, ...basics },
    };
    set({ resumeData: newData });
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    }
  },

  setTemplateId: (id) => {
    set({ templateId: id });
    if (typeof window !== "undefined") {
      localStorage.setItem(TEMPLATE_KEY, id);
    }
  },

  resetAll: () => {
    set({ resumeData: defaultResumeData, templateId: "classic" });
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TEMPLATE_KEY);
    }
  },

  hydrate: () => {
    const { data, templateId } = loadFromStorage();
    set({ resumeData: data, templateId, hydrated: true });
  },
}));
```

- [ ] **Step 3: 验证 TypeScript 编译通过**

```bash
npx tsc --noEmit
```

Expected: 无错误。

- [ ] **Step 4: Commit**

```bash
git add src/lib/
git commit -m "feat: add ResumeData types and Zustand store with localStorage persistence"
```

---

### Task 3: 模板组件 — 经典模板

**Files:**
- Create: `src/components/templates/index.ts`
- Create: `src/components/templates/classic.tsx`

- [ ] **Step 1: 创建模板注册表 `src/components/templates/index.ts`**

```typescript
import { TemplateId } from "@/lib/types";

export { ClassicTemplate } from "./classic";
export { ModernTemplate } from "./modern";
export { MinimalTemplate } from "./minimal";

export const TEMPLATE_LIST: { id: TemplateId; name: string; description: string }[] = [
  { id: "classic", name: "经典", description: "单栏黑白，适合传统行业" },
  { id: "modern", name: "现代", description: "双栏彩边，适合科技行业" },
  { id: "minimal", name: "简约", description: "大量留白，适合创意行业" },
];
```

- [ ] **Step 2: 创建经典模板 `src/components/templates/classic.tsx`**

单栏黑白模板。结构：
- 顶部：姓名（大号加粗）、职位、联系方式一行
- 分隔线
- 个人简介（如有）
- 工作经历：公司名 + 职位 + 日期，下方描述要点
- 教育背景：学校 + 学位 + 专业 + 日期
- 技能：逗号分隔
- 项目经历（如有）
- 语言（如有）

用 Tailwind 排版。所有文字黑色，分隔线灰色。不使用任何彩色。字体用 serif 风格。

```tsx
import { TemplateProps } from "@/lib/types";

export function ClassicTemplate({ data }: TemplateProps) {
  const { basics, experience, education, skills, projects, languages } = data;

  return (
    <div className="font-serif text-black p-8 text-[10pt] leading-relaxed">
      {/* Header */}
      <h1 className="text-[22pt] font-bold text-center mb-1">
        {basics.name || "姓名"}
      </h1>
      <p className="text-center text-[11pt] mb-2">{basics.title || "职位"}</p>
      <p className="text-center text-[9pt] text-gray-600 mb-4">
        {[basics.email, basics.phone, basics.location, basics.website]
          .filter(Boolean)
          .join(" · ")}
      </p>

      <hr className="border-gray-400 mb-4" />

      {/* Summary */}
      {basics.summary && (
        <section className="mb-4">
          <h2 className="text-[11pt] font-bold border-b border-gray-300 pb-1 mb-2">
            个人简介
          </h2>
          <p className="text-[9pt] whitespace-pre-line">{basics.summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[11pt] font-bold border-b border-gray-300 pb-1 mb-2">
            工作经历
          </h2>
          {experience.map((exp, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-[10pt]">{exp.company}</span>
                <span className="text-[8pt] text-gray-500">
                  {exp.startDate} — {exp.endDate ?? "至今"}
                </span>
              </div>
              <p className="text-[9pt] italic">{exp.position}</p>
              {exp.description && (
                <ul className="list-disc list-inside text-[9pt] mt-1">
                  {exp.description.split("\n").filter(Boolean).map((line, j) => (
                    <li key={j}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[11pt] font-bold border-b border-gray-300 pb-1 mb-2">
            教育背景
          </h2>
          {education.map((edu, i) => (
            <div key={i} className="mb-2 flex justify-between items-baseline">
              <div>
                <span className="font-bold text-[10pt]">{edu.school}</span>
                <span className="text-[9pt] ml-2">
                  {edu.degree} · {edu.major}
                </span>
              </div>
              <span className="text-[8pt] text-gray-500">
                {edu.startDate} — {edu.endDate}
              </span>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[11pt] font-bold border-b border-gray-300 pb-1 mb-2">
            技能
          </h2>
          <p className="text-[9pt]">{skills.join(" · ")}</p>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[11pt] font-bold border-b border-gray-300 pb-1 mb-2">
            项目经历
          </h2>
          {projects.map((proj, i) => (
            <div key={i} className="mb-2">
              <span className="font-bold text-[10pt]">{proj.name}</span>
              {proj.url && (
                <span className="text-[8pt] text-gray-500 ml-2">{proj.url}</span>
              )}
              <p className="text-[9pt]">{proj.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[11pt] font-bold border-b border-gray-300 pb-1 mb-2">
            语言能力
          </h2>
          <p className="text-[9pt]">{languages.join(" · ")}</p>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/components/templates/
git commit -m "feat: add template registry and classic template"
```

---

### Task 4: 模板组件 — 现代和简约模板

**Files:**
- Create: `src/components/templates/modern.tsx`
- Create: `src/components/templates/minimal.tsx`

- [ ] **Step 1: 创建现代模板 `src/components/templates/modern.tsx`**

双栏布局：左侧窄栏（约 30%）深色背景显示姓名、联系方式、技能、语言；右侧宽栏显示工作经历、教育、项目。

左侧背景色 `#2D3748`（深灰蓝），文字白色。右侧白色背景。无衬线字体。

```tsx
import { TemplateProps } from "@/lib/types";

export function ModernTemplate({ data }: TemplateProps) {
  const { basics, experience, education, skills, projects, languages } = data;

  return (
    <div className="flex min-h-full text-[10pt] leading-relaxed font-sans">
      {/* Sidebar */}
      <div className="w-[30%] bg-[#2D3748] text-white p-6">
        <h1 className="text-[18pt] font-bold mb-1">{basics.name || "姓名"}</h1>
        <p className="text-[10pt] text-gray-300 mb-4">{basics.title || "职位"}</p>

        <div className="space-y-1 text-[8pt] text-gray-300 mb-6">
          {basics.email && <p>{basics.email}</p>}
          {basics.phone && <p>{basics.phone}</p>}
          {basics.location && <p>{basics.location}</p>}
          {basics.website && <p>{basics.website}</p>}
        </div>

        {skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-[9pt] font-bold uppercase tracking-wider border-b border-gray-500 pb-1 mb-2">
              技能
            </h2>
            <div className="flex flex-wrap gap-1">
              {skills.map((s, i) => (
                <span
                  key={i}
                  className="text-[8pt] bg-white/10 px-2 py-0.5 rounded"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {languages.length > 0 && (
          <div className="mb-6">
            <h2 className="text-[9pt] font-bold uppercase tracking-wider border-b border-gray-500 pb-1 mb-2">
              语言
            </h2>
            <ul className="text-[8pt] space-y-1">
              {languages.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="w-[70%] p-6">
        {basics.summary && (
          <section className="mb-5">
            <h2 className="text-[11pt] font-bold text-[#2D3748] border-b-2 border-[#2D3748] pb-1 mb-2">
              个人简介
            </h2>
            <p className="text-[9pt] whitespace-pre-line">{basics.summary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section className="mb-5">
            <h2 className="text-[11pt] font-bold text-[#2D3748] border-b-2 border-[#2D3748] pb-1 mb-2">
              工作经历
            </h2>
            {experience.map((exp, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-[10pt]">{exp.position}</span>
                  <span className="text-[8pt] text-gray-500">
                    {exp.startDate} — {exp.endDate ?? "至今"}
                  </span>
                </div>
                <p className="text-[9pt] text-gray-600">{exp.company}</p>
                {exp.description && (
                  <ul className="list-disc list-inside text-[9pt] mt-1">
                    {exp.description.split("\n").filter(Boolean).map((line, j) => (
                      <li key={j}>{line}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {education.length > 0 && (
          <section className="mb-5">
            <h2 className="text-[11pt] font-bold text-[#2D3748] border-b-2 border-[#2D3748] pb-1 mb-2">
              教育背景
            </h2>
            {education.map((edu, i) => (
              <div key={i} className="mb-2 flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-[10pt]">{edu.school}</span>
                  <span className="text-[9pt] ml-2 text-gray-600">
                    {edu.degree} · {edu.major}
                  </span>
                </div>
                <span className="text-[8pt] text-gray-500">
                  {edu.startDate} — {edu.endDate}
                </span>
              </div>
            ))}
          </section>
        )}

        {projects.length > 0 && (
          <section className="mb-5">
            <h2 className="text-[11pt] font-bold text-[#2D3748] border-b-2 border-[#2D3748] pb-1 mb-2">
              项目经历
            </h2>
            {projects.map((proj, i) => (
              <div key={i} className="mb-2">
                <span className="font-bold text-[10pt]">{proj.name}</span>
                {proj.url && (
                  <span className="text-[8pt] text-gray-400 ml-2">{proj.url}</span>
                )}
                <p className="text-[9pt]">{proj.description}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建简约模板 `src/components/templates/minimal.tsx`**

单栏，大量留白，细线条分隔。与经典模板类似但更空灵：更大行间距，更淡的分隔线，更小的标题。

```tsx
import { TemplateProps } from "@/lib/types";

export function MinimalTemplate({ data }: TemplateProps) {
  const { basics, experience, education, skills, projects, languages } = data;

  return (
    <div className="font-sans text-black p-10 text-[10pt] leading-loose">
      {/* Header - minimal, centered */}
      <h1 className="text-[20pt] font-light text-center tracking-wide mb-1">
        {basics.name || "姓名"}
      </h1>
      <p className="text-center text-[10pt] text-gray-400 mb-3">
        {[basics.title, basics.email, basics.phone, basics.location, basics.website]
          .filter(Boolean)
          .join("  ·  ")}
      </p>

      {/* Summary */}
      {basics.summary && (
        <p className="text-[9pt] text-gray-600 text-center max-w-[80%] mx-auto mb-6 whitespace-pre-line">
          {basics.summary}
        </p>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[9pt] uppercase tracking-[0.2em] text-gray-400 mb-3">
            Experience
          </h2>
          {experience.map((exp, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between items-baseline">
                <span className="text-[10pt]">{exp.company}</span>
                <span className="text-[8pt] text-gray-400">
                  {exp.startDate} — {exp.endDate ?? "Present"}
                </span>
              </div>
              <p className="text-[9pt] text-gray-500 italic">{exp.position}</p>
              {exp.description && (
                <ul className="text-[9pt] text-gray-600 mt-1 space-y-0.5">
                  {exp.description.split("\n").filter(Boolean).map((line, j) => (
                    <li key={j}>— {line}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[9pt] uppercase tracking-[0.2em] text-gray-400 mb-3">
            Education
          </h2>
          {education.map((edu, i) => (
            <div key={i} className="mb-2 flex justify-between items-baseline">
              <span className="text-[10pt]">
                {edu.school} · {edu.degree} {edu.major}
              </span>
              <span className="text-[8pt] text-gray-400">
                {edu.startDate} — {edu.endDate}
              </span>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[9pt] uppercase tracking-[0.2em] text-gray-400 mb-3">
            Skills
          </h2>
          <p className="text-[9pt] text-gray-600">{skills.join("  ·  ")}</p>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[9pt] uppercase tracking-[0.2em] text-gray-400 mb-3">
            Projects
          </h2>
          {projects.map((proj, i) => (
            <div key={i} className="mb-2">
              <span className="text-[10pt]">{proj.name}</span>
              {proj.url && (
                <span className="text-[8pt] text-gray-400 ml-2">{proj.url}</span>
              )}
              <p className="text-[9pt] text-gray-600">{proj.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[9pt] uppercase tracking-[0.2em] text-gray-400 mb-3">
            Languages
          </h2>
          <p className="text-[9pt] text-gray-600">{languages.join("  ·  ")}</p>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/components/templates/
git commit -m "feat: add modern and minimal resume templates"
```

---

### Task 5: 首页 — 模板选择

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/template-card.tsx`

- [ ] **Step 1: 创建模板卡片组件 `src/components/template-card.tsx`**

展示模板缩略图（用 CSS 模拟简历布局）+ 模板名称 + 描述。点击跳转到 `/editor?template=<id>`。

```tsx
"use client";

import Link from "next/link";
import { TemplateId } from "@/lib/types";
import { ClassicTemplate } from "./templates/classic";
import { ModernTemplate } from "./templates/modern";
import { MinimalTemplate } from "./templates/minimal";
import { sampleResumeData } from "./template-card.helpers";

// 小型辅助文件 src/components/template-card.helpers.ts
// 导出一份示例数据用于模板卡片预览

const templateComponents: Record<TemplateId, React.ComponentType<{ data: any }>> = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
};

export function TemplateCard({
  id,
  name,
  description,
}: {
  id: TemplateId;
  name: string;
  description: string;
}) {
  const TemplateComponent = templateComponents[id];

  return (
    <Link
      href={`/editor?template=${id}`}
      className="group block rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-[210/297] overflow-hidden bg-white p-2 scale-[0.9] origin-top">
        <div className="pointer-events-none transform scale-[0.35] origin-top-left w-[285%]">
          <TemplateComponent data={sampleResumeData} />
        </div>
      </div>
      <div className="p-4 bg-white">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
          {name}
        </h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </Link>
  );
}
```

创建示例数据文件 `src/components/template-card.helpers.ts`：

```typescript
import { ResumeData } from "@/lib/types";

export const sampleResumeData: ResumeData = {
  basics: {
    name: "张三",
    title: "高级前端工程师",
    email: "zhangsan@email.com",
    phone: "138-0000-0000",
    location: "北京",
    summary: "5 年前端开发经验，擅长 React 生态。",
  },
  experience: [
    {
      company: "某科技公司",
      position: "前端工程师",
      startDate: "2021-03",
      endDate: null,
      description: "负责核心产品前端架构\n推动 TypeScript 迁移",
    },
  ],
  education: [
    {
      school: "某大学",
      degree: "本科",
      major: "计算机科学",
      startDate: "2014-09",
      endDate: "2018-06",
    },
  ],
  skills: ["React", "TypeScript", "Node.js"],
  projects: [
    { name: "内部工具平台", description: "企业级低代码平台" },
  ],
  languages: ["中文（母语）", "英语（流利）"],
};
```

- [ ] **Step 2: 实现首页 `src/app/page.tsx`**

```tsx
import { TEMPLATE_LIST } from "@/components/templates";
import { TemplateCard } from "@/components/template-card";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">简历生成器</h1>
          <p className="text-lg text-gray-600">
            选择模板，填写内容，一键导出 PDF
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TEMPLATE_LIST.map((t) => (
            <TemplateCard key={t.id} id={t.id} name={t.name} description={t.description} />
          ))}
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: 验证首页渲染**

```bash
npm run dev
```

访问 http://localhost:3000 确认 3 个模板卡片正常显示，点击可跳转到 `/editor?template=xxx`。

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/components/template-card.tsx src/components/template-card.helpers.ts
git commit -m "feat: add homepage with template selection cards"
```

---

### Task 6: 编辑器表单组件

**Files:**
- Create: `src/components/editor/basics-form.tsx`
- Create: `src/components/editor/experience-form.tsx`
- Create: `src/components/editor/education-form.tsx`
- Create: `src/components/editor/skills-form.tsx`
- Create: `src/components/editor/projects-form.tsx`
- Create: `src/components/editor/form-panel.tsx`

- [ ] **Step 1: 创建基本信息表单 `src/components/editor/basics-form.tsx`**

```tsx
"use client";

import { useResumeStore } from "@/lib/store";

export function BasicsForm() {
  const { resumeData, updateBasics } = useResumeStore();
  const { basics } = resumeData;

  return (
    <div className="space-y-3 py-2">
      <div className="grid grid-cols-2 gap-3">
        <input
          className="border rounded px-3 py-1.5 text-sm w-full"
          placeholder="姓名"
          value={basics.name}
          onChange={(e) => updateBasics({ name: e.target.value })}
        />
        <input
          className="border rounded px-3 py-1.5 text-sm w-full"
          placeholder="职位"
          value={basics.title}
          onChange={(e) => updateBasics({ title: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input
          className="border rounded px-3 py-1.5 text-sm w-full"
          placeholder="邮箱"
          type="email"
          value={basics.email}
          onChange={(e) => updateBasics({ email: e.target.value })}
        />
        <input
          className="border rounded px-3 py-1.5 text-sm w-full"
          placeholder="电话"
          value={basics.phone}
          onChange={(e) => updateBasics({ phone: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input
          className="border rounded px-3 py-1.5 text-sm w-full"
          placeholder="城市"
          value={basics.location}
          onChange={(e) => updateBasics({ location: e.target.value })}
        />
        <input
          className="border rounded px-3 py-1.5 text-sm w-full"
          placeholder="网站 (可选)"
          value={basics.website || ""}
          onChange={(e) => updateBasics({ website: e.target.value })}
        />
      </div>
      <textarea
        className="border rounded px-3 py-1.5 text-sm w-full"
        placeholder="个人简介 (可选)"
        rows={3}
        value={basics.summary || ""}
        onChange={(e) => updateBasics({ summary: e.target.value })}
      />
    </div>
  );
}
```

- [ ] **Step 2: 创建工作经历表单 `src/components/editor/experience-form.tsx`**

```tsx
"use client";

import { useResumeStore } from "@/lib/store";

export function ExperienceForm() {
  const { resumeData, setResumeData } = useResumeStore();
  const { experience } = resumeData;

  const add = () => {
    setResumeData({
      ...resumeData,
      experience: [
        ...experience,
        { company: "", position: "", startDate: "", endDate: null, description: "" },
      ],
    });
  };

  const remove = (index: number) => {
    setResumeData({
      ...resumeData,
      experience: experience.filter((_, i) => i !== index),
    });
  };

  const update = (index: number, field: string, value: string | null) => {
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    setResumeData({ ...resumeData, experience: updated });
  };

  return (
    <div className="space-y-4 py-2">
      {experience.map((exp, i) => (
        <div key={i} className="border rounded p-3 space-y-2 relative">
          <button
            onClick={() => remove(i)}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-sm"
          >
            ✕
          </button>
          <div className="grid grid-cols-2 gap-2">
            <input
              className="border rounded px-2 py-1 text-sm w-full"
              placeholder="公司名"
              value={exp.company}
              onChange={(e) => update(i, "company", e.target.value)}
            />
            <input
              className="border rounded px-2 py-1 text-sm w-full"
              placeholder="职位"
              value={exp.position}
              onChange={(e) => update(i, "position", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              className="border rounded px-2 py-1 text-sm w-full"
              placeholder="开始日期 (YYYY-MM)"
              value={exp.startDate}
              onChange={(e) => update(i, "startDate", e.target.value)}
            />
            <div className="flex items-center gap-2">
              <input
                className="border rounded px-2 py-1 text-sm flex-1"
                placeholder="结束日期"
                value={exp.endDate || ""}
                disabled={exp.endDate === null}
                onChange={(e) => update(i, "endDate", e.target.value)}
              />
              <label className="text-xs whitespace-nowrap">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={exp.endDate === null}
                  onChange={(e) =>
                    update(i, "endDate", e.target.checked ? null : "")
                  }
                />
                至今
              </label>
            </div>
          </div>
          <textarea
            className="border rounded px-2 py-1 text-sm w-full"
            placeholder="工作描述 (每行一条)"
            rows={3}
            value={exp.description}
            onChange={(e) => update(i, "description", e.target.value)}
          />
        </div>
      ))}
      <button
        onClick={add}
        className="w-full border border-dashed rounded py-2 text-sm text-gray-500 hover:text-blue-600 hover:border-blue-400"
      >
        + 添加工作经历
      </button>
    </div>
  );
}
```

- [ ] **Step 3: 创建教育背景表单 `src/components/editor/education-form.tsx`**

```tsx
"use client";

import { useResumeStore } from "@/lib/store";

export function EducationForm() {
  const { resumeData, setResumeData } = useResumeStore();
  const { education } = resumeData;

  const add = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...education,
        { school: "", degree: "", major: "", startDate: "", endDate: "" },
      ],
    });
  };

  const remove = (index: number) => {
    setResumeData({
      ...resumeData,
      education: education.filter((_, i) => i !== index),
    });
  };

  const update = (index: number, field: string, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setResumeData({ ...resumeData, education: updated });
  };

  return (
    <div className="space-y-4 py-2">
      {education.map((edu, i) => (
        <div key={i} className="border rounded p-3 space-y-2 relative">
          <button
            onClick={() => remove(i)}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-sm"
          >
            ✕
          </button>
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            placeholder="学校"
            value={edu.school}
            onChange={(e) => update(i, "school", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              className="border rounded px-2 py-1 text-sm w-full"
              placeholder="学位 (本科/硕士/博士)"
              value={edu.degree}
              onChange={(e) => update(i, "degree", e.target.value)}
            />
            <input
              className="border rounded px-2 py-1 text-sm w-full"
              placeholder="专业"
              value={edu.major}
              onChange={(e) => update(i, "major", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              className="border rounded px-2 py-1 text-sm w-full"
              placeholder="开始日期 (YYYY-MM)"
              value={edu.startDate}
              onChange={(e) => update(i, "startDate", e.target.value)}
            />
            <input
              className="border rounded px-2 py-1 text-sm w-full"
              placeholder="结束日期 (YYYY-MM)"
              value={edu.endDate}
              onChange={(e) => update(i, "endDate", e.target.value)}
            />
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="w-full border border-dashed rounded py-2 text-sm text-gray-500 hover:text-blue-600 hover:border-blue-400"
      >
        + 添加教育背景
      </button>
    </div>
  );
}
```

- [ ] **Step 4: 创建技能输入 `src/components/editor/skills-form.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useResumeStore } from "@/lib/store";

export function SkillsForm() {
  const { resumeData, setResumeData } = useResumeStore();
  const { skills } = resumeData;
  const [input, setInput] = useState("");

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setResumeData({ ...resumeData, skills: [...skills, trimmed] });
      setInput("");
    }
  };

  const remove = (index: number) => {
    setResumeData({
      ...resumeData,
      skills: skills.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-3 py-2">
      <div className="flex gap-2">
        <input
          className="border rounded px-3 py-1.5 text-sm flex-1"
          placeholder="输入技能后按回车或点击添加"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
        />
        <button
          onClick={add}
          className="px-3 py-1.5 text-sm bg-gray-100 rounded hover:bg-gray-200"
        >
          添加
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded"
          >
            {skill}
            <button
              onClick={() => remove(i)}
              className="text-blue-400 hover:text-red-500"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: 创建项目经历表单 `src/components/editor/projects-form.tsx`**

```tsx
"use client";

import { useResumeStore } from "@/lib/store";

export function ProjectsForm() {
  const { resumeData, setResumeData } = useResumeStore();
  const { projects } = resumeData;

  const add = () => {
    setResumeData({
      ...resumeData,
      projects: [...projects, { name: "", description: "", url: "" }],
    });
  };

  const remove = (index: number) => {
    setResumeData({
      ...resumeData,
      projects: projects.filter((_, i) => i !== index),
    });
  };

  const update = (index: number, field: string, value: string) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setResumeData({ ...resumeData, projects: updated });
  };

  return (
    <div className="space-y-4 py-2">
      {projects.map((proj, i) => (
        <div key={i} className="border rounded p-3 space-y-2 relative">
          <button
            onClick={() => remove(i)}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-sm"
          >
            ✕
          </button>
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            placeholder="项目名称"
            value={proj.name}
            onChange={(e) => update(i, "name", e.target.value)}
          />
          <textarea
            className="border rounded px-2 py-1 text-sm w-full"
            placeholder="项目描述"
            rows={2}
            value={proj.description}
            onChange={(e) => update(i, "description", e.target.value)}
          />
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            placeholder="链接 (可选)"
            value={proj.url || ""}
            onChange={(e) => update(i, "url", e.target.value)}
          />
        </div>
      ))}
      <button
        onClick={add}
        className="w-full border border-dashed rounded py-2 text-sm text-gray-500 hover:text-blue-600 hover:border-blue-400"
      >
        + 添加项目经历
      </button>
    </div>
  );
}
```

- [ ] **Step 6: 创建表单面板容器 `src/components/editor/form-panel.tsx`**

组织所有表单模块，用折叠面板（`<details>` 元素即可）。

```tsx
"use client";

import { BasicsForm } from "./basics-form";
import { ExperienceForm } from "./experience-form";
import { EducationForm } from "./education-form";
import { SkillsForm } from "./skills-form";
import { ProjectsForm } from "./projects-form";

export function FormPanel() {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-2">
      <details open>
        <summary className="font-semibold text-gray-700 cursor-pointer py-2">
          基本信息
        </summary>
        <BasicsForm />
      </details>
      <details open>
        <summary className="font-semibold text-gray-700 cursor-pointer py-2">
          工作经历
        </summary>
        <ExperienceForm />
      </details>
      <details>
        <summary className="font-semibold text-gray-700 cursor-pointer py-2">
          教育背景
        </summary>
        <EducationForm />
      </details>
      <details>
        <summary className="font-semibold text-gray-700 cursor-pointer py-2">
          技能
        </summary>
        <SkillsForm />
      </details>
      <details>
        <summary className="font-semibold text-gray-700 cursor-pointer py-2">
          项目经历
        </summary>
        <ProjectsForm />
      </details>
    </div>
  );
}
```

- [ ] **Step 7: 验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 8: Commit**

```bash
git add src/components/editor/
git commit -m "feat: add editor form components (basics, experience, education, skills, projects)"
```

---

### Task 7: 预览组件和工具栏

**Files:**
- Create: `src/components/preview/resume-preview.tsx`
- Create: `src/components/editor/toolbar.tsx`

- [ ] **Step 1: 创建预览容器 `src/components/preview/resume-preview.tsx`**

A4 比例容器，根据 store 中的 `templateId` 渲染对应模板，传入 `resumeData`。用 CSS transform 缩放适配容器宽度。

```tsx
"use client";

import { useResumeStore } from "@/lib/store";
import { ClassicTemplate } from "@/components/templates/classic";
import { ModernTemplate } from "@/components/templates/modern";
import { MinimalTemplate } from "@/components/templates/minimal";
import { TemplateId } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

const templates: Record<TemplateId, React.ComponentType<{ data: any }>> = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
};

export function ResumePreview() {
  const { resumeData, templateId } = useResumeStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  const Template = templates[templateId];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      const containerWidth = container.clientWidth;
      // A4 width = 210mm ≈ 794px at 96dpi
      const newScale = Math.min(containerWidth / 794, 1);
      setScale(newScale);
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full overflow-auto bg-gray-200 flex items-start justify-center p-4"
    >
      <div
        className="bg-white shadow-lg"
        style={{
          width: "794px",
          minHeight: "1123px",
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        <Template data={resumeData} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建工具栏 `src/components/editor/toolbar.tsx`**

包含：模板切换下拉、导出 PDF 按钮、清空重置按钮。

```tsx
"use client";

import { useResumeStore } from "@/lib/store";
import { TEMPLATE_LIST } from "@/components/templates";
import { TemplateId } from "@/lib/types";

export function Toolbar() {
  const { templateId, setTemplateId, resumeData, resetAll } = useResumeStore();

  const handleExport = async () => {
    const res = await fetch("/api/export-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeData, templateId }),
    });

    if (!res.ok) {
      alert("导出失败，请重试");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b">
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-600">模板：</label>
        <select
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value as TemplateId)}
          className="border rounded px-2 py-1 text-sm"
        >
          {TEMPLATE_LIST.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={resetAll}
          className="px-3 py-1 text-sm text-gray-600 border rounded hover:bg-gray-50"
        >
          清空
        </button>
        <button
          onClick={handleExport}
          className="px-4 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          导出 PDF
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/components/preview/ src/components/editor/toolbar.tsx
git commit -m "feat: add resume preview container and editor toolbar"
```

---

### Task 8: 编辑器页面组装

**Files:**
- Create: `src/app/editor/page.tsx`

- [ ] **Step 1: 创建编辑器页面 `src/app/editor/page.tsx`**

左右分栏布局。读取 URL query 参数 `template` 设置初始模板。首次加载时 hydrate store。

```tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useResumeStore } from "@/lib/store";
import { Toolbar } from "@/components/editor/toolbar";
import { FormPanel } from "@/components/editor/form-panel";
import { ResumePreview } from "@/components/preview/resume-preview";
import { TemplateId } from "@/lib/types";
import { Suspense } from "react";

function EditorContent() {
  const searchParams = useSearchParams();
  const { hydrate, setTemplateId, hydrated } = useResumeStore();

  useEffect(() => {
    hydrate();
    const template = searchParams.get("template") as TemplateId | null;
    if (template) {
      setTemplateId(template);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!hydrated) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Toolbar />
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-[40%] border-r overflow-y-auto bg-white">
          <FormPanel />
        </div>
        <div className="w-full md:w-[60%] overflow-hidden">
          <ResumePreview />
        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense>
      <EditorContent />
    </Suspense>
  );
}
```

- [ ] **Step 2: 验证完整编辑器工作**

```bash
npm run dev
```

1. 访问首页，点击一个模板卡片
2. 跳转到编辑器，左栏表单填写内容
3. 右栏实时预览更新
4. 切换模板下拉，预览切换
5. 刷新页面，数据从 localStorage 恢复

- [ ] **Step 3: Commit**

```bash
git add src/app/editor/
git commit -m "feat: add editor page with split-pane layout and hydration"
```

---

### Task 9: PDF 导出 API

**Files:**
- Create: `src/app/api/export-pdf/route.ts`
- Create: `src/app/resume-print/page.tsx` — 专供 PDF 渲染的打印页面

> **关键设计决策：** 不使用 `renderToString`（Tailwind 类名不会生成样式），而是让 Puppeteer 访问一个真实的 Next.js 页面路由，通过 URL query 传递数据。这样 Tailwind CSS 正常加载，PDF 输出有完整样式。

- [ ] **Step 1: 创建打印用页面 `src/app/resume-print/page.tsx`**

这个页面只用于 PDF 渲染，用户不会直接访问。从 URL searchParams 读取 JSON 编码的简历数据和模板 ID。

```tsx
import { ResumeData, TemplateId } from "@/lib/types";
import { ClassicTemplate } from "@/components/templates/classic";
import { ModernTemplate } from "@/components/templates/modern";
import { MinimalTemplate } from "@/components/templates/minimal";
import { Suspense } from "react";

const templates: Record<TemplateId, React.ComponentType<{ data: ResumeData }>> = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
};

function PrintContent() {
  // Puppeteer 会通过 URL params 传递数据
  // 格式: /resume-print?data=<base64-encoded-json>&template=classic
  const params = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : null;
  const dataB64 = params?.get("data") || "";
  const templateId = (params?.get("template") || "classic") as TemplateId;

  let resumeData: ResumeData;
  try {
    resumeData = JSON.parse(atob(dataB64));
  } catch {
    resumeData = { basics: { name: "", title: "", email: "", phone: "", location: "" }, experience: [], education: [], skills: [], projects: [], languages: [] };
  }

  const Template = templates[templateId];
  return <Template data={resumeData} />;
}

export default function ResumePrintPage() {
  return (
    <Suspense>
      <PrintContent />
    </Suspense>
  );
}
```

- [ ] **Step 2: 创建 PDF 导出 API `src/app/api/export-pdf/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { ResumeData, TemplateId } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { resumeData, templateId } = (await request.json()) as {
      resumeData: ResumeData;
      templateId: TemplateId;
    };

    // Base64 编码简历数据，通过 URL 传递给打印页面
    const dataB64 = Buffer.from(JSON.stringify(resumeData)).toString("base64");
    const printUrl = `http://localhost:3000/resume-print?data=${encodeURIComponent(dataB64)}&template=${templateId}`;

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(printUrl, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });

    await browser.close();

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"',
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json({ error: "PDF 导出失败" }, { status: 500 });
  }
}
```

> **注意：** 此方案要求 Next.js dev server 或 production server 在 localhost:3000 运行。生产环境部署时，需将 `localhost:3000` 改为实际域名或使用内部地址。

- [ ] **Step 3: 测试 PDF 导出**

确保 dev server 在运行（`npm run dev`），在编辑器中填写内容，点击导出 PDF，确认 PDF 文件下载且样式正确。

如果 Puppeteer 安装失败（缺少 Chromium），运行：

```bash
npx puppeteer browsers install chrome
```

- [ ] **Step 4: Commit**

```bash
git add src/app/resume-print/ src/app/api/export-pdf/
git commit -m "feat: add PDF export API using Puppeteer with real page rendering"
```

---

### Task 10: 移动端适配和最终打磨

**Files:**
- Modify: `src/app/editor/page.tsx` — 移动端上下布局 + 预览切换
- Modify: `src/app/globals.css` — 基础样式补充

- [ ] **Step 1: 编辑器移动端适配**

修改 `src/app/editor/page.tsx`，添加移动端逻辑：

```tsx
// 在 EditorContent 中添加：
const [showPreview, setShowPreview] = useState(false);

// 修改分栏部分：
<div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
  {/* 左栏 - 桌面端显示 / 移动端按切换显示 */}
  <div className={`w-full md:w-[40%] border-r overflow-y-auto bg-white ${showPreview ? "hidden md:block" : ""}`}>
    <FormPanel />
  </div>
  {/* 右栏 - 桌面端显示 / 移动端按切换显示 */}
  <div className={`w-full md:w-[60%] overflow-hidden ${showPreview ? "" : "hidden md:block"}`}>
    <ResumePreview />
  </div>
  {/* 移动端切换按钮 - 固定在底部 */}
  <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t p-2 flex gap-2">
    <button
      onClick={() => setShowPreview(false)}
      className={`flex-1 py-2 text-sm rounded ${!showPreview ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
    >
      编辑
    </button>
    <button
      onClick={() => setShowPreview(true)}
      className={`flex-1 py-2 text-sm rounded ${showPreview ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
    >
      预览
    </button>
    <button
      onClick={handleExport}
      className="px-4 py-2 text-sm text-white bg-blue-600 rounded"
    >
      导出
    </button>
  </div>
</div>
```

注意：需要将 `handleExport` 从 Toolbar 提取到 EditorContent 层级，或通过 props 传递。

- [ ] **Step 2: 首页移动端适配**

确认模板卡片在移动端单列显示（`grid-cols-1`）。已有 `md:grid-cols-3` 处理。

- [ ] **Step 3: 添加 .gitignore 条目**

确保 `.superpowers/` 在 `.gitignore` 中。

- [ ] **Step 4: 全流程冒烟测试**

```bash
npm run dev
```

测试：
1. 首页 3 个模板卡片正常显示
2. 点击进入编辑器，URL 带模板参数
3. 填写基本信息，预览实时更新
4. 添加工作经历/教育条目
5. 切换模板
6. 刷新页面，数据恢复
7. 导出 PDF
8. 移动端视口下布局切换正常

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: mobile responsive layout and final polish"
```

- [ ] **Step 6: 构建验证**

```bash
npm run build
```

确认无错误无警告。

---

## Task Dependency Order

Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6 → Task 7 → Task 8 → Task 9 → Task 10

每一步依赖前一步的文件和类型定义。Task 3 和 Task 4 可以并行，但 Task 4 的 index.ts 依赖 Task 3 先创建。

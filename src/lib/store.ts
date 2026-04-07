import { create } from "zustand";
import { ResumeData, TemplateId, SkillItem } from "./types";

const STORAGE_KEY = "resume-builder-data-v2";
const TEMPLATE_KEY = "resume-builder-template-v2";

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

function migrateData(raw: ResumeData): ResumeData {
  // Migrate skills from string[] to SkillItem[]
  if (raw.skills.length > 0 && typeof raw.skills[0] === "string") {
    raw.skills = (raw.skills as unknown as string[]).map((s) => ({
      name: s,
      level: 80,
    })) as SkillItem[];
  }
  return raw;
}

function loadFromStorage(): { data: ResumeData; templateId: TemplateId } {
  if (typeof window === "undefined") {
    return { data: defaultResumeData, templateId: "modern" };
  }
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const savedTemplate = localStorage.getItem(TEMPLATE_KEY);
    const data = savedData ? migrateData(JSON.parse(savedData)) : defaultResumeData;
    // Migrate removed templates to default
    const validTemplates: TemplateId[] = ["modern", "geek"];
    const tid = validTemplates.includes(savedTemplate as TemplateId)
      ? (savedTemplate as TemplateId)
      : "modern";
    return { data, templateId: tid };
  } catch {
    return { data: defaultResumeData, templateId: "modern" };
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
  loadDemo: () => void;
}

export const useResumeStore = create<ResumeStore>((set, get) => ({
  resumeData: defaultResumeData,
  templateId: "modern",
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
    set({ resumeData: defaultResumeData, templateId: "modern" });
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TEMPLATE_KEY);
    }
  },

  hydrate: () => {
    const { data, templateId } = loadFromStorage();
    set({ resumeData: data, templateId, hydrated: true });
  },

  loadDemo: () => {
    const demo: ResumeData = {
      basics: {
        name: "张明",
        title: "高级前端工程师",
        email: "zhangming@email.com",
        phone: "138-0000-0000",
        location: "北京",
        website: "https://zhangming.dev",
        summary: "8 年前端开发经验，专注于 React 生态和工程化体系建设。带领团队完成多次大型项目交付，擅长性能优化与架构设计。",
      },
      experience: [
        {
          company: "字节跳动",
          position: "高级前端工程师",
          startDate: "2021-03",
          endDate: null,
          description: "负责抖音电商核心链路前端架构设计\n主导微前端方案落地，覆盖 20+ 子应用\n推动 TypeScript 全量迁移，代码缺陷率下降 40%",
        },
        {
          company: "美团",
          position: "前端工程师",
          startDate: "2018-07",
          endDate: "2021-02",
          description: "负责外卖商家端 B 端系统开发\n设计并实现组件库，提升团队开发效率 30%\n优化首屏加载性能，FCP 从 3.2s 降至 1.1s",
        },
      ],
      education: [
        {
          school: "北京邮电大学",
          degree: "本科",
          major: "计算机科学与技术",
          startDate: "2014-09",
          endDate: "2018-06",
        },
      ],
      skills: [
        { name: "React", level: 95 },
        { name: "TypeScript", level: 90 },
        { name: "Next.js", level: 85 },
        { name: "Node.js", level: 80 },
        { name: "Webpack", level: 88 },
        { name: "Tailwind CSS", level: 85 },
        { name: "GraphQL", level: 75 },
        { name: "Docker", level: 70 },
      ],
      radar: [
        { label: "前端框架", value: 90 },
        { label: "跨端开发", value: 70 },
        { label: "全流程闭环", value: 85 },
        { label: "Node.js拓展", value: 75 },
        { label: "AI辅助研发", value: 80 },
        { label: "硬件通信", value: 50 },
      ],
      projects: [
        {
          name: "企业级低代码平台",
          description: "面向内部运营的页面搭建平台，支持可视化拖拽与多端发布",
          url: "https://lowcode.example.com",
        },
        {
          name: "前端性能监控系统",
          description: "基于 Web Vitals 的实时监控平台，接入 50+ 业务线",
        },
      ],
      languages: ["中文（母语）", "英语（流利）"],
    };
    set({ resumeData: demo });
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
    }
  },
}));

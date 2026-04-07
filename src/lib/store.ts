import { create } from "zustand";
import { ResumeData, TemplateId } from "./types";

const STORAGE_KEY = "resume-builder-data";
const TEMPLATE_KEY = "resume-builder-template";

const defaultResumeData: ResumeData = {
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
      description: "负责抖音电商核心链路前端架构设计\n主导微前端方案落地，覆盖 20+ 子应用\n推动 TypeScript 全量迁移，代码缺陷率下降 40%\n搭建前端监控体系，页面性能 P99 < 1.2s",
    },
    {
      company: "美团",
      position: "前端工程师",
      startDate: "2018-07",
      endDate: "2021-02",
      description: "负责外卖商家端 B 端系统开发\n设计并实现基于 React 的组件库，提升团队开发效率 30%\n优化首屏加载性能，FCP 从 3.2s 降至 1.1s",
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
  skills: ["React", "TypeScript", "Next.js", "Node.js", "Webpack", "Tailwind CSS", "GraphQL", "Docker"],
  projects: [
    {
      name: "企业级低代码平台",
      description: "面向内部运营团队的页面搭建平台，支持可视化拖拽、逻辑编排和多端发布，日均创建页面 500+",
      url: "https://lowcode.example.com",
    },
    {
      name: "前端性能监控系统",
      description: "基于 Web Vitals 的实时性能监控平台，接入 50+ 业务线，自动告警与性能报告生成",
    },
  ],
  languages: ["中文（母语）", "英语（流利）"],
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

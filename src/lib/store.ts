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

export interface SkillItem {
  name: string;
  level: number; // 0-100
}

export interface RadarDimension {
  label: string;
  value: number; // 0-100
}

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
  skills: SkillItem[];
  projects: {
    name: string;
    description: string;
    url?: string;
  }[];
  languages: string[];
  radar?: RadarDimension[];
}

export type TemplateId = "modern" | "geek";

export interface TemplateProps {
  data: ResumeData;
}

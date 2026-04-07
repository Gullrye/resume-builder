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

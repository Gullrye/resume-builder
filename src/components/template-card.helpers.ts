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
  skills: [
    { name: "React", level: 95 },
    { name: "TypeScript", level: 90 },
    { name: "Node.js", level: 80 },
  ],
  projects: [{ name: "内部工具平台", description: "企业级低代码平台" }],
  languages: ["中文（母语）", "英语（流利）"],
};

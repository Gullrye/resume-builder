"use client";
import { BasicsForm } from "./basics-form";
import { ExperienceForm } from "./experience-form";
import { EducationForm } from "./education-form";
import { SkillsForm } from "./skills-form";
import { ProjectsForm } from "./projects-form";
import { RadarForm } from "./radar-form";

const sections = [
  { title: "基本信息", Component: BasicsForm, defaultOpen: true },
  { title: "工作经历", Component: ExperienceForm, defaultOpen: true },
  { title: "教育背景", Component: EducationForm, defaultOpen: false },
  { title: "技能", Component: SkillsForm, defaultOpen: false },
  { title: "能力维度", Component: RadarForm, defaultOpen: false },
  { title: "项目经历", Component: ProjectsForm, defaultOpen: false },
];

export function FormPanel() {
  return (
    <div className="h-full overflow-y-auto p-5 space-y-1">
      {sections.map(({ title, Component, defaultOpen }) => (
        <details
          key={title}
          open={defaultOpen}
          className="group rounded-xl overflow-hidden"
        >
          <summary className="flex items-center font-semibold text-sm text-ink px-3 py-2.5 rounded-lg hover:bg-paper-dark transition-colors">
            {title}
          </summary>
          <div className="px-3 pb-3">
            <Component />
          </div>
        </details>
      ))}
    </div>
  );
}

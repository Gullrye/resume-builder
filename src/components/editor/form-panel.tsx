"use client";
import { BasicsForm } from "./basics-form";
import { ExperienceForm } from "./experience-form";
import { EducationForm } from "./education-form";
import { SkillsForm } from "./skills-form";
import { ProjectsForm } from "./projects-form";

export function FormPanel() {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-2">
      <details open><summary className="font-semibold text-gray-700 cursor-pointer py-2">基本信息</summary><BasicsForm /></details>
      <details open><summary className="font-semibold text-gray-700 cursor-pointer py-2">工作经历</summary><ExperienceForm /></details>
      <details><summary className="font-semibold text-gray-700 cursor-pointer py-2">教育背景</summary><EducationForm /></details>
      <details><summary className="font-semibold text-gray-700 cursor-pointer py-2">技能</summary><SkillsForm /></details>
      <details><summary className="font-semibold text-gray-700 cursor-pointer py-2">项目经历</summary><ProjectsForm /></details>
    </div>
  );
}

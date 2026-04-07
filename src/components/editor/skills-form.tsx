"use client";
import { useState } from "react";
import { useResumeStore } from "@/lib/store";

export function SkillsForm() {
  const { resumeData, setResumeData } = useResumeStore();
  const { skills } = resumeData;
  const [input, setInput] = useState("");
  const add = () => { const t = input.trim(); if (t && !skills.includes(t)) { setResumeData({ ...resumeData, skills: [...skills, t] }); setInput(""); } };
  const remove = (i: number) => setResumeData({ ...resumeData, skills: skills.filter((_, j) => j !== i) });
  return (
    <div className="space-y-3 py-2">
      <div className="flex gap-2">
        <input className="border rounded px-3 py-1.5 text-sm flex-1" placeholder="输入技能后按回车或点击添加" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <button onClick={add} className="px-3 py-1.5 text-sm bg-gray-100 rounded hover:bg-gray-200">添加</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent-light text-accent text-sm rounded-lg">
            {skill}
            <button onClick={() => remove(i)} className="text-accent/50 hover:text-red-500 transition-colors">✕</button>
          </span>
        ))}
      </div>
    </div>
  );
}

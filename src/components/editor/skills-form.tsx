"use client";
import { useState } from "react";
import { useResumeStore } from "@/lib/store";

export function SkillsForm() {
  const { resumeData, setResumeData } = useResumeStore();
  const { skills } = resumeData;
  const [input, setInput] = useState("");
  const add = () => {
    const t = input.trim();
    if (t && !skills.some((s) => s.name === t)) {
      setResumeData({ ...resumeData, skills: [...skills, { name: t, level: 80 }] });
      setInput("");
    }
  };
  const remove = (i: number) => setResumeData({ ...resumeData, skills: skills.filter((_, j) => j !== i) });
  const updateLevel = (i: number, level: number) => {
    const u = [...skills];
    u[i] = { ...u[i], level };
    setResumeData({ ...resumeData, skills: u });
  };
  return (
    <div className="space-y-3 py-2">
      <div className="flex gap-2">
        <input
          className="border rounded px-3 py-1.5 text-sm flex-1"
          placeholder="输入技能后按回车或点击添加"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        />
        <button onClick={add} className="px-3 py-1.5 text-sm bg-gray-100 rounded hover:bg-gray-200">添加</button>
      </div>
      <div className="space-y-2">
        {skills.map((skill, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent-light text-accent text-sm rounded-lg min-w-0">
              <span className="truncate">{skill.name}</span>
              <button onClick={() => remove(i)} className="text-accent/50 hover:text-red-500 transition-colors shrink-0">✕</button>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={skill.level}
              onChange={(e) => updateLevel(i, Number(e.target.value))}
              className="flex-1 h-1.5 accent-accent cursor-pointer"
            />
            <span className="text-xs text-ink-light w-8 text-right">{skill.level}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

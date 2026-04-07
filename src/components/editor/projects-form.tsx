"use client";
import { useResumeStore } from "@/lib/store";

export function ProjectsForm() {
  const { resumeData, setResumeData } = useResumeStore();
  const { projects } = resumeData;
  const add = () => setResumeData({ ...resumeData, projects: [...projects, { name: "", description: "", url: "" }] });
  const remove = (i: number) => setResumeData({ ...resumeData, projects: projects.filter((_, j) => j !== i) });
  const update = (i: number, field: string, value: string) => { const u = [...projects]; u[i] = { ...u[i], [field]: value }; setResumeData({ ...resumeData, projects: u }); };
  return (
    <div className="space-y-4 py-2">
      {projects.map((proj, i) => (
        <div key={i} className="border rounded p-3 pr-8 space-y-2 relative">
          <button onClick={() => remove(i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-sm">✕</button>
          <input className="border rounded px-2 py-1 text-sm w-full" placeholder="项目名称" value={proj.name} onChange={(e) => update(i, "name", e.target.value)} />
          <textarea className="border rounded px-2 py-1 text-sm w-full" placeholder="项目描述" rows={2} value={proj.description} onChange={(e) => update(i, "description", e.target.value)} />
          <input className="border rounded px-2 py-1 text-sm w-full" placeholder="链接 (可选)" value={proj.url || ""} onChange={(e) => update(i, "url", e.target.value)} />
        </div>
      ))}
      <button onClick={add} className="w-full border border-dashed rounded py-2 text-sm text-gray-500 hover:text-blue-600 hover:border-blue-400">+ 添加项目经历</button>
    </div>
  );
}

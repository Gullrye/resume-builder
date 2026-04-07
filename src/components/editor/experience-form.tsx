"use client";
import { useResumeStore } from "@/lib/store";

export function ExperienceForm() {
  const { resumeData, setResumeData } = useResumeStore();
  const { experience } = resumeData;
  const add = () => setResumeData({ ...resumeData, experience: [...experience, { company: "", position: "", startDate: "", endDate: null, description: "" }] });
  const remove = (i: number) => setResumeData({ ...resumeData, experience: experience.filter((_, j) => j !== i) });
  const update = (i: number, field: string, value: string | null) => { const u = [...experience]; u[i] = { ...u[i], [field]: value }; setResumeData({ ...resumeData, experience: u }); };
  return (
    <div className="space-y-4 py-2">
      {experience.map((exp, i) => (
        <div key={i} className="border rounded p-3 space-y-2 relative">
          <button onClick={() => remove(i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-sm">✕</button>
          <div className="grid grid-cols-2 gap-2">
            <input className="border rounded px-2 py-1 text-sm w-full" placeholder="公司名" value={exp.company} onChange={(e) => update(i, "company", e.target.value)} />
            <input className="border rounded px-2 py-1 text-sm w-full" placeholder="职位" value={exp.position} onChange={(e) => update(i, "position", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input className="border rounded px-2 py-1 text-sm w-full" placeholder="开始日期 (YYYY-MM)" value={exp.startDate} onChange={(e) => update(i, "startDate", e.target.value)} />
            <div className="flex items-center gap-2">
              <input className="border rounded px-2 py-1 text-sm flex-1" placeholder="结束日期" value={exp.endDate || ""} disabled={exp.endDate === null} onChange={(e) => update(i, "endDate", e.target.value)} />
              <label className="text-xs whitespace-nowrap"><input type="checkbox" className="mr-1" checked={exp.endDate === null} onChange={(e) => update(i, "endDate", e.target.checked ? null : "")} />至今</label>
            </div>
          </div>
          <textarea className="border rounded px-2 py-1 text-sm w-full" placeholder="工作描述 (每行一条)" rows={3} value={exp.description} onChange={(e) => update(i, "description", e.target.value)} />
        </div>
      ))}
      <button onClick={add} className="w-full border border-dashed rounded py-2 text-sm text-gray-500 hover:text-blue-600 hover:border-blue-400">+ 添加工作经历</button>
    </div>
  );
}

"use client";
import { useResumeStore } from "@/lib/store";

export function EducationForm() {
  const { resumeData, setResumeData } = useResumeStore();
  const { education } = resumeData;
  const add = () => setResumeData({ ...resumeData, education: [...education, { school: "", degree: "", major: "", startDate: "", endDate: "" }] });
  const remove = (i: number) => setResumeData({ ...resumeData, education: education.filter((_, j) => j !== i) });
  const update = (i: number, field: string, value: string) => { const u = [...education]; u[i] = { ...u[i], [field]: value }; setResumeData({ ...resumeData, education: u }); };
  return (
    <div className="space-y-4 py-2">
      {education.map((edu, i) => (
        <div key={i} className="border rounded p-3 space-y-2 relative">
          <button onClick={() => remove(i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-sm">✕</button>
          <input className="border rounded px-2 py-1 text-sm w-full" placeholder="学校" value={edu.school} onChange={(e) => update(i, "school", e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <input className="border rounded px-2 py-1 text-sm w-full" placeholder="学位 (本科/硕士/博士)" value={edu.degree} onChange={(e) => update(i, "degree", e.target.value)} />
            <input className="border rounded px-2 py-1 text-sm w-full" placeholder="专业" value={edu.major} onChange={(e) => update(i, "major", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input className="border rounded px-2 py-1 text-sm w-full" placeholder="开始日期 (YYYY-MM)" value={edu.startDate} onChange={(e) => update(i, "startDate", e.target.value)} />
            <input className="border rounded px-2 py-1 text-sm w-full" placeholder="结束日期 (YYYY-MM)" value={edu.endDate} onChange={(e) => update(i, "endDate", e.target.value)} />
          </div>
        </div>
      ))}
      <button onClick={add} className="w-full border border-dashed rounded py-2 text-sm text-gray-500 hover:text-blue-600 hover:border-blue-400">+ 添加教育背景</button>
    </div>
  );
}

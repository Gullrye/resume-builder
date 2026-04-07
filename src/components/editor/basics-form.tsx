"use client";
import { useResumeStore } from "@/lib/store";

export function BasicsForm() {
  const { resumeData, updateBasics } = useResumeStore();
  const { basics } = resumeData;
  return (
    <div className="space-y-3 py-2">
      <div className="grid grid-cols-2 gap-3">
        <input className="border rounded px-3 py-1.5 text-sm w-full" placeholder="姓名" value={basics.name} onChange={(e) => updateBasics({ name: e.target.value })} />
        <input className="border rounded px-3 py-1.5 text-sm w-full" placeholder="职位" value={basics.title} onChange={(e) => updateBasics({ title: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input className="border rounded px-3 py-1.5 text-sm w-full" placeholder="邮箱" type="email" value={basics.email} onChange={(e) => updateBasics({ email: e.target.value })} />
        <input className="border rounded px-3 py-1.5 text-sm w-full" placeholder="电话" value={basics.phone} onChange={(e) => updateBasics({ phone: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input className="border rounded px-3 py-1.5 text-sm w-full" placeholder="城市" value={basics.location} onChange={(e) => updateBasics({ location: e.target.value })} />
        <input className="border rounded px-3 py-1.5 text-sm w-full" placeholder="网站 (可选)" value={basics.website || ""} onChange={(e) => updateBasics({ website: e.target.value })} />
      </div>
      <textarea className="border rounded px-3 py-1.5 text-sm w-full" placeholder="个人简介 (可选)" rows={3} value={basics.summary || ""} onChange={(e) => updateBasics({ summary: e.target.value })} />
    </div>
  );
}

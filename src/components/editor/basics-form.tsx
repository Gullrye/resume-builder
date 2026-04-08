"use client";
import { useResumeStore } from "@/lib/store";

export function BasicsForm() {
  const { resumeData, updateBasics, updateLanguages } = useResumeStore();
  const { basics, languages } = resumeData;

  const addEntry = () => {
    updateLanguages([...languages, { label: "", value: "" }]);
  };

  const updateEntry = (index: number, field: "label" | "value", val: string) => {
    const updated = languages.map((l, i) =>
      i === index ? { ...l, [field]: val } : l
    );
    updateLanguages(updated);
  };

  const removeEntry = (index: number) => {
    updateLanguages(languages.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3 py-2">
      <div className="grid grid-cols-2 gap-3">
        <input className="border rounded px-3 py-1.5 text-sm w-full min-w-0" placeholder="姓名" value={basics.name} onChange={(e) => updateBasics({ name: e.target.value })} />
        <input className="border rounded px-3 py-1.5 text-sm w-full min-w-0" placeholder="职位" value={basics.title} onChange={(e) => updateBasics({ title: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input className="border rounded px-3 py-1.5 text-sm w-full min-w-0" placeholder="邮箱" type="email" value={basics.email} onChange={(e) => updateBasics({ email: e.target.value })} />
        <input className="border rounded px-3 py-1.5 text-sm w-full min-w-0" placeholder="电话" value={basics.phone} onChange={(e) => updateBasics({ phone: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input className="border rounded px-3 py-1.5 text-sm w-full min-w-0" placeholder="城市" value={basics.location} onChange={(e) => updateBasics({ location: e.target.value })} />
        <input className="border rounded px-3 py-1.5 text-sm w-full min-w-0" placeholder="网站 (可选)" value={basics.website || ""} onChange={(e) => updateBasics({ website: e.target.value })} />
      </div>
      {/* Custom labeled fields */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted">自定义标签项</span>
          <button
            type="button"
            onClick={addEntry}
            className="text-xs text-accent hover:text-accent-hover"
          >
            + 添加
          </button>
        </div>
        <div className="space-y-1.5">
          {languages.map((entry, i) => (
            <div key={i} className="flex gap-2 items-center min-w-0">
              <input
                className="border rounded px-2.5 py-1 text-sm w-[90px] shrink-0"
                placeholder="标签名"
                value={entry.label}
                onChange={(e) => updateEntry(i, "label", e.target.value)}
              />
              <input
                className="border rounded px-2.5 py-1 text-sm flex-1 min-w-0"
                placeholder="内容"
                value={entry.value}
                onChange={(e) => updateEntry(i, "value", e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeEntry(i)}
                className="text-muted hover:text-red-500 text-sm shrink-0"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        {languages.length === 0 && (
          <p className="text-xs text-muted py-1">如：语言能力 / 驾照 / 兴趣爱好等</p>
        )}
      </div>
      <textarea className="border rounded px-3 py-1.5 text-sm w-full min-w-0 box-border" placeholder="个人简介 (可选)" rows={3} value={basics.summary || ""} onChange={(e) => updateBasics({ summary: e.target.value })} />
    </div>
  );
}

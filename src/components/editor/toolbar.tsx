"use client";

import { useResumeStore } from "@/lib/store";
import { TEMPLATE_LIST } from "@/components/templates";
import { TemplateId } from "@/lib/types";

export function Toolbar({ onExport }: { onExport?: () => void }) {
  const { templateId, setTemplateId, resumeData, resetAll } = useResumeStore();

  const handleExport = async () => {
    const res = await fetch("/api/export-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeData, templateId }),
    });

    if (!res.ok) {
      alert("导出失败，请重试");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b">
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-600">模板：</label>
        <select
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value as TemplateId)}
          className="border rounded px-2 py-1 text-sm"
        >
          {TEMPLATE_LIST.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={resetAll}
          className="px-3 py-1 text-sm text-gray-600 border rounded hover:bg-gray-50"
        >
          清空
        </button>
        <button
          onClick={onExport ?? handleExport}
          className="px-4 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          导出 PDF
        </button>
      </div>
    </div>
  );
}

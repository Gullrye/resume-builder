"use client";

import { useResumeStore } from "@/lib/store";
import { TEMPLATE_LIST } from "@/components/templates";
import { TemplateId } from "@/lib/types";

export function Toolbar({ onExport }: { onExport?: () => void }) {
  const { templateId, setTemplateId, resumeData, resetAll, loadDemo } = useResumeStore();

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
    <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-border">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-ink-light">模板</label>
        <select
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value as TemplateId)}
          className="border border-border rounded-lg px-3 py-1.5 text-sm bg-paper text-ink cursor-pointer"
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
          onClick={loadDemo}
          className="px-3 py-1.5 text-sm text-accent border border-accent/20 rounded-lg hover:bg-accent-light transition-colors"
        >
          填充示例
        </button>
        <button
          onClick={resetAll}
          className="px-3 py-1.5 text-sm text-ink-light border border-border rounded-lg hover:bg-paper-dark transition-colors"
        >
          清空
        </button>
        <button
          onClick={onExport ?? handleExport}
          className="px-5 py-1.5 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-hover transition-colors"
        >
          导出 PDF
        </button>
      </div>
    </div>
  );
}

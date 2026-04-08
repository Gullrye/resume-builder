"use client";

import Link from "next/link";
import { useResumeStore } from "@/lib/store";
import { TEMPLATE_LIST } from "@/components/templates";
import { TemplateId } from "@/lib/types";

export function Toolbar({ onExport, isExporting }: { onExport?: () => void; isExporting?: boolean }) {
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
    <div className="flex items-center justify-between px-3 md:px-5 py-2.5 md:py-3 bg-white border-b border-border">
      <div className="flex items-center gap-2 md:gap-3">
        <Link
          href="/"
          className="text-sm font-semibold text-ink hover:text-accent transition-colors"
        >
          ← <span className="hidden sm:inline">首页</span>
        </Link>
        <span className="text-border hidden md:inline">|</span>
        <label className="text-sm font-medium text-ink-light hidden md:inline">模板</label>
        <select
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value as TemplateId)}
          className="border border-border rounded-lg px-2 md:px-3 py-1.5 text-sm bg-paper text-ink cursor-pointer"
        >
          {TEMPLATE_LIST.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1.5 md:gap-2">
        <button
          onClick={loadDemo}
          className="hidden md:inline-flex px-3 py-1.5 text-sm text-accent border border-accent/20 rounded-lg hover:bg-accent-light transition-colors"
        >
          填充示例
        </button>
        <button
          onClick={resetAll}
          className="hidden md:inline-flex px-3 py-1.5 text-sm text-ink-light border border-border rounded-lg hover:bg-paper-dark transition-colors"
        >
          清空
        </button>
        <button
          onClick={onExport ?? handleExport}
          disabled={isExporting}
          className="hidden md:inline-flex px-5 py-1.5 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed items-center gap-1.5"
        >
          {isExporting && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {isExporting ? "导出中..." : "导出 PDF"}
        </button>
      </div>
    </div>
  );
}

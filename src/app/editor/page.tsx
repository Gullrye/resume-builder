"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useResumeStore } from "@/lib/store";
import { Toolbar } from "@/components/editor/toolbar";
import { FormPanel } from "@/components/editor/form-panel";
import { ResumePreview } from "@/components/preview/resume-preview";
import { TemplateId } from "@/lib/types";
import { Suspense } from "react";

function EditorContent() {
  const searchParams = useSearchParams();
  const { hydrate, setTemplateId, hydrated, resumeData, templateId } = useResumeStore();
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    hydrate();
    const template = searchParams.get("template") as TemplateId | null;
    if (template) {
      setTemplateId(template);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync URL when template changes
  useEffect(() => {
    if (!hydrated) return;
    const url = new URL(window.location.href);
    const current = url.searchParams.get("template");
    if (current !== templateId) {
      url.searchParams.set("template", templateId);
      window.history.replaceState(null, "", url.toString());
    }
  }, [templateId, hydrated]);

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

  if (!hydrated) {
    return (
      <div className="h-screen flex items-center justify-center bg-paper">
        <div className="text-center animate-fade-in">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-paper">
      <Toolbar onExport={handleExport} />
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Form panel */}
        <div className={`flex-1 md:flex-none w-full md:w-[40%] bg-white border-r border-border overflow-y-auto overflow-x-hidden pb-20 md:pb-0 min-w-0 ${showPreview ? "hidden md:block" : ""}`}>
          <FormPanel />
        </div>
        {/* Preview panel */}
        <div className={`flex-1 md:flex-none w-full md:w-[60%] overflow-hidden pb-20 md:pb-0 ${showPreview ? "" : "hidden md:block"}`}>
          <ResumePreview />
        </div>
        {/* Mobile bottom bar */}
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/80 backdrop-blur-lg border-t border-border p-3 flex gap-2" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
          <button
            onClick={() => setShowPreview(false)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors ${!showPreview ? "bg-accent text-white" : "bg-paper text-ink-light"}`}
          >
            编辑
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors ${showPreview ? "bg-accent text-white" : "bg-paper text-ink-light"}`}
          >
            预览
          </button>
          <button
            onClick={handleExport}
            className="px-5 py-2.5 text-sm font-medium text-white bg-accent rounded-xl hover:bg-accent-hover transition-colors"
          >
            导出
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense>
      <EditorContent />
    </Suspense>
  );
}

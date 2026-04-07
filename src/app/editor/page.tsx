"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Toolbar onExport={handleExport} />
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className={`w-full md:w-[40%] border-r overflow-y-auto bg-white ${showPreview ? "hidden md:block" : ""}`}>
          <FormPanel />
        </div>
        <div className={`w-full md:w-[60%] overflow-hidden ${showPreview ? "" : "hidden md:block"}`}>
          <ResumePreview />
        </div>
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t p-2 flex gap-2">
          <button
            onClick={() => setShowPreview(false)}
            className={`flex-1 py-2 text-sm rounded ${!showPreview ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
          >
            编辑
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className={`flex-1 py-2 text-sm rounded ${showPreview ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
          >
            预览
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded"
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

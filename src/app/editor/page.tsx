"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useResumeStore } from "@/lib/store";
import { Toolbar } from "@/components/editor/toolbar";
import { FormPanel } from "@/components/editor/form-panel";
import { ResumePreview } from "@/components/preview/resume-preview";
import { TemplateId } from "@/lib/types";
import { Suspense } from "react";

function EditorContent() {
  const searchParams = useSearchParams();
  const { hydrate, setTemplateId, hydrated } = useResumeStore();

  useEffect(() => {
    hydrate();
    const template = searchParams.get("template") as TemplateId | null;
    if (template) {
      setTemplateId(template);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!hydrated) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Toolbar />
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-[40%] border-r overflow-y-auto bg-white">
          <FormPanel />
        </div>
        <div className="w-full md:w-[60%] overflow-hidden">
          <ResumePreview />
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

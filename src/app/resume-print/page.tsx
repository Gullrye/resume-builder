"use client";

import { useSearchParams } from "next/navigation";
import { ResumeData, TemplateId } from "@/lib/types";
import { ModernTemplate } from "@/components/templates/modern";
import { GeekTemplate } from "@/components/templates/geek";
import { Suspense } from "react";

const templates: Record<TemplateId, React.ComponentType<{ data: ResumeData }>> = {
  modern: ModernTemplate,
  geek: GeekTemplate,
};

const emptyData: ResumeData = {
  basics: { name: "", title: "", email: "", phone: "", location: "" },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  languages: [],
};

function PrintContent() {
  const searchParams = useSearchParams();
  const dataB64 = searchParams.get("data") || "";
  const templateId = (searchParams.get("template") || "modern") as TemplateId;

  let resumeData: ResumeData;
  try {
    const bytes = Uint8Array.from(atob(dataB64), (c) => c.charCodeAt(0));
    resumeData = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    resumeData = emptyData;
  }

  const isModern = templateId === "modern";
  const Template = templates[templateId];

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: isModern
            ? `@page { margin: 0; size: A4; }
               html, body { margin: 0; padding: 0; }`
            : `@page { margin: 18px 0; size: A4; }
               @page :first { margin-top: 0; }
               html, body { margin: 0; padding: 0; background: white; }`,
        }}
      />
      {isModern && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            width: "30%",
            background: "#2D3748",
            zIndex: -1,
          }}
        />
      )}
      <Template data={resumeData} />
    </>
  );
}

export default function ResumePrintPage() {
  return (
    <Suspense>
      <PrintContent />
    </Suspense>
  );
}

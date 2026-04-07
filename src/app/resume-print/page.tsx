"use client";

import { useSearchParams } from "next/navigation";
import { ResumeData, TemplateId } from "@/lib/types";
import { ClassicTemplate } from "@/components/templates/classic";
import { ModernTemplate } from "@/components/templates/modern";
import { MinimalTemplate } from "@/components/templates/minimal";
import { Suspense } from "react";

const templates: Record<TemplateId, React.ComponentType<{ data: ResumeData }>> = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
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
  const templateId = (searchParams.get("template") || "classic") as TemplateId;

  let resumeData: ResumeData;
  try {
    resumeData = JSON.parse(atob(dataB64));
  } catch {
    resumeData = emptyData;
  }

  const Template = templates[templateId];
  return <Template data={resumeData} />;
}

export default function ResumePrintPage() {
  return (
    <Suspense>
      <PrintContent />
    </Suspense>
  );
}

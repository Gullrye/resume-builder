"use client";

import { useSearchParams } from "next/navigation";
import { ResumeData, TemplateId } from "@/lib/types";
import { ClassicTemplate } from "@/components/templates/classic";
import { ModernTemplate } from "@/components/templates/modern";
import { MinimalTemplate } from "@/components/templates/minimal";
import { GeekTemplate } from "@/components/templates/geek";
import { Suspense } from "react";

const templates: Record<TemplateId, React.ComponentType<{ data: ResumeData }>> = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
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
  const templateId = (searchParams.get("template") || "classic") as TemplateId;

  let resumeData: ResumeData;
  try {
    const bytes = Uint8Array.from(atob(dataB64), (c) => c.charCodeAt(0));
    resumeData = JSON.parse(new TextDecoder().decode(bytes));
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

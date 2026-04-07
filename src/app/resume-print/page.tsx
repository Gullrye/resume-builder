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

function PrintContent() {
  const params = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : null;
  const dataB64 = params?.get("data") || "";
  const templateId = (params?.get("template") || "classic") as TemplateId;

  let resumeData: ResumeData;
  try {
    resumeData = JSON.parse(atob(dataB64));
  } catch {
    resumeData = { basics: { name: "", title: "", email: "", phone: "", location: "" }, experience: [], education: [], skills: [], projects: [], languages: [] };
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

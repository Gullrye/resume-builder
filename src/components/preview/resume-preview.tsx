"use client";

import { useResumeStore } from "@/lib/store";
import { ClassicTemplate } from "@/components/templates/classic";
import { ModernTemplate } from "@/components/templates/modern";
import { MinimalTemplate } from "@/components/templates/minimal";
import { TemplateId } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

const templates: Record<TemplateId, React.ComponentType<{ data: any }>> = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
};

export function ResumePreview() {
  const { resumeData, templateId } = useResumeStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  const Template = templates[templateId];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      const containerWidth = container.clientWidth;
      const newScale = Math.min(containerWidth / 794, 1);
      setScale(newScale);
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full overflow-auto bg-gray-200 flex items-start justify-center p-4"
    >
      <div
        className="bg-white shadow-lg"
        style={{
          width: "794px",
          minHeight: "1123px",
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        <Template data={resumeData} />
      </div>
    </div>
  );
}

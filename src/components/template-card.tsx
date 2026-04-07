"use client";

import Link from "next/link";
import { TemplateId } from "@/lib/types";
import { ClassicTemplate } from "./templates/classic";
import { ModernTemplate } from "./templates/modern";
import { MinimalTemplate } from "./templates/minimal";
import { GeekTemplate } from "./templates/geek";
import { sampleResumeData } from "./template-card.helpers";

const templateComponents: Record<
  TemplateId,
  React.ComponentType<{ data: typeof sampleResumeData }>
> = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  geek: GeekTemplate,
};

export function TemplateCard({
  id,
  name,
  description,
}: {
  id: TemplateId;
  name: string;
  description: string;
}) {
  const TemplateComponent = templateComponents[id];

  return (
    <Link
      href={`/editor?template=${id}`}
      className="group block rounded-2xl overflow-hidden bg-white border border-border hover:border-accent/30 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(194,65,12,0.08)] hover:-translate-y-1"
    >
      {/* Thumbnail */}
      <div className="aspect-[210/297] overflow-hidden bg-paper-dark relative">
        <div className="absolute inset-0 p-3">
          <div className="pointer-events-none transform scale-[0.35] origin-top-left w-[285%]">
            <TemplateComponent data={sampleResumeData} />
          </div>
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/5 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="bg-accent text-white text-sm font-medium px-5 py-2 rounded-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            使用此模板
          </span>
        </div>
      </div>
      {/* Info */}
      <div className="p-5 border-t border-border">
        <h3 className="text-lg font-semibold text-ink group-hover:text-accent transition-colors duration-200">
          {name}
        </h3>
        <p className="text-sm text-muted mt-1">{description}</p>
      </div>
    </Link>
  );
}

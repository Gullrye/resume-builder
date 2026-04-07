"use client";

import Link from "next/link";
import { TemplateId } from "@/lib/types";
import { ClassicTemplate } from "./templates/classic";
import { ModernTemplate } from "./templates/modern";
import { MinimalTemplate } from "./templates/minimal";
import { sampleResumeData } from "./template-card.helpers";

const templateComponents: Record<
  TemplateId,
  React.ComponentType<{ data: typeof sampleResumeData }>
> = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
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
      className="group block rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-[210/297] overflow-hidden bg-white p-2">
        <div className="pointer-events-none transform scale-[0.35] origin-top-left w-[285%]">
          <TemplateComponent data={sampleResumeData} />
        </div>
      </div>
      <div className="p-4 bg-white">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
          {name}
        </h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </Link>
  );
}

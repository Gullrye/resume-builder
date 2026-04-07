import { TemplateProps } from "@/lib/types";

export function MinimalTemplate({ data }: TemplateProps) {
  const { basics, experience, education, skills, projects, languages } = data;

  return (
    <div className="font-sans p-10 max-w-[210mm] mx-auto leading-loose">
      {/* Header */}
      <h1 className="text-[20pt] text-center">{basics.name}</h1>
      <p className="text-[10pt] text-center text-gray-500 mt-1">
        {[basics.title, basics.email, basics.phone, basics.location, basics.website]
          .filter(Boolean)
          .join("  ·  ")}
      </p>

      {/* Summary */}
      {basics.summary && (
        <p className="text-[9pt] text-gray-600 mt-8">{basics.summary}</p>
      )}

      {/* Experience */}
      <MinimalSection title="工作经历">
        {experience.map((exp, i) => (
          <div key={i} className="mb-4">
            <div className="flex justify-between items-baseline">
              <span className="text-[10pt] text-gray-800">{exp.company}</span>
              <span className="text-[8pt] text-gray-400">
                {exp.startDate} - {exp.endDate ?? "至今"}
              </span>
            </div>
            <p className="text-[9pt] text-gray-500">{exp.position}</p>
            <ul className="text-[8pt] text-gray-600 list-disc list-inside mt-1">
              {exp.description
                .split("\n")
                .filter(Boolean)
                .map((line, j) => (
                  <li key={j}>{line}</li>
                ))}
            </ul>
          </div>
        ))}
      </MinimalSection>

      {/* Education */}
      <MinimalSection title="教育背景">
        {education.map((edu, i) => (
          <div key={i} className="mb-2">
            <div className="flex justify-between items-baseline">
              <span className="text-[10pt] text-gray-800">
                {edu.school} — {edu.degree} {edu.major}
              </span>
              <span className="text-[8pt] text-gray-400">
                {edu.startDate} - {edu.endDate}
              </span>
            </div>
          </div>
        ))}
      </MinimalSection>

      {/* Skills */}
      {skills.length > 0 && (
        <MinimalSection title="专业技能">
          <p className="text-[9pt] text-gray-600">{skills.join(" · ")}</p>
        </MinimalSection>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <MinimalSection title="项目经历">
          {projects.map((proj, i) => (
            <div key={i} className="mb-2">
              <span className="text-[10pt] text-gray-800">{proj.name}</span>
              {proj.url && (
                <span className="text-[8pt] text-gray-400 ml-2">
                  {proj.url}
                </span>
              )}
              <p className="text-[8pt] text-gray-600 mt-1">
                {proj.description}
              </p>
            </div>
          ))}
        </MinimalSection>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <MinimalSection title="语言能力">
          <p className="text-[9pt] text-gray-600">{languages.join(" · ")}</p>
        </MinimalSection>
      )}
    </div>
  );
}

function MinimalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8">
      <h2 className="text-[9pt] text-gray-400 uppercase tracking-[0.2em] mb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}

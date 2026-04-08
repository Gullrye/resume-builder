import { TemplateProps } from "@/lib/types";

export function ModernTemplate({ data }: TemplateProps) {
  const { basics, experience, education, skills, projects, languages } = data;

  return (
    <div className="font-sans flex max-w-[210mm] mx-auto min-h-[297mm] h-full">
      {/* Left Sidebar */}
      <aside className="w-[30%] bg-[#2D3748] text-white px-8 pt-6 pb-4">
        <h1 className="text-[18pt] font-bold">{basics.name}</h1>
        <p className="text-[10pt] mt-1 opacity-80">{basics.title}</p>

        <div className="mt-6 space-y-1 text-[8pt] opacity-90">
          <p>{basics.email}</p>
          <p>{basics.phone}</p>
          <p>{basics.location}</p>
          {basics.website && <p>{basics.website}</p>}
        </div>

        {/* Skills as tags */}
        {skills.length > 0 && (
          <div className="mt-6">
            <h3 className="text-[9pt] font-bold uppercase tracking-wide mb-2">
              专业技能
            </h3>
            <div className="flex flex-wrap gap-1">
              {skills.map((s, i) => (
                <span
                  key={i}
                  className="text-[7pt] bg-white/20 rounded px-2 py-0.5"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Custom labeled fields */}
        {languages.length > 0 && (
          <div className="mt-6 space-y-3">
            {languages.map((entry, i) => (
              <div key={i}>
                <h3 className="text-[9pt] font-bold uppercase tracking-wide mb-2">
                  {entry.label || "自定义"}
                </h3>
                <p className="text-[7pt] opacity-90">{entry.value}</p>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Right Content */}
      <main className="w-[70%] bg-white px-8 pt-6 pb-4">
        {/* Summary */}
        {basics.summary && (
          <div className="mb-6">
            <p className="text-[9pt] text-gray-700 leading-relaxed">
              {basics.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        <Section title="工作经历">
          {experience.map((exp, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between items-baseline">
                <span className="text-[10pt] font-bold text-[#2D3748]">
                  {exp.company}
                </span>
                <span className="text-[8pt] text-gray-500">
                  {exp.startDate} - {exp.endDate ?? "至今"}
                </span>
              </div>
              <p className="text-[9pt] text-gray-600">{exp.position}</p>
              <ul className="text-[8pt] text-gray-600 list-disc list-inside mt-1">
                {exp.description
                  .split("\n")
                  .map((line, j) =>
                    line.trim() === "" ? (
                      <li key={j} className="h-2" style={{ listStyleType: "none" }} />
                    ) : (
                      <li key={j} style={{ breakInside: "avoid" }}>{line}</li>
                    )
                  )}
              </ul>
            </div>
          ))}
        </Section>

        {/* Education */}
        <Section title="教育背景">
          {education.map((edu, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between items-baseline" style={{ breakInside: "avoid" }}>
                <span className="text-[10pt] font-bold text-[#2D3748]">
                  {edu.school}
                </span>
                <span className="text-[8pt] text-gray-500">
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
              <p className="text-[9pt] text-gray-600">
                {edu.degree} {edu.major}
              </p>
            </div>
          ))}
        </Section>

        {/* Projects */}
        {projects.length > 0 && (
          <Section title="项目经历">
            {projects.map((proj, i) => (
              <div key={i} className="mb-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-[10pt] font-bold text-[#2D3748]">
                    {proj.name}
                  </span>
                  {proj.url && (
                    <span className="text-[8pt] text-gray-400">
                      {proj.url}
                    </span>
                  )}
                </div>
                <p className="text-[8pt] text-gray-600 mt-1">
                  {proj.description}
                </p>
              </div>
            ))}
          </Section>
        )}
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-[11pt] font-bold text-[#2D3748] border-b-2 border-[#2D3748] pb-1 mb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}

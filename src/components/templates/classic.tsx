import { TemplateProps } from "@/lib/types";

export function ClassicTemplate({ data }: TemplateProps) {
  const { basics, experience, education, skills, projects, languages } = data;

  return (
    <div className="font-serif text-black p-10 max-w-[210mm] mx-auto">
      {/* Header */}
      <h1 className="text-[22pt] font-bold text-center">{basics.name}</h1>
      <p className="text-[11pt] text-center mt-1">{basics.title}</p>
      <p className="text-[9pt] text-center mt-2">
        {[basics.email, basics.phone, basics.location, basics.website]
          .filter(Boolean)
          .join(" | ")}
      </p>

      <hr className="border-gray-300 my-4" />

      {/* Experience */}
      <Section title="工作经历">
        {experience.map((exp, i) => (
          <div key={i} className="mb-3" style={{ breakInside: "avoid" }}>
            <div className="flex justify-between items-baseline">
              <span className="text-[10pt] font-bold">{exp.company}</span>
              <span className="text-[8pt] text-gray-600">
                {exp.startDate} - {exp.endDate ?? "至今"}
              </span>
            </div>
            <p className="text-[9pt] italic">{exp.position}</p>
            <ul className="text-[8pt] list-disc list-inside mt-1">
              {exp.description
                .split("\n")
                .filter(Boolean)
                .map((line, j) => (
                  <li key={j}>{line}</li>
                ))}
            </ul>
          </div>
        ))}
      </Section>

      {/* Education */}
      <Section title="教育背景">
        {education.map((edu, i) => (
          <div key={i} className="mb-2" style={{ breakInside: "avoid" }}>
            <div className="flex justify-between items-baseline">
              <span className="text-[10pt] font-bold">
                {edu.school} — {edu.degree} {edu.major}
              </span>
              <span className="text-[8pt] text-gray-600">
                {edu.startDate} - {edu.endDate}
              </span>
            </div>
          </div>
        ))}
      </Section>

      {/* Skills */}
      {skills.length > 0 && (
        <Section title="专业技能">
          <p className="text-[9pt]">{skills.map((s) => s.name).join(" · ")}</p>
        </Section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <Section title="项目经历">
          {projects.map((proj, i) => (
            <div key={i} className="mb-2" style={{ breakInside: "avoid" }}>
              <span className="text-[10pt] font-bold">{proj.name}</span>
              {proj.url && (
                <span className="text-[8pt] text-gray-500 ml-2">
                  {proj.url}
                </span>
              )}
              <p className="text-[8pt] mt-1">{proj.description}</p>
            </div>
          ))}
        </Section>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <Section title="语言能力">
          <p className="text-[9pt]">{languages.join(" · ")}</p>
        </Section>
      )}
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
    <div className="mb-4">
      <h2 className="text-[11pt] font-bold border-b border-gray-300 pb-1 mb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}

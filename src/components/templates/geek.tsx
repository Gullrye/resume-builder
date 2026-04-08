import { TemplateProps, RadarDimension } from "@/lib/types";

const TRAIT_COLORS = [
  { border: "rgba(138,90,180,0.3)", bg: "radial-gradient(ellipse at center, rgba(138,90,180,0.15) 0%, rgba(138,90,180,0.02) 80%)", text: "#5a3c75" },
  { border: "rgba(75,165,110,0.3)", bg: "radial-gradient(ellipse at center, rgba(75,165,110,0.15) 0%, rgba(75,165,110,0.02) 80%)", text: "#2b603d" },
  { border: "rgba(210,80,80,0.3)", bg: "radial-gradient(ellipse at center, rgba(210,80,80,0.15) 0%, rgba(210,80,80,0.02) 80%)", text: "#8c2a2a" },
  { border: "rgba(60,130,190,0.3)", bg: "radial-gradient(ellipse at center, rgba(60,130,190,0.15) 0%, rgba(60,130,190,0.02) 80%)", text: "#245278" },
  { border: "rgba(200,150,50,0.4)", bg: "radial-gradient(ellipse at center, rgba(200,150,50,0.2) 0%, rgba(200,150,50,0.02) 80%)", text: "#7a5c18" },
];

const DEFAULT_RADAR: RadarDimension[] = [
  { label: "前端框架", value: 80 },
  { label: "跨端开发", value: 60 },
  { label: "全流程闭环", value: 70 },
  { label: "Node.js拓展", value: 60 },
  { label: "AI辅助研发", value: 70 },
  { label: "硬件通信", value: 40 },
];

/** Compute radar polygon points from dimension values */
function radarPoints(dims: RadarDimension[], cx: number, cy: number, r: number): string {
  const n = dims.length;
  return dims
    .map((d, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const dist = (d.value / 100) * r;
      const x = cx + dist * Math.cos(angle);
      const y = cy + dist * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function gridPoints(n: number, cx: number, cy: number, r: number): string {
  return Array.from({ length: n }, (_, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`;
  }).join(" ");
}

export function GeekTemplate({ data }: TemplateProps) {
  const { basics, experience, education, skills, projects, languages } = data;
  const radar = data.radar ?? DEFAULT_RADAR;
  const traits = skills.slice(0, 5);
  const barSkills = skills.slice(0, 8);
  const n = radar.length;

  return (
    <div
      className="font-sans max-w-[210mm] mx-auto bg-[#fdfdfd] relative text-[#202124] leading-[1.55] text-[13.5px]"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif', padding: "22px 40px 8px" }}
    >
      {/* Top gradient bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[6px]"
        style={{ background: "linear-gradient(90deg, #3c82be, #4ba56e, #d25050)" }}
      />

      {/* Header */}
      <header className="text-center mb-2 mt-[3px]">
        <h1 className="text-[34px] font-extrabold tracking-[4px] text-[#202124]">
          {basics.name || "姓名"}
        </h1>
        <div className="text-[15px] font-semibold text-[#3c82be] mt-1 tracking-wide">
          {basics.title || "职位"}
        </div>
      </header>

      {/* Profile Summary */}
      {basics.summary && (
        <div
          className="mb-3 rounded-r text-[13px] text-[#3c4043] text-justify"
          style={{
            background: "rgba(60,130,190,0.04)",
            borderLeft: "3px solid rgba(60,130,190,0.8)",
            padding: "10px 15px",
          }}
        >
          {basics.summary}
        </div>
      )}

      {/* Dashboard */}
      <div
        className="bg-white rounded-lg mb-4"
        style={{
          border: "1px solid #e0e0e0",
          padding: "14px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
        }}
      >
        {/* Basic Info — full width */}
        <div className="mb-4">
          <div className="text-[14px] font-bold mb-1.5 text-[#202124] flex items-center">
            <span className="inline-block w-1 h-[14px] bg-[#3c82be] mr-2 rounded-sm" />
            基本信息
          </div>
          <div
            className="grid grid-cols-2 gap-x-[30px] gap-y-[6px] bg-[#f8f9fa] rounded-md border border-[#f1f3f4]"
            style={{ padding: "8px 15px" }}
          >
            {basics.phone && <InfoRow label="联系电话" value={basics.phone} />}
            {basics.email && <InfoRow label="电子邮箱" value={basics.email} small />}
            {basics.location && <InfoRow label="期望城市" value={basics.location} />}
            {basics.title && <InfoRow label="求职意向" value={basics.title} />}
            {languages.length > 0 && <InfoRow label="语言能力" value={languages.join(" / ")} />}
          </div>
        </div>

        {/* Traits + Skills | Radar */}
        <div className="flex gap-[25px]">
          {/* Left: traits + skill bars */}
          <div className="flex-1 flex flex-col gap-3">
            {/* Trait Tags */}
            {traits.length > 0 && (
              <div>
                <div className="text-[14px] font-bold mb-1.5 text-[#202124] flex items-center">
                  <span className="inline-block w-1 h-[14px] bg-[#3c82be] mr-2 rounded-sm" />
                  核心优势标签
                </div>
                <div className="flex flex-wrap gap-2">
                  {traits.map((tag, i) => {
                    const c = TRAIT_COLORS[i % TRAIT_COLORS.length];
                    return (
                      <span
                        key={i}
                        className="text-[12px] font-semibold rounded-md text-center"
                        style={{
                          border: `1px solid ${c.border}`,
                          background: c.bg,
                          color: c.text,
                          padding: "4px 10px",
                        }}
                      >
                        {tag.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Skill Bars */}
            {barSkills.length > 0 && (
              <div>
                <div className="text-[14px] font-bold mb-1.5 text-[#202124] flex items-center">
                  <span className="inline-block w-1 h-[14px] bg-[#3c82be] mr-2 rounded-sm" />
                  核心技术栈熟练度
                </div>
                <div className="grid grid-cols-2 gap-x-[25px] gap-y-2">
                  {barSkills.map((skill) => (
                    <div key={skill.name} className="flex items-center gap-2.5 text-[12.5px]">
                      <span className="w-[95px] font-semibold text-[#5f6368] truncate">{skill.name}</span>
                      <div className="flex-1 h-[6px] bg-[#e8eaed] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${skill.level}%`,
                            background: "rgba(60,130,190,0.8)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Radar Chart */}
          <div className="relative w-[160px] h-[160px] shrink-0 self-center">
            {radar.map((dim, i) => {
              const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
              const labelR = 100;
              const lx = 80 + labelR * Math.cos(angle);
              const ly = 80 + labelR * Math.sin(angle);
              const anchor = Math.abs(angle) < 0.1 || Math.abs(angle - Math.PI * 2) < 0.1 ? "middle"
                : Math.cos(angle) > 0.1 ? "start" : Math.cos(angle) < -0.1 ? "end" : "middle";
              return (
                <span
                  key={i}
                  className="absolute text-[11px] font-semibold text-[#5f6368]"
                  style={{
                    left: `${lx}px`,
                    top: `${ly}px`,
                    transform: "translate(-50%, -50%)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {dim.label}
                </span>
              );
            })}
            <svg width="160" height="160" viewBox="0 0 160 160">
              {/* Grid rings */}
              <polygon points={gridPoints(n, 80, 80, 60)} fill="none" stroke="#e0e0e0" strokeWidth="1" />
              <polygon points={gridPoints(n, 80, 80, 40)} fill="none" stroke="#e0e0e0" strokeWidth="1" />
              <polygon points={gridPoints(n, 80, 80, 20)} fill="none" stroke="#e0e0e0" strokeWidth="1" />
              {/* Axis lines */}
              {radar.map((_, i) => {
                const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
                return (
                  <line
                    key={i}
                    x1={80} y1={80}
                    x2={80 + 60 * Math.cos(angle)}
                    y2={80 + 60 * Math.sin(angle)}
                    stroke="#e0e0e0" strokeWidth="1"
                  />
                );
              })}
              {/* Data polygon */}
              <polygon
                points={radarPoints(radar, 80, 80, 60)}
                fill="rgba(60,130,190,0.2)"
                stroke="#3c82be"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Experience */}
      {experience.length > 0 && (
        <>
          <SectionTitle>工作经历</SectionTitle>
          <div className="border-l-2 border-[#e8eaed] ml-[5px] pl-[18px]">
            {experience.map((exp, i) => (
              <TimelineItem key={i} last={i === experience.length - 1}>
                <div className="flex justify-between items-baseline mb-1" style={{ breakInside: "avoid" }}>
                  <div className="text-[14.5px] font-bold text-[#202124]">
                    {exp.position}
                    <span className="text-[#5f6368] font-semibold ml-2 text-[13.5px]">@ {exp.company}</span>
                  </div>
                  <span className="text-[12.5px] text-[#5f6368]" style={{ fontFamily: "Monaco, Consolas, monospace" }}>
                    {exp.startDate} - {exp.endDate ?? "至今"}
                  </span>
                </div>
                <ul className="list-none">
                  {exp.description.split("\n").filter(Boolean).map((line, j) => (
                    <li key={j} className="relative pl-3 mb-1 text-[#3c4043] text-justify" style={{ breakInside: "avoid" }}>
                      <span className="absolute left-0 text-[rgba(60,130,190,0.8)] font-bold">•</span>
                      {line}
                    </li>
                  ))}
                </ul>
              </TimelineItem>
            ))}
          </div>
        </>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <>
          <SectionTitle className="mt-4">项目经历</SectionTitle>
          <div className="border-l-2 border-[#e8eaed] ml-[5px] pl-[18px]">
            {projects.map((proj, i) => (
              <TimelineItem key={i} last={i === projects.length - 1}>
                <div className="flex justify-between items-baseline mb-1" style={{ breakInside: "avoid" }}>
                  <div className="text-[14.5px] font-bold text-[#202124]">
                    {proj.name}
                    {proj.url && (
                      <span className="text-[12px] text-[#5f6368] font-normal ml-2">{proj.url}</span>
                    )}
                  </div>
                </div>
                {proj.description && (
                  <ul className="list-none">
                    <li className="relative pl-3 text-[#3c4043] text-justify" style={{ breakInside: "avoid" }}>
                      <span className="absolute left-0 text-[rgba(60,130,190,0.8)] font-bold">•</span>
                      {proj.description}
                    </li>
                  </ul>
                )}
              </TimelineItem>
            ))}
          </div>
        </>
      )}

      {/* Education */}
      {education.length > 0 && (
        <>
          <SectionTitle className="mt-4">教育经历</SectionTitle>
          <div className="ml-[5px] pl-[18px]">
            {education.map((edu, i) => (
              <TimelineItem key={i} last={i === education.length - 1} hideLine>
                <div className="flex justify-between items-baseline mb-1" style={{ breakInside: "avoid" }}>
                  <div className="text-[14.5px] font-bold text-[#202124]">
                    {edu.degree} {edu.major}
                    <span className="text-[#5f6368] font-semibold ml-2 text-[13.5px]">@ {edu.school}</span>
                  </div>
                  <span className="text-[12.5px] text-[#5f6368]" style={{ fontFamily: "Monaco, Consolas, monospace" }}>
                    {edu.startDate} - {edu.endDate}
                  </span>
                </div>
              </TimelineItem>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function InfoRow({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="flex justify-between border-b border-dashed border-[#e0e0e0] pb-[3px] text-[13px]">
      <span className="text-[#5f6368]">{label}:</span>
      <span className={`text-[#202124] font-semibold ${small ? "text-[12.5px]" : ""}`}>{value}</span>
    </div>
  );
}

function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`text-[16.5px] font-bold text-[#202124] mb-3 flex items-center gap-2.5 ${className}`} style={{ breakInside: "avoid" }}>
      {children}
      <span className="flex-1 h-px bg-[#e0e0e0]" />
    </h2>
  );
}

function TimelineItem({ children, last, hideLine }: { children: React.ReactNode; last: boolean; hideLine?: boolean }) {
  return (
    <div className={`relative ${last ? "mb-0" : "mb-4"}`}>
      {!hideLine && (
        <span
          className="absolute w-2 h-2 rounded-full bg-white border-2 border-[#3c82be]"
          style={{ left: "-23px", top: "5px" }}
        />
      )}
      {children}
    </div>
  );
}

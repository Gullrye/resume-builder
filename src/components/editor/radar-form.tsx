"use client";
import { useResumeStore } from "@/lib/store";
import { RadarDimension } from "@/lib/types";

const DEFAULT_RADAR: RadarDimension[] = [
  { label: "前端框架", value: 80 },
  { label: "跨端开发", value: 60 },
  { label: "全流程闭环", value: 70 },
  { label: "Node.js拓展", value: 60 },
  { label: "AI辅助研发", value: 70 },
  { label: "硬件通信", value: 40 },
];

export function RadarForm() {
  const { resumeData, setResumeData } = useResumeStore();
  const radar = resumeData.radar ?? DEFAULT_RADAR;

  const ensureRadar = () => {
    if (!resumeData.radar) {
      setResumeData({ ...resumeData, radar: [...DEFAULT_RADAR] });
    }
  };

  const update = (i: number, field: keyof RadarDimension, val: string | number) => {
    const u = [...radar];
    u[i] = { ...u[i], [field]: val };
    setResumeData({ ...resumeData, radar: u });
  };

  return (
    <div className="space-y-3 py-2" onMouseEnter={ensureRadar}>
      {radar.map((dim, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            className="border rounded px-2 py-1 text-sm w-28 shrink-0"
            value={dim.label}
            onChange={(e) => update(i, "label", e.target.value)}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={dim.value}
            onChange={(e) => update(i, "value", Number(e.target.value))}
            className="flex-1 h-1.5 accent-accent cursor-pointer"
          />
          <span className="text-xs text-ink-light w-8 text-right">{dim.value}%</span>
        </div>
      ))}
    </div>
  );
}

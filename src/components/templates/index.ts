import { TemplateId } from "@/lib/types";

export { ClassicTemplate } from "./classic";
export { ModernTemplate } from "./modern";
export { MinimalTemplate } from "./minimal";
export { GeekTemplate } from "./geek";

export const TEMPLATE_LIST: {
  id: TemplateId;
  name: string;
  description: string;
}[] = [
  { id: "classic", name: "经典", description: "单栏黑白，适合传统行业" },
  { id: "modern", name: "现代", description: "双栏彩边，适合科技行业" },
  { id: "minimal", name: "简约", description: "大量留白，适合创意行业" },
  { id: "geek", name: "极客", description: "仪表盘+时间线，适合技术岗" },
];

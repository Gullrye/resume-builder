import { TemplateId } from "@/lib/types";

export { ModernTemplate } from "./modern";
export { GeekTemplate } from "./geek";

export const TEMPLATE_LIST: {
  id: TemplateId;
  name: string;
  description: string;
}[] = [
  { id: "modern", name: "现代", description: "双栏彩边，适合科技行业" },
  { id: "geek", name: "极客", description: "仪表盘+时间线，适合技术岗" },
];

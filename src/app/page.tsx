import { TEMPLATE_LIST } from "@/components/templates";
import { TemplateCard } from "@/components/template-card";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">简历生成器</h1>
          <p className="text-lg text-gray-600">
            选择模板，填写内容，一键导出 PDF
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TEMPLATE_LIST.map((t) => (
            <TemplateCard
              key={t.id}
              id={t.id}
              name={t.name}
              description={t.description}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

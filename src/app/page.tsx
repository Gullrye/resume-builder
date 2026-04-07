import { TEMPLATE_LIST } from "@/components/templates";
import { TemplateCard } from "@/components/template-card";

export default function Home() {
  return (
    <main className="min-h-screen bg-paper">
      {/* Subtle top grain texture */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
      />

      <div className="relative max-w-6xl mx-auto px-6 py-20">
        {/* Hero */}
        <div className="text-center mb-20 animate-fade-up">
          <div className="inline-block mb-6">
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-accent bg-accent-light px-4 py-1.5 rounded-full">
              Resume Builder
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-ink tracking-tight leading-[1.1] mb-5">
            写简历，<br className="hidden sm:block" />
            <span className="text-accent">不纠结</span>
          </h1>
          <p className="text-lg md:text-xl text-ink-light font-light max-w-md mx-auto leading-relaxed">
            选模板，填内容，实时预览，一键导出
          </p>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10 max-w-4xl mx-auto">
          {TEMPLATE_LIST.map((t, i) => (
            <div key={t.id} className="animate-fade-up" style={{ animationDelay: `${(i + 1) * 120}ms` }}>
              <TemplateCard id={t.id} name={t.name} description={t.description} />
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <p className="text-center text-sm text-muted mt-16 animate-fade-in" style={{ animationDelay: '600ms' }}>
          无需注册，数据保存在本地浏览器
        </p>
      </div>
    </main>
  );
}

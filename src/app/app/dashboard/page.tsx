import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpenText, CheckCircle2, Clock3, FileText, Megaphone, Target } from "lucide-react";
import { dashboardPriorities, kpis, marketCards, movementBeliefs, sourceNotes, visualAssets } from "@/lib/brand-data";
import { documents } from "@/lib/documents";

function Badge({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "amber" | "blue" | "purple" }) {
  const colors = {
    green: "text-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_12%,transparent)]",
    amber: "text-[var(--warning)] bg-[color-mix(in_srgb,var(--warning)_12%,transparent)]",
    blue: "text-sky-400 bg-sky-400/10",
    purple: "text-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_14%,transparent)]",
  };
  return <span className={`rounded-md px-2.5 py-1 text-[11px] font-black ${colors[tone]}`}>{children}</span>;
}

export default function DashboardPage() {
  return (
    <div>
      <header className="mb-6 grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
        <section className="panel overflow-hidden p-6 sm:p-8">
          <p className="kicker">eDrive Go // Painel principal</p>
          <h1 className="page-title mt-4 max-w-4xl">A nova infraestrutura do Motorista Livre.</h1>
          <p className="muted mt-5 max-w-3xl text-base leading-8">
            Painel de marca, movimento, documentos e inteligencia do cliente reconstruido sobre a logica do painel Triade: denso, navegavel e pronto para evoluir.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/app/marca" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-black text-[var(--primary-foreground)]">
              Abrir brandbook <ArrowUpRight className="size-4" />
            </Link>
            <Link href="/app/marca/documentos" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border)] px-4 text-sm font-black">
              Ver documentos <FileText className="size-4" />
            </Link>
          </div>
        </section>
        <section className="panel overflow-hidden">
          <Image src="/images/edrive-go-dashboard.svg" width={1200} height={760} alt="Painel visual eDrive Go" className="h-full min-h-[320px] w-full object-cover" priority />
        </section>
      </header>

      <section className="metric-grid overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)]">
        {kpis.map((metric, index) => (
          <article key={metric.label} className={`p-5 ${index < kpis.length - 1 ? "border-b border-[var(--border)] lg:border-b-0 lg:border-r" : ""}`}>
            <metric.icon className="size-5 text-[var(--primary)]" />
            <p className="muted mt-5 text-xs font-black uppercase tracking-[0.12em]">{metric.label}</p>
            <p className="mt-1 text-3xl font-black">{metric.value}</p>
            <p className="muted mt-2 text-xs leading-relaxed">{metric.note}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <div className="space-y-6">
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
              <div>
                <h2 className="text-lg font-black">Prioridades do painel</h2>
                <p className="muted text-xs">Ordenadas por impacto em marca, movimento e documento</p>
              </div>
              <Link href="/app/marca/diretorio" className="text-sm font-black text-[var(--primary)]">Diretorio</Link>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {dashboardPriorities.map((item) => (
                <div key={item.score} className="flex items-center gap-4 p-4">
                  <div className="grid size-9 place-items-center rounded-lg bg-[var(--muted)] text-xs font-black">{item.score}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black">{item.title}</p>
                    <p className="muted mt-1 text-xs">{item.project} · {item.status}</p>
                  </div>
                  <Badge tone={item.priority === "Alta" ? "green" : "amber"}>{item.priority}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="panel p-5">
              <div className="mb-5 flex items-center justify-between"><h2 className="font-black">Mercado e escala</h2><Target className="size-5 text-[var(--primary)]" /></div>
              <div className="space-y-4">
                {marketCards.map((card) => (
                  <div key={card.label}>
                    <div className="mb-1 flex justify-between gap-3 text-xs"><span className="font-black">{card.label}</span><span className="text-[var(--primary)]">{card.value}</span></div>
                    <p className="muted text-xs leading-relaxed">{card.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel p-5">
              <div className="mb-5 flex items-center justify-between"><h2 className="font-black">Crenças do movimento</h2><Megaphone className="size-5 text-[var(--primary)]" /></div>
              <div className="space-y-3">
                {movementBeliefs.slice(0, 5).map((belief) => (
                  <div key={belief} className="flex gap-3 text-sm font-bold leading-6"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--primary)]" />{belief}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Link href="/app/marca/documentos/movimento-manifesto" className="block overflow-hidden rounded-lg bg-[var(--sidebar)] p-6 text-white shadow-xl shadow-black/20">
            <div className="mb-8 flex items-center justify-between"><div className="grid size-11 place-items-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]"><BookOpenText /></div><Badge>Documento-chave</Badge></div>
            <p className="text-sm font-black text-[var(--primary)]">Manifesto</p>
            <h2 className="mt-2 text-2xl font-black">Nao pedimos fe. Pedimos 5 minutos com a calculadora.</h2>
            <p className="mt-4 text-sm leading-6 text-white/64">Documento completo publicado com leitura individual no padrão Dr. Pitágoras.</p>
            <span className="mt-6 flex items-center gap-2 text-sm font-black text-[var(--primary)]">Abrir documento <ArrowUpRight className="size-4" /></span>
          </Link>

          <div className="panel p-5">
            <h2 className="font-black">Status de fontes</h2>
            <div className="mt-5 space-y-4">
              {sourceNotes.map((note) => (
                <div key={note.title} className="flex gap-3 text-sm">
                  <Clock3 className="mt-0.5 size-4 shrink-0 text-[var(--warning)]" />
                  <div><p className="font-black">{note.title}</p><p className="muted mt-1 text-xs leading-relaxed">{note.text}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_.8fr]">
        <div className="panel overflow-hidden">
          <div className="border-b border-[var(--border)] p-5">
            <p className="kicker">Galeria visual</p>
            <h2 className="mt-2 text-xl font-black">Imagens criadas para substituir a ausência do Instagram</h2>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-3">
            {visualAssets.map((asset) => (
              <article key={asset.title} className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--muted)]">
                <Image src={asset.src} width={1200} height={760} alt={asset.title} className="aspect-[4/3] w-full object-cover" />
                <div className="p-4"><p className="font-black">{asset.title}</p><p className="muted mt-2 text-xs leading-relaxed">{asset.caption}</p></div>
              </article>
            ))}
          </div>
        </div>
        <div className="panel p-5">
          <p className="kicker">Documentos publicados</p>
          <h2 className="mt-2 text-xl font-black">Acervo completo clicavel</h2>
          <div className="mt-5 space-y-3">
            {documents.slice(0, 7).map((document) => (
              <Link key={document.id} href={`/app/marca/documentos/${document.id}`} className="block rounded-lg border border-[var(--border)] p-3 transition hover:border-[var(--border-strong)]">
                <p className="text-sm font-black">{document.title}</p>
                <p className="muted mt-1 text-xs">{document.category} · {document.tags.join(", ")}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

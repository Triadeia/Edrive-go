import Link from "next/link";
import { ArrowRight, BookOpenText, BrainCircuit, Flame, Sparkles } from "lucide-react";
import { brandPillars, ecosystemStats, manifestoLines } from "@/lib/brand-data";
import { SectionCard } from "@/components/section-card";

const quickAccess = [
  { href: "/app/branding", title: "Branding Book", text: "Essencia, posicionamento, voz, visual e regras de comportamento.", icon: BookOpenText },
  { href: "/app/movimento", title: "Movimento", text: "Manifesto, Motorista Livre, big idea e narrativa da Maldicao.", icon: Flame },
  { href: "/app/primal-branding", title: "Primal Branding", text: "Crenças, rituais, icones, palavras sagradas e comunidade.", icon: Sparkles },
  { href: "/app/inteligencia-cliente", title: "Inteligencia do Cliente", text: "ICPs, voz do motorista, objeções e TAM/SAM/SOM.", icon: BrainCircuit },
];

export default function AppHome() {
  return (
    <div className="space-y-6">
      <section className="panel relative overflow-hidden rounded-lg p-6 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(0,200,150,.2),transparent_28rem)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="kicker">Painel principal</p>
            <h1 className="display-title mt-4 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl">
              A marca que transforma locacao eletrica em movimento.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/64">
              Esta primeira fase organiza o DNA da eDrive Go: branding book, movimento, primal branding e inteligencia do cliente. Sem CRM, sem pipeline, sem operacao de frota.
            </p>
          </div>
          <div className="rounded-lg border border-electric/20 bg-electric/10 p-5">
            <p className="text-sm font-black text-electric">Frase de comando</p>
            <p className="mt-4 text-3xl font-black leading-tight">Os primeiros motoristas da nova geracao.</p>
            <p className="mt-4 text-sm leading-relaxed text-white/56">A categoria precisa parecer maior que aluguel: infraestrutura, energia, autonomia e comunidade.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickAccess.map((item) => (
          <Link key={item.href} href={item.href} className="soft-panel group rounded-lg p-5 transition hover:border-electric/35 hover:bg-electric/8">
            <item.icon className="size-6 text-electric" />
            <h2 className="mt-5 text-lg font-extrabold">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/54">{item.text}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-xs font-black text-electric">
              Abrir <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <div className="panel rounded-lg p-6">
          <p className="kicker">Resumo do ecossistema</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {ecosystemStats.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <p className="text-3xl font-black">{stat.value}</p>
                <p className="mt-1 text-sm text-white/54">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="panel rounded-lg p-6">
          <p className="kicker">Manifesto em sinais</p>
          <div className="mt-5 space-y-3">
            {manifestoLines.slice(0, 4).map((line) => (
              <p key={line} className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm font-bold leading-relaxed text-white/78">
                {line}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {brandPillars.map((pillar) => (
          <SectionCard key={pillar.title} title={pillar.title} text={pillar.text} icon={pillar.icon} />
        ))}
      </section>
    </div>
  );
}

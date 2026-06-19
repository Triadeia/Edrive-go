import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BatteryCharging, CircleDollarSign, Network, Zap } from "lucide-react";
import { brandPillars, ecosystemStats } from "@/lib/brand-data";
import { SectionCard } from "@/components/section-card";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="electric-grid" />
      <section className="relative mx-auto flex min-h-[88vh] w-full max-w-7xl flex-col justify-center px-5 py-8 sm:px-8 lg:px-10">
        <nav className="absolute left-5 right-5 top-5 flex items-center justify-between sm:left-8 sm:right-8 lg:left-10 lg:right-10">
          <Image src="/brand/logo-roxa.svg" width={172} height={52} alt="eDrive Go" priority />
          <Link href="/app" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/14 bg-white/[0.04] px-4 text-sm font-extrabold text-white transition hover:border-electric/50 hover:bg-electric/10">
            Entrar <ArrowRight className="size-4" />
          </Link>
        </nav>

        <div className="grid items-center gap-10 pt-24 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <p className="kicker">eDrive Go // Movimento do Motorista Livre</p>
            <h1 className="display-title mt-5 max-w-4xl text-5xl font-bold leading-[1.04] text-white sm:text-6xl lg:text-7xl">
              Os primeiros motoristas da nova geracao.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/66">
              Nao e locadora. E a nova infraestrutura de mobilidade eletrica para quem cansou de trabalhar para a gasolina.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/app" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-electric px-6 text-sm font-extrabold text-night shadow-glow transition hover:bg-[#18e2ad]">
                Abrir painel <ArrowRight className="size-4" />
              </Link>
              <Link href="/app/branding" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/14 px-6 text-sm font-extrabold text-white/84 transition hover:border-purple/50 hover:bg-purple/10">
                Ver Branding Book
              </Link>
            </div>
          </div>

          <div className="panel relative overflow-hidden rounded-lg p-5">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-electric via-purple to-volt" />
            <div className="grid aspect-square place-items-center rounded-lg border border-white/10 bg-[radial-gradient(circle,rgba(0,200,150,.16),transparent_58%)]">
              <div className="brand-ring grid size-[72%] place-items-center rounded-full p-[1px]">
                <div className="grid size-full place-items-center rounded-full bg-night">
                  <Image src="/brand/app-icon-motorista.svg" width={210} height={210} alt="Icone eDrive Go Motorista" className="h-auto w-1/2" priority />
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {ecosystemStats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                  <p className="mt-1 text-xs leading-snug text-white/50">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-7xl gap-4 px-5 pb-16 sm:px-8 md:grid-cols-2 lg:grid-cols-4 lg:px-10">
        {brandPillars.map((pillar) => (
          <SectionCard key={pillar.title} title={pillar.title} text={pillar.text} icon={pillar.icon} />
        ))}
      </section>

      <section className="relative border-t border-white/10 px-5 py-14 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
          {[
            { icon: CircleDollarSign, title: "A Maldicao da Gasolina", text: "A narrativa que nomeia o inimigo real: o custo aceito como inevitavel." },
            { icon: BatteryCharging, title: "Go + Energy", text: "Aquisicao pelo carro, fidelizacao pela infraestrutura de recarga e energia." },
            { icon: Network, title: "Ecossistema", text: "Frota, hub, app, comunidade e prova financeira operando como um sistema." },
          ].map((item) => (
            <article key={item.title} className="panel rounded-lg p-6">
              <item.icon className="size-7 text-electric" />
              <h2 className="mt-5 text-xl font-extrabold">{item.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/58">{item.text}</p>
            </article>
          ))}
        </div>
        <div className="mx-auto mt-10 max-w-7xl">
          <div className="electric-line" />
          <p className="mt-8 max-w-3xl text-2xl font-black leading-tight text-white sm:text-3xl">
            Voce trabalha para voce ou para a gasolina?
          </p>
        </div>
      </section>
    </main>
  );
}

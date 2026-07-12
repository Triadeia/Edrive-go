import Link from "next/link";
import { ArrowRight, MessageSquareText, Target, Users } from "lucide-react";
import { customerSignals, marketCards } from "@/lib/brand-data";
import { documents } from "@/lib/documents";

const icps = [
  {
    name: "Motorista Prisioneiro da Gasolina",
    score: "9.6",
    summary: "Full-time, carro antigo, alto gasto de combustivel e manutencao. Dor financeira constante e mensuravel.",
    quote: "Eu trabalho das 6h da manha as 10h da noite e no final do mes to no zero. A gasolina me mata.",
  },
  {
    name: "Motorista que ja fez a conta",
    score: "9.2",
    summary: "Ja viu conteudo sobre VE, comparou combustivel e eletrico e esta em fase de decisao.",
    quote: "Cara, eu ja vi que compensa. Falta so a oportunidade.",
  },
  {
    name: "Motorista em crise financeira direta",
    score: "9.4",
    summary: "Sente a gasolina subir mais rapido que a tarifa dos apps. Urgencia emocional e financeira combinadas.",
    quote: "Fiz R$4.100 e sobrou R$800. Isso nao pode continuar.",
  },
];

export default function CustomerIntelligencePage() {
  const intelligenceDocs = documents.filter((document) => document.category === "Inteligencia");

  return (
    <article className="space-y-6">
      <section className="panel p-6 sm:p-8">
        <p className="kicker">Inteligencia do Cliente</p>
        <h1 className="page-title mt-4">O motorista certo, no momento certo, com a dor certa.</h1>
        <p className="muted mt-5 max-w-3xl text-lg leading-8">ICPs, Buyer Personas, Voz do Cliente e TAM/SAM/SOM reunidos como uma area unica, sem virar CRM ou modulo comercial avancado.</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {icps.map((icp) => (
          <article key={icp.name} className="panel p-6">
            <div className="flex items-center justify-between">
              <Users className="size-5 text-[var(--primary)]" />
              <span className="rounded-md bg-[var(--muted)] px-2 py-1 font-mono text-xs font-black">{icp.score}</span>
            </div>
            <h2 className="mt-5 text-2xl font-black">{icp.name}</h2>
            <p className="muted mt-3 text-sm leading-7">{icp.summary}</p>
            <blockquote className="mt-5 rounded-lg border-l-4 border-[var(--primary)] bg-[var(--muted)] p-4 text-sm font-bold leading-7">{icp.quote}</blockquote>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <article className="panel p-6">
          <p className="kicker">Voz do Cliente</p>
          <h2 className="mt-3 text-2xl font-black">Frases que precisam aparecer na copy.</h2>
          <div className="mt-5 space-y-3">
            {customerSignals.map((voice) => (
              <p key={voice} className="flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4 text-sm font-bold leading-7">
                <MessageSquareText className="mt-0.5 size-4 shrink-0 text-[var(--primary)]" />&ldquo;{voice}&rdquo;
              </p>
            ))}
          </div>
        </article>
        <article className="panel p-6">
          <p className="kicker">TAM / SAM / SOM</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {marketCards.map((item) => (
              <div key={item.label} className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
                <Target className="size-5 text-[var(--primary)]" />
                <p className="mt-4 text-sm font-black text-[var(--primary)]">{item.label}</p>
                <p className="mt-2 text-3xl font-black">{item.value}</p>
                <p className="muted mt-2 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker">Documentos de inteligencia</p>
            <h2 className="section-title mt-3">Leitura completa publicada.</h2>
          </div>
          <Link href="/app/marca/documentos" className="text-sm font-black text-[var(--primary)]">Ver todos</Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {intelligenceDocs.map((document) => (
            <Link key={document.id} href={`/app/marca/documentos/${document.id}`} className="panel panel-interactive block p-4 shadow-none">
              <p className="kicker">{document.category}</p>
              <h3 className="mt-3 font-black">{document.title}</h3>
              <p className="muted mt-2 text-sm leading-6">{document.description}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[var(--primary)]">Abrir <ArrowRight className="size-4" /></span>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}

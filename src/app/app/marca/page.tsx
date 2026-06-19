import Image from "next/image";
import Link from "next/link";
import { ArrowDownToLine, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { brandSections, forbiddenPhrases, palette, recommendedPhrases, visualAssets } from "@/lib/brand-data";
import { documents } from "@/lib/documents";

export default function MarcaPage() {
  return (
    <article className="space-y-6">
      <section className="panel grid gap-8 overflow-hidden p-6 sm:p-8 xl:grid-cols-[1fr_360px]">
        <div>
          <p className="kicker">Brandbook eDrive Go</p>
          <h1 className="page-title mt-4 max-w-4xl">Marca, movimento e documentos em uma unica base.</h1>
          <p className="muted mt-5 max-w-3xl text-base leading-8">
            Reconstruido a partir da estrutura Triade: brandbook navegavel, galeria visual, documentos completos e diretrizes de uso para manter a eDrive Go com cara de ecossistema eletrico.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/app/marca/documentos" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-black text-[var(--primary-foreground)]">
              Abrir documentos <ArrowRight className="size-4" />
            </Link>
            <a href="/brand/logo-roxa.svg" download className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border)] px-4 text-sm font-black">
              Baixar logo <ArrowDownToLine className="size-4" />
            </a>
          </div>
        </div>
        <div className="grid place-items-center rounded-lg border border-[var(--border)] bg-[var(--muted)] p-8">
          <Image src="/brand/logo-roxa.svg" width={260} height={92} alt="eDrive Go" />
        </div>
      </section>

      <nav className="glass flex gap-2 overflow-x-auto rounded-lg p-2" aria-label="Navegacao do brandbook">
        {["essencia", "paleta", "visual", "voz", "documentos"].map((item) => (
          <a key={item} href={`#${item}`} className="rounded-md px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]">{item}</a>
        ))}
      </nav>

      <section id="essencia" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {brandSections.map((section) => (
          <article key={section.slug} className="panel panel-interactive p-5">
            <section.icon className="size-6 text-[var(--primary)]" />
            <p className="kicker mt-5">{section.group}</p>
            <h2 className="mt-2 text-xl font-black">{section.title}</h2>
            <p className="muted mt-3 text-sm leading-7">{section.description}</p>
            <Link href={`/app/marca/${section.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[var(--primary)]">
              Abrir capitulo <ArrowRight className="size-4" />
            </Link>
          </article>
        ))}
      </section>

      <section id="paleta" className="panel p-6">
        <p className="kicker">Paleta cromatica</p>
        <h2 className="section-title mt-3">Preto, roxo, verde eletrico e sinal de urgencia.</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {palette.map((color) => (
            <article key={color.hex} className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card-strong)]">
              <div className="h-24" style={{ backgroundColor: color.hex }} />
              <div className="p-4">
                <h3 className="font-black">{color.name}</h3>
                <p className="mt-1 font-mono text-xs text-[var(--primary)]">{color.hex}</p>
                <p className="muted mt-3 text-sm leading-6">{color.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="visual" className="grid gap-6 xl:grid-cols-[.95fr_1.05fr]">
        <div className="panel p-6">
          <p className="kicker">Tipografia correta</p>
          <h2 className="section-title mt-3">Sora em toda a interface.</h2>
          <p className="muted mt-5 leading-7">
            A primeira versao usava Libre Baskerville e parecia editorial demais. A nova fundacao usa Sora para criar uma sensacao mais tecnologica, premium, objetiva e parecida com painel operacional.
          </p>
          <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
            <p className="text-4xl font-black">Sora 800</p>
            <p className="muted mt-2 text-sm">Nao e locadora. E movimento.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {visualAssets.map((asset) => (
            <article key={asset.title} className="panel overflow-hidden">
              <Image src={asset.src} width={1200} height={760} alt={asset.title} className="aspect-[4/3] w-full object-cover" />
              <div className="p-4"><p className="font-black">{asset.title}</p><p className="muted mt-2 text-xs leading-relaxed">{asset.caption}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section id="voz" className="grid gap-6 xl:grid-cols-2">
        <div className="panel p-6">
          <p className="kicker">Frases recomendadas</p>
          <div className="mt-5 space-y-3">
            {recommendedPhrases.map((phrase) => (
              <p key={phrase} className="flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4 text-sm font-black"><CheckCircle2 className="size-4 shrink-0 text-[var(--primary)]" />{phrase}</p>
            ))}
          </div>
        </div>
        <div className="panel p-6">
          <p className="kicker">Frases proibidas</p>
          <div className="mt-5 space-y-3">
            {forbiddenPhrases.map((phrase) => (
              <p key={phrase} className="flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4 text-sm font-bold"><XCircle className="size-4 shrink-0 text-red-400" />{phrase}</p>
            ))}
          </div>
        </div>
      </section>

      <section id="documentos" className="panel p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker">Documentos completos</p>
            <h2 className="section-title mt-3">Todos os documentos publicados e clicaveis.</h2>
          </div>
          <Link href="/app/marca/documentos" className="text-sm font-black text-[var(--primary)]">Abrir biblioteca completa</Link>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {documents.map((document) => (
            <Link key={document.id} href={`/app/marca/documentos/${document.id}`} className="panel panel-interactive block p-4 shadow-none">
              <p className="kicker">{document.category}</p>
              <h3 className="mt-3 font-black">{document.title}</h3>
              <p className="muted mt-2 text-sm leading-6">{document.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}

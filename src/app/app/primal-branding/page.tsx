import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { primalElements } from "@/lib/brand-data";

export default function PrimalBrandingPage() {
  return (
    <article className="space-y-6">
      <section className="panel p-6 sm:p-8">
        <p className="kicker">Primal Branding</p>
        <h1 className="page-title mt-4">Os 7 elementos do sistema de crenca.</h1>
        <p className="muted mt-5 max-w-3xl text-lg leading-8">A eDrive Go precisa virar pertencimento. Estes elementos transformam oferta em cultura e cultura em retencao.</p>
        <Link href="/app/marca/documentos/movimento-primal-branding" className="mt-7 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-black text-[var(--primary-foreground)]">
          Ler documento completo <ArrowRight className="size-4" />
        </Link>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {primalElements.map(([title, text], index) => (
          <article key={title} className="panel panel-interactive p-5">
            <Sparkles className="size-5 text-[var(--primary)]" />
            <p className="mt-6 font-mono text-xs font-black text-[var(--primary)]">{String(index + 1).padStart(2, "0")}</p>
            <h2 className="mt-3 text-xl font-black">{title}</h2>
            <p className="muted mt-3 text-sm leading-7">{text}</p>
          </article>
        ))}
      </section>
    </article>
  );
}

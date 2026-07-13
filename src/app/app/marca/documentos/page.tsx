import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import { documents, getDocumentContent, getDocumentStats } from "@/lib/documents";

const categories = ["Movimento", "Inteligencia", "Comercial"] as const;

export default function DocumentsPage() {
  return (
    <article className="space-y-6">
      <header className="panel p-6 sm:p-8">
        <p className="kicker">Documentos eDrive Go</p>
        <h1 className="page-title mt-4">Biblioteca completa publicada.</h1>
        <p className="muted mt-5 max-w-3xl text-lg leading-8">
          Todos os documentos criados ate aqui foram trazidos para dentro do painel. Cada card abre uma pagina propria com o conteudo completo.
        </p>
      </header>

      {categories.map((category) => {
        const items = documents.filter((document) => document.category === category);
        return (
          <section key={category} className="panel p-6">
            <div className="mb-5 flex items-center gap-3">
              <FileText className="size-5 text-[var(--primary)]" />
              <div>
                <p className="kicker">{category}</p>
                <h2 className="text-2xl font-black">{items.length} documentos</h2>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((document) => {
                const stats = getDocumentStats(getDocumentContent(document));
                return (
                  <Link key={document.id} href={`/app/marca/documentos/${document.id}`} className="panel panel-interactive block p-5 shadow-none">
                    <div className="flex items-center justify-between">
                      <span className="kicker">{document.source}</span>
                      <ArrowUpRight className="muted size-4" />
                    </div>
                    <h3 className="mt-5 text-lg font-black">{document.title}</h3>
                    <p className="muted mt-2 text-sm leading-6">{document.description}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="rounded-md bg-[var(--muted)] px-2 py-1 text-[11px] font-black">{stats.words.toLocaleString("pt-BR")} palavras</span>
                      <span className="rounded-md bg-[var(--muted)] px-2 py-1 text-[11px] font-black">{stats.headings} secoes</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </article>
  );
}

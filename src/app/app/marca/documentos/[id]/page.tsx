import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { MarkdownDocument } from "@/components/markdown-document";
import { documents, getDocument, getDocumentContent, getDocumentStats } from "@/lib/documents";

export function generateStaticParams() {
  return documents.map((document) => ({ id: document.id }));
}

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const document = getDocument(id);
  if (!document) notFound();
  const content = getDocumentContent(document);
  const stats = getDocumentStats(content);

  return (
    <article className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/app/marca/documentos" className="inline-flex items-center gap-2 text-sm font-black text-[var(--primary)]"><ArrowLeft className="size-4" /> Voltar aos documentos</Link>
        <a href={`/documents/${document.fileName}`} className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-black">
          <Download className="size-4" /> Baixar fonte
        </a>
      </div>

      <header className="panel p-6 sm:p-8">
        <div className="mb-6 flex size-12 items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--primary)]">
          <FileText className="size-6" />
        </div>
        <p className="kicker">{document.category} · {document.source}</p>
        <h1 className="page-title mt-4">{document.title}</h1>
        <p className="muted mt-4 max-w-3xl text-lg leading-8">{document.subtitle}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-md bg-[var(--muted)] px-2 py-1 text-xs font-black">{stats.words.toLocaleString("pt-BR")} palavras</span>
          <span className="rounded-md bg-[var(--muted)] px-2 py-1 text-xs font-black">{stats.headings} secoes</span>
          {document.tags.map((tag) => <span key={tag} className="rounded-md bg-[var(--muted)] px-2 py-1 text-xs font-black">{tag}</span>)}
        </div>
      </header>

      <section className="panel p-5 sm:p-8">
        <MarkdownDocument content={content} />
      </section>
    </article>
  );
}

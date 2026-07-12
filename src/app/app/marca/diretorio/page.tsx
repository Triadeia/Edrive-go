import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { brandSections } from "@/lib/brand-data";
import { documents } from "@/lib/documents";

export default function DirectoryPage() {
  const entries = [
    ...brandSections.map((item) => ({
      id: item.slug,
      href: `/app/marca/${item.slug}`,
      category: item.group,
      name: item.shortTitle,
      description: item.description,
    })),
    ...documents.map((item) => ({
      id: item.id,
      href: `/app/marca/documentos/${item.id}`,
      category: item.category,
      name: item.title,
      description: item.description,
    })),
  ];

  return (
    <article>
      <header className="mb-8 max-w-3xl">
        <span className="kicker">Biblioteca navegavel</span>
        <h1 className="page-title mt-4">Tudo que forma a experiencia Libert Drive.</h1>
        <p className="muted mt-5 max-w-2xl text-lg leading-8">Capitulos do brandbook, documentos completos, movimento e inteligencia em um unico diretorio visual.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {entries.map((item) => (
          <Link key={`${item.category}-${item.id}`} href={item.href} className="panel panel-interactive block p-5">
            <div className="flex items-center justify-between">
              <span className="kicker">{item.category}</span>
              <ArrowUpRight className="muted size-4" />
            </div>
            <h2 className="mt-6 text-lg font-black">{item.name}</h2>
            <p className="muted mt-2 text-sm leading-6">{item.description}</p>
          </Link>
        ))}
      </div>
    </article>
  );
}

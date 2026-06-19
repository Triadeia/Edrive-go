import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { brandSections } from "@/lib/brand-data";

export function generateStaticParams() {
  return brandSections.map((section) => ({ slug: section.slug }));
}

export default async function BrandSectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const section = brandSections.find((item) => item.slug === slug);
  if (!section) notFound();

  return (
    <article className="space-y-6">
      <Link href="/app/marca" className="inline-flex items-center gap-2 text-sm font-black text-[var(--primary)]"><ArrowLeft className="size-4" /> Voltar ao brandbook</Link>
      <section className="panel p-6 sm:p-8">
        <p className="kicker">{section.group}</p>
        <h1 className="page-title mt-4">{section.title}</h1>
        <p className="muted mt-5 max-w-3xl text-lg leading-8">{section.description}</p>
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        {section.chapters.map((chapter) => (
          <article key={chapter.id} className="panel p-6">
            <p className="kicker">{chapter.id}</p>
            <h2 className="mt-3 text-2xl font-black">{chapter.title}</h2>
            <p className="muted mt-4 leading-7">{chapter.lead}</p>
            {chapter.points ? (
              <div className="mt-5 space-y-3">
                {chapter.points.map((point) => (
                  <div key={point.title} className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4">
                    <p className="font-black">{point.title}</p>
                    <p className="muted mt-2 text-sm leading-6">{point.text}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </section>
    </article>
  );
}

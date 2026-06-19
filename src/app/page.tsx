import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BatteryCharging, BookOpenText, FileText } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen px-5 py-5 sm:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-40px)] max-w-7xl items-center gap-10 py-12 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <Image src="/brand/logo-roxa.svg" width={190} height={64} alt="eDrive Go" priority />
          <p className="kicker mt-10">Painel eDrive Go</p>
          <h1 className="page-title mt-4 max-w-4xl">Nao e locadora. E movimento.</h1>
          <p className="muted mt-6 max-w-2xl text-lg leading-8">Brandbook, movimento, documentos e inteligencia do cliente em uma experiencia visual inspirada no painel Triade, com Sora e tres modos de tema.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/app/dashboard" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--primary)] px-5 text-sm font-black text-[var(--primary-foreground)]">
              Entrar no painel <ArrowRight className="size-4" />
            </Link>
            <Link href="/app/marca/documentos" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--border)] px-5 text-sm font-black">
              Abrir documentos <FileText className="size-4" />
            </Link>
          </div>
          <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              [BatteryCharging, "80+ carregadores"],
              [BookOpenText, "Brandbook completo"],
              [FileText, "12 documentos"],
            ].map(([Icon, text]) => {
              const ItemIcon = Icon as typeof BatteryCharging;
              return (
                <div key={String(text)} className="panel p-4">
                  <ItemIcon className="size-5 text-[var(--primary)]" />
                  <p className="mt-4 text-sm font-black">{String(text)}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="panel overflow-hidden">
          <Image src="/images/edrive-hub.svg" width={1200} height={760} alt="Hub eDrive Go" className="h-full min-h-[430px] w-full object-cover" priority />
        </div>
      </section>
    </main>
  );
}

import { customerIntelligence } from "@/lib/brand-data";

export default function CustomerIntelligencePage() {
  return (
    <div className="space-y-6">
      <section className="panel rounded-lg p-6 sm:p-8">
        <p className="kicker">Inteligencia do Cliente</p>
        <h1 className="display-title mt-4 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl">O motorista certo, no momento certo, com a dor certa.</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-white/62">
          Esta area reune ICPs, Buyer Personas, Voz do Cliente e TAM/SAM/SOM. Nao inclui scripts comerciais nem pipeline nesta fase.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {customerIntelligence.icps.map((icp) => (
          <article key={icp.name} className="panel rounded-lg p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="kicker">ICP prioritario</p>
              <span className="rounded-md bg-electric/12 px-3 py-1 font-mono text-xs font-black text-electric">{icp.score}</span>
            </div>
            <h2 className="mt-4 text-2xl font-black">{icp.name}</h2>
            <p className="mt-3 text-sm leading-7 text-white/58">{icp.summary}</p>
            <blockquote className="mt-5 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm font-bold leading-relaxed text-white/74">{icp.signal}</blockquote>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
        <article className="panel rounded-lg p-6">
          <p className="kicker">Voz do Cliente</p>
          <div className="mt-5 space-y-3">
            {customerIntelligence.voices.map((voice) => (
              <p key={voice} className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm font-bold leading-relaxed text-white/72">"{voice}"</p>
            ))}
          </div>
        </article>
        <article className="panel rounded-lg p-6">
          <p className="kicker">TAM / SAM / SOM</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {customerIntelligence.market.map((item) => (
              <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm font-black text-electric">{item.label}</p>
                <p className="mt-3 text-3xl font-black">{item.value}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/54">{item.text}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

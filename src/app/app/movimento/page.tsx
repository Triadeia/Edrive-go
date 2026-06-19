import { manifestoLines, movementBeliefs } from "@/lib/brand-data";

const journey = [
  ["Fase 0", "O Adormecido", "Ainda aceita gasolina como custo inevitavel."],
  ["Fase 1", "A Decisao", "Faz o calculo, entra no movimento e recebe as chaves."],
  ["Fase 2", "O Despertar", "Primeiros 30 dias provando que a conta fecha."],
  ["Fase 3", "A Consolidacao", "90 dias: o habito vira identidade."],
  ["Fase 4", "A Referencia", "O motorista passa a orientar quem chega."],
  ["Fase 5", "O Embaixador", "Indica, celebra e multiplica a Virada Eletrica."],
];

export default function MovementPage() {
  return (
    <div className="space-y-6">
      <section className="panel rounded-lg p-6 sm:p-8">
        <p className="kicker">Movimento eDrive Go</p>
        <h1 className="display-title mt-4 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl">A Maldicao da Gasolina tem nome. E tem fim.</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-white/62">
          O movimento transforma uma decisao economica em identidade: Motoristas Livres que decidiram parar de financiar um custo que parecia inevitavel.
        </p>
      </section>

      <section className="panel rounded-lg p-6">
        <p className="kicker">Manifesto</p>
        <div className="mt-5 grid gap-4 lg:grid-cols-5">
          {manifestoLines.map((line) => (
            <blockquote key={line} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <p className="display-title text-xl font-bold leading-snug">{line}</p>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[.82fr_1.18fr]">
        <article className="panel rounded-lg p-6">
          <p className="kicker">Big Idea</p>
          <h2 className="mt-4 text-3xl font-black">A Maldicao da Gasolina</h2>
          <p className="mt-4 text-sm leading-7 text-white/58">
            A crenca coletiva de que combustivel fossil e custo inevitavel do trabalho de mobilidade. A eDrive Go nomeia o inimigo e mostra a saida com eletrico, locacao e infraestrutura.
          </p>
          <div className="mt-6 rounded-lg border border-electric/20 bg-electric/10 p-5">
            <p className="text-2xl font-black">Voce trabalha para voce ou para a gasolina?</p>
          </div>
        </article>
        <article className="panel rounded-lg p-6">
          <p className="kicker">As crenças do Motorista Livre</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {movementBeliefs.map((belief) => (
              <p key={belief} className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm font-bold leading-relaxed text-white/72">{belief}</p>
            ))}
          </div>
        </article>
      </section>

      <section className="panel rounded-lg p-6">
        <p className="kicker">Jornada de pertencimento</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {journey.map(([phase, title, text]) => (
            <article key={phase} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <p className="font-mono text-xs font-black text-electric">{phase}</p>
              <h3 className="mt-3 text-xl font-black">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/54">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

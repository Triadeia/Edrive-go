import { primalElements } from "@/lib/brand-data";

const rituals = [
  "Ativacao: A partir de hoje, voce nao abastece mais.",
  "Primeira Semana Eletrica: registro diario de rota, km, bateria e custo.",
  "Setimo Dia: mini-calculo de economia compartilhado na celula.",
  "30 Dias Livre: depoimento curto e badge digital.",
  "Indicacao: libertar quem voce conhece.",
  "Summit do Motorista Livre: celebracao presencial de resultados.",
];

const sacredWords = ["Motorista Livre", "Virada Eletrica", "Maldicao da Gasolina", "Mais um mes livre", "Rode sem corrente", "Calculo da Virada"];

export default function PrimalBrandingPage() {
  return (
    <div className="space-y-6">
      <section className="panel rounded-lg p-6 sm:p-8">
        <p className="kicker">Primal Branding</p>
        <h1 className="display-title mt-4 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl">O sistema de crença que faz a comunidade ficar.</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-white/62">
          A eDrive Go precisa ser reconhecida como causa, nao apenas produto. Estes sete elementos tornam a marca repetivel, defensavel e comunitaria.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {primalElements.map((element) => (
          <article key={element.title} className="soft-panel rounded-lg p-5">
            <element.icon className="size-6 text-electric" />
            <h2 className="mt-5 text-lg font-extrabold">{element.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/58">{element.text}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="panel rounded-lg p-6">
          <p className="kicker">Rituais da comunidade</p>
          <div className="mt-5 space-y-3">
            {rituals.map((ritual, index) => (
              <div key={ritual} className="flex gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <span className="grid size-8 flex-none place-items-center rounded-md bg-electric/12 font-mono text-xs font-black text-electric">{index + 1}</span>
                <p className="text-sm font-bold leading-relaxed text-white/72">{ritual}</p>
              </div>
            ))}
          </div>
        </article>
        <article className="panel rounded-lg p-6">
          <p className="kicker">Palavras sagradas</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {sacredWords.map((word) => (
              <span key={word} className="rounded-lg border border-electric/25 bg-electric/10 px-4 py-3 text-sm font-black text-white">{word}</span>
            ))}
          </div>
          <div className="mt-8 rounded-lg border border-purple/25 bg-purple/10 p-5">
            <h2 className="text-2xl font-black">A regra de ouro</h2>
            <p className="mt-3 text-sm leading-7 text-white/62">Comunidade nao e grupo de WhatsApp. E identidade compartilhada, ritual recorrente e prova social organizada.</p>
          </div>
        </article>
      </section>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, BookOpenText, CheckCircle2, Flag, Quote, RadioTower } from "lucide-react";
import { movementBeliefs } from "@/lib/brand-data";

const rituals = [
  ["Ativacao", "A partir de hoje, voce nao abastece mais."],
  ["Primeira Semana Eletrica", "Registro de rota, bateria, autonomia e primeiras economias."],
  ["Calculo da Virada", "Comparativo mensal entre gasolina, locacao, energia e margem."],
  ["30 Dias Livre", "Depoimento curto, badge digital e prova social autorizada."],
  ["Indicacao", "Libertar quem voce conhece da Maldicao da Gasolina."],
  ["Summit", "Encontro para celebrar resultados, rotas, dicas e embaixadores."],
];

const journey = [
  ["Fase 0", "O Adormecido", "Ainda acha que gasolina e custo inevitavel."],
  ["Fase 1", "A Decisao", "Faz a conta, entra na comunidade e recebe as chaves."],
  ["Fase 2", "O Despertar", "Primeiros 30 dias provando que a rotina eletrica funciona."],
  ["Fase 3", "A Consolidacao", "90 dias: habito financeiro vira identidade."],
  ["Fase 4", "A Referencia", "Passa a responder duvidas e virar prova para outros."],
  ["Fase 5", "O Embaixador", "Indica, acompanha e multiplica o movimento."],
];

export default function MovimentoPage() {
  return (
    <article className="space-y-6">
      <section className="panel overflow-hidden p-6 sm:p-8">
        <p className="kicker">Movimento eDrive Go</p>
        <h1 className="page-title mt-4">A Maldicao da Gasolina tem nome. E tem fim.</h1>
        <p className="muted mt-5 max-w-3xl text-lg leading-8">
          A area de movimento segue a logica do painel Dr. Pitagoras: manifesto, inimigo comum, crenças, linguagem, rituais e jornada de pertencimento.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/app/marca/documentos/movimento-manifesto" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-black text-[var(--primary-foreground)]">
            Ler manifesto completo <ArrowRight className="size-4" />
          </Link>
          <Link href="/app/primal-branding" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border)] px-4 text-sm font-black">
            Abrir Primal Branding
          </Link>
        </div>
      </section>

      <section className="panel bg-[var(--sidebar)] p-8 text-white">
        <Quote className="mb-8 size-7 text-[var(--primary)]" />
        <blockquote className="max-w-4xl text-4xl font-black leading-tight">Existe uma conta que ninguem te mostrou. Quando voce ve, nao da pra nao ver.</blockquote>
        <p className="mt-6 max-w-3xl leading-7 text-white/66">Nao somos apenas um aplicativo. Somos infraestrutura. O motorista entra pelo Go; a fidelizacao acontece pela Energy.</p>
        <p className="mt-6 text-sm font-black uppercase tracking-[0.14em] text-[var(--primary)]">Seja Motorista Livre. Rode sem corrente.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {movementBeliefs.map((belief, index) => (
          <div key={belief} className="panel flex items-start gap-4 p-4">
            <span className="mt-1 font-mono text-sm font-black text-[var(--primary)]">{String(index + 1).padStart(2, "0")}</span>
            <p className="text-sm font-bold leading-6">{belief}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_.9fr]">
        <div className="panel p-6">
          <p className="kicker">Rituais</p>
          <h2 className="section-title mt-3">Comunidade nao e grupo. E comportamento repetido.</h2>
          <div className="mt-6 space-y-3">
            {rituals.map(([title, text]) => (
              <div key={title} className="flex gap-4 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4">
                <RadioTower className="mt-0.5 size-5 shrink-0 text-[var(--primary)]" />
                <div><p className="font-black">{title}</p><p className="muted mt-1 text-sm leading-6">{text}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel p-6">
          <p className="kicker">Jornada</p>
          <div className="mt-6 space-y-3">
            {journey.map(([phase, title, text]) => (
              <article key={phase} className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4">
                <p className="font-mono text-xs font-black text-[var(--primary)]">{phase}</p>
                <h3 className="mt-2 font-black">{title}</h3>
                <p className="muted mt-1 text-sm leading-6">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="panel grid gap-5 p-6 xl:grid-cols-[.75fr_1.25fr]">
        <div>
          <Flag className="size-6 text-[var(--primary)]" />
          <p className="kicker mt-6">Juramento do Motorista Livre</p>
          <h2 className="section-title mt-3">Eu escolho. Eu me comprometo. Eu sou Motorista Livre.</h2>
        </div>
        <div className="space-y-4 text-lg font-bold leading-8">
          <p>Escolho parar de financiar uma ineficiencia que tem solucao.</p>
          <p>Escolho tratar meu trabalho como o negocio que e.</p>
          <p>Escolho fazer a conta antes de aceitar o que sempre foi assim.</p>
          <Link href="/app/marca/documentos/movimento-ritual-comunidade" className="inline-flex items-center gap-2 text-sm font-black text-[var(--primary)]">
            Abrir ritual completo <BookOpenText className="size-4" />
          </Link>
        </div>
      </section>
    </article>
  );
}

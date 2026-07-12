import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenText,
  Calculator,
  Car,
  CircleDollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Gauge,
  Landmark,
  Network,
  ShieldAlert,
  Zap,
} from "lucide-react";

const docs = [
  {
    title: "Plano de Negocio Completo",
    href: "/libert-drive/documentos/Libert_Drive_Plano_de_Negocio.html",
    type: "HTML",
    text: "30 entregaveis: tese estrategica, modelo de negocio, DRE, marketing, vendas, operacao, compliance, roadmap e riscos.",
    icon: BookOpenText,
  },
  {
    title: "Deck Executivo",
    href: "/libert-drive/documentos/Libert_Drive_Deck.html",
    type: "HTML",
    text: "Narrativa para investidores/parceiros: problema, solucao, mercado, modelo, GTM, unit economics, riscos e pedido.",
    icon: FileText,
  },
  {
    title: "Modelo Financeiro",
    href: "/libert-drive/documentos/Libert_Drive_Modelo_Financeiro.html",
    type: "HTML",
    text: "Gerador da planilha financeira com premissas editaveis e explicacao do arquivo Excel.",
    icon: FileSpreadsheet,
  },
  {
    title: "Documentacao Operacional",
    href: "/libert-drive/documentos/Libert_Drive_Documentacao_Operacional.md",
    type: "MD",
    text: "Playbooks de marketing, vendas, suporte, frota, telemetria, compliance e checklists de execucao.",
    icon: Network,
  },
  {
    title: "README do Modelo Financeiro",
    href: "/libert-drive/documentos/README_MODELO_FINANCEIRO.md",
    type: "MD",
    text: "Guia de uso da planilha, abas, premissas principais, cenarios e notas tecnicas.",
    icon: FileText,
  },
];

const downloads = [
  {
    title: "Baixar Excel financeiro",
    href: "/libert-drive/downloads/Libert_Drive_Modelo_Financeiro.xlsx",
    text: "Planilha com Premissas, Frota, Motoristas, Marketing, Funil, Equipe, Consorcio, Custos, DRE, Fluxo, Unit, Cenarios, Sensibilidade, Dashboard, Riscos e Roadmap.",
  },
  {
    title: "Baixar codigo da calculadora Claude",
    href: "/libert-drive/downloads/libert-drive-calculadora-claude.zip",
    text: "Projeto gerado pelo Claude preservado como referencia tecnica e fonte de componentes/fórmulas.",
  },
];

const conclusions = [
  {
    title: "O plano do Claude e a base executiva",
    text: "Ele organiza a Libert Drive como operacao asset-light: locar 100 BYD Dolphin Mini, validar demanda, controlar ocupacao, inadimplencia e custo de locadora antes de comprar frota.",
    icon: Gauge,
  },
  {
    title: "A esteira de posse aumenta a tese",
    text: "Nossa camada nova transforma o carro alugado em carro ponte por 3 meses: o motorista entra, paga entrada, roda enquanto o carro proprio chega e libera o carro para a proxima leva.",
    icon: Car,
  },
  {
    title: "O caixa muda de patamar",
    text: "Entradas entre R$ 15 mil e R$ 30 mil e parcelas de R$ 1.400 por 48 meses criam uma carteira financeira recorrente, mas exigem estrutura regulada e segregacao de valores.",
    icon: CircleDollarSign,
  },
  {
    title: "Compliance virou trava de crescimento",
    text: "Entrada, financiamento, consorcio e carta contemplada nao podem ser comunicados como promessa. Precisam de parceiro autorizado, contrato claro, contabilidade e conciliacao separada.",
    icon: ShieldAlert,
  },
];

const roadmap = [
  ["7 dias", "Validar contrato com locadora, sublocacao, km app/PJ, seguro, manutenção, caução e regras de recolhimento."],
  ["30 dias", "Rodar piloto comercial, medir CPL, lead para contrato, aprovacao, inadimplencia, suporte e ocupacao real."],
  ["60 dias", "Fechar parceiro regulado para financiamento/consorcio e estruturar contas/rubricas separadas."],
  ["90 dias", "Operar primeira leva de 100 carros ponte e medir quantos carros retornam apos entrega do carro proprio."],
  ["12 meses", "Escalar de 100 em 100, integrar Libert Energy, Libert Drive App e telemetria como centros de margem."],
];

function DocCard({ item }: { item: (typeof docs)[number] }) {
  return (
    <a href={item.href} target="_blank" rel="noreferrer" className="panel panel-interactive block p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="grid size-10 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] text-[var(--primary)]">
          <item.icon className="size-5" />
        </div>
        <span className="rounded-md bg-[var(--muted)] px-2 py-1 text-[10px] font-black">{item.type}</span>
      </div>
      <h3 className="text-lg font-black">{item.title}</h3>
      <p className="muted mt-3 text-sm leading-6">{item.text}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[var(--primary)]">
        Abrir documento <ArrowUpRight className="size-4" />
      </span>
    </a>
  );
}

export default function LibertDrivePage() {
  return (
    <div className="space-y-6">
      <header className="grid gap-5 xl:grid-cols-[1.08fr_.92fr]">
        <section className="panel overflow-hidden p-6 sm:p-8">
          <p className="kicker">Libert Drive // central executiva</p>
          <h1 className="page-title mt-4 max-w-5xl">Plano, documentos e modelo vivo no mesmo painel.</h1>
          <p className="muted mt-5 max-w-3xl text-base leading-8">
            Esta central preserva o pacote entregue pelo Claude, conecta os arquivos ao painel e deixa clara a conclusao mais importante: manter a calculadora viva como camada de decisao, agora com a esteira de financiamento e carro ponte.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/app/calculadora" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-black text-[var(--primary-foreground)]">
              Abrir calculadora viva <Calculator className="size-4" />
            </Link>
            <a href="/libert-drive/downloads/Libert_Drive_Modelo_Financeiro.xlsx" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border)] px-4 text-sm font-black">
              Baixar Excel <Download className="size-4" />
            </a>
          </div>
        </section>
        <section className="panel grid content-between gap-5 p-6">
          <div>
            <p className="kicker">Conclusao da analise</p>
            <h2 className="mt-3 text-2xl font-black">Nao substituir. Somar.</h2>
            <p className="muted mt-3 text-sm leading-7">
              O pacote do Claude documenta a empresa. A calculadora que montamos operacionaliza a tese nova: entrada, 48 parcelas, entrega em 3 meses e reciclagem dos carros de 100 em 100.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-[var(--muted)] p-4">
              <p className="text-2xl font-black">R$ 15k–30k</p>
              <p className="muted mt-1 text-xs">entrada simulada por motorista</p>
            </div>
            <div className="rounded-lg bg-[var(--muted)] p-4">
              <p className="text-2xl font-black">48x R$ 1.400</p>
              <p className="muted mt-1 text-xs">carteira recorrente a validar</p>
            </div>
          </div>
        </section>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {conclusions.map((item) => (
          <article key={item.title} className="panel p-5">
            <item.icon className="size-5 text-[var(--primary)]" />
            <h2 className="mt-5 text-lg font-black">{item.title}</h2>
            <p className="muted mt-3 text-sm leading-6">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_.72fr]">
        <div className="panel p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="kicker">Acervo publicado</p>
              <h2 className="mt-1 text-xl font-black">Documentos abríveis no painel/Vercel</h2>
            </div>
            <BookOpenText className="size-5 text-[var(--primary)]" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {docs.map((item) => (
              <DocCard key={item.title} item={item} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="panel p-5">
            <p className="kicker">Downloads</p>
            <h2 className="mt-1 text-xl font-black">Arquivos-fonte preservados</h2>
            <div className="mt-5 space-y-3">
              {downloads.map((item) => (
                <a key={item.href} href={item.href} className="block rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4 transition hover:border-[var(--border-strong)]">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black">{item.title}</p>
                    <Download className="size-4 shrink-0 text-[var(--primary)]" />
                  </div>
                  <p className="muted mt-2 text-xs leading-5">{item.text}</p>
                </a>
              ))}
            </div>
          </section>

          <section className="panel p-5">
            <p className="kicker">Roadmap consolidado</p>
            <h2 className="mt-1 text-xl font-black">Proximo movimento</h2>
            <div className="mt-5 divide-y divide-[var(--border)]">
              {roadmap.map(([when, action]) => (
                <div key={when} className="grid gap-2 py-3 sm:grid-cols-[72px_1fr]">
                  <span className="text-sm font-black text-[var(--primary)]">{when}</span>
                  <p className="muted text-sm leading-6">{action}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-lg bg-[var(--sidebar)] p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]">
                <Landmark className="size-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--primary)]">Trava juridica</p>
                <h2 className="text-lg font-black">Financiamento nao pode ser improvisado.</h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/68">
              Entradas e parcelas so devem virar receita operacional se advogado, contador e parceiro regulado validarem contrato, rubrica, conciliacao, LGPD, politica de cancelamento e comunicacao comercial.
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}

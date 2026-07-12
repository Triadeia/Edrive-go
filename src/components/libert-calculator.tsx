"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BatteryCharging,
  Car,
  CircleDollarSign,
  Download,
  Gauge,
  Info,
  LineChart,
  Users,
  Zap,
} from "lucide-react";
import { defaultAssumptions, scenarioLabels } from "@/data/libert-calculator-defaults";
import { calculateLibertDrive, flattenResultsForCsv, getScenarioAssumptions } from "@/lib/libert-calculator";
import type { CalculatorAssumptions, CalculatorResults, ScenarioId } from "@/types/calculator";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const moneyPrecise = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const number = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const percent = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 });
const financingTone = "text-amber-300";

const mileageProfiles = [
  { label: "6h/dia", hours: 6, km: 3000, range: "2.500-3.500 km/mes" },
  { label: "8h/dia", hours: 8, km: 4250, range: "3.500-5.000 km/mes" },
  { label: "10-12h/dia", hours: 11, km: 5750, range: "5.000-6.500 km/mes" },
];

const termDescriptions: Record<string, string> = {
  "Numero de carros": "Quantidade total de carros considerados na frota inicial da simulacao. Inclui carros disponiveis, carros ponte e carros que podem ficar parados.",
  "Carros ativos": "Carros realmente produtivos no mes depois de aplicar ocupacao e indisponibilidade. E a base para receita e suporte.",
  "Ocupacao da frota": "Percentual da frota que deve estar alugada ou em uso por motoristas. Se a ocupacao cai, a receita cai mesmo que a frota continue custando.",
  "Aluguel por carro": "Custo mensal pago para a locadora ou parceiro por cada carro da frota. E uma saida direta do DRE.",
  "Aluguel Localiza": "Prestacao mensal que a Libert Drive paga para a Localiza ou locadora parceira por cada carro alugado.",
  "Entrada para tirar o veiculo": "Valor medio que o motorista precisa dar para iniciar a esteira do carro proprio financiado. Hoje vem da media entre entrada minima e entrada maxima.",
  "Prestacao mensal motorista": "Parcela mensal que o motorista paga no financiamento do carro proprio.",
  "Telemetria por carro": "Custo mensal de rastreamento, dados, monitoramento e controle operacional por veiculo.",
  "Manutencao por carro": "Provisao mensal para revisao, pneus, pequenos reparos e desgaste operacional.",
  "Horas por dia": "Media de horas ativas por dia por motorista. Serve para escolher a faixa de quilometragem mensal esperada.",
  "Km por motorista": "Quilometragem media rodada por motorista no mes. Referencia operacional: 6h/dia tende a 2.500-3.500 km, 8h/dia a 3.500-5.000 km e 10-12h/dia a 5.000-6.500 km.",
  "6h/dia": "Perfil moderado de operacao, usando media de 3.000 km/mes por motorista.",
  "8h/dia": "Perfil base de operacao, usando media de 4.250 km/mes por motorista.",
  "10-12h/dia": "Perfil intenso de operacao, usando media de 5.750 km/mes por motorista.",
  "Franquia km/mes": "Quantidade de quilometros incluida no contrato mensal com a locadora antes de cobrar km excedente.",
  "Valor km excedente": "Valor estimado pago por km acima da franquia. Localiza e Movida variam por contrato e grupo tarifario, entao este campo precisa ser ajustado com a proposta real.",
  "Km excedente por motorista": "Diferenca entre km mensal rodado por motorista e franquia contratada. Se ficar negativo, a calculadora considera zero.",
  "Custo km excedente": "Saida mensal estimada por rodar acima da franquia: km excedente por motorista vezes carros ativos vezes valor por km.",
  "Carros parados": "Percentual da frota indisponivel por manutencao, atraso, sinistro, troca de motorista ou problema operacional.",
  "Conversao para posse": "Percentual dos contratos aprovados que entram na esteira de financiamento/posse do carro proprio.",
  "Entrada minima": "Menor entrada esperada do motorista no financiamento do carro proprio.",
  "Entrada maxima": "Maior entrada esperada do motorista no financiamento do carro proprio.",
  "Entrada media": "Media entre entrada minima e entrada maxima. Serve para estimar caixa de entrada por contrato financiado.",
  "Parcela mensal": "Valor mensal que o motorista paga no financiamento do carro proprio.",
  "Prazo parcelas": "Quantidade de meses do financiamento. No modelo atual, a referencia e 48 parcelas.",
  "Entrega do carro": "Tempo esperado entre o fechamento do financiamento e a entrega do carro proprio. Durante esse periodo, o motorista usa o carro ponte.",
  "Tamanho da leva": "Quantidade de carros ou contratos planejados por ciclo de expansao. No modelo, a referencia e lancar de 100 em 100.",
  "Cadencia da leva": "Intervalo entre uma leva e outra. Exemplo: 100 carros a cada 3 meses.",
  "Contratos pagando": "Numero de contratos de financiamento que ja estao pagando parcelas no mes simulado.",
  "% parcela Libert Drive": "Percentual da parcela de financiamento reconhecido como caixa da Libert Drive. Precisa ser validado juridica e contabilmente.",
  "Valor mensal": "Preco mensal cobrado do motorista pelo aluguel/uso do carro quando ele ainda nao esta no carro proprio financiado.",
  "Taxa de ativacao": "Valor cobrado na entrada operacional para cobrir onboarding, vistoria, entrega, analise e preparacao.",
  "Entrada/sinal": "Valor operacional de sinal ou reserva do contrato de locacao. Nao confundir com a entrada do financiamento.",
  "Receita adicional": "Receita complementar por motorista, como beneficios, recarga, parcerias, seguros, servicos ou upsells.",
  "Churn mensal": "Percentual de motoristas que saem da base a cada mes.",
  "Inadimplencia": "Percentual esperado de receita que atrasa ou nao e paga. Afeta caixa, provisao e risco.",
  "CPL": "Custo por lead. Quanto a midia precisa gastar para gerar um interessado.",
  "Midia mensal": "Investimento mensal em trafego pago e campanhas para gerar demanda.",
  "Lead para WhatsApp": "Percentual de leads que chegam a uma conversa comercial real.",
  "Comparecimento": "Percentual de interessados que aparecem na etapa combinada, como call, webinar, visita ou apresentacao.",
  "Aprovacao": "Percentual de aplicacoes aprovadas apos analise, credito, perfil e regras operacionais.",
  "Fechamento": "Percentual de aprovados que realmente fecham contrato.",
  "Leads por SDR": "Capacidade mensal de atendimento de um SDR. Define quantos SDRs sao necessarios.",
  "Oportunidades por closer": "Quantidade de oportunidades qualificadas que um closer consegue trabalhar no mes.",
  "Comissao por contrato": "Comissao variavel paga para vendas a cada contrato ativado.",
  "Tickets por motorista": "Media de chamados de suporte por motorista no mes.",
  "Carros por gestor": "Quantidade de carros que um gestor de frota consegue acompanhar com qualidade.",
  "Custo admin fixo": "Despesa fixa mensal de administracao que nao varia diretamente com cada carro.",
  "Interessados em consorcio": "Percentual da base com potencial interesse em consorcio, credito ou produto financeiro parceiro.",
  "Conversao consorcio": "Percentual dos interessados que converte no produto de consorcio/credito.",
  "Comissao consorcio": "Receita ou comissao media por contrato de consorcio convertido.",
  "Provisao de risco": "Percentual reservado para perdas, cancelamentos, credito, inadimplencia e risco financeiro.",
  "Imposto receita": "Percentual estimado de impostos e deducoes sobre a receita bruta.",
  "Caixa inicial": "Dinheiro disponivel antes do mes simulado. Serve para medir folego de caixa.",
  "Receita bruta": "Soma de receitas antes de impostos, deducoes e custos: aluguel, ativacao, entradas, financiamento e receitas complementares.",
  "Receita recorrente aluguel": "Receita mensal vinda do aluguel/uso da frota, sem incluir parcelas de financiamento.",
  "Receita recorrente": "Receita mensal repetida. Nesta calculadora, separe o aluguel das parcelas de financiamento para enxergar a origem do caixa.",
  "Receita de ativacao": "Receita de taxas cobradas quando um contrato e ativado.",
  "Entradas operacionais": "Sinais e entradas ligadas ao contrato operacional de locacao, sem incluir entrada do financiamento.",
  "Entradas financiamento": "Caixa vindo da entrada do financiamento do carro proprio.",
  "Parcelas financiamento": "Dinheiro vindo das parcelas mensais do financiamento do carro proprio.",
  "Receita complementar": "Receitas extras por motorista, consorcio, parceiros, energia, servicos ou produtos adicionais.",
  "Deducoes e impostos": "Impostos e deducoes calculados sobre a receita bruta. Aparecem como saida negativa no DRE.",
  "Custo direto + provisoes": "Custo de frota, energia quando aplicavel, manutencao, incidentes, inadimplencia, churn e provisoes de risco.",
  Marketing: "Soma de midia, producao de lancamento, ferramentas e agencia.",
  Vendas: "Custo do time comercial, gestor de vendas e comissoes.",
  "Suporte e operacao": "Custo do time de suporte, gestores de frota, operadores, analistas de credito, cobranca e recuperacao.",
  "Administrativo, tech e compliance": "Custos fixos de administracao, tecnologia, legal, compliance e estrutura.",
  "Lucro liquido estimado": "Resultado final estimado depois de custos, despesas e imposto sobre lucro.",
  "DRE mensal": "Demonstrativo de Resultado do mes. Mostra receitas, saidas, EBITDA e lucro estimado.",
  "DRE projetada": "Projecao do Demonstrativo de Resultado para frente, usando as premissas atuais da calculadora.",
  "12 meses, mes a mes": "Visao dos proximos 12 meses, com rampa da frota, carro ponte por 3 meses e carteira de parcelas crescendo a cada leva.",
  Mes: "Mes da projecao. M1 e o primeiro mes projetado, M6 e o sexto.",
  Carros: "Quantidade de carros ativos estimada naquele mes.",
  Ponte: "Carros ponte em uso por motoristas que aguardam o carro proprio financiado.",
  Receita: "Receita bruta total do mes projetado.",
  "Financ.": "Caixa vindo do financiamento: entradas do financiamento mais parcelas mensais pagas.",
  Saidas: "Custos e despesas do mes. Aparecem negativos porque reduzem o resultado.",
  EBITDA: "Resultado operacional antes de juros, impostos, depreciacao e amortizacao. Mostra se a operacao para de pe antes de efeitos financeiros/contabeis.",
  Lucro: "Lucro liquido estimado depois dos impostos sobre resultado.",
  Caixa: "Caixa acumulado apos o resultado do mes projetado.",
  "Novos contratos de posse/mes": "Quantidade estimada de novos motoristas que entram por mes na esteira de financiamento/posse.",
  "Carros ponte em uso": "Carros da frota usados temporariamente por motoristas enquanto o carro proprio financiado nao e entregue.",
  "Carros em aluguel puro": "Carros ativos que continuam gerando receita pelo aluguel tradicional, sem estarem alocados como carro ponte.",
  "Caixa de entrada/mes": "Valor mensal vindo das entradas de financiamento dos novos contratos de posse.",
  "Caixa por leva de 100": "Caixa potencial quando uma leva completa de 100 contratos paga a entrada media do financiamento.",
  "Contratos pagando parcela": "Quantidade de contratos de financiamento gerando parcela mensal.",
  "Entregas potenciais/ano": "Quantidade anual estimada de carros proprios entregues aos motoristas pela esteira.",
  "Carros liberados por ciclo": "Carros ponte que retornam para a frota quando o carro proprio do motorista e entregue.",
  Leads: "Interessados gerados pela midia.",
  WhatsApp: "Leads que viram conversa no WhatsApp ou canal comercial.",
  Webinar: "Pessoas que chegam a apresentacao, call, visita ou etapa educativa.",
  Aplicacoes: "Pessoas que submetem dados para analise de perfil, credito ou aprovacao.",
  Aprovados: "Aplicacoes aprovadas pela regra comercial, operacional e de credito.",
  Ativados: "Contratos que realmente entram em operacao.",
  SDRs: "Quantidade estimada de pre-vendedores necessarios para atender os leads.",
  Closers: "Quantidade estimada de vendedores de fechamento necessarios.",
  Suporte: "Quantidade estimada de agentes de suporte.",
  "Gestores frota": "Quantidade estimada de gestores para cuidar da frota.",
  Operadores: "Quantidade estimada de pessoas para entrega, recolhimento e rotina operacional.",
  "Analistas credito": "Quantidade estimada de analistas para avaliar aplicacoes e credito.",
  "Receita por carro ativo": "Receita mensal media gerada por cada carro ativo.",
  "Contribuicao por carro": "Margem mensal media por carro apos custos diretos e provisoes.",
  "Break-even carros": "Quantidade de carros ativos necessaria para cobrir despesas fixas e chegar no ponto de equilibrio.",
  "CAC total": "Custo total de aquisicao por cliente, somando marketing e vendas dividido pelos contratos ativados.",
  LTV: "Lifetime Value. Valor economico estimado de um motorista durante o tempo medio de contrato.",
  "LTV/CAC": "Relacao entre valor do cliente e custo de aquisicao. Exemplo: 3x significa que o cliente gera tres vezes o custo para adquiri-lo.",
  "Payback CAC": "Tempo estimado para recuperar o CAC com a margem gerada pelo motorista.",
  "Midia para ocupar frota": "Investimento de midia estimado para gerar contratos suficientes para ocupar a frota.",
  "Caixa financiamento": "Caixa vindo especificamente do financiamento: entrada media dos novos contratos mais parcelas da carteira.",
};

type NumericPath =
  | ["fleet", keyof CalculatorAssumptions["fleet"]]
  | ["offer", keyof CalculatorAssumptions["offer"]]
  | ["marketing", keyof CalculatorAssumptions["marketing"]]
  | ["sales", keyof CalculatorAssumptions["sales"]]
  | ["operations", keyof CalculatorAssumptions["operations"]]
  | ["credit", keyof CalculatorAssumptions["credit"]]
  | ["financing", keyof CalculatorAssumptions["financing"]]
  | ["taxes", keyof CalculatorAssumptions["taxes"]];

function updateNumber(state: CalculatorAssumptions, [section, key]: NumericPath, value: number): CalculatorAssumptions {
  return { ...state, [section]: { ...state[section], [key]: value } } as CalculatorAssumptions;
}

function Term({ label, className = "" }: { label: string; className?: string }) {
  const description = termDescriptions[label];
  if (!description) return <span className={className}>{label}</span>;

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span>{label}</span>
      <span tabIndex={0} title={description} className="group relative inline-grid size-4 shrink-0 cursor-help place-items-center rounded-full border border-[var(--primary)]/45 text-[var(--primary)] outline-none transition hover:border-[var(--primary)] hover:bg-[var(--primary)]/10 focus:border-[var(--primary)] focus:bg-[var(--primary)]/10">
        <Info className="size-3" aria-hidden="true" />
        <span className="sr-only">Explicacao de {label}</span>
        <span
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-72 max-w-[min(80vw,22rem)] -translate-x-1/2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-left text-xs font-bold normal-case leading-5 tracking-normal text-[var(--foreground)] opacity-0 shadow-2xl shadow-black/35 transition group-hover:opacity-100 group-focus:opacity-100"
        >
          {description}
        </span>
      </span>
    </span>
  );
}

function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  tone = "default",
  amount,
}: {
  label: string;
  value: string;
  note: string;
  icon: typeof Gauge;
  tone?: "default" | "financing";
  amount?: number;
}) {
  const valueTone = tone === "financing" ? financingTone : typeof amount === "number" && amount < 0 ? "text-red-400" : "";
  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--card-strong)] p-4">
      <div className="mb-5 flex items-center justify-between gap-3">
        <Icon className={`size-5 ${tone === "financing" ? financingTone : "text-[var(--primary)]"}`} />
        <span className={`rounded-md px-2 py-1 text-[10px] font-black uppercase ${tone === "financing" ? "bg-amber-400/10 text-amber-300" : "bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)]"}`}>
          mensal
        </span>
      </div>
      <p className="muted text-[11px] font-black uppercase tracking-[0.12em]"><Term label={label} /></p>
      <p className={`mt-1 text-2xl font-black ${valueTone}`}>{value}</p>
      <p className="muted mt-2 text-xs leading-relaxed">{note}</p>
    </article>
  );
}

function Field({
  label,
  path,
  value,
  min,
  max,
  step = 1,
  suffix,
  format = "number",
  onChange,
}: {
  label: string;
  path: NumericPath;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  format?: "number" | "money" | "moneyPrecise" | "percent";
  onChange: (path: NumericPath, value: number) => void;
}) {
  const display =
    format === "money"
      ? money.format(value)
      : format === "moneyPrecise"
        ? moneyPrecise.format(value)
        : format === "percent"
          ? percent.format(value)
          : `${number.format(value)}${suffix ? ` ${suffix}` : ""}`;
  return (
    <label className="block rounded-lg border border-[var(--border)] bg-[var(--muted)] p-3">
      <span className="flex items-center justify-between gap-3 text-xs font-black">
        <Term label={label} />
        <span className="text-[var(--primary)]">{display}</span>
      </span>
      <input
        className="mt-3 w-full accent-[var(--primary)]"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(path, Number(event.target.value))}
      />
    </label>
  );
}

function DirectMoneyCard({
  label,
  value,
  min,
  max,
  step,
  tone = "default",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  tone?: "default" | "financing";
  onChange: (value: number) => void;
}) {
  const isFinancing = tone === "financing";
  return (
    <label className={`block rounded-lg border p-4 ${isFinancing ? "border-amber-300/20 bg-amber-300/10" : "border-transparent bg-[var(--muted)]"}`}>
      <span className="flex items-center gap-2 text-2xl font-black">
        <span>R$</span>
        <input
          aria-label={label}
          className="min-w-0 flex-1 bg-transparent text-2xl font-black outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          value={Math.round(value)}
          onChange={(event) => onChange(Number(event.target.value || 0))}
        />
      </span>
      <span className={`mt-1 block text-xs font-black ${isFinancing ? "text-amber-300" : "text-[var(--muted-foreground)]"}`}>
        <Term label={label} />
      </span>
    </label>
  );
}

function ResultRow({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "financing" }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] py-3 last:border-b-0">
      <span className="muted text-sm"><Term label={label} /></span>
      <span className={`text-right text-sm font-black ${tone === "financing" ? financingTone : ""}`}>{value}</span>
    </div>
  );
}

function FinancialValue({ amount, tone = "auto" }: { amount: number; tone?: "auto" | "financing" }) {
  const toneClass = tone === "financing" ? financingTone : amount < 0 ? "text-red-400" : amount > 0 ? "text-sky-400" : "text-[var(--muted-foreground)]";
  return <span className={`text-right text-sm font-black ${toneClass}`}>{money.format(amount)}</span>;
}

function MoneyRow({ label, amount, tone = "auto" }: { label: string; amount: number; tone?: "auto" | "financing" }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] py-3 last:border-b-0">
      <span className="muted text-sm"><Term label={label} /></span>
      <FinancialValue amount={amount} tone={tone} />
    </div>
  );
}

function csvDownload(input: CalculatorAssumptions, results: CalculatorResults) {
  const rows = flattenResultsForCsv(input, results);
  const csv = ["metric,value", ...rows.map(([key, value]) => `${key},${value}`)].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `libert-drive-${input.scenario}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function LibertCalculator() {
  const [assumptions, setAssumptions] = useState<CalculatorAssumptions>(defaultAssumptions);
  const results = useMemo(() => calculateLibertDrive(assumptions), [assumptions]);
  const rentalRecurringRevenue = results.dre.recurringRevenue - results.financing.installmentRevenue;
  const operationalEntryRevenue = results.dre.entryRevenue - results.financing.downPaymentCash;

  function onScenarioChange(scenario: ScenarioId) {
    setAssumptions(getScenarioAssumptions(scenario));
  }

  function onFieldChange(path: NumericPath, value: number) {
    setAssumptions((current) => updateNumber(current, path, value));
  }

  function onAverageDownPaymentChange(value: number) {
    setAssumptions((current) => {
      const cleanValue = Math.max(0, value);
      const currentSpread = Math.max(0, (current.financing.downPaymentMax - current.financing.downPaymentMin) / 2);
      const spread = Math.min(cleanValue, currentSpread);

      return {
        ...current,
        financing: {
          ...current.financing,
          downPaymentMin: cleanValue - spread,
          downPaymentMax: cleanValue + spread,
        },
      };
    });
  }

  function applyMileageProfile(profile: (typeof mileageProfiles)[number]) {
    setAssumptions((current) => ({
      ...current,
      fleet: {
        ...current.fleet,
        driverHoursPerDay: profile.hours,
        monthlyKmPerDriver: profile.km,
      },
    }));
  }

  return (
    <div className="space-y-6">
      <header className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <section className="panel overflow-hidden p-6 sm:p-8">
          <p className="kicker">Libert Drive // Calculadora executiva</p>
          <h1 className="page-title mt-4 max-w-5xl">A matematica da frota, energia, credito e operacao.</h1>
          <p className="muted mt-5 max-w-3xl text-base leading-8">
            Simule a operacao de 100 BYD Dolphin Mini, funil de lancamento, carro ponte, financiamento em 48 parcelas, equipe, suporte, telemetria, Libert Energy e receitas complementares.
          </p>
          <div className="mt-7">
            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-[var(--muted-foreground)]">Regua de cenarios</p>
            <div className="grid gap-2 sm:grid-cols-5">
              {(Object.keys(scenarioLabels) as ScenarioId[]).map((scenario, index) => (
                <button
                  key={scenario}
                  className={`min-h-11 rounded-lg border px-3 text-xs font-black transition ${
                    assumptions.scenario === scenario
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--card-strong)] hover:border-[var(--primary)]/55"
                  }`}
                  onClick={() => onScenarioChange(scenario)}
                >
                  <span className="mb-1 block text-[10px] opacity-70">0{index + 1}</span>
                  {scenarioLabels[scenario]}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--border)] px-4 text-sm font-black"
              onClick={() => csvDownload(assumptions, results)}
            >
              <Download className="size-4" />
              CSV
            </button>
          </div>
        </section>
        <section className="panel grid content-between gap-4 p-6">
          <div>
            <p className="kicker">Esteira de alavancagem</p>
            <h2 className="mt-3 text-2xl font-black">100 carros a cada 3 meses.</h2>
            <p className="muted mt-3 text-sm leading-7">
              O motorista usa o carro ponte enquanto o carro proprio e entregue. Quando o carro chega, a frota ponte volta para a Libert Drive e alimenta a proxima leva.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
            <DirectMoneyCard label="Entrada para tirar o veiculo" value={results.financing.averageDownPayment} min={0} max={70000} step={500} tone="financing" onChange={onAverageDownPaymentChange} />
            <DirectMoneyCard label="Prestacao mensal motorista" value={assumptions.financing.monthlyInstallment} min={500} max={4000} step={50} tone="financing" onChange={(value) => onFieldChange(["financing", "monthlyInstallment"], value)} />
            <DirectMoneyCard label="Aluguel Localiza" value={assumptions.fleet.monthlyVehicleRental} min={1800} max={6000} step={10} onChange={(value) => onFieldChange(["fleet", "monthlyVehicleRental"], value)} />
          </div>
        </section>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={Car} label="Carros ativos" value={`${results.fleet.activeCars}/${assumptions.fleet.totalCars}`} note={`${results.fleet.inactiveCars} parados ou indisponiveis`} />
        <MetricCard icon={CircleDollarSign} label="Receita bruta" value={money.format(results.dre.grossRevenue)} note="recorrencia, ativacao, entrada e complementares" />
        <MetricCard icon={LineChart} label="EBITDA" value={money.format(results.dre.ebitda)} note={`${percent.format(results.unit.ebitdaMargin)} sobre receita liquida`} amount={results.dre.ebitda} />
        <MetricCard icon={Zap} label="Caixa financiamento" value={money.format(results.financing.downPaymentCash + results.financing.installmentRevenue)} note="entrada media + parcelas da carteira" tone="financing" />
        <MetricCard icon={Gauge} label="Custo km excedente" value={money.format(results.fleet.extraKmCost)} note={`${number.format(results.fleet.extraKmPerDriver)} km excedentes por motorista`} amount={-results.fleet.extraKmCost} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[.95fr_1.05fr]">
        <div className="space-y-6">
          <section className="panel p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="kicker">Bloco 1</p>
                <h2 className="mt-1 text-xl font-black">Frota</h2>
              </div>
              <Car className="size-5 text-[var(--primary)]" />
            </div>
            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              {mileageProfiles.map((profile) => {
                const isActive = assumptions.fleet.driverHoursPerDay === profile.hours && assumptions.fleet.monthlyKmPerDriver === profile.km;
                return (
                  <button
                    key={profile.label}
                    className={`rounded-lg border p-3 text-left transition ${
                      isActive
                        ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_14%,transparent)]"
                        : "border-[var(--border)] bg-[var(--muted)] hover:border-[var(--primary)]/60"
                    }`}
                    onClick={() => applyMileageProfile(profile)}
                  >
                    <p className="text-sm font-black"><Term label={profile.label} /></p>
                    <p className="muted mt-1 text-xs font-bold">{profile.range}</p>
                    <p className="mt-2 text-xs font-black text-[var(--primary)]">{number.format(profile.km)} km usados</p>
                  </button>
                );
              })}
            </div>
            <div className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-3 text-xs font-bold leading-6 text-[var(--muted-foreground)]">
              Referencia operacional: Zarp indica faixas por horas/dia. Localiza e Movida tratam km excedente como valor de contrato/grupo tarifario, entao a franquia e o valor por km ficam editaveis.
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Numero de carros" path={["fleet", "totalCars"]} value={assumptions.fleet.totalCars} min={1} max={500} onChange={onFieldChange} />
              <Field label="Ocupacao da frota" path={["fleet", "occupancyRate"]} value={assumptions.fleet.occupancyRate} min={0.1} max={1} step={0.01} format="percent" onChange={onFieldChange} />
              <Field label="Aluguel Localiza" path={["fleet", "monthlyVehicleRental"]} value={assumptions.fleet.monthlyVehicleRental} min={1800} max={6000} step={10} format="money" onChange={onFieldChange} />
              <Field label="Telemetria por carro" path={["fleet", "telemetryPerCar"]} value={assumptions.fleet.telemetryPerCar} min={0} max={400} format="money" onChange={onFieldChange} />
              <Field label="Manutencao por carro" path={["fleet", "maintenancePerCar"]} value={assumptions.fleet.maintenancePerCar} min={0} max={800} format="money" onChange={onFieldChange} />
              <Field label="Horas por dia" path={["fleet", "driverHoursPerDay"]} value={assumptions.fleet.driverHoursPerDay} min={4} max={14} step={0.5} suffix="h" onChange={onFieldChange} />
              <Field label="Km por motorista" path={["fleet", "monthlyKmPerDriver"]} value={assumptions.fleet.monthlyKmPerDriver} min={500} max={8000} step={50} suffix="km" onChange={onFieldChange} />
              <Field label="Franquia km/mes" path={["fleet", "monthlyKmAllowance"]} value={assumptions.fleet.monthlyKmAllowance} min={1000} max={10000} step={250} suffix="km" onChange={onFieldChange} />
              <Field label="Valor km excedente" path={["fleet", "extraKmFee"]} value={assumptions.fleet.extraKmFee} min={0} max={3} step={0.05} format="moneyPrecise" onChange={onFieldChange} />
              <Field label="Carros parados" path={["fleet", "downtimeRate"]} value={assumptions.fleet.downtimeRate} min={0} max={0.3} step={0.01} format="percent" onChange={onFieldChange} />
            </div>
          </section>

          <section className="panel p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="kicker">Bloco novo</p>
                <h2 className="mt-1 text-xl font-black">Esteira de posse e financiamento</h2>
              </div>
              <Zap className="size-5 text-[var(--primary)]" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Conversao para posse" path={["financing", "ownershipConversionRate"]} value={assumptions.financing.ownershipConversionRate} min={0} max={1} step={0.01} format="percent" onChange={onFieldChange} />
              <Field label="Entrada minima" path={["financing", "downPaymentMin"]} value={assumptions.financing.downPaymentMin} min={0} max={50000} step={1000} format="money" onChange={onFieldChange} />
              <Field label="Entrada maxima" path={["financing", "downPaymentMax"]} value={assumptions.financing.downPaymentMax} min={0} max={70000} step={1000} format="money" onChange={onFieldChange} />
              <Field label="Prestacao mensal motorista" path={["financing", "monthlyInstallment"]} value={assumptions.financing.monthlyInstallment} min={500} max={4000} step={50} format="money" onChange={onFieldChange} />
              <Field label="Prazo parcelas" path={["financing", "installmentTermMonths"]} value={assumptions.financing.installmentTermMonths} min={12} max={84} step={1} suffix="meses" onChange={onFieldChange} />
              <Field label="Entrega do carro" path={["financing", "deliveryLeadMonths"]} value={assumptions.financing.deliveryLeadMonths} min={1} max={8} step={1} suffix="meses" onChange={onFieldChange} />
              <Field label="Tamanho da leva" path={["financing", "cohortSize"]} value={assumptions.financing.cohortSize} min={10} max={300} step={10} onChange={onFieldChange} />
              <Field label="Cadencia da leva" path={["financing", "cohortCadenceMonths"]} value={assumptions.financing.cohortCadenceMonths} min={1} max={6} step={1} suffix="meses" onChange={onFieldChange} />
              <Field label="Contratos pagando" path={["financing", "activeInstallmentContracts"]} value={assumptions.financing.activeInstallmentContracts} min={0} max={3000} step={25} onChange={onFieldChange} />
              <Field label="% parcela Libert Drive" path={["financing", "retainedInstallmentRate"]} value={assumptions.financing.retainedInstallmentRate} min={0} max={1} step={0.05} format="percent" onChange={onFieldChange} />
            </div>
          </section>

          <section className="panel p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="kicker">Bloco 2</p>
                <h2 className="mt-1 text-xl font-black">Oferta ao motorista</h2>
              </div>
              <BatteryCharging className="size-5 text-[var(--primary)]" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Valor mensal" path={["offer", "monthlyPrice"]} value={assumptions.offer.monthlyPrice} min={2500} max={6500} step={50} format="money" onChange={onFieldChange} />
              <Field label="Taxa de ativacao" path={["offer", "activationFee"]} value={assumptions.offer.activationFee} min={0} max={2500} step={50} format="money" onChange={onFieldChange} />
              <Field label="Entrada/sinal" path={["offer", "entryFee"]} value={assumptions.offer.entryFee} min={0} max={6000} step={100} format="money" onChange={onFieldChange} />
              <Field label="Receita adicional" path={["offer", "additionalRevenuePerDriver"]} value={assumptions.offer.additionalRevenuePerDriver} min={0} max={800} step={10} format="money" onChange={onFieldChange} />
              <Field label="Churn mensal" path={["offer", "churnRate"]} value={assumptions.offer.churnRate} min={0} max={0.25} step={0.005} format="percent" onChange={onFieldChange} />
              <Field label="Inadimplencia" path={["offer", "defaultRate"]} value={assumptions.offer.defaultRate} min={0} max={0.25} step={0.005} format="percent" onChange={onFieldChange} />
            </div>
          </section>

          <section className="panel p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="kicker">Bloco 3</p>
                <h2 className="mt-1 text-xl font-black">Marketing e lancamento</h2>
              </div>
              <LineChart className="size-5 text-[var(--primary)]" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="CPL" path={["marketing", "cpl"]} value={assumptions.marketing.cpl} min={0.5} max={120} step={0.5} format="money" onChange={onFieldChange} />
              <Field label="Midia mensal" path={["marketing", "monthlyMediaSpend"]} value={assumptions.marketing.monthlyMediaSpend} min={1000} max={250000} step={1000} format="money" onChange={onFieldChange} />
              <Field label="Lead para WhatsApp" path={["marketing", "leadToWhatsappRate"]} value={assumptions.marketing.leadToWhatsappRate} min={0.1} max={1} step={0.01} format="percent" onChange={onFieldChange} />
              <Field label="Comparecimento" path={["marketing", "attendanceRate"]} value={assumptions.marketing.attendanceRate} min={0.1} max={1} step={0.01} format="percent" onChange={onFieldChange} />
              <Field label="Aprovacao" path={["marketing", "approvalRate"]} value={assumptions.marketing.approvalRate} min={0.05} max={0.9} step={0.01} format="percent" onChange={onFieldChange} />
              <Field label="Fechamento" path={["marketing", "closeRate"]} value={assumptions.marketing.closeRate} min={0.05} max={0.9} step={0.01} format="percent" onChange={onFieldChange} />
            </div>
          </section>

          <section className="panel p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="kicker">Blocos 4 e 5</p>
                <h2 className="mt-1 text-xl font-black">Vendas, suporte e operacao</h2>
              </div>
              <Users className="size-5 text-[var(--primary)]" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Leads por SDR" path={["sales", "leadsPerSdr"]} value={assumptions.sales.leadsPerSdr} min={100} max={2000} step={50} onChange={onFieldChange} />
              <Field label="Oportunidades por closer" path={["sales", "opportunitiesPerCloser"]} value={assumptions.sales.opportunitiesPerCloser} min={20} max={250} step={5} onChange={onFieldChange} />
              <Field label="Comissao por contrato" path={["sales", "commissionPerContract"]} value={assumptions.sales.commissionPerContract} min={0} max={1500} step={50} format="money" onChange={onFieldChange} />
              <Field label="Tickets por motorista" path={["operations", "ticketsPerDriver"]} value={assumptions.operations.ticketsPerDriver} min={0.2} max={8} step={0.1} onChange={onFieldChange} />
              <Field label="Carros por gestor" path={["operations", "carsPerFleetManager"]} value={assumptions.operations.carsPerFleetManager} min={10} max={120} step={5} onChange={onFieldChange} />
              <Field label="Custo admin fixo" path={["operations", "fixedAdminCost"]} value={assumptions.operations.fixedAdminCost} min={0} max={80000} step={1000} format="money" onChange={onFieldChange} />
            </div>
          </section>

          <section className="panel p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="kicker">Blocos 6 e 7</p>
                <h2 className="mt-1 text-xl font-black">Credito, consorcio, impostos e caixa</h2>
              </div>
              <CircleDollarSign className="size-5 text-[var(--primary)]" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Interessados em consorcio" path={["credit", "consortiumInterestRate"]} value={assumptions.credit.consortiumInterestRate} min={0} max={0.8} step={0.01} format="percent" onChange={onFieldChange} />
              <Field label="Conversao consorcio" path={["credit", "consortiumConversionRate"]} value={assumptions.credit.consortiumConversionRate} min={0} max={0.7} step={0.01} format="percent" onChange={onFieldChange} />
              <Field label="Comissao consorcio" path={["credit", "consortiumCommission"]} value={assumptions.credit.consortiumCommission} min={0} max={5000} step={100} format="money" onChange={onFieldChange} />
              <Field label="Provisao de risco" path={["credit", "riskProvisionRate"]} value={assumptions.credit.riskProvisionRate} min={0} max={0.25} step={0.005} format="percent" onChange={onFieldChange} />
              <Field label="Imposto receita" path={["taxes", "revenueTaxRate"]} value={assumptions.taxes.revenueTaxRate} min={0} max={0.25} step={0.005} format="percent" onChange={onFieldChange} />
              <Field label="Caixa inicial" path={["taxes", "initialCash"]} value={assumptions.taxes.initialCash} min={0} max={1000000} step={10000} format="money" onChange={onFieldChange} />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="panel p-5">
            <p className="kicker"><Term label="DRE mensal" /></p>
            <h2 className="mt-1 text-xl font-black">Resultado consolidado</h2>
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-black text-amber-300">
              <span className="size-2 rounded-full bg-amber-300" />
              Valores em amarelo vêm de entrada ou parcela do financiamento.
            </div>
            <div className="mt-5">
              <MoneyRow label="Receita recorrente aluguel" amount={rentalRecurringRevenue} />
              <MoneyRow label="Receita de ativacao" amount={results.dre.activationRevenue} />
              <MoneyRow label="Entradas operacionais" amount={operationalEntryRevenue} />
              <MoneyRow label="Entradas financiamento" amount={results.financing.downPaymentCash} tone="financing" />
              <MoneyRow label="Parcelas financiamento" amount={results.financing.installmentRevenue} tone="financing" />
              <MoneyRow label="Receita complementar" amount={results.dre.complementaryRevenue} />
              <MoneyRow label="Deducoes e impostos" amount={-results.dre.deductions} />
              <MoneyRow label="Custo km excedente" amount={-results.fleet.extraKmCost} />
              <MoneyRow label="Custo direto + provisoes" amount={-(results.dre.directCosts - results.fleet.extraKmCost)} />
              <MoneyRow label="Marketing" amount={-results.dre.marketingCost} />
              <MoneyRow label="Vendas" amount={-results.dre.salesCost} />
              <MoneyRow label="Suporte e operacao" amount={-results.dre.supportOpsCost} />
              <MoneyRow label="Administrativo, tech e compliance" amount={-results.dre.adminCost} />
              <MoneyRow label="Lucro liquido estimado" amount={results.dre.netProfit} />
            </div>
          </section>

          <section className="panel p-5">
            <p className="kicker"><Term label="DRE projetada" /></p>
            <h2 className="mt-1 text-xl font-black"><Term label="12 meses, mes a mes" /></h2>
            <p className="muted mt-3 text-sm leading-6">
              Projecao com a esteira de 100 em 100, carro ponte por {assumptions.financing.deliveryLeadMonths} meses e carteira de parcelas crescendo a cada nova leva. Agora com mais 6 janelas, totalizando 12 meses.
            </p>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="text-[11px] font-black uppercase text-[var(--muted-foreground)]">
                  <tr className="border-b border-[var(--border)]">
                    <th className="py-3 pr-4"><Term label="Mes" /></th>
                    <th className="py-3 pr-4"><Term label="Carros" /></th>
                    <th className="py-3 pr-4"><Term label="Ponte" /></th>
                    <th className="py-3 pr-4"><Term label="Receita" /></th>
                    <th className="py-3 pr-4"><Term label="Financ." /></th>
                    <th className="py-3 pr-4"><Term label="Saidas" /></th>
                    <th className="py-3 pr-4"><Term label="EBITDA" /></th>
                    <th className="py-3 pr-4"><Term label="Lucro" /></th>
                    <th className="py-3"><Term label="Caixa" /></th>
                  </tr>
                </thead>
                <tbody>
                  {results.projection.map((month) => {
                    const exits = -(month.directCosts + month.marketingCost + month.salesCost + month.supportOpsCost + month.adminCost);
                    return (
                      <tr key={month.month} className="border-b border-[var(--border)] last:border-b-0">
                        <td className="py-3 pr-4 font-black">M{month.month}</td>
                        <td className="py-3 pr-4">{number.format(month.activeCars)}</td>
                        <td className="py-3 pr-4">{number.format(month.bridgeCarsInUse)}</td>
                        <td className="py-3 pr-4"><FinancialValue amount={month.grossRevenue} /></td>
                        <td className="py-3 pr-4"><FinancialValue amount={month.financingCash} tone="financing" /></td>
                        <td className="py-3 pr-4"><FinancialValue amount={exits} /></td>
                        <td className="py-3 pr-4"><FinancialValue amount={month.ebitda} /></td>
                        <td className="py-3 pr-4"><FinancialValue amount={month.netProfit} /></td>
                        <td className="py-3"><FinancialValue amount={month.cashAfterMonth} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel p-5">
            <p className="kicker">Esteira 100 em 100</p>
            <h2 className="mt-1 text-xl font-black">Carro ponte vira alavanca</h2>
            <div className="mt-5">
              <ResultRow label="Novos contratos de posse/mes" value={number.format(results.financing.newOwnershipContracts)} />
              <ResultRow label="Carros ponte em uso" value={number.format(results.financing.bridgeCarsInUse)} />
              <ResultRow label="Carros em aluguel puro" value={number.format(results.financing.rentalOnlyCars)} />
              <ResultRow label="Entrada media" value={money.format(results.financing.averageDownPayment)} tone="financing" />
              <ResultRow label="Caixa de entrada/mes" value={money.format(results.financing.downPaymentCash)} tone="financing" />
              <ResultRow label="Caixa por leva de 100" value={money.format(results.financing.cycleDownPaymentCash)} tone="financing" />
              <ResultRow label="Contratos pagando parcela" value={number.format(results.financing.installmentContracts)} />
              <ResultRow label="Entregas potenciais/ano" value={number.format(results.financing.annualOwnershipDeliveries)} />
              <ResultRow label="Carros liberados por ciclo" value={number.format(results.financing.releasedCarsPerCycle)} />
              <ResultRow label="Km excedente por motorista" value={`${number.format(results.fleet.extraKmPerDriver)} km`} />
              <ResultRow label="Custo km excedente" value={money.format(results.fleet.extraKmCost)} />
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="panel p-5">
              <p className="kicker">Funil</p>
              <h2 className="mt-1 text-lg font-black">Contratos</h2>
              <div className="mt-4">
                <ResultRow label="Leads" value={number.format(results.funnel.leads)} />
                <ResultRow label="WhatsApp" value={number.format(results.funnel.whatsapp)} />
                <ResultRow label="Webinar" value={number.format(results.funnel.webinar)} />
                <ResultRow label="Aplicacoes" value={number.format(results.funnel.applications)} />
                <ResultRow label="Aprovados" value={number.format(results.funnel.approved)} />
                <ResultRow label="Ativados" value={number.format(results.funnel.activatedContracts)} />
              </div>
            </div>
            <div className="panel p-5">
              <p className="kicker">Equipe</p>
              <h2 className="mt-1 text-lg font-black">Capacidade</h2>
              <div className="mt-4">
                <ResultRow label="SDRs" value={number.format(results.team.sdrs)} />
                <ResultRow label="Closers" value={number.format(results.team.closers)} />
                <ResultRow label="Suporte" value={number.format(results.team.supportAgents)} />
                <ResultRow label="Gestores frota" value={number.format(results.team.fleetManagers)} />
                <ResultRow label="Operadores" value={number.format(results.team.operators)} />
                <ResultRow label="Analistas credito" value={number.format(results.team.creditAnalysts)} />
              </div>
            </div>
          </section>

          <section className="panel p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="kicker">Unit economics</p>
                <h2 className="mt-1 text-xl font-black">Por carro, motorista e aquisicao</h2>
              </div>
              <Users className="size-5 text-[var(--primary)]" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultRow label="Receita por carro ativo" value={money.format(results.unit.revenuePerActiveCar)} />
              <ResultRow label="Contribuicao por carro" value={money.format(results.unit.contributionPerCar)} />
              <ResultRow label="Break-even carros" value={results.unit.breakEvenCars ? number.format(results.unit.breakEvenCars) : "Sem margem positiva"} />
              <ResultRow label="CAC total" value={money.format(results.unit.cacTotal)} />
              <ResultRow label="LTV" value={money.format(results.unit.ltv)} />
              <ResultRow label="LTV/CAC" value={`${results.unit.ltvCac.toFixed(1)}x`} />
              <ResultRow label="Payback CAC" value={`${results.unit.paybackMonths.toFixed(1)} meses`} />
              <ResultRow label="Midia para ocupar frota" value={money.format(results.funnel.requiredMediaToFillFleet)} />
            </div>
          </section>

          <section className="panel p-5">
            <div className="mb-4 flex items-center gap-3">
              <AlertTriangle className="size-5 text-[var(--warning)]" />
              <div>
                <p className="kicker">Auditoria</p>
                <h2 className="text-xl font-black">Alertas de risco</h2>
              </div>
            </div>
            <div className="space-y-3">
              {results.alerts.map((alert) => (
                <div key={alert} className="rounded-lg border border-[color-mix(in_srgb,var(--warning)_30%,transparent)] bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] p-3 text-sm font-bold leading-6">
                  {alert}
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

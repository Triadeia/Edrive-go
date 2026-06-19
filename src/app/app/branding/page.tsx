import Image from "next/image";
import { brandingSections, forbiddenPhrases, recommendedPhrases } from "@/lib/brand-data";

const colors = [
  { name: "Preto Noturno", hex: "#0A0A0A", role: "Autoridade, eficiencia e base premium." },
  { name: "Roxo eDrive", hex: "#6F35FF", role: "Tecnologia, marca institucional e memorabilidade." },
  { name: "Verde Eletrico", hex: "#00C896", role: "Energia, lucro, recarga, vida e progresso." },
  { name: "Branco Eletrico", hex: "#F5F5F5", role: "Clareza, limpeza e zero combustivel." },
  { name: "Amarelo Relampago", hex: "#FFD700", role: "Urgencia, destaque e ativacao." },
  { name: "Cinza Asfalto", hex: "#3A3A3A", role: "Rua, realidade e trabalho diario." },
];

const values = [
  "Prova antes de promessa",
  "Motorista como empresario",
  "Tecnologia acessivel",
  "Comunidade como retencao",
  "Energia limpa com resultado financeiro",
  "Clareza radical no contrato e no calculo",
];

export default function BrandingPage() {
  return (
    <div className="space-y-6">
      <section className="panel rounded-lg p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            <p className="kicker">Branding Book</p>
            <h1 className="display-title mt-4 text-4xl font-bold leading-tight sm:text-5xl">O sistema de marca da eDrive Go.</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/62">
              Uma marca premium, eletrica, institucional e de rua. Forte o bastante para parecer infraestrutura; humana o bastante para falar com o motorista na linguagem dele.
            </p>
          </div>
          <div className="grid place-items-center rounded-lg border border-white/10 bg-white/[0.04] p-8">
            <Image src="/brand/logo-roxa.svg" width={250} height={84} alt="eDrive Go" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {brandingSections.map((section) => (
          <article key={section.title} className="soft-panel rounded-lg p-5">
            <section.icon className="size-6 text-electric" />
            <h2 className="mt-5 text-lg font-extrabold">{section.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/58">{section.body}</p>
            <div className="mt-4 space-y-2">
              {section.points.map((point) => (
                <p key={point} className="rounded-md bg-white/[0.04] px-3 py-2 text-xs font-bold text-white/62">{point}</p>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
        <article className="panel rounded-lg p-6">
          <p className="kicker">Missao, visao e valores</p>
          <h2 className="mt-4 text-2xl font-black">Ajudar motoristas a parar de financiar a ineficiencia.</h2>
          <p className="mt-4 text-sm leading-7 text-white/58">
            Missao: tornar a mobilidade eletrica economicamente acessivel para motoristas de app. Visao: ser a infraestrutura que acelera a transicao eletrica da mobilidade urbana brasileira. Personalidade: libertadora, calculada, confiante, premium e proxima.
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {values.map((value) => (
              <div key={value} className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm font-bold text-white/70">{value}</div>
            ))}
          </div>
        </article>

        <article className="panel rounded-lg p-6">
          <p className="kicker">Paleta oficial</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {colors.map((color) => (
              <div key={color.hex} className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
                <div className="h-20" style={{ backgroundColor: color.hex }} />
                <div className="p-4">
                  <p className="font-black">{color.name}</p>
                  <p className="mt-1 font-mono text-xs text-electric">{color.hex}</p>
                  <p className="mt-2 text-xs leading-relaxed text-white/50">{color.role}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="panel rounded-lg p-6">
          <p className="kicker">Identidade verbal recomendada</p>
          <div className="mt-5 space-y-3">
            {recommendedPhrases.map((phrase) => (
              <p key={phrase} className="rounded-lg border border-electric/20 bg-electric/10 p-4 text-sm font-black text-white">{phrase}</p>
            ))}
          </div>
        </article>
        <article className="panel rounded-lg p-6">
          <p className="kicker">Frases proibidas</p>
          <div className="mt-5 space-y-3">
            {forbiddenPhrases.map((phrase) => (
              <p key={phrase} className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm font-bold text-white/54">{phrase}</p>
            ))}
          </div>
        </article>
      </section>

      <section className="panel rounded-lg p-6">
        <p className="kicker">Tipografia, imagem e aplicacoes</p>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <h3 className="display-title text-3xl font-bold">Libre Baskerville</h3>
            <p className="mt-3 text-sm text-white/54">Usada para manifesto, declaracoes institucionais e frases de movimento.</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <h3 className="text-3xl font-black">Manrope</h3>
            <p className="mt-3 text-sm text-white/54">Usada para interface, cards, navegacao, dados e comunicacao objetiva.</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <h3 className="text-xl font-black">Direcao de imagem</h3>
            <p className="mt-3 text-sm leading-7 text-white/54">BYD em contexto urbano baiano, carregamento limpo, motorista real, painel sem gasolina, hub de energia e prova financeira. Nunca usar cenas genericas de SaaS.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  BadgeCheck,
  Ban,
  BatteryCharging,
  BookOpenText,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  Download,
  Eye,
  FileText,
  Flame,
  Gauge,
  LayoutDashboard,
  Megaphone,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import {
  brandSections,
  forbiddenPhrases,
  movementBeliefs,
  palette,
  primalElements,
  recommendedPhrases,
  visualAssets,
} from "@/lib/brand-data";
import { documents } from "@/lib/documents";

const brandNav = [
  ["Essencia", "essencia"],
  ["Logomarcas", "logomarcas"],
  ["Paleta", "paleta"],
  ["Construcao", "construcao"],
  ["Aplicacoes", "aplicacoes"],
  ["Voz", "voz"],
  ["Movimento", "movimento"],
  ["Uso correto", "uso"],
  ["Documentos", "documentos"],
] as const;

const logoFiles = [
  {
    title: "Icone roxo principal",
    src: "/brand/app-icon-normal.svg",
    file: "/brand/app-icon-normal.svg",
    format: "SVG",
    usage: "Pecas digitais, fundos claros, apresentacoes e telas institucionais.",
  },
  {
    title: "Icone branco",
    src: "/brand/icone-branco.svg",
    file: "/brand/icone-branco.svg",
    format: "SVG",
    usage: "Fundos escuros, cards premium, avatar e areas com alto contraste.",
  },
  {
    title: "Icone preto",
    src: "/brand/icone-preto.svg",
    file: "/brand/icone-preto.svg",
    format: "SVG",
    usage: "Documentos, telas claras, assinatura compacta e aplicacoes neutras.",
  },
  {
    title: "App icon motorista",
    src: "/brand/app-icon-motorista.svg",
    file: "/brand/app-icon-motorista.svg",
    format: "SVG",
    usage: "Interface voltada ao motorista, atalhos mobile e comunicacao de produto.",
  },
  {
    title: "App icon normal",
    src: "/brand/app-icon-normal.svg",
    file: "/brand/app-icon-normal.svg",
    format: "SVG",
    usage: "Favicon, app icon, assinatura de sistema e superficies digitais.",
  },
];

const essenceCards = [
  {
    icon: Zap,
    title: "Essencia",
    text: "Acesso eletrico, economia mensuravel e liberdade operacional para o motorista de aplicativo.",
  },
  {
    icon: ShieldCheck,
    title: "Personalidade",
    text: "Direta, tecnologica, corajosa, urbana e obsessiva por prova. A marca fala com numero, nao com promessa vazia.",
  },
  {
    icon: CircleDollarSign,
    title: "Promessa",
    text: "Tirar o motorista da dependencia da gasolina e colocar sua margem de volta no centro da decisao.",
  },
  {
    icon: Flame,
    title: "Movimento",
    text: "Os primeiros motoristas da nova geracao. Quem entra no eletrico deixa de aceitar o custo como destino.",
  },
];

const constructionRules = [
  ["Simbolo", "Raio, energia e mobilidade devem aparecer como sistema de acesso, nao como decoracao aleatoria."],
  ["Wordmark", "A assinatura Libert Drive precisa manter leitura rapida, contraste alto e presenca de marca digital."],
  ["Protecao", "Respeitar respiro minimo equivalente a altura do icone principal ao redor da marca."],
  ["Hierarquia", "Primeiro vem a tese: infraestrutura eletrica. Depois vem produto, frota, recarga e comunidade."],
];

const applicationCards = [
  {
    title: "Dashboard institucional",
    src: "/images/libert-dashboard.svg",
    text: "Interface densa, limpa e orientada a decisao. Deve parecer centro de comando de mobilidade eletrica.",
  },
  {
    title: "Motorista Livre",
    src: "/images/libert-driver.svg",
    text: "Imagem humana, urbana e profissional. O motorista aparece como protagonista, nao como publico vulneravel.",
  },
  {
    title: "Hub de recarga",
    src: "/images/libert-hub.svg",
    text: "A infraestrutura precisa ser visivel: cabo, energia, estacao, carro e contexto real de operacao.",
  },
];

const voiceRules = [
  "Perguntas diretas que fazem o motorista confrontar a propria conta.",
  "Numeros simples, comparacoes concretas e linguagem de margem.",
  "Tom de aliado forte: confronta a gasolina, nao humilha o motorista.",
  "Promessa sempre acompanhada de calculo, condicao ou prova.",
];

const dos = [
  "Usar Sora como tipografia unica do painel e das pecas digitais.",
  "Tratar roxo como memoria de marca e verde como energia, economia e acao.",
  "Mostrar carro eletrico, recarga, motorista e calculo sempre que possivel.",
  "Conectar Libert Drive e Libert Energy como sistema de entrada e fidelizacao.",
];

const donts = [
  "Chamar a Libert Drive de apenas uma locadora de carros.",
  "Usar visual generico de SaaS sem rua, carro, energia ou motorista.",
  "Prometer economia universal sem explicar perfil, uso e calculo.",
  "Diluir a marca em gradientes decorativos sem funcao narrativa.",
];

export default function MarcaPage() {
  const featuredDocs = documents.slice(0, 8);

  return (
    <article className="brandbook space-y-6">
      <nav className="brandbook-tabs" aria-label="Navegacao do brandbook">
        <Link href="/app/marca">Visao geral</Link>
        <Link href="/app/marca/diretorio">Diretorio</Link>
        {brandSections.map((section) => (
          <Link key={section.slug} href={`/app/marca/${section.slug}`}>
            {section.shortTitle}
          </Link>
        ))}
        <Link href="/app/movimento">Movimento</Link>
      </nav>

      <section className="brandbook-hero panel overflow-hidden">
        <div className="brandbook-hero-copy">
          <p className="brand-kicker">Guidelines oficiais / Libert Drive</p>
          <h1>Marca, movimento e infraestrutura eletrica.</h1>
          <p>
            Sistema vivo para usar a identidade da Libert Drive com consistencia: essencia, promessa,
            paleta, voz, logomarcas, aplicacoes, documentos e regras de uso.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#logomarcas" className="brandbook-button brandbook-button-primary">
              Baixar logomarcas <ArrowDownToLine className="size-4" />
            </a>
            <Link href="/app/movimento" className="brandbook-button">
              Abrir movimento <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
        <div className="brandbook-logo-stage" aria-label="Logo Libert Drive">
          <div className="brandbook-logo-card flex items-center justify-center gap-4">
            <Image src="/brand/app-icon-normal.svg" width={74} height={74} alt="" priority />
            <span className="text-3xl font-black text-[var(--primary)]">Libert Drive</span>
          </div>
          <div className="brandbook-signal">
            <BatteryCharging className="size-5" />
            <span>Libert Drive abre. Libert Energy fideliza.</span>
          </div>
        </div>
      </section>

      <nav className="brandbook-anchor-nav" aria-label="Navegacao das guidelines">
        {brandNav.map(([label, id]) => (
          <a key={id} href={`#${id}`}>
            {label}
          </a>
        ))}
      </nav>

      <section id="essencia" className="brandbook-section panel">
        <div className="brandbook-section-head">
          <p className="brand-kicker">Introducao a marca</p>
          <h2>A nova infraestrutura do motorista da nova geracao.</h2>
          <p>
            A Libert Drive nao deve ser percebida como locadora. Ela e a porta de entrada para uma
            nova equacao de trabalho: carro eletrico, recarga, economia, comunidade e retencao no
            ecossistema Libert Energy.
          </p>
        </div>
        <div className="brandbook-essence-grid">
          {essenceCards.map((card) => (
            <article key={card.title}>
              <card.icon className="size-6 text-[var(--primary)]" />
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="logomarcas" className="brandbook-section panel">
        <div className="brandbook-section-head brandbook-section-row">
          <div>
            <p className="brand-kicker">Area de logomarca</p>
            <h2>Arquivos oficiais prontos para tela, app e documento.</h2>
          </div>
          <a href="/brand/app-icon-normal.svg" download className="brandbook-button">
            Logo principal <Download className="size-4" />
          </a>
        </div>
        <div className="brandbook-logo-grid">
          {logoFiles.map((logo) => (
            <article key={logo.title}>
              <div className="brandbook-logo-preview">
                <Image src={logo.src} width={190} height={92} alt={logo.title} />
              </div>
              <div className="brandbook-logo-meta">
                <h3>{logo.title}</h3>
                <p>{logo.usage}</p>
                <a href={logo.file} download>
                  {logo.format} <ArrowDownToLine className="size-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="paleta" className="brandbook-section panel">
        <div className="brandbook-section-head">
          <p className="brand-kicker">Paleta cromatica</p>
          <h2>Preto, roxo e energia com funcao.</h2>
        </div>
        <div className="brandbook-color-grid">
          {palette.map((color) => (
            <article key={color.hex} style={{ "--swatch": color.hex } as CSSProperties}>
              <div />
              <h3>{color.name}</h3>
              <p className="brandbook-hex">{color.hex}</p>
              <p>{color.role}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="construcao" className="brandbook-section panel">
        <div className="brandbook-construction">
          <div>
            <p className="brand-kicker">Construcao do sistema</p>
            <h2>Movimento primeiro. Produto depois. Prova sempre.</h2>
            <p>
              A marca precisa organizar a narrativa em tres camadas: a dor da gasolina, a virada
              eletrica e a infraestrutura que sustenta a decisao no longo prazo.
            </p>
          </div>
          <div className="brandbook-rule-grid">
            {constructionRules.map(([title, text]) => (
              <article key={title}>
                <p>{title}</p>
                <span>{text}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="aplicacoes" className="brandbook-section panel">
        <div className="brandbook-section-head">
          <p className="brand-kicker">Aplicacao de marca</p>
          <h2>A identidade precisa mostrar infraestrutura, rua e calculo.</h2>
          <p>
            As imagens devem revelar o que a marca promete: carro eletrico em operacao, recarga
            acessivel, motorista real, painel de controle e economia visivel.
          </p>
        </div>
        <div className="brandbook-application-grid">
          {applicationCards.map((card) => (
            <article key={card.title}>
              <Image src={card.src} width={1200} height={760} alt={`Aplicacao de marca - ${card.title}`} />
              <div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="brandbook-visual-strip">
          {visualAssets.map((asset) => (
            <span key={asset.title}>{asset.title}</span>
          ))}
        </div>
      </section>

      <section id="voz" className="brandbook-section panel brandbook-voice">
        <div>
          <Megaphone className="size-7 text-[var(--primary)]" />
          <p className="brand-kicker">Identidade verbal</p>
          <h2>Direta, calculada e libertadora.</h2>
          <p>
            A voz da Libert Drive nao grita e nao floreia. Ela aponta o custo invisivel, mostra a
            conta e convida o motorista para uma decisao de margem.
          </p>
        </div>
        <div className="brandbook-voice-list">
          {voiceRules.map((rule) => (
            <p key={rule}>
              <CheckCircle2 className="size-4" />
              {rule}
            </p>
          ))}
        </div>
      </section>

      <section id="movimento" className="brandbook-section panel brandbook-movement">
        <Zap className="size-8 text-[var(--primary)]" />
        <blockquote>Voce trabalha para voce ou para a gasolina?</blockquote>
        <p>
          A Libert Drive nao vende apenas acesso a um carro. Ela instala uma nova identidade:
          Motorista Livre, alguem que mede custo, controla margem e deixa de aceitar a gasolina
          como destino profissional.
        </p>
        <div className="brandbook-movement-grid">
          {movementBeliefs.slice(0, 4).map((belief, index) => (
            <article key={belief}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{belief}</p>
            </article>
          ))}
        </div>
        <Link href="/app/movimento" className="brandbook-button brandbook-button-primary">
          Publicacao completa do movimento <ArrowRight className="size-4" />
        </Link>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="brandbook-section panel">
          <div className="brandbook-use-title">
            <BadgeCheck className="size-6 text-[var(--primary)]" />
            <h2>Faca</h2>
          </div>
          <div className="brandbook-use-list">
            {dos.map((item) => (
              <p key={item}>
                <CheckCircle2 className="size-4" />
                {item}
              </p>
            ))}
          </div>
        </div>
        <div id="uso" className="brandbook-section panel">
          <div className="brandbook-use-title">
            <Ban className="size-6 text-red-400" />
            <h2>Evite</h2>
          </div>
          <div className="brandbook-use-list">
            {donts.map((item) => (
              <p key={item}>
                <Ban className="size-4 text-red-400" />
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="brandbook-section panel">
        <div className="brandbook-section-head">
          <p className="brand-kicker">Frases de marca</p>
          <h2>O que a marca pode e nao pode dizer.</h2>
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="brandbook-phrase-list">
            {recommendedPhrases.map((phrase) => (
              <p key={phrase}>
                <CheckCircle2 className="size-4 text-[var(--primary)]" />
                {phrase}
              </p>
            ))}
          </div>
          <div className="brandbook-phrase-list">
            {forbiddenPhrases.map((phrase) => (
              <p key={phrase}>
                <Ban className="size-4 text-red-400" />
                {phrase}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="brandbook-section panel">
        <div className="brandbook-section-head">
          <p className="brand-kicker">Primal Branding</p>
          <h2>Os elementos que fazem a marca virar comunidade.</h2>
        </div>
        <div className="brandbook-primal-grid">
          {primalElements.map(([title, text]) => (
            <article key={title}>
              <Sparkles className="size-5 text-[var(--primary)]" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="documentos" className="brandbook-section panel">
        <div className="brandbook-section-head brandbook-section-row">
          <div>
            <p className="brand-kicker">Documentos publicados</p>
            <h2>Base estrategica clicavel do brandbook.</h2>
          </div>
          <Link href="/app/marca/documentos" className="brandbook-button">
            Biblioteca completa <FileText className="size-4" />
          </Link>
        </div>
        <div className="brandbook-doc-grid">
          {featuredDocs.map((document) => (
            <Link key={document.id} href={`/app/marca/documentos/${document.id}`}>
              <span>{document.category}</span>
              <h3>{document.title}</h3>
              <p>{document.description}</p>
              <ArrowRight className="size-4" />
            </Link>
          ))}
        </div>
      </section>

      <section className="brandbook-system-map panel">
        <article>
          <BookOpenText className="size-5" />
          <span>Brandbook</span>
        </article>
        <article>
          <Route className="size-5" />
          <span>Movimento</span>
        </article>
        <article>
          <Target className="size-5" />
          <span>Cliente ideal</span>
        </article>
        <article>
          <Gauge className="size-5" />
          <span>Dashboard</span>
        </article>
        <article>
          <LayoutDashboard className="size-5" />
          <span>Documentos</span>
        </article>
        <article>
          <Boxes className="size-5" />
          <span>Ecossistema</span>
        </article>
        <article>
          <Eye className="size-5" />
          <span>Prova visual</span>
        </article>
      </section>
    </article>
  );
}

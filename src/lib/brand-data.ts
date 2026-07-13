import {
  BadgeCheck,
  BatteryCharging,
  Calculator,
  BookOpenText,
  BrainCircuit,
  Car,
  Component,
  FileText,
  Flame,
  Gauge,
  ListTodo,
  Megaphone,
  Moon,
  Network,
  Palette,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  Users,
  Video,
  Zap,
} from "lucide-react";

export const navigation = [
  {
    label: "Operacao",
    items: [
      { href: "/app/dashboard", label: "Visao geral", icon: Gauge },
      { href: "/app/tarefas", label: "Tarefas", icon: ListTodo },
      { href: "/app/calculadora", label: "Calculadora", icon: Calculator },
      { href: "/app/edrive-go", label: "Central eDrive Go", icon: Network },
      { href: "/app/marca", label: "Brandbook eDrive Go", icon: BookOpenText },
      { href: "/app/movimento", label: "Movimento", icon: Megaphone },
      { href: "/app/marketing/maquina-geracao-videos-em-escala", label: "Marketing", icon: Video },
    ],
  },
  {
    label: "Inteligencia",
    items: [
      { href: "/app/inteligencia-cliente", label: "Cliente ideal", icon: BrainCircuit },
      { href: "/app/marca/documentos", label: "Documentos", icon: FileText },
      { href: "/app/marca/diretorio", label: "Diretorio", icon: Component },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/app/primal-branding", label: "Primal Branding", icon: Sparkles },
      { href: "/app/branding", label: "Guidelines", icon: Palette },
    ],
  },
];

export const themes = [
  { id: "night", label: "Noturno", icon: Moon },
  { id: "day", label: "Diario", icon: Sun },
  { id: "brand", label: "Marca", icon: Zap },
] as const;

export type ThemeId = (typeof themes)[number]["id"];

export const kpis = [
  { label: "Carregadores", value: "80+", note: "hub ultrarrapido integrado", icon: BatteryCharging, tone: "green" },
  { label: "Frota inicial", value: "110", note: "BYD Dolphin para motoristas", icon: Car, tone: "purple" },
  { label: "Mercado SAM", value: "42,5K", note: "motoristas qualificados Bahia", icon: Users, tone: "blue" },
  { label: "Documentos", value: "12", note: "publicados e clicaveis", icon: FileText, tone: "amber" },
];

export const dashboardPriorities = [
  { score: "01", title: "Reposicionar a marca como infraestrutura, nao locadora", project: "Brandbook", status: "Publicado", priority: "Alta" },
  { score: "02", title: "Transformar a Maldicao da Gasolina em eixo narrativo", project: "Movimento", status: "Publicado", priority: "Alta" },
  { score: "03", title: "Publicar documentos completos por pagina navegavel", project: "Acervo", status: "Publicado", priority: "Alta" },
  { score: "04", title: "Organizar ICPs, TAM/SAM/SOM e voz do motorista", project: "Inteligencia", status: "Publicado", priority: "Media" },
  { score: "05", title: "Publicar galeria oficial do eletroposto e do lançamento", project: "Visual", status: "Publicado", priority: "Media" },
];

export const dashboardHero = {
  src: "/images/edrive-go-official/entrega-chave-edrive-go.webp",
  alt: "Entrega oficial de um veiculo eletrico eDrive Go",
  width: 1672,
  height: 941,
};

export const brandSections = [
  {
    slug: "estrategia",
    group: "Marca",
    title: "Nao e locadora. E movimento.",
    shortTitle: "Estrategia",
    description: "Posicionamento, big idea, promessa, inimigo comum e diferenciacao da eDrive Go.",
    icon: ShieldCheck,
    chapters: [
      {
        id: "posicionamento",
        title: "A nova infraestrutura do motorista da nova geracao",
        lead: "A eDrive Go nao deve parecer apenas uma locadora. A marca deve se posicionar como acesso, energia, frota, comunidade e recorrencia para motoristas que querem controlar sua margem.",
        points: [
          { title: "Categoria", text: "Locacao inteligente de veiculos eletricos para motoristas de aplicativo." },
          { title: "Diferenca", text: "Acesso ao eletrico sem compra, conectado ao ecossistema eDrive Go Energy." },
          { title: "Promessa", text: "Parar de financiar a gasolina e trabalhar com custo previsivel." },
        ],
      },
      {
        id: "big-idea",
        title: "A Maldicao da Gasolina",
        lead: "A crenca de que combustivel fossil e custo inevitavel do trabalho de mobilidade. A eDrive Go quebra essa crenca com calculo, carro eletrico e comunidade.",
      },
    ],
  },
  {
    slug: "movimento",
    group: "Marca",
    title: "Motoristas Livres.",
    shortTitle: "Movimento",
    description: "Manifesto, rituais, comunidade, linguagem e jornada de pertencimento.",
    icon: Flame,
    chapters: [
      {
        id: "manifesto",
        title: "O motorista deixa de sobreviver para lucrar",
        lead: "A decisao eletrica nao e so troca de carro. E uma virada de identidade: de motorista que aceita o custo para empresario da propria mobilidade.",
        points: [
          { title: "Crenca", text: "Motorista de app e empresario." },
          { title: "Ritual", text: "A partir de hoje, voce nao abastece mais." },
          { title: "Prova", text: "O Calculo da Virada todos os meses." },
        ],
      },
    ],
  },
  {
    slug: "voz",
    group: "Marca",
    title: "O Transformador com Dados.",
    shortTitle: "Voz & Copy",
    description: "Tom direto, linguagem de rua, dados claros e promessas responsaveis.",
    icon: Megaphone,
    chapters: [
      {
        id: "atributos",
        title: "Direta, honesta e calculada",
        lead: "A eDrive Go fala como quem fez a conta e voltou para mostrar a saida. Sem jargao de startup, sem sonho abstrato, sem humilhar o motorista.",
        points: [
          { title: "Usar", text: "Numero real, pergunta direta, comparacao concreta e prova social." },
          { title: "Evitar", text: "Promessa universal, sensacionalismo e linguagem corporativa fria." },
        ],
      },
    ],
  },
  {
    slug: "visual",
    group: "Fundamentos",
    title: "Premium, eletrico e urbano.",
    shortTitle: "Visual",
    description: "Sistema visual com preto, roxo, verde eletrico, branco e amarelo relampago.",
    icon: Palette,
    chapters: [
      { id: "paleta", title: "Cor tem funcao", lead: "Preto noturno estrutura autoridade. Roxo segura a marca. Verde comunica energia, economia e recarga. Amarelo cria urgencia. Branco organiza leitura." },
      { id: "imagem", title: "Imagem real, contexto urbano e prova", lead: "As imagens devem mostrar carro eletrico, hub de recarga, motorista real, Salvador/RMS, painel com zero gasolina e situacoes de trabalho." },
    ],
  },
  {
    slug: "cliente",
    group: "Produto",
    title: "O motorista certo no momento certo.",
    shortTitle: "Cliente",
    description: "ICPs, dores, objecoes, desejos, medos e mercado.",
    icon: Target,
    chapters: [
      { id: "icp", title: "O prisioneiro da gasolina", lead: "Motorista full-time, carro antigo, alto custo de combustivel, cansaco financeiro e abertura para uma conta que faca sentido." },
    ],
  },
  {
    slug: "ecossistema",
    group: "Produto",
    title: "eDrive Go abre. eDrive Go Energy fideliza.",
    shortTitle: "Ecossistema",
    description: "Como locacao, recarga, energia e comunidade viram retencao.",
    icon: Network,
    chapters: [
      { id: "go-energy", title: "Dois motores de crescimento", lead: "O motorista entra pela eDrive Go porque quer reduzir custo. A fidelizacao acontece pela eDrive Go Energy porque recarga, hub e energia tornam a decisao recorrente." },
    ],
  },
];

export const palette = [
  { name: "Preto Noturno", hex: "#07070A", role: "Autoridade, tecnologia e base premium." },
  { name: "Roxo eDrive Go", hex: "#6F35FF", role: "Marca, sistema digital e memoria visual." },
  { name: "Verde Eletrico", hex: "#00C896", role: "Energia, economia, lucro e recarga." },
  { name: "Branco Eletrico", hex: "#F5F5F7", role: "Clareza, documentos e area de leitura." },
  { name: "Amarelo Relampago", hex: "#FFD700", role: "Urgencia, destaque e ativacao." },
  { name: "Cinza Asfalto", hex: "#3A3A3A", role: "Rua, trabalho e contexto urbano." },
];

export const visualAssets = [
  {
    title: "Eletroposto eDrive Go Energy",
    src: "/images/edrive-go-official/eletroposto-edrive-energy.webp",
    alt: "Eletroposto eDrive Go Energy com cobertura solar e veículos em recarga",
    caption: "Imagem real do eletroposto eDrive Go Energy, com estrutura solar, vagas de recarga e operação em funcionamento.",
    width: 1846,
    height: 948,
    imageClassName: "scale-[1.08]",
    objectPosition: "center 48%",
  },
  {
    title: "Fachada do lançamento",
    src: "/images/edrive-go-official/fachada-lancamento-edrive-go.webp",
    alt: "Projeto da fachada preta da recepção do lançamento eDrive Go",
    caption: "Planejamento oficial da recepção eDrive Go com enxoval preto, sinalização e atendimento do evento.",
    width: 1122,
    height: 1402,
    imageClassName: "",
    objectPosition: "center 40%",
  },
  {
    title: "Entrega oficial de veículos",
    src: "/images/edrive-go-official/entrega-chave-edrive-go.webp",
    alt: "Entrega de chave de um veículo elétrico no lançamento eDrive Go",
    caption: "Vista frontal da experiência de entrega de chaves, com frota elétrica, equipe e identidade visual do lançamento.",
    width: 1672,
    height: 941,
    imageClassName: "",
    objectPosition: "center",
  },
];

export const recommendedPhrases = [
  "Nao e locadora. E movimento.",
  "Voce trabalha para voce ou para a gasolina?",
  "Os primeiros motoristas da nova geracao.",
  "Nao pedimos fe. Pedimos 5 minutos com a calculadora.",
  "A partir de hoje, voce nao abastece mais.",
  "O motorista entra pela eDrive Go. A fidelizacao acontece pela eDrive Go Energy.",
];

export const forbiddenPhrases = [
  "So uma locadora de carros",
  "Economia garantida para qualquer motorista",
  "Eletrico e coisa de rico",
  "App comum de mobilidade",
  "Promessa sem calculo individual",
  "Contrato dificil e suporte distante",
];

export const movementBeliefs = [
  "Motorista de app e empresario.",
  "Custo aceito e custo permanente.",
  "R$1.000 por mes nao e economia. E transformacao de vida.",
  "O eletrico nao e futuro. E presente para quem chegou primeiro.",
  "Comunidade nao e bonus. E parte do resultado.",
  "Prova vale mais do que promessa.",
  "Quem fez a Virada Eletrica tem responsabilidade de mostrar o caminho.",
  "A gasolina e a corrente invisivel do motorista.",
];

export const customerSignals = [
  "Boto R$200 de gasolina hoje, amanha ja ta na metade.",
  "Posto virou meu segundo patrao.",
  "Nao tenho salario. Tenho meta.",
  "Meu sonho e ter previsibilidade de renda.",
  "O que me convence nao e promessa. E prova.",
];

export const marketCards = [
  { label: "TAM Brasil", value: "1,26M", text: "motoristas qualificados estimados para VE em escala nacional." },
  { label: "SAM Bahia", value: "42,5K", text: "motoristas qualificados nas cidades hub e RMS." },
  { label: "SOM base", value: "110", text: "veiculos ocupados ao final do mes 3 no cenario base." },
  { label: "Ano 1", value: "R$16,1M", text: "receita projetada com frota expandida para 500 veiculos." },
];

export const sourceNotes = [
  { title: "Acervo oficial eDrive Go", text: "A galeria usa o registro real do eletroposto e os planejamentos visuais aprovados para a fachada e a entrega de veículos do lançamento." },
  { title: "Painel Triade", text: "A URL publica redireciona para login. A estrutura foi analisada pelo codigo clonado: sidebar fixa, topbar, cards densos, brandbook, diretorio e documentos individuais." },
  { title: "Dr. Pitagoras", text: "A area de movimento e documentos publicos serviu de referencia para pagina de manifesto e documento individual em /app/marca/documentos/[id]." },
];

export const primalElements = [
  ["Creation Story", "A eDrive Go nasce da pergunta: e se o motorista nao precisasse pagar gasolina?"],
  ["Creed", "Motorista Livre controla a propria equacao financeira."],
  ["Icons", "Raio sem corrente, BYD, painel com zero gasolina, cabo de recarga e R$1.000."],
  ["Rituals", "Ativacao, primeira semana eletrica, Calculo da Virada e 30 Dias Livre."],
  ["Pagans", "O sempre foi assim, o ceticismo sem dados e a ideia de que eletrico e privilegio."],
  ["Sacred Words", "Maldicao da Gasolina, Motorista Livre, Virada Eletrica e Rode sem corrente."],
  ["Leader", "A lideranca que mostra numero, infraestrutura e motorista real."],
];

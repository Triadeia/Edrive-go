export type DocumentCategory = "Movimento" | "Inteligencia" | "Comercial";

export type LibertDocument = {
  id: string;
  fileName: string;
  title: string;
  subtitle: string;
  category: DocumentCategory;
  source: string;
  description: string;
  tags: string[];
};

export const documents: LibertDocument[] = [
  {
    id: "movimento-manifesto",
    fileName: "movimento-manifesto.md",
    title: "Manifesto do Motorista Livre",
    subtitle: "Documento fundacional do movimento Libert Drive",
    category: "Movimento",
    source: "Movimento - Libert Drive",
    description: "Manifesto completo, crenças, juramento e narrativa do Motorista Livre.",
    tags: ["manifesto", "motorista-livre", "crencas"],
  },
  {
    id: "movimento-big-idea-posicionamento",
    fileName: "movimento-big-idea-posicionamento.md",
    title: "Big Idea + Posicionamento",
    subtitle: "A Maldicao da Gasolina e diferenciacao competitiva",
    category: "Movimento",
    source: "Movimento - Libert Drive",
    description: "Sistema de comunicacao com big idea, posicionamento, promessa e mapa competitivo.",
    tags: ["big-idea", "posicionamento", "maldicao"],
  },
  {
    id: "movimento-primal-branding",
    fileName: "movimento-primal-branding.md",
    title: "Primal Branding Libert Drive",
    subtitle: "7 elementos do sistema de crenca",
    category: "Movimento",
    source: "Movimento - Libert Drive",
    description: "Creation story, credo, icones, rituais, pagans, palavras sagradas e lideranca.",
    tags: ["primal", "comunidade", "rituais"],
  },
  {
    id: "movimento-ritual-comunidade",
    fileName: "movimento-ritual-comunidade.md",
    title: "Ritual Design + Comunidade",
    subtitle: "Arquitetura de pertencimento e expansao",
    category: "Movimento",
    source: "Movimento - Libert Drive",
    description: "Jornada do Motorista Livre, celulas, moderacao, marcos e embaixadores.",
    tags: ["comunidade", "ritual", "embaixador"],
  },
  {
    id: "movimento-sexy-canvas",
    fileName: "movimento-sexy-canvas.md",
    title: "Sexy Canvas Libert Drive",
    subtitle: "Identidade de marca completa",
    category: "Movimento",
    source: "Movimento - Libert Drive",
    description: "Por que, inimigo, heroi, transformacao, voz, personalidade e sistema de comunicacao.",
    tags: ["canvas", "identidade", "voz"],
  },
  {
    id: "movimento-banco-de-hooks",
    fileName: "movimento-banco-de-hooks.md",
    title: "Hooks do Movimento",
    subtitle: "50 hooks, headlines, CTAs e roteiros",
    category: "Movimento",
    source: "Movimento - Libert Drive",
    description: "Banco de copy focado em Maldicao, Virada Eletrica, R$1.000 e comunidade.",
    tags: ["hooks", "copy", "conteudo"],
  },
  {
    id: "libert-drive-bussola-cliente-ideal",
    fileName: "libert-drive-bussola-cliente-ideal.md",
    title: "Bussola do Cliente Ideal",
    subtitle: "Inteligencia estrategica de segmentacao",
    category: "Inteligencia",
    source: "Base de inteligencia - Libert Drive",
    description: "Mapa de segmentos, clientes ideais, mercados adjacentes e anti-clientes.",
    tags: ["icp", "segmentacao", "qualificacao"],
  },
  {
    id: "libert-drive-icps-buyer-personas",
    fileName: "libert-drive-icps-buyer-personas.md",
    title: "ICPs & Buyer Personas",
    subtitle: "Perfis profundos de motoristas",
    category: "Inteligencia",
    source: "Base de inteligencia - Libert Drive",
    description: "ICPs completos, medos, desejos, dores e linguagem emocional.",
    tags: ["personas", "medos", "desejos"],
  },
  {
    id: "libert-drive-voz-do-cliente",
    fileName: "libert-drive-voz-do-cliente.md",
    title: "Voz do Cliente",
    subtitle: "100 frases reais, dores, objecoes, desejos e medos",
    category: "Inteligencia",
    source: "Base de inteligencia - Libert Drive",
    description: "Banco de linguagem real do motorista de aplicativo.",
    tags: ["voz", "dores", "objecoes"],
  },
  {
    id: "libert-drive-tam-sam-som",
    fileName: "libert-drive-tam-sam-som.md",
    title: "TAM / SAM / SOM",
    subtitle: "Dimensionamento de mercado e cenarios",
    category: "Inteligencia",
    source: "Base de inteligencia - Libert Drive",
    description: "Mercado total, servivel, obtivel, cenario base, agressivo e expansao nacional.",
    tags: ["mercado", "som", "financeiro"],
  },
  {
    id: "libert-drive-banco-de-hooks",
    fileName: "libert-drive-banco-de-hooks.md",
    title: "Banco de Hooks e Copy",
    subtitle: "100 hooks, headlines, CTAs, WhatsApp e scripts",
    category: "Comercial",
    source: "Base de inteligencia - Libert Drive",
    description: "Biblioteca completa de ganchos, mensagens e ideias de conteudo.",
    tags: ["hooks", "whatsapp", "video"],
  },
  {
    id: "libert-drive-scripts-comerciais",
    fileName: "libert-drive-scripts-comerciais.md",
    title: "Scripts Comerciais",
    subtitle: "WhatsApp, telefone, presencial e objecoes",
    category: "Comercial",
    source: "Base de inteligencia - Libert Drive",
    description: "Scripts completos publicados como documento de referencia, sem virar modulo de CRM.",
    tags: ["scripts", "comercial", "objecoes"],
  },
];

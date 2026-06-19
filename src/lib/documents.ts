import fs from "node:fs";
import path from "node:path";

export type DocumentCategory = "Movimento" | "Inteligencia" | "Comercial";

export type EdriveDocument = {
  id: string;
  fileName: string;
  title: string;
  subtitle: string;
  category: DocumentCategory;
  source: string;
  description: string;
  tags: string[];
};

export const documents: EdriveDocument[] = [
  {
    id: "movimento-manifesto",
    fileName: "movimento-manifesto.md",
    title: "Manifesto do Motorista Livre",
    subtitle: "Documento fundacional do movimento eDrive Go",
    category: "Movimento",
    source: "Movimento - edrive-go",
    description: "Manifesto completo, crenças, juramento e narrativa do Motorista Livre.",
    tags: ["manifesto", "motorista-livre", "crencas"],
  },
  {
    id: "movimento-big-idea-posicionamento",
    fileName: "movimento-big-idea-posicionamento.md",
    title: "Big Idea + Posicionamento",
    subtitle: "A Maldicao da Gasolina e diferenciacao competitiva",
    category: "Movimento",
    source: "Movimento - edrive-go",
    description: "Sistema de comunicacao com big idea, posicionamento, promessa e mapa competitivo.",
    tags: ["big-idea", "posicionamento", "maldicao"],
  },
  {
    id: "movimento-primal-branding",
    fileName: "movimento-primal-branding.md",
    title: "Primal Branding eDrive Go",
    subtitle: "7 elementos do sistema de crenca",
    category: "Movimento",
    source: "Movimento - edrive-go",
    description: "Creation story, credo, icones, rituais, pagans, palavras sagradas e lideranca.",
    tags: ["primal", "comunidade", "rituais"],
  },
  {
    id: "movimento-ritual-comunidade",
    fileName: "movimento-ritual-comunidade.md",
    title: "Ritual Design + Comunidade",
    subtitle: "Arquitetura de pertencimento e expansao",
    category: "Movimento",
    source: "Movimento - edrive-go",
    description: "Jornada do Motorista Livre, celulas, moderacao, marcos e embaixadores.",
    tags: ["comunidade", "ritual", "embaixador"],
  },
  {
    id: "movimento-sexy-canvas",
    fileName: "movimento-sexy-canvas.md",
    title: "Sexy Canvas eDrive Go",
    subtitle: "Identidade de marca completa",
    category: "Movimento",
    source: "Movimento - edrive-go",
    description: "Por que, inimigo, heroi, transformacao, voz, personalidade e sistema de comunicacao.",
    tags: ["canvas", "identidade", "voz"],
  },
  {
    id: "movimento-banco-de-hooks",
    fileName: "movimento-banco-de-hooks.md",
    title: "Hooks do Movimento",
    subtitle: "50 hooks, headlines, CTAs e roteiros",
    category: "Movimento",
    source: "Movimento - edrive-go",
    description: "Banco de copy focado em Maldicao, Virada Eletrica, R$1.000 e comunidade.",
    tags: ["hooks", "copy", "conteudo"],
  },
  {
    id: "edrive-go-bussola-cliente-ideal",
    fileName: "edrive-go-bussola-cliente-ideal.md",
    title: "Bussola do Cliente Ideal",
    subtitle: "Inteligencia estrategica de segmentacao",
    category: "Inteligencia",
    source: "Base de inteligencia - Edrive-go",
    description: "Mapa de segmentos, clientes ideais, mercados adjacentes e anti-clientes.",
    tags: ["icp", "segmentacao", "qualificacao"],
  },
  {
    id: "edrive-go-icps-buyer-personas",
    fileName: "edrive-go-icps-buyer-personas.md",
    title: "ICPs & Buyer Personas",
    subtitle: "Perfis profundos de motoristas",
    category: "Inteligencia",
    source: "Base de inteligencia - Edrive-go",
    description: "ICPs completos, medos, desejos, dores e linguagem emocional.",
    tags: ["personas", "medos", "desejos"],
  },
  {
    id: "edrive-go-voz-do-cliente",
    fileName: "edrive-go-voz-do-cliente.md",
    title: "Voz do Cliente",
    subtitle: "100 frases reais, dores, objecoes, desejos e medos",
    category: "Inteligencia",
    source: "Base de inteligencia - Edrive-go",
    description: "Banco de linguagem real do motorista de aplicativo.",
    tags: ["voz", "dores", "objecoes"],
  },
  {
    id: "edrive-go-tam-sam-som",
    fileName: "edrive-go-tam-sam-som.md",
    title: "TAM / SAM / SOM",
    subtitle: "Dimensionamento de mercado e cenarios",
    category: "Inteligencia",
    source: "Base de inteligencia - Edrive-go",
    description: "Mercado total, servivel, obtivel, cenario base, agressivo e expansao nacional.",
    tags: ["mercado", "som", "financeiro"],
  },
  {
    id: "edrive-go-banco-de-hooks",
    fileName: "edrive-go-banco-de-hooks.md",
    title: "Banco de Hooks e Copy",
    subtitle: "100 hooks, headlines, CTAs, WhatsApp e scripts",
    category: "Comercial",
    source: "Base de inteligencia - Edrive-go",
    description: "Biblioteca completa de ganchos, mensagens e ideias de conteudo.",
    tags: ["hooks", "whatsapp", "video"],
  },
  {
    id: "edrive-go-scripts-comerciais",
    fileName: "edrive-go-scripts-comerciais.md",
    title: "Scripts Comerciais",
    subtitle: "WhatsApp, telefone, presencial e objecoes",
    category: "Comercial",
    source: "Base de inteligencia - Edrive-go",
    description: "Scripts completos publicados como documento de referencia, sem virar modulo de CRM.",
    tags: ["scripts", "comercial", "objecoes"],
  },
];

export function getDocument(id: string) {
  return documents.find((document) => document.id === id);
}

export function getDocumentContent(document: EdriveDocument) {
  const fullPath = path.join(process.cwd(), "content", "documents", document.fileName);
  return fs.readFileSync(fullPath, "utf8");
}

export function getDocumentStats(content: string) {
  const words = content.split(/\s+/).filter(Boolean).length;
  const headings = content.split("\n").filter((line) => line.startsWith("#")).length;
  return { words, headings };
}

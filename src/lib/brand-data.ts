import {
  BadgeCheck,
  BatteryCharging,
  BookOpenText,
  BrainCircuit,
  Car,
  CircleDollarSign,
  Flame,
  Gauge,
  Handshake,
  Landmark,
  MessageSquareText,
  Network,
  Palette,
  RadioTower,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";

export const coreNavigation = [
  { href: "/app", label: "Visao geral", icon: Gauge },
  { href: "/app/branding", label: "Branding Book", icon: BookOpenText },
  { href: "/app/movimento", label: "Movimento", icon: Flame },
  { href: "/app/primal-branding", label: "Primal Branding", icon: Sparkles },
  { href: "/app/inteligencia-cliente", label: "Inteligencia do Cliente", icon: BrainCircuit },
];

export const brandPillars = [
  {
    title: "Nao e locadora. E movimento.",
    text: "A eDrive Go transforma locacao eletrica em uma identidade coletiva para motoristas que decidiram parar de trabalhar para a gasolina.",
    icon: Flame,
  },
  {
    title: "Infraestrutura, nao aplicativo isolado.",
    text: "O Go abre a porta pelo carro e pela economia. A Energy sustenta fidelizacao com energia, recarga, hubs e recorrencia operacional.",
    icon: Network,
  },
  {
    title: "A conta antes da promessa.",
    text: "A marca convence com calculo real: gasto atual de combustivel, custo total de operacao e diferenca liquida no bolso.",
    icon: CircleDollarSign,
  },
  {
    title: "Motoristas da nova geracao.",
    text: "Os pioneiros nao compram status. Eles compram controle: carro eletrico, custo previsivel, comunidade e vantagem de chegada.",
    icon: Zap,
  },
];

export const ecosystemStats = [
  { value: "80+", label: "carregadores rapidos e ultrarrapidos" },
  { value: "110", label: "BYD Dolphins na frota inicial" },
  { value: "6.000 m2", label: "de placas solares no hub" },
  { value: "R$80M+", label: "de investimento no ecossistema" },
];

export const brandingSections = [
  {
    title: "Essencia da marca",
    icon: ShieldCheck,
    body: "A eDrive Go existe para provar que motorista de app nao precisa aceitar gasolina como destino financeiro. A marca organiza tecnologia, frota, energia e comunidade para devolver controle de margem a quem roda todos os dias.",
    points: ["Liberdade financeira aplicada", "Mobilidade eletrica acessivel", "Pertencimento de Motorista Livre"],
  },
  {
    title: "Quem e a eDrive Go",
    icon: Car,
    body: "Locacao inteligente de veiculos eletricos para motoristas de aplicativo, conectada a um ecossistema maior de energia, recarga, tecnologia e aquisicao de usuarios.",
    points: ["BYD 0km", "Sem entrada absurda", "KM ilimitado", "Suporte e comunidade"],
  },
  {
    title: "Go + Energy",
    icon: BatteryCharging,
    body: "O motorista entra pelo Go. A fidelizacao acontece pela Energy. O Go reduz a barreira de acesso ao eletrico; a Energy cria a infraestrutura que torna a escolha sustentavel e recorrente.",
    points: ["Go = aquisicao e produto de entrada", "Energy = recarga e recorrencia", "Ecossistema = retencao"],
  },
  {
    title: "Posicionamento",
    icon: Target,
    body: "A nova infraestrutura de mobilidade eletrica para os motoristas da nova geracao: sem gasolina, sem compra do veiculo, com calculo claro e comunidade de quem fez a virada.",
    points: ["RMS como primeiro territorio", "Motorista full-time como foco", "Eletrico como vantagem economica"],
  },
  {
    title: "Big Idea",
    icon: Flame,
    body: "A Maldicao da Gasolina: a crenca de que combustivel fossil e um custo inevitavel do trabalho de mobilidade. A eDrive Go existe para quebrar essa crenca com numero, veiculo e infraestrutura.",
    points: ["Nomeia o inimigo", "Cria urgencia", "Transforma economia em identidade"],
  },
  {
    title: "Tom de voz",
    icon: MessageSquareText,
    body: "Direto, honesto, calculado e de rua. A eDrive Go fala como quem fez a conta e voltou para mostrar a saida. Sem jargao de startup, sem promessa vazia, sem paternalismo.",
    points: ["Numero na primeira frase", "Pergunta antes de afirmar", "Prova antes de promessa"],
  },
  {
    title: "Sistema visual",
    icon: Palette,
    body: "Preto noturno, roxo institucional, verde eletrico, branco eletrico e amarelo relampago. O visual deve parecer premium, urbano, energetico e memoravel.",
    points: ["Contraste alto", "Linhas eletricas", "Dados em destaque", "Logo oficial como sinal"],
  },
  {
    title: "Comportamento da marca",
    icon: Handshake,
    body: "A marca nao trata motorista como lead descartavel. Trata como operador de um negocio proprio, com medo real, familia, risco e ambicao de melhorar a margem.",
    points: ["Faz a conta junto", "Responde duvidas sem julgamento", "Celebra marcos reais"],
  },
];

export const recommendedPhrases = [
  "Nao e locadora. E movimento.",
  "Os primeiros motoristas da nova geracao.",
  "Voce trabalha para voce ou para a gasolina?",
  "Nao pedimos fe. Pedimos 5 minutos com a calculadora.",
  "A partir de hoje, voce nao abastece mais.",
  "O motorista entra pelo Go. A fidelizacao acontece pela Energy.",
];

export const forbiddenPhrases = [
  "So mais uma locadora de carros",
  "Economia garantida para qualquer perfil",
  "Eletrico e luxo para poucos",
  "App de motorista comum",
  "Contrato sem adaptacao e sem suporte",
  "Promessa facil sem calculo individual",
];

export const movementBeliefs = [
  "Motorista de app e empresario. Quem pensa como funcionario, perde como funcionario.",
  "Custo aceito e custo permanente.",
  "R$1.000 por mes nao e economia. E transformacao de vida.",
  "Eletrico nao e tendencia. E decisao presente.",
  "Comunidade nao e bonus. E parte do resultado.",
  "Prova vale mais do que promessa.",
];

export const primalElements = [
  {
    title: "Creation Story",
    text: "O movimento nasce quando a eDrive Go faz a pergunta que o mercado ignorou: e se o motorista nao precisasse pagar gasolina?",
    icon: Landmark,
  },
  {
    title: "Creed",
    text: "Motorista Livre controla sua equacao financeira, faz a conta antes de aceitar o custo e mostra o caminho para outros motoristas.",
    icon: BadgeCheck,
  },
  {
    title: "Icons",
    text: "Raio sem corrente, BYD Dolphin, painel com zero gasolina, cabo de carregamento, chave digital e o numero R$1.000.",
    icon: Zap,
  },
  {
    title: "Rituals",
    text: "Ativacao, primeira semana eletrica, calculo da virada, depoimento dos 30 dias, indicacao e Summit do Motorista Livre.",
    icon: RadioTower,
  },
  {
    title: "Pagans",
    text: "O 'sempre foi assim', o medo sem dados, a normalizacao do custo e a ideia de que eletrico e privilegio.",
    icon: ShieldCheck,
  },
  {
    title: "Sacred Words",
    text: "Maldicao da Gasolina, Virada Eletrica, Motorista Livre, Mais um mes livre, Rode sem corrente.",
    icon: MessageSquareText,
  },
  {
    title: "Leader",
    text: "A lideranca deve aparecer como operador de ecossistema e prova: quem mostra numero, infraestrutura e motorista real.",
    icon: Users,
  },
];

export const customerIntelligence = {
  icps: [
    {
      name: "Motorista Prisioneiro da Gasolina",
      score: "9.6",
      summary: "Full-time, 8-12h por dia, carro proprio antigo, alto gasto de combustivel e manutencao. Dor financeira clara e imediata.",
      signal: "Trabalho muito e no final do mes estou no zero. A gasolina me mata.",
    },
    {
      name: "Motorista que ja fez a conta",
      score: "9.2",
      summary: "Ja viu conteudo sobre eletrico, calculou gasto atual e sabe que a economia pode pagar a mudanca. Compra com menos educacao.",
      signal: "Eu ja vi que compensa. Falta so a oportunidade certa.",
    },
    {
      name: "Motorista em crise por combustivel",
      score: "9.4",
      summary: "Sente a gasolina subir mais rapido que a tarifa dos apps. Urgencia emocional e financeira combinadas.",
      signal: "Fiz R$4.100 e sobrou R$800. Isso nao pode continuar.",
    },
  ],
  voices: [
    "Boto R$200 de gasolina hoje, amanha ja ta na metade.",
    "Posto virou meu segundo patrao.",
    "Nao tenho salario. Tenho meta.",
    "Meu sonho e ter previsibilidade de renda.",
    "O que me convence nao e promessa. E prova.",
  ],
  market: [
    { label: "TAM Brasil", value: "1,26M", text: "motoristas qualificados estimados para VE em escala nacional." },
    { label: "SAM Bahia fase 1", value: "42,5K", text: "motoristas qualificados em media nas cidades hub e RMS." },
    { label: "SOM base 90 dias", value: "110", text: "veiculos ocupados ao final do mes 3 no cenario base." },
    { label: "Receita anual base", value: "R$16,1M", text: "projecao com expansao da frota para 500 veiculos no ano 1." },
  ],
};

export const manifestoLines = [
  "Existe uma conta que ninguem te mostrou. Quando voce ve, nao da pra nao ver.",
  "A Maldicao nao e o posto de gasolina. A Maldicao e a crenca de que voce nao tem outra opcao.",
  "Nao somos apenas um aplicativo. Somos infraestrutura.",
  "Bem-vindo ao unico lugar onde motorista de app e tratado como o empresario que e.",
  "Seja Motorista Livre. Rode sem corrente.",
];

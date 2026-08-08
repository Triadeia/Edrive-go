import type {
  WorkspaceList,
  WorkspaceMember,
  WorkspaceSpace,
  WorkspaceTask,
} from "./workspace-store";

const CREATED_AT = "2026-08-08T14:30:00-03:00";
const NILTON_ID = "a40b9bdc-b0ec-5f9e-a958-a8f3dc885f2a";
const WILL_ID = "158d1297-c12f-54ac-94b4-2b13f7bbaa30";

const memberIds = {
  tarcisio: "c0010000-0000-4000-8000-000000000001",
  lucas: "c0010000-0000-4000-8000-000000000002",
  bruno: "c0010000-0000-4000-8000-000000000003",
  aquarela: "c0010000-0000-4000-8000-000000000004",
  nilton: NILTON_ID,
  will: WILL_ID,
} as const;

const spaceId = "c0020000-0000-4000-8000-000000000001";
const listIds = {
  active: "c0030000-0000-4000-8000-000000000001",
  waiting: "c0030000-0000-4000-8000-000000000002",
  someday: "c0030000-0000-4000-8000-000000000003",
  done: "c0030000-0000-4000-8000-000000000004",
} as const;

export const goAppChecklistMembers: WorkspaceMember[] = [
  { id: memberIds.tarcisio, name: "Tarcisio Silva", role: "Direção executiva", color: "#7c3aed" },
  { id: memberIds.lucas, name: "Lucas Monteiro", role: "Marketing e growth", color: "#2563eb" },
  { id: memberIds.bruno, name: "Bruno Santos", role: "Liderança comunitária", color: "#d97706" },
  { id: memberIds.aquarela, name: "Diego e Wilian · Aquarela", role: "Tecnologia do app", color: "#dc2626" },
];

export const goAppChecklistSpaces: WorkspaceSpace[] = [
  { id: spaceId, name: "GO App — Lançamento 15/09", emoji: "🚀", position: 5 },
];

export const goAppChecklistLists: WorkspaceList[] = [
  { id: listIds.active, spaceId, name: "Ativas · execução", color: "#dc2626", position: 0 },
  { id: listIds.waiting, spaceId, name: "Aguardando terceiros", color: "#d97706", position: 1 },
  { id: listIds.someday, spaceId, name: "Backlog futuro", color: "#2563eb", position: 2 },
  { id: listIds.done, spaceId, name: "Concluídas", color: "#16a34a", position: 3 },
];

type RawTask = {
  externalId: `T${number}`;
  title: string;
  description: string;
  status: WorkspaceTask["status"];
  priority: WorkspaceTask["priority"];
  sourcePriority: "P0" | "P1" | "P2" | "P3";
  assigneeId: string | null;
  assigneeName: string;
  backupAssignee?: string;
  listId: string;
  subarea: string;
  phase: string;
  startAt?: string | null;
  dueAt?: string | null;
  dependencies?: Array<`T${number}`>;
  blockers?: string | null;
  nextAction?: string | null;
  evidence?: string | null;
  definitionOfDone?: string | null;
  vendor?: string | null;
  notes?: string | null;
};

const rawTasks: RawTask[] = [
  {
    externalId: "T205",
    title: "Enviar o checklist técnico à Aquarela e fechar a reunião de status",
    description: "Exigir respostas objetivas sobre lojas, DEV versus PROD, cadastro, biometria, cartão, PIX, saques, cupons, referral, deep links, Firebase, exportações e push.",
    status: "todo", priority: "urgent", sourcePriority: "P0", assigneeId: memberIds.aquarela,
    assigneeName: "Tarcisio, Diego e Wilian", backupAssignee: "Nilton Macario", listId: listIds.active,
    subarea: "Produto e tecnologia", phase: "D-38 · Destravamento", startAt: "2026-08-08T14:30:00-03:00", dueAt: "2026-08-08T18:00:00-03:00",
    nextAction: "Enviar a pauta e obter aceite por escrito.", evidence: "Convite da reunião e confirmação da pauta.",
    definitionOfDone: "Reunião marcada para 10 ou 11/08 com aceite por escrito.", vendor: "Aquarela",
  },
  {
    externalId: "T206", title: "Preparar a oferta dos Fundadores GO em três opções",
    description: "Mostrar benefício, custo, prazo, antifraude e impacto operacional de cada opção, com uma recomendação explícita.",
    status: "todo", priority: "urgent", sourcePriority: "P0", assigneeId: memberIds.tarcisio,
    assigneeName: "Tarcisio Silva", backupAssignee: "Lucas Monteiro", listId: listIds.active,
    subarea: "Oferta", phase: "D-37 · Destravamento", startAt: "2026-08-08T14:30:00-03:00", dueAt: "2026-08-09T18:00:00-03:00",
    nextAction: "Redigir o one-pager com três opções.", evidence: "Documento de uma página.",
    definitionOfDone: "Três opções comparáveis e uma recomendação prontas para decisão.",
  },
  {
    externalId: "T207", title: "Fechar o rascunho do Formulário Fundador",
    description: "Capturar opt-in LGPD, telefone, bairro de moradia, zonas preferidas, veículo, categoria, origem/UTM e indicação.",
    status: "todo", priority: "urgent", sourcePriority: "P0", assigneeId: memberIds.nilton,
    assigneeName: "Nilton Macario", listId: listIds.active, subarea: "Aquisição e dados", phase: "D-37 · Destravamento",
    startAt: "2026-08-08T14:30:00-03:00", dueAt: "2026-08-09T18:00:00-03:00",
    nextAction: "Montar e testar todos os campos.", evidence: "Lead de teste exportado.",
    definitionOfDone: "Um lead de teste é exportado com todos os campos e consentimento.",
  },
  {
    externalId: "T208", title: "Adaptar seis conceitos da Fase 1 em dezoito roteiros curtos",
    description: "Usar três re-hooks por conceito, CTA único para Fundadores e neutralidade eleitoral. Reaproveitar o Sistema 10X.",
    status: "todo", priority: "high", sourcePriority: "P1", assigneeId: memberIds.will,
    assigneeName: "Will Trindade", backupAssignee: "Bruno Santos", listId: listIds.active,
    subarea: "Conteúdo", phase: "D-38 · Fase 1", startAt: "2026-08-08T14:30:00-03:00", dueAt: "2026-08-08T20:00:00-03:00",
    nextAction: "Selecionar os seis conceitos e escrever três re-hooks de cada.", evidence: "18 roteiros revisados.",
    definitionOfDone: "Dezoito roteiros prontos para gravação, todos com CTA rastreável.",
  },
  {
    externalId: "T209", title: "Reunir documentos para a verificação Meta Business e WABA",
    description: "Separar CNPJ, razão social, endereço, domínio, e-mail corporativo e responsável legal.",
    status: "todo", priority: "urgent", sourcePriority: "P0", assigneeId: memberIds.nilton,
    assigneeName: "Nilton Macario", listId: listIds.active, subarea: "WhatsApp", phase: "D-37 · Infraestrutura",
    startAt: "2026-08-08T14:30:00-03:00", dueAt: "2026-08-09T18:00:00-03:00",
    nextAction: "Centralizar os documentos e validar consistência.", evidence: "Pasta de documentos completa.",
    definitionOfDone: "Pacote pronto para abertura do protocolo em 10/08.", vendor: "Meta/BSP",
  },
  {
    externalId: "T210", title: "Marcar a sessão de mapeamento dos grupos com Bruno",
    description: "Levar lista de grupos, administradores, tamanho aproximado, regras, risco de spam e possível capitão.",
    status: "todo", priority: "urgent", sourcePriority: "P0", assigneeId: memberIds.lucas,
    assigneeName: "Lucas Monteiro", backupAssignee: "Bruno Santos", listId: listIds.active,
    subarea: "Comunidade", phase: "D-38 · Destravamento", startAt: "2026-08-08T14:30:00-03:00", dueAt: "2026-08-08T18:00:00-03:00",
    nextAction: "Enviar convite e definir o dono da planilha.", evidence: "Reunião agendada.",
    definitionOfDone: "Reunião marcada e planilha com responsável definido.",
  },
  {
    externalId: "T211", title: "Aprovar a árvore mínima do site GO App",
    description: "Priorizar Motoristas, Cadastro, Requisitos, Como funciona, Ganhos, Elétrico/Frota, Segurança, Suporte, Fundadores e Blog.",
    status: "todo", priority: "high", sourcePriority: "P1", assigneeId: memberIds.nilton,
    assigneeName: "Nilton Macario", backupAssignee: "Lucas Monteiro", listId: listIds.active,
    subarea: "Site", phase: "Semana 1 · Fundação", startAt: "2026-08-08T14:30:00-03:00", dueAt: "2026-08-10T18:00:00-03:00",
    nextAction: "Revisar o blueprint e congelar a navegação mínima.", evidence: "Árvore aprovada.",
    definitionOfDone: "Rotas da Onda 1A aprovadas por Nilton e Lucas.",
  },
  {
    externalId: "T212", title: "Definir o CMS e publicar o esqueleto técnico do blog",
    description: "Entregar índice, categorias, autor, data, imagem, breadcrumbs, relacionados, FAQ, sitemap XML, canonical e schema Article.",
    status: "todo", priority: "high", sourcePriority: "P1", assigneeId: memberIds.nilton,
    assigneeName: "Nilton Macario", listId: listIds.active, subarea: "Blog e SEO", phase: "Semana 1 · Fundação",
    startAt: "2026-08-10T09:00:00-03:00", dueAt: "2026-08-11T18:00:00-03:00", dependencies: ["T211"],
    nextAction: "Escolher CMS e criar template de artigo.", evidence: "Blog em staging com SEO técnico.",
    definitionOfDone: "Esqueleto do blog publicado em staging com indexação bloqueada.", vendor: "Vercel",
  },
  {
    externalId: "T213", title: "Criar os seis primeiros briefs SEO do blog GO",
    description: "Cobrir cadastro, documentos, primeira corrida, ganhos/custos, recarga elétrica e Fundadores GO.",
    status: "todo", priority: "high", sourcePriority: "P1", assigneeId: memberIds.nilton,
    assigneeName: "Nilton Macario", backupAssignee: "Will Trindade", listId: listIds.active,
    subarea: "Blog e SEO", phase: "Semana 1 · Fundação", startAt: "2026-08-10T09:00:00-03:00", dueAt: "2026-08-12T18:00:00-03:00", dependencies: ["T211"],
    nextAction: "Criar palavra-chave, intenção, H1, outline, CTA, links e fontes.", evidence: "Seis briefs completos.",
    definitionOfDone: "Seis briefs aprovados e prontos para redação.",
  },
  {
    externalId: "T214", title: "Subir LP, CRM interino e tracking web ponta a ponta",
    description: "Configurar GA4/GTM/Pixel, UTM persistente e registro de origem no CRM.",
    status: "todo", priority: "urgent", sourcePriority: "P0", assigneeId: memberIds.nilton,
    assigneeName: "Nilton Macario", listId: listIds.active, subarea: "Growth e analytics", phase: "Semana 1 · Fundação",
    startAt: "2026-08-10T09:00:00-03:00", dueAt: "2026-08-14T18:00:00-03:00", dependencies: ["T207"],
    nextAction: "Implementar e testar a jornada clique → formulário → CRM.", evidence: "Lead ponta a ponta com origem correta.",
    definitionOfDone: "Lead de teste aparece no CRM com UTM e origem preservadas.",
  },
  {
    externalId: "T215", title: "Rodar o primeiro corte semanal de conteúdo",
    description: "Matar, iterar ou escalar usando retenção, CTR, opt-in e cadastro qualificado.",
    status: "todo", priority: "high", sourcePriority: "P1", assigneeId: memberIds.nilton,
    assigneeName: "Nilton Macario", backupAssignee: "Will Trindade e Lucas Monteiro", listId: listIds.active,
    subarea: "Conteúdo e analytics", phase: "Semana 1 · Revisão", startAt: "2026-08-14T15:15:00-03:00", dueAt: "2026-08-14T16:00:00-03:00", dependencies: ["T208", "T214"],
    nextAction: "Consolidar métricas e classificar cada criativo.", evidence: "Ata do corte semanal.",
    definitionOfDone: "Cada criativo recebe decisão e próxima ação baseada em dados.",
  },
  {
    externalId: "T216", title: "Aquarela confirmar status técnico e datas de entrega",
    description: "Confirmar apps nas lojas, PROD, pagamentos, cupons/referral, tracking e exportações.",
    status: "blocked", priority: "urgent", sourcePriority: "P0", assigneeId: memberIds.aquarela,
    assigneeName: "Diego e Wilian · Aquarela", listId: listIds.waiting, subarea: "Produto e tecnologia", phase: "Aguardando terceiro",
    dueAt: "2026-08-11T18:00:00-03:00", blockers: "Resposta e aceite formal da Aquarela.",
    nextAction: "Cobrar respostas item a item.", evidence: "E-mail ou ata com datas.",
    definitionOfDone: "Todos os itens têm status, dono e data confirmados.", vendor: "Aquarela",
  },
  {
    externalId: "T217", title: "Tarcisio decidir oferta, orçamento, geografia e categorias do D-0",
    description: "Decisões necessárias para publicar convites e configurar PROD.",
    status: "blocked", priority: "urgent", sourcePriority: "P0", assigneeId: memberIds.tarcisio,
    assigneeName: "Tarcisio Silva", listId: listIds.waiting, subarea: "Direção", phase: "Aguardando decisão",
    dueAt: "2026-08-12T18:00:00-03:00", blockers: "Decisão executiva pendente.",
    nextAction: "Realizar reunião de decisão com opções e custos.", evidence: "Decisões registradas.",
    definitionOfDone: "Oferta, orçamento, escopo geográfico e categorias aprovados por escrito.",
  },
  {
    externalId: "T218", title: "Bruno entregar o mapa dos grupos e nomes de capitães",
    description: "Dependência para distribuição comunitária com governança e sem spam.",
    status: "blocked", priority: "urgent", sourcePriority: "P0", assigneeId: memberIds.bruno,
    assigneeName: "Bruno Santos", backupAssignee: "Lucas Monteiro", listId: listIds.waiting,
    subarea: "Comunidade", phase: "Aguardando terceiro", dueAt: "2026-08-13T18:00:00-03:00",
    blockers: "Disponibilidade dos administradores dos grupos.", nextAction: "Preencher o mapa de grupos.",
    evidence: "Mapa de grupos e capitães.", definitionOfDone: "Pelo menos 80% dos grupos relevantes mapeados.",
  },
  {
    externalId: "T219", title: "Meta e BSP aprovarem WABA e templates",
    description: "Dependência para escala oficial de mensagens com opt-in.",
    status: "blocked", priority: "urgent", sourcePriority: "P0", assigneeId: null,
    assigneeName: "Meta/BSP", backupAssignee: "Nilton Macario", listId: listIds.waiting,
    subarea: "WhatsApp", phase: "Aguardando terceiro", dueAt: "2026-08-21T18:00:00-03:00",
    blockers: "Análise externa da Meta/BSP.", nextAction: "Abrir protocolo e acompanhar diariamente.",
    evidence: "WABA ativa e templates aprovados.", definitionOfDone: "WABA operacional com pelo menos cinco templates aprovados.", vendor: "Meta/BSP",
  },
  {
    externalId: "T220", title: "Liberar credenciais de domínio, CMS, analytics e painel",
    description: "Acessos necessários para publicação, tracking e QA do site.",
    status: "blocked", priority: "urgent", sourcePriority: "P0", assigneeId: memberIds.nilton,
    assigneeName: "Nilton Macario", listId: listIds.waiting, subarea: "Acessos", phase: "Aguardando credenciais",
    dueAt: "2026-08-10T12:00:00-03:00", blockers: "Credenciais sob posse dos proprietários das contas.",
    nextAction: "Identificar proprietários e solicitar acesso mínimo.", evidence: "Acessos testados.",
    definitionOfDone: "Todos os acessos mínimos funcionam com MFA habilitado.",
  },
  {
    externalId: "T221", title: "Crawlear o catálogo global da Uber por famílias de template",
    description: "Executar depois de fechar Brasil e validar quais padrões geram valor para o GO.",
    status: "backlog", priority: "low", sourcePriority: "P3", assigneeId: memberIds.nilton,
    assigneeName: "Nilton Macario", listId: listIds.someday, subarea: "Benchmark", phase: "Pós-fundação",
    nextAction: "Definir o escopo global depois do recorte Brasil.", definitionOfDone: "Inventário global agrupado por template e intenção.",
  },
  {
    externalId: "T222", title: "Abrir a árvore de passageiros e páginas locais por bairro",
    description: "Iniciar somente quando os três clusters âncora estiverem verdes.",
    status: "backlog", priority: "medium", sourcePriority: "P2", assigneeId: memberIds.nilton,
    assigneeName: "Nilton Macario", backupAssignee: "Lucas Monteiro", listId: listIds.someday,
    subarea: "Passageiros e local", phase: "Pós-lançamento", blockers: "Liquidez dos três clusters ainda não comprovada.",
    nextAction: "Aguardar o semáforo verde.", definitionOfDone: "Árvore publicada somente nos clusters com guardrails aprovados.",
  },
  {
    externalId: "T223", title: "Criar a frente B2B e empresas",
    description: "Cobrir vouchers, eventos, deslocamento corporativo e parcerias depois da estabilização da Onda 1.",
    status: "backlog", priority: "low", sourcePriority: "P3", assigneeId: memberIds.lucas,
    assigneeName: "Lucas Monteiro", listId: listIds.someday, subarea: "B2B", phase: "Pós-lançamento",
    nextAction: "Revisar após a semana 1.", definitionOfDone: "Oferta e árvore B2B aprovadas com caso de uso prioritário.",
  },
  {
    externalId: "T224", title: "Criar a biblioteca pública de newsroom e transparência",
    description: "Organizar comunicados, segurança, sustentabilidade e dados após definir governança editorial.",
    status: "backlog", priority: "low", sourcePriority: "P3", assigneeId: memberIds.will,
    assigneeName: "Will Trindade", backupAssignee: "Nilton Macario", listId: listIds.someday,
    subarea: "Newsroom", phase: "Pós-lançamento", blockers: "Governança editorial ainda não formalizada.",
    nextAction: "Nomear porta-voz e fluxo de aprovação.", definitionOfDone: "Newsroom com dono, política de revisão e primeiros comunicados.",
  },
  {
    externalId: "T225", title: "Inventariar a pasta launch e identificar a fonte canônica do War Room",
    description: "Mapeamento da estrutura local e da fonte única de verdade concluído.",
    status: "done", priority: "high", sourcePriority: "P1", assigneeId: memberIds.nilton,
    assigneeName: "Nilton Macario", listId: listIds.done, subarea: "Pesquisa", phase: "Concluído 08/08",
    startAt: "2026-08-08T09:00:00-03:00", dueAt: "2026-08-08T14:00:00-03:00",
    evidence: "Inventário da pasta launch.", definitionOfDone: "Fonte canônica e ordem de leitura identificadas.",
  },
  {
    externalId: "T226", title: "Confirmar as seis frentes dos Google Docs",
    description: "Motoristas, geo, WhatsApp, conteúdo, inteligência e riscos confirmados.",
    status: "done", priority: "high", sourcePriority: "P1", assigneeId: memberIds.nilton,
    assigneeName: "Nilton Macario", listId: listIds.done, subarea: "Pesquisa", phase: "Concluído 08/08",
    startAt: "2026-08-08T09:00:00-03:00", dueAt: "2026-08-08T14:00:00-03:00",
    evidence: "Metadados dos seis documentos.", definitionOfDone: "As seis frentes estão mapeadas e ligadas ao War Room.",
  },
  {
    externalId: "T227", title: "Medir a arquitetura pública da Uber Brasil e separar famílias de URLs",
    description: "Sitemap brasileiro medido com 7.117 URLs e famílias relevantes identificadas.",
    status: "done", priority: "high", sourcePriority: "P1", assigneeId: memberIds.nilton,
    assigneeName: "Nilton Macario", listId: listIds.done, subarea: "Benchmark", phase: "Concluído 08/08",
    startAt: "2026-08-08T09:00:00-03:00", dueAt: "2026-08-08T14:00:00-03:00",
    evidence: "Inventário CSV com 7.117 URLs.", definitionOfDone: "Famílias de conteúdo, produto e redirects separadas.",
  },
  {
    externalId: "T228", title: "Transformar a análise Uber em inventário e matriz de templates para o GO",
    description: "Blueprint do projeto e do blog criado sem copiar textos ou identidade da Uber.",
    status: "done", priority: "high", sourcePriority: "P1", assigneeId: memberIds.nilton,
    assigneeName: "Nilton Macario", listId: listIds.done, subarea: "Arquitetura", phase: "Concluído 08/08",
    startAt: "2026-08-08T09:00:00-03:00", dueAt: "2026-08-08T14:00:00-03:00",
    evidence: "Blueprint e matriz de templates.", definitionOfDone: "Árvore mínima e backlog editorial definidos.",
  },
];

const taskIdByExternalId = new Map(
  rawTasks.map(({ externalId }) => [externalId, `c0040000-0000-4000-8000-000000000${externalId.slice(1)}`]),
);
const positionByList = new Map<string, number>();

function sourceDate(value?: string | null): { date: string; time: string } {
  if (!value) return { date: "", time: "" };
  return { date: value.slice(0, 10), time: value.slice(11, 16) };
}

function sourceStatus(status: WorkspaceTask["status"]): string {
  if (status === "blocked") return "BLOQUEADO";
  if (status === "backlog") return "BACKLOG";
  if (status === "done") return "CONCLUIDO";
  return "NAO INICIADO";
}

export const goAppChecklistTasks: WorkspaceTask[] = rawTasks.map((input) => {
  const start = sourceDate(input.startAt);
  const due = sourceDate(input.dueAt);
  const position = positionByList.get(input.listId) ?? 0;
  positionByList.set(input.listId, position + 1);
  const dependencies = (input.dependencies ?? []).map((externalId) => ({
    externalId,
    taskId: taskIdByExternalId.get(externalId) ?? null,
  }));
  const id = taskIdByExternalId.get(input.externalId) as string;
  const listName = goAppChecklistLists.find(({ id: candidateId }) => candidateId === input.listId)?.name ?? "GO App";
  return {
    id,
    externalId: input.externalId,
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    assigneeId: input.assigneeId,
    backupAssignee: input.backupAssignee ?? null,
    listId: input.listId,
    subarea: input.subarea,
    phase: input.phase,
    startAt: input.startAt ?? null,
    dueAt: input.dueAt ?? null,
    tags: ["GO App", "Lançamento 15/09", input.sourcePriority],
    vendor: input.vendor ?? null,
    cost: null,
    blockers: input.blockers ?? null,
    nextAction: input.nextAction ?? null,
    notes: input.notes ?? null,
    evidence: input.evidence ?? null,
    approval: input.sourcePriority === "P0" ? "War Room GO" : null,
    risk: input.status === "blocked" ? input.blockers ?? "Dependência externa" : null,
    definitionOfDone: input.definitionOfDone ?? null,
    source: "TASKS.md · GO_APP_PROJECT · 08/08/2026",
    sourceUrl: "https://edrive-go.vercel.app/app/tarefas",
    dependencies,
    checklist: [],
    position,
    sourceMeta: {
      ID: input.externalId,
      Frente: "GO App — Lançamento 15/09",
      Subfrente: input.subarea,
      Fase: input.phase,
      Descricao_da_Tarefa: input.title,
      Responsavel_Funcao: input.subarea,
      Responsavel_Nominal_Sugerido: input.assigneeName,
      Responsavel_Substituto: input.backupAssignee ?? "-",
      Prioridade: input.sourcePriority,
      Status: sourceStatus(input.status),
      Data_Inicio: start.date,
      Hora_Inicio: start.time,
      Prazo: due.date,
      Hora_Limite: due.time,
      Dependencias: (input.dependencies ?? []).join(", ") || "-",
      Bloqueadores: input.blockers ?? "-",
      Aprovacao_Necessaria: input.sourcePriority === "P0" ? "War Room GO" : "Nao",
      Fornecedor: input.vendor ?? "-",
      Custo_Previsto: "0",
      Tipo_Custo: "sem custo definido",
      Centro_Custo: "GO App",
      Evidencia_Exigida: input.evidence ?? "Atualização no painel",
      Definicao_de_Concluido: input.definitionOfDone ?? "Critério registrado na tarefa",
      Risco_Associado: input.status === "blocked" ? input.blockers ?? "Dependência externa" : "-",
      Proxima_Acao: input.nextAction ?? "Executar conforme prioridade",
      Observacoes: `Lista: ${listName}`,
      Fonte_da_Informacao: "TASKS.md · GO_APP_PROJECT · 08/08/2026",
      Link_Comprovante: "https://edrive-go.vercel.app/app/tarefas",
    },
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  };
});

export const goAppChecklistSeed = {
  members: goAppChecklistMembers,
  spaces: goAppChecklistSpaces,
  lists: goAppChecklistLists,
  tasks: goAppChecklistTasks,
};

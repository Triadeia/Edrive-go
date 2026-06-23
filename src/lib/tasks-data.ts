export const taskStatuses = ["Backlog", "A Fazer", "Em andamento", "Em revisao", "Bloqueada", "Concluida", "Cancelada"] as const;
export const taskPriorities = ["Urgente", "Alta", "Media", "Baixa"] as const;

export type TaskStatus = (typeof taskStatuses)[number];
export type TaskPriority = (typeof taskPriorities)[number];

export interface EdriveTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  owner: string;
  area: string;
  project: string;
  dueDate: string;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export type TaskInput = Omit<EdriveTask, "id" | "score" | "createdAt" | "updatedAt"> & { score?: number };

export const seedTasks: EdriveTask[] = [
  ["task-brandbook", "Finalizar brandbook premium eDrive Go", "Revisar guidelines, logomarcas, paleta, aplicacoes e movimento.", "Concluida", "Urgente", "Nilton", "Marca", "Brandbook eDrive Go", "2026-06-24", 98],
  ["task-movimento", "Publicar narrativa Motorista Livre", "Organizar manifesto, crenças, rituais e frases de impacto.", "Em andamento", "Urgente", "Copy", "Movimento", "Movimento eDrive Go", "2026-06-25", 94],
  ["task-docs", "Organizar documentos clicaveis", "Garantir leitura completa dos documentos no painel.", "Concluida", "Alta", "Produto", "Acervo", "Documentos", "2026-06-26", 91],
  ["task-icp", "Refinar ICPs e dores do motorista", "Transformar voz do cliente em filtros de decisao e mensagens.", "A Fazer", "Alta", "Inteligencia", "Cliente", "Inteligencia do Cliente", "2026-06-27", 88],
  ["task-kpi", "Criar painel de tarefas do modulo 01", "Subir area de tarefas com lista, kanban, calendario e API.", "Em andamento", "Urgente", "Codex", "Produto Digital", "Painel eDrive Go", "2026-06-23", 96],
  ["task-fotos", "Substituir imagens geradas por fotos oficiais", "Adicionar fotos reais de hub, frota, motorista e recarga quando liberadas.", "Backlog", "Media", "Design", "Visual", "Assets oficiais", "2026-07-01", 72],
  ["task-vercel", "Validar deploy de producao", "Conferir rotas publicadas, API de tarefas e responsividade.", "A Fazer", "Alta", "Codex", "Produto Digital", "Vercel", "2026-06-23", 86],
  ["task-copy", "Criar biblioteca de headlines para anuncios", "Separar hooks por Maldicao da Gasolina, Virada Eletrica e economia.", "Backlog", "Media", "Copy", "Conteudo", "Banco de Hooks", "2026-07-03", 70],
  ["task-energy", "Explicar relacao Go + Energy", "Criar bloco visual mostrando entrada pelo Go e fidelizacao pela Energy.", "Em revisao", "Alta", "Estrategia", "Ecossistema", "eDrive Energy", "2026-06-28", 82],
  ["task-comunidade", "Desenhar ritos da comunidade", "Transformar ativacao, primeira recarga e 30 dias livre em tarefas operacionais.", "Bloqueada", "Media", "Comunidade", "Movimento", "Motorista Livre", "2026-07-05", 66],
].map(([id, title, description, status, priority, owner, area, project, dueDate, score], index) => {
  const createdAt = new Date(Date.UTC(2026, 5, 20, 10, index)).toISOString();
  return {
    id,
    title,
    description,
    status,
    priority,
    owner,
    area,
    project,
    dueDate,
    score,
    createdAt,
    updatedAt: createdAt,
  } as EdriveTask;
});

export function makeTask(input: TaskInput): EdriveTask {
  const now = new Date().toISOString();
  return {
    id: `task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    ...input,
    score: input.score ?? scoreTask(input.priority, input.status, input.dueDate),
    createdAt: now,
    updatedAt: now,
  };
}

export function scoreTask(priority: TaskPriority, status: TaskStatus, dueDate: string) {
  const priorityScore = { Urgente: 38, Alta: 30, Media: 22, Baixa: 14 }[priority];
  const statusScore = { Bloqueada: 28, "Em andamento": 24, "A Fazer": 20, "Em revisao": 18, Backlog: 12, Concluida: 4, Cancelada: 0 }[status];
  const diff = Math.ceil((new Date(`${dueDate}T12:00:00`).getTime() - Date.now()) / 86_400_000);
  const dueScore = diff <= 0 ? 30 : diff <= 2 ? 24 : diff <= 7 ? 16 : 8;
  return Math.min(100, priorityScore + statusScore + dueScore);
}

export function normalizeTask(input: Partial<EdriveTask> & { title?: string }): TaskInput {
  return {
    title: String(input.title || "Nova tarefa eDrive Go").slice(0, 140),
    description: String(input.description || "").slice(0, 500),
    status: taskStatuses.includes(input.status as TaskStatus) ? input.status as TaskStatus : "A Fazer",
    priority: taskPriorities.includes(input.priority as TaskPriority) ? input.priority as TaskPriority : "Media",
    owner: String(input.owner || "Equipe eDrive").slice(0, 80),
    area: String(input.area || "Operacao").slice(0, 80),
    project: String(input.project || "Painel eDrive Go").slice(0, 100),
    dueDate: /^\d{4}-\d{2}-\d{2}$/.test(String(input.dueDate)) ? String(input.dueDate) : new Date().toISOString().slice(0, 10),
  };
}

import launchSeedJson from "../../data/tasks/launch-workspace-seed.json";
import { launchWorkspaceSchema } from "./workspace-schema";

export const LAUNCH_SOURCE_HEADER_MAP = [
  { header: "ID", field: "externalId" },
  { header: "Frente", field: "listId" },
  { header: "Subfrente", field: "subarea" },
  { header: "Fase", field: "phase" },
  { header: "Descricao_da_Tarefa", field: "title" },
  { header: "Responsavel_Funcao", field: "sourceMeta.Responsavel_Funcao" },
  { header: "Responsavel_Nominal_Sugerido", field: "assigneeId" },
  { header: "Responsavel_Substituto", field: "backupAssignee" },
  { header: "Prioridade", field: "priority" },
  { header: "Status", field: "status" },
  { header: "Data_Inicio", field: "startAt.date" },
  { header: "Hora_Inicio", field: "startAt.time" },
  { header: "Prazo", field: "dueAt.date" },
  { header: "Hora_Limite", field: "dueAt.time" },
  { header: "Dependencias", field: "dependencies" },
  { header: "Bloqueadores", field: "blockers" },
  { header: "Aprovacao_Necessaria", field: "approval" },
  { header: "Fornecedor", field: "vendor" },
  { header: "Custo_Previsto", field: "cost" },
  { header: "Tipo_Custo", field: "sourceMeta.Tipo_Custo" },
  { header: "Centro_Custo", field: "tags.Centro_Custo" },
  { header: "Evidencia_Exigida", field: "evidence" },
  { header: "Definicao_de_Concluido", field: "definitionOfDone" },
  { header: "Risco_Associado", field: "risk" },
  { header: "Proxima_Acao", field: "nextAction" },
  { header: "Observacoes", field: "notes" },
  { header: "Fonte_da_Informacao", field: "source" },
  { header: "Link_Comprovante", field: "sourceUrl" },
] as const;

export const launchWorkspaceSeed = launchWorkspaceSchema.parse(launchSeedJson);

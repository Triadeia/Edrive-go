import { LAUNCH_SOURCE_HEADER_MAP } from "./workspace-seed";
import {
  type WorkspaceEnvelope,
  type WorkspaceTask,
  validateWorkspaceEnvelope,
} from "./workspace-store";

function neutralizeFormula(value: string): string {
  return /^\s*[=+\-@]/.test(value) ? `'${value}` : value;
}

function csvCell(value: unknown): string {
  const text = neutralizeFormula(value === null || value === undefined ? "" : String(value));
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function datePart(value: string | null): string {
  return value?.slice(0, 10) ?? "";
}

function timePart(value: string | null): string {
  return value?.slice(11, 16) ?? "";
}

function currentSourceRow(
  workspace: WorkspaceEnvelope,
  task: WorkspaceTask,
): Record<string, string> {
  const list = workspace.lists.find(({ id }) => id === task.listId);
  const assignee = workspace.members.find(({ id }) => id === task.assigneeId);
  return {
    ...task.sourceMeta,
    ID: task.externalId,
    Frente: list?.name ?? "",
    Subfrente: task.subarea,
    Fase: task.phase,
    Descricao_da_Tarefa: task.title,
    Responsavel_Nominal_Sugerido: assignee?.name ?? "",
    Responsavel_Substituto: task.backupAssignee ?? "",
    Prioridade: task.priority,
    Status: task.status,
    Data_Inicio: datePart(task.startAt),
    Hora_Inicio: timePart(task.startAt),
    Prazo: datePart(task.dueAt),
    Hora_Limite: timePart(task.dueAt),
    Dependencias: task.dependencies.map(({ externalId }) => externalId).join(", "),
    Bloqueadores: task.blockers ?? "",
    Aprovacao_Necessaria: task.approval ?? "",
    Fornecedor: task.vendor ?? "",
    Custo_Previsto: task.cost === null ? "" : String(task.cost),
    Centro_Custo: task.tags.join("; "),
    Evidencia_Exigida: task.evidence ?? "",
    Definicao_de_Concluido: task.definitionOfDone ?? "",
    Risco_Associado: task.risk ?? "",
    Proxima_Acao: task.nextAction ?? "",
    Observacoes: task.notes ?? "",
    Fonte_da_Informacao: task.source ?? "",
    Link_Comprovante: task.sourceUrl ?? "",
  };
}

export function exportWorkspaceCsv(candidate: WorkspaceEnvelope): string {
  const workspace = validateWorkspaceEnvelope(candidate);
  const headers = LAUNCH_SOURCE_HEADER_MAP.map(({ header }) => header);
  const rows = workspace.tasks.map((task) => {
    const values = currentSourceRow(workspace, task);
    return headers.map((header) => csvCell(values[header])).join(",");
  });
  return [headers.join(","), ...rows].join("\n");
}

export function exportWorkspaceJson(candidate: WorkspaceEnvelope): string {
  return JSON.stringify(validateWorkspaceEnvelope(candidate), null, 2);
}

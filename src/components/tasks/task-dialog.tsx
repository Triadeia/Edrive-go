"use client";

import { Plus, Trash2, X } from "lucide-react";
import { cloneElement, useMemo, useRef, useState, type ReactElement } from "react";

import { priorityLabels, statusLabels } from "./task-views";
import { AccessibleDialog } from "./accessible-dialog";
import { bahiaWallClock, isoFromBahiaWallClock } from "@/lib/tasks/workspace-dates";
import type { CreateTaskInput, UpdateTaskInput, WorkspaceEnvelope, WorkspaceTask } from "@/lib/tasks/workspace-store";

type TaskDraft = CreateTaskInput;

const emptySourceMeta: WorkspaceTask["sourceMeta"] = {
  ID: "", Frente: "", Subfrente: "", Fase: "", Descricao_da_Tarefa: "",
  Responsavel_Funcao: "", Responsavel_Nominal_Sugerido: "", Responsavel_Substituto: "",
  Prioridade: "", Status: "", Data_Inicio: "", Hora_Inicio: "", Prazo: "", Hora_Limite: "",
  Dependencias: "", Bloqueadores: "", Aprovacao_Necessaria: "", Fornecedor: "",
  Custo_Previsto: "", Tipo_Custo: "", Centro_Custo: "", Evidencia_Exigida: "",
  Definicao_de_Concluido: "", Risco_Associado: "", Proxima_Acao: "", Observacoes: "",
  Fonte_da_Informacao: "", Link_Comprovante: "",
};

function blankToNull(value: string): string | null {
  const result = value.trim();
  return result ? result : null;
}

function localDateTime(iso: string | null): string {
  return iso ? bahiaWallClock(iso) : "";
}

function toIso(value: string): string | null {
  return value ? isoFromBahiaWallClock(value) : null;
}

function makeDraft(workspace: WorkspaceEnvelope, task?: WorkspaceTask | null, initialDate?: string): TaskDraft {
  if (task) {
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...input } = task;
    return structuredClone(input);
  }
  const dueAt = initialDate ? isoFromBahiaWallClock(`${initialDate}T18:00`) : null;
  return {
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assigneeId: null,
    backupAssignee: null,
    listId: [...workspace.lists].sort((a, b) => a.position - b.position)[0]?.id ?? "",
    subarea: "Operação",
    phase: "Planejamento",
    startAt: null,
    dueAt,
    tags: [],
    vendor: null,
    cost: null,
    blockers: null,
    nextAction: null,
    notes: null,
    evidence: null,
    approval: null,
    risk: null,
    definitionOfDone: null,
    source: null,
    sourceUrl: null,
    dependencies: [],
    checklist: [],
    sourceMeta: structuredClone(emptySourceMeta),
  };
}

export function TaskDialog({ workspace, task, initialDate, onClose, onSave }: {
  workspace: WorkspaceEnvelope;
  task: WorkspaceTask | null;
  initialDate?: string;
  onClose: () => void;
  onSave: (input: CreateTaskInput | UpdateTaskInput) => Promise<void>;
}) {
  const [draft, setDraft] = useState<TaskDraft>(() => makeDraft(workspace, task, initialDate));
  const pendingRef = useRef(false);
  const [pending, setPending] = useState(false);
  const [newChecklist, setNewChecklist] = useState("");
  const dependencyOptions = useMemo(() => workspace.tasks.filter((candidate) => candidate.id !== task?.id && !draft.dependencies.some((dependency) => dependency.taskId === candidate.id)), [draft.dependencies, task?.id, workspace.tasks]);

  const patch = <K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const addChecklist = () => {
    if (!newChecklist.trim()) return;
    patch("checklist", [...draft.checklist, { title: newChecklist.trim(), completed: false }]);
    setNewChecklist("");
  };
  const addDependency = (taskId: string) => {
    const target = workspace.tasks.find((candidate) => candidate.id === taskId);
    if (target) patch("dependencies", [...draft.dependencies, { taskId: target.id, externalId: target.externalId }]);
  };

  return (
    <AccessibleDialog className="max-w-5xl" labelledBy="task-dialog-title" onClose={onClose}>
        <header className="modal-header"><div><p className="kicker">{task ? `Editar ${task.externalId}` : "Nova tarefa"}</p><h2 id="task-dialog-title" className="mt-1 text-2xl font-black">Dados operacionais</h2></div><button type="button" className="icon-button" aria-label="Fechar formulário de tarefa" onClick={onClose}><X className="size-5" /></button></header>
        <form className="max-h-[76vh] overflow-y-auto p-5" onSubmit={async (event) => { event.preventDefault(); if (!draft.title.trim() || pendingRef.current) return; pendingRef.current = true; setPending(true); try { await onSave({ ...draft, title: draft.title.trim() }); } finally { pendingRef.current = false; setPending(false); } }}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Título" className="md:col-span-2 lg:col-span-3"><input data-dialog-autofocus required value={draft.title} onChange={(event) => patch("title", event.target.value)} /></Field>
            <Field label="Descrição" className="md:col-span-2 lg:col-span-3"><textarea rows={3} value={draft.description} onChange={(event) => patch("description", event.target.value)} /></Field>
            <Field label="Status"><select value={draft.status} onChange={(event) => patch("status", event.target.value as TaskDraft["status"])}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
            <Field label="Prioridade"><select value={draft.priority} onChange={(event) => patch("priority", event.target.value as TaskDraft["priority"])}>{Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
            <Field label="Responsável"><select value={draft.assigneeId ?? ""} onChange={(event) => patch("assigneeId", event.target.value || null)}><option value="">Sem responsável</option>{workspace.members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></Field>
            <Field label="Substituto"><input value={draft.backupAssignee ?? ""} onChange={(event) => patch("backupAssignee", blankToNull(event.target.value))} /></Field>
            <Field label="Lista"><select required value={draft.listId} onChange={(event) => patch("listId", event.target.value)}>{[...workspace.spaces].sort((a, b) => a.position - b.position).map((space) => <optgroup key={space.id} label={`${space.emoji} ${space.name}`}>{workspace.lists.filter((list) => list.spaceId === space.id).sort((a, b) => a.position - b.position).map((list) => <option key={list.id} value={list.id}>{list.name}</option>)}</optgroup>)}</select></Field>
            <Field label="Subfrente"><input required value={draft.subarea} onChange={(event) => patch("subarea", event.target.value)} /></Field>
            <Field label="Fase"><input required value={draft.phase} onChange={(event) => patch("phase", event.target.value)} /></Field>
            <Field label="Início"><input type="datetime-local" value={localDateTime(draft.startAt)} onChange={(event) => patch("startAt", toIso(event.target.value))} /></Field>
            <Field label="Prazo"><input type="datetime-local" value={localDateTime(draft.dueAt)} onChange={(event) => patch("dueAt", toIso(event.target.value))} /></Field>
            <Field label="Tags"><input value={draft.tags.join(", ")} placeholder="local, urgente" onChange={(event) => patch("tags", event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean))} /></Field>
            <Field label="Fornecedor"><input value={draft.vendor ?? ""} onChange={(event) => patch("vendor", blankToNull(event.target.value))} /></Field>
            <Field label="Custo previsto"><input type="number" min="0" step="0.01" value={draft.cost ?? ""} onChange={(event) => patch("cost", event.target.value === "" ? null : Number(event.target.value))} /></Field>
            <Field label="Bloqueios"><textarea rows={2} value={draft.blockers ?? ""} onChange={(event) => patch("blockers", blankToNull(event.target.value))} /></Field>
            <Field label="Próxima ação"><textarea rows={2} value={draft.nextAction ?? ""} onChange={(event) => patch("nextAction", blankToNull(event.target.value))} /></Field>
            <Field label="Notas"><textarea rows={2} value={draft.notes ?? ""} onChange={(event) => patch("notes", blankToNull(event.target.value))} /></Field>
            <Field label="Evidência"><textarea rows={2} value={draft.evidence ?? ""} onChange={(event) => patch("evidence", blankToNull(event.target.value))} /></Field>
            <Field label="Aprovação"><textarea rows={2} value={draft.approval ?? ""} onChange={(event) => patch("approval", blankToNull(event.target.value))} /></Field>
            <Field label="Risco"><textarea rows={2} value={draft.risk ?? ""} onChange={(event) => patch("risk", blankToNull(event.target.value))} /></Field>
            <Field label="Definição de concluído" className="md:col-span-2"><textarea rows={2} value={draft.definitionOfDone ?? ""} onChange={(event) => patch("definitionOfDone", blankToNull(event.target.value))} /></Field>
            <Field label="Origem"><input value={draft.source ?? ""} onChange={(event) => patch("source", blankToNull(event.target.value))} /></Field>
            <Field label="URL da origem" className="md:col-span-2"><input type="url" value={draft.sourceUrl ?? ""} onChange={(event) => patch("sourceUrl", blankToNull(event.target.value))} /></Field>
          </div>

          <section className="mt-6 rounded-lg border border-[var(--border)] p-4">
            <h3 className="font-black">Checklist</h3>
            <div className="mt-3 space-y-2">{draft.checklist.map((item, index) => <div key={item.id ?? `${item.title}-${index}`} className="flex items-center gap-2"><input aria-label={`Concluir ${item.title}`} type="checkbox" checked={item.completed} onChange={(event) => patch("checklist", draft.checklist.map((candidate, itemIndex) => itemIndex === index ? { ...candidate, completed: event.target.checked } : candidate))} /><span className="flex-1 text-sm">{item.title}</span><button type="button" className="icon-button danger" aria-label={`Remover ${item.title}`} onClick={() => patch("checklist", draft.checklist.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="size-3.5" /></button></div>)}</div>
            <div className="mt-3 flex gap-2"><label className="sr-only" htmlFor="new-checklist">Novo item do checklist</label><input id="new-checklist" className="form-control flex-1" value={newChecklist} onChange={(event) => setNewChecklist(event.target.value)} placeholder="Novo item do checklist" /><button type="button" className="secondary-button" aria-label="Adicionar item ao checklist" onClick={addChecklist}><Plus className="size-4" /> Adicionar</button></div>
          </section>

          <section className="mt-4 rounded-lg border border-[var(--border)] p-4">
            <h3 className="font-black">Dependências</h3>
            <div className="mt-3 flex flex-wrap gap-2">{draft.dependencies.map((dependency) => <span key={dependency.taskId ?? dependency.externalId} className="inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-bold">{dependency.externalId}<button type="button" aria-label={`Remover dependência ${dependency.externalId}`} onClick={() => patch("dependencies", draft.dependencies.filter((candidate) => candidate.taskId !== dependency.taskId))}><X className="size-3" /></button></span>)}</div>
            <label className="mt-3 block text-xs font-black">Adicionar dependência<select className="form-control mt-1" value="" onChange={(event) => addDependency(event.target.value)}><option value="">Selecionar tarefa</option>{dependencyOptions.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.externalId} — {candidate.title}</option>)}</select></label>
          </section>

          <footer className="mt-6 flex justify-end gap-2 border-t border-[var(--border)] pt-4"><button type="button" className="secondary-button" disabled={pending} onClick={onClose}>Cancelar</button><button type="submit" className="primary-button" disabled={pending}>{pending ? "Salvando…" : "Salvar tarefa"}</button></footer>
        </form>
    </AccessibleDialog>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: ReactElement<{ className?: string; id?: string }> }) {
  const id = `field-${label.toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, "-")}`;
  return <label className={`block text-xs font-black ${className}`} htmlFor={id}>{label}<span className="mt-1 block">{cloneElement(children, { id, className: `form-control ${children.props.className ?? ""}` })}</span></label>;
}

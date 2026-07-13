"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { WorkspaceEnvelope, WorkspaceList, WorkspaceMember, WorkspaceSpace, WorkspaceTask } from "@/lib/tasks/workspace-store";

function Modal({ title, kicker, onClose, children }: { title: string; kicker: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="modal-backdrop" role="presentation"><section className="modal-card max-w-lg" role="dialog" aria-modal="true" aria-labelledby="workspace-dialog-title"><header className="modal-header"><div><p className="kicker">{kicker}</p><h2 id="workspace-dialog-title" className="mt-1 text-xl font-black">{title}</h2></div><button type="button" className="icon-button" aria-label="Fechar diálogo" onClick={onClose}><X className="size-5" /></button></header>{children}</section></div>;
}

export function MemberDialog({ member, onClose, onSave }: { member: WorkspaceMember | null; onClose: () => void; onSave: (input: Omit<WorkspaceMember, "id">) => void }) {
  const [name, setName] = useState(member?.name ?? "");
  const [role, setRole] = useState(member?.role ?? "Operação");
  const [color, setColor] = useState(member?.color ?? "#00c896");
  return <Modal kicker="Equipe" title={member ? "Editar funcionário" : "Adicionar funcionário"} onClose={onClose}><form className="space-y-4 p-5" onSubmit={(event) => { event.preventDefault(); if (name.trim() && role.trim()) onSave({ name: name.trim(), role: role.trim(), color }); }}><label className="block text-xs font-black">Nome do funcionário<input className="form-control mt-1" required value={name} onChange={(event) => setName(event.target.value)} /></label><label className="block text-xs font-black">Função do funcionário<input className="form-control mt-1" required value={role} onChange={(event) => setRole(event.target.value)} /></label><label className="block text-xs font-black">Cor do funcionário<input className="ml-3 h-10 w-16 align-middle" type="color" value={color} onChange={(event) => setColor(event.target.value)} /></label><DialogActions onClose={onClose} submitLabel="Salvar funcionário" /></form></Modal>;
}

export function SpaceDialog({ space, onClose, onSave }: { space: WorkspaceSpace | null; onClose: () => void; onSave: (input: { name: string; emoji: string }) => void }) {
  const [name, setName] = useState(space?.name ?? "");
  const [emoji, setEmoji] = useState(space?.emoji ?? "📁");
  return <Modal kicker="Estrutura" title={space ? "Editar space" : "Adicionar space"} onClose={onClose}><form className="space-y-4 p-5" onSubmit={(event) => { event.preventDefault(); if (name.trim() && emoji.trim()) onSave({ name: name.trim(), emoji: emoji.trim() }); }}><label className="block text-xs font-black">Nome do space<input className="form-control mt-1" required value={name} onChange={(event) => setName(event.target.value)} /></label><label className="block text-xs font-black">Emoji do space<input className="form-control mt-1" required value={emoji} onChange={(event) => setEmoji(event.target.value)} /></label><DialogActions onClose={onClose} submitLabel="Salvar space" /></form></Modal>;
}

export function ListDialog({ workspace, list, spaceId, onClose, onSave }: { workspace: WorkspaceEnvelope; list: WorkspaceList | null; spaceId?: string; onClose: () => void; onSave: (input: { name: string; color: string; spaceId: string }) => void }) {
  const [name, setName] = useState(list?.name ?? "");
  const [color, setColor] = useState(list?.color ?? "#00c896");
  const [ownerSpaceId, setOwnerSpaceId] = useState(list?.spaceId ?? spaceId ?? workspace.spaces[0]?.id ?? "");
  return <Modal kicker="Estrutura" title={list ? "Editar lista" : "Adicionar lista"} onClose={onClose}><form className="space-y-4 p-5" onSubmit={(event) => { event.preventDefault(); if (name.trim() && ownerSpaceId) onSave({ name: name.trim(), color, spaceId: ownerSpaceId }); }}><label className="block text-xs font-black">Nome da lista<input className="form-control mt-1" required value={name} onChange={(event) => setName(event.target.value)} /></label><label className="block text-xs font-black">Space<select className="form-control mt-1" value={ownerSpaceId} onChange={(event) => setOwnerSpaceId(event.target.value)}>{workspace.spaces.map((space) => <option key={space.id} value={space.id}>{space.emoji} {space.name}</option>)}</select></label><label className="block text-xs font-black">Cor da lista<input className="ml-3 h-10 w-16 align-middle" type="color" value={color} onChange={(event) => setColor(event.target.value)} /></label><DialogActions onClose={onClose} submitLabel="Salvar lista" /></form></Modal>;
}

export function TaskDeleteDialog({ task, onClose, onConfirm }: { task: WorkspaceTask; onClose: () => void; onConfirm: () => void }) {
  return <Modal kicker="Exclusão segura" title={`Excluir ${task.externalId}?`} onClose={onClose}><div className="p-5"><Impact>Dependências que apontam para esta tarefa serão removidas.</Impact><p className="mt-4 text-sm font-bold">{task.title}</p><DialogActions danger onClose={onClose} submitLabel="Excluir tarefa definitivamente" onSubmit={onConfirm} /></div></Modal>;
}

type StructureDelete =
  | { kind: "member"; entity: WorkspaceMember }
  | { kind: "list"; entity: WorkspaceList }
  | { kind: "space"; entity: WorkspaceSpace };

export function StructureDeleteDialog({ workspace, target, onClose, onConfirm }: { workspace: WorkspaceEnvelope; target: StructureDelete; onClose: () => void; onConfirm: (destinationListId?: string) => void }) {
  const blockedListIds = useMemo(() => target.kind === "space" ? new Set(workspace.lists.filter((list) => list.spaceId === target.entity.id).map((list) => list.id)) : new Set(target.kind === "list" ? [target.entity.id] : []), [target, workspace.lists]);
  const destinations = workspace.lists.filter((list) => !blockedListIds.has(list.id));
  const [destinationListId, setDestinationListId] = useState("");
  useEffect(() => setDestinationListId(""), [target]);
  const name = target.entity.name;
  const taskCount = target.kind === "member" ? workspace.tasks.filter((task) => task.assigneeId === target.entity.id).length : target.kind === "list" ? workspace.tasks.filter((task) => task.listId === target.entity.id).length : workspace.tasks.filter((task) => blockedListIds.has(task.listId)).length;
  const title = target.kind === "member" ? `Excluir funcionário ${name}?` : target.kind === "list" ? `Excluir lista ${name}?` : `Excluir space ${name}?`;
  const submitLabel = target.kind === "member" ? "Excluir funcionário definitivamente" : target.kind === "list" ? "Excluir lista definitivamente" : "Excluir space definitivamente";
  const needsDestination = target.kind !== "member";
  return <Modal kicker="Exclusão segura" title={title} onClose={onClose}><form className="p-5" onSubmit={(event) => { event.preventDefault(); if (!needsDestination || destinationListId) onConfirm(destinationListId || undefined); }}><Impact>{target.kind === "member" ? "Tarefas atribuídas ficarão sem responsável." : `${taskCount} tarefa(s) serão movidas para a lista de destino antes da exclusão.`}</Impact>{needsDestination ? <label className="mt-4 block text-xs font-black">Lista de destino<select className="form-control mt-1" required value={destinationListId} onChange={(event) => setDestinationListId(event.target.value)}><option value="">Selecione uma lista</option>{destinations.map((list) => { const space = workspace.spaces.find((candidate) => candidate.id === list.spaceId); return <option key={list.id} value={list.id}>{space?.name} / {list.name}</option>; })}</select></label> : null}<DialogActions danger onClose={onClose} submitLabel={submitLabel} /></form></Modal>;
}

function Impact({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-3 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm"><AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-300" /><p>{children}</p></div>;
}

function DialogActions({ onClose, submitLabel, danger = false, onSubmit }: { onClose: () => void; submitLabel: string; danger?: boolean; onSubmit?: () => void }) {
  return <div className="mt-6 flex justify-end gap-2 border-t border-[var(--border)] pt-4"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button type={onSubmit ? "button" : "submit"} className={danger ? "danger-button" : "primary-button"} onClick={onSubmit}>{submitLabel}</button></div>;
}

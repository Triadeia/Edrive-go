"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { AccessibleDialog } from "./accessible-dialog";
import type {
  WorkspaceEnvelope,
  WorkspaceList,
  WorkspaceMember,
  WorkspaceSpace,
  WorkspaceTask,
} from "@/lib/tasks/workspace-store";

function usePendingAction() {
  const pendingRef = useRef(false);
  const [pending, setPending] = useState(false);
  const run = async (action: () => Promise<void>) => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    try {
      await action();
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  };
  return { pending, run };
}

function Modal({
  title,
  kicker,
  onClose,
  closeDisabled = false,
  children,
}: {
  title: string;
  kicker: string;
  onClose: () => void;
  closeDisabled?: boolean;
  children: ReactNode;
}) {
  return (
    <AccessibleDialog
      className="max-w-lg"
      labelledBy="workspace-dialog-title"
      onClose={onClose}
      closeDisabled={closeDisabled}
    >
      <header className="modal-header">
        <div>
          <p className="kicker">{kicker}</p>
          <h2 id="workspace-dialog-title" className="mt-1 text-xl font-black">{title}</h2>
        </div>
        <button type="button" disabled={closeDisabled} className="icon-button" aria-label="Fechar diálogo" onClick={onClose}>
          <X className="size-5" />
        </button>
      </header>
      {children}
    </AccessibleDialog>
  );
}

export function MemberDialog({ member, onClose, onSave }: {
  member: WorkspaceMember | null;
  onClose: () => void;
  onSave: (input: Omit<WorkspaceMember, "id">) => Promise<void>;
}) {
  const [name, setName] = useState(member?.name ?? "");
  const [role, setRole] = useState(member?.role ?? "Operação");
  const [color, setColor] = useState(member?.color ?? "#00c896");
  const action = usePendingAction();
  return (
    <Modal kicker="Equipe" title={member ? "Editar funcionário" : "Adicionar funcionário"} onClose={onClose} closeDisabled={action.pending}>
      <form className="space-y-4 p-5" onSubmit={(event) => {
        event.preventDefault();
        if (name.trim() && role.trim()) void action.run(() => onSave({ name: name.trim(), role: role.trim(), color }));
      }}>
        <label className="block text-xs font-black">Nome do funcionário<input data-dialog-autofocus className="form-control mt-1" required value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label className="block text-xs font-black">Função do funcionário<input className="form-control mt-1" required value={role} onChange={(event) => setRole(event.target.value)} /></label>
        <label className="block text-xs font-black">Cor do funcionário<input className="ml-3 h-10 w-16 align-middle" type="color" value={color} onChange={(event) => setColor(event.target.value)} /></label>
        <DialogActions pending={action.pending} onClose={onClose} submitLabel="Salvar funcionário" />
      </form>
    </Modal>
  );
}

export function SpaceDialog({ space, onClose, onSave }: {
  space: WorkspaceSpace | null;
  onClose: () => void;
  onSave: (input: { name: string; emoji: string }) => Promise<void>;
}) {
  const [name, setName] = useState(space?.name ?? "");
  const [emoji, setEmoji] = useState(space?.emoji ?? "📁");
  const action = usePendingAction();
  return (
    <Modal kicker="Estrutura" title={space ? "Editar space" : "Adicionar space"} onClose={onClose} closeDisabled={action.pending}>
      <form className="space-y-4 p-5" onSubmit={(event) => {
        event.preventDefault();
        if (name.trim() && emoji.trim()) void action.run(() => onSave({ name: name.trim(), emoji: emoji.trim() }));
      }}>
        <label className="block text-xs font-black">Nome do space<input data-dialog-autofocus className="form-control mt-1" required value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label className="block text-xs font-black">Emoji do space<input className="form-control mt-1" required value={emoji} onChange={(event) => setEmoji(event.target.value)} /></label>
        <DialogActions pending={action.pending} onClose={onClose} submitLabel="Salvar space" />
      </form>
    </Modal>
  );
}

export function ListDialog({ workspace, list, spaceId, onClose, onSave }: {
  workspace: WorkspaceEnvelope;
  list: WorkspaceList | null;
  spaceId?: string;
  onClose: () => void;
  onSave: (input: { name: string; color: string; spaceId: string }) => Promise<void>;
}) {
  const [name, setName] = useState(list?.name ?? "");
  const [color, setColor] = useState(list?.color ?? "#00c896");
  const [ownerSpaceId, setOwnerSpaceId] = useState(list?.spaceId ?? spaceId ?? workspace.spaces[0]?.id ?? "");
  const action = usePendingAction();
  return (
    <Modal kicker="Estrutura" title={list ? "Editar lista" : "Adicionar lista"} onClose={onClose} closeDisabled={action.pending}>
      <form className="space-y-4 p-5" onSubmit={(event) => {
        event.preventDefault();
        if (name.trim() && ownerSpaceId) void action.run(() => onSave({ name: name.trim(), color, spaceId: ownerSpaceId }));
      }}>
        <label className="block text-xs font-black">Nome da lista<input data-dialog-autofocus className="form-control mt-1" required value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label className="block text-xs font-black">Space<select className="form-control mt-1" value={ownerSpaceId} onChange={(event) => setOwnerSpaceId(event.target.value)}>{workspace.spaces.map((space) => <option key={space.id} value={space.id}>{space.emoji} {space.name}</option>)}</select></label>
        <label className="block text-xs font-black">Cor da lista<input className="ml-3 h-10 w-16 align-middle" type="color" value={color} onChange={(event) => setColor(event.target.value)} /></label>
        <DialogActions pending={action.pending} onClose={onClose} submitLabel="Salvar lista" />
      </form>
    </Modal>
  );
}

export function TaskDeleteDialog({ task, onClose, onConfirm }: {
  task: WorkspaceTask;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const action = usePendingAction();
  return (
    <Modal kicker="Exclusão segura" title={`Excluir ${task.externalId}?`} onClose={onClose} closeDisabled={action.pending}>
      <div className="p-5">
        <Impact>Dependências que apontam para esta tarefa serão removidas.</Impact>
        <p className="mt-4 text-sm font-bold">{task.title}</p>
        <DialogActions pending={action.pending} danger onClose={onClose} submitLabel="Excluir tarefa definitivamente" onSubmit={() => action.run(onConfirm)} />
      </div>
    </Modal>
  );
}

export function ImportLaunchDialog({ currentTaskCount, onClose, onConfirm }: {
  currentTaskCount: number;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const action = usePendingAction();
  return (
    <Modal kicker="Checklist canônico" title="Importar as 204 tarefas do lançamento?" onClose={onClose} closeDisabled={action.pending}>
      <div className="p-5">
        <Impact>O painel contém {currentTaskCount} tarefa(s). A importação adiciona somente itens ausentes e preserva edições existentes.</Impact>
        <p className="muted mt-4 text-sm">Você pode repetir esta importação com segurança: os IDs T001–T204 não serão duplicados.</p>
        <DialogActions pending={action.pending} onClose={onClose} submitLabel="Confirmar importação" onSubmit={() => action.run(onConfirm)} />
      </div>
    </Modal>
  );
}

type StructureDelete =
  | { kind: "member"; entity: WorkspaceMember }
  | { kind: "list"; entity: WorkspaceList }
  | { kind: "space"; entity: WorkspaceSpace };

export function StructureDeleteDialog({ workspace, target, onClose, onConfirm }: {
  workspace: WorkspaceEnvelope;
  target: StructureDelete;
  onClose: () => void;
  onConfirm: (destinationListId?: string) => Promise<void>;
}) {
  const blockedListIds = useMemo(() => target.kind === "space"
    ? new Set(workspace.lists.filter((list) => list.spaceId === target.entity.id).map((list) => list.id))
    : new Set(target.kind === "list" ? [target.entity.id] : []), [target, workspace.lists]);
  const destinations = workspace.lists.filter((list) => !blockedListIds.has(list.id));
  const [destinationListId, setDestinationListId] = useState("");
  const action = usePendingAction();
  useEffect(() => setDestinationListId(""), [target]);
  const name = target.entity.name;
  const taskCount = target.kind === "member"
    ? workspace.tasks.filter((task) => task.assigneeId === target.entity.id).length
    : target.kind === "list"
      ? workspace.tasks.filter((task) => task.listId === target.entity.id).length
      : workspace.tasks.filter((task) => blockedListIds.has(task.listId)).length;
  const title = target.kind === "member" ? `Excluir funcionário ${name}?` : target.kind === "list" ? `Excluir lista ${name}?` : `Excluir space ${name}?`;
  const submitLabel = target.kind === "member" ? "Excluir funcionário definitivamente" : target.kind === "list" ? "Excluir lista definitivamente" : "Excluir space definitivamente";
  const needsDestination = target.kind !== "member";
  const impact = target.kind === "member"
    ? `${taskCount} ${taskCount === 1 ? "tarefa atribuída ficará" : "tarefas atribuídas ficarão"} sem responsável.`
    : `${taskCount} ${taskCount === 1 ? "tarefa será movida" : "tarefas serão movidas"} para a lista de destino antes da exclusão.`;
  return (
    <Modal kicker="Exclusão segura" title={title} onClose={onClose} closeDisabled={action.pending}>
      <form className="p-5" onSubmit={(event) => {
        event.preventDefault();
        if (!needsDestination || destinationListId) void action.run(() => onConfirm(destinationListId || undefined));
      }}>
        <Impact>{impact}</Impact>
        {needsDestination ? (
          <label className="mt-4 block text-xs font-black">Lista de destino
            <select className="form-control mt-1" required value={destinationListId} onChange={(event) => setDestinationListId(event.target.value)}>
              <option value="">Selecione uma lista</option>
              {destinations.map((list) => {
                const space = workspace.spaces.find((candidate) => candidate.id === list.spaceId);
                return <option key={list.id} value={list.id}>{space?.name} / {list.name}</option>;
              })}
            </select>
          </label>
        ) : null}
        <DialogActions pending={action.pending} danger onClose={onClose} submitLabel={submitLabel} />
      </form>
    </Modal>
  );
}

function Impact({ children }: { children: ReactNode }) {
  return <div className="flex gap-3 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm"><AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-300" /><p>{children}</p></div>;
}

function DialogActions({ onClose, submitLabel, danger = false, onSubmit, pending = false }: {
  onClose: () => void;
  submitLabel: string;
  danger?: boolean;
  onSubmit?: () => Promise<void>;
  pending?: boolean;
}) {
  return (
    <div className="mt-6 flex justify-end gap-2 border-t border-[var(--border)] pt-4">
      <button type="button" className="secondary-button" disabled={pending} onClick={onClose}>Cancelar</button>
      <button type={onSubmit ? "button" : "submit"} disabled={pending} className={danger ? "danger-button" : "primary-button"} onClick={() => { if (onSubmit) void onSubmit(); }}>{pending ? "Processando…" : submitLabel}</button>
    </div>
  );
}

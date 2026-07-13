"use client";

import { ChevronDown, ListPlus, Menu, Pencil, Plus, Trash2, UserPlus, X } from "lucide-react";
import { useState } from "react";

import type {
  WorkspaceEnvelope,
  WorkspaceList,
  WorkspaceMember,
  WorkspaceSpace,
} from "@/lib/tasks/workspace-store";

type SidebarProps = {
  workspace: WorkspaceEnvelope;
  selectedListId: string | null;
  onSelectList: (listId: string | null) => void;
  onAddMember: () => void;
  onEditMember: (member: WorkspaceMember) => void;
  onDeleteMember: (member: WorkspaceMember) => void;
  onAddSpace: () => void;
  onEditSpace: (space: WorkspaceSpace) => void;
  onDeleteSpace: (space: WorkspaceSpace) => void;
  onAddList: (space: WorkspaceSpace) => void;
  onEditList: (list: WorkspaceList) => void;
  onDeleteList: (list: WorkspaceList) => void;
};

export function WorkspaceSidebar(props: SidebarProps) {
  const [open, setOpen] = useState(false);
  const sortedSpaces = [...props.workspace.spaces].sort((a, b) => a.position - b.position);

  return (
    <>
      <button
        type="button"
        className="tasks-sidebar-toggle"
        aria-label={open ? "Fechar navegação do workspace" : "Abrir navegação do workspace"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
        Estrutura
      </button>
      <aside className={`tasks-workspace-sidebar ${open ? "is-open" : ""}`} aria-label="Estrutura do workspace">
        <div className="border-b border-[var(--border)] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="kicker">Workspace</p>
              <h2 className="mt-2 text-base font-black">{props.workspace.workspace.name}</h2>
              <p className="muted mt-1 text-xs">{props.workspace.workspace.eventName}</p>
            </div>
            <button type="button" className="icon-button" aria-label="Adicionar space" onClick={props.onAddSpace}>
              <Plus className="size-4" />
            </button>
          </div>
          <button
            type="button"
            className={`mt-4 w-full rounded-md px-3 py-2 text-left text-sm font-bold ${props.selectedListId === null ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--muted)]"}`}
            onClick={() => props.onSelectList(null)}
          >
            Todas as tarefas <span className="float-right">{props.workspace.tasks.length}</span>
          </button>
        </div>

        <div className="max-h-[54vh] space-y-3 overflow-y-auto p-3">
          {sortedSpaces.map((space) => {
            const lists = props.workspace.lists
              .filter((list) => list.spaceId === space.id)
              .sort((a, b) => a.position - b.position);
            const count = lists.reduce(
              (sum, list) => sum + props.workspace.tasks.filter((task) => task.listId === list.id).length,
              0,
            );
            return (
              <details key={space.id} open className="group rounded-lg border border-[var(--border)] bg-[var(--card-strong)]">
                <summary className="flex cursor-pointer list-none items-center gap-2 p-3">
                  <ChevronDown className="size-4 transition group-open:rotate-0" />
                  <span aria-hidden>{space.emoji}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-black">{space.name}</span>
                  <span className="muted text-xs">{count}</span>
                </summary>
                <div className="space-y-1 border-t border-[var(--border)] p-2">
                  <div className="mb-2 flex justify-end gap-1">
                    <button type="button" className="icon-button" aria-label={`Adicionar lista em ${space.name}`} onClick={() => props.onAddList(space)}><ListPlus className="size-3.5" /></button>
                    <button type="button" className="icon-button" aria-label={`Editar space ${space.name}`} onClick={() => props.onEditSpace(space)}><Pencil className="size-3.5" /></button>
                    <button type="button" className="icon-button danger" aria-label={`Excluir space ${space.name}`} onClick={() => props.onDeleteSpace(space)}><Trash2 className="size-3.5" /></button>
                  </div>
                  {lists.map((list) => {
                    const taskCount = props.workspace.tasks.filter((task) => task.listId === list.id).length;
                    return (
                      <div key={list.id} className="group/list flex items-center gap-1">
                        <button
                          type="button"
                          className={`min-w-0 flex-1 rounded-md px-2 py-2 text-left text-xs font-bold ${props.selectedListId === list.id ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "hover:bg-[var(--muted)]"}`}
                          onClick={() => props.onSelectList(list.id)}
                        >
                          <span className="mr-2 inline-block size-2 rounded-full" style={{ backgroundColor: list.color ?? "#00c896" }} />
                          {list.name}<span className="float-right">{taskCount}</span>
                        </button>
                        <button type="button" className="icon-button" aria-label={`Editar lista ${list.name}`} onClick={() => props.onEditList(list)}><Pencil className="size-3" /></button>
                        <button type="button" className="icon-button danger" aria-label={`Excluir lista ${list.name}`} onClick={() => props.onDeleteList(list)}><Trash2 className="size-3" /></button>
                      </div>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>

        <div className="border-t border-[var(--border)] p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-wider">Equipe</p>
            <button type="button" className="icon-button" aria-label="Adicionar funcionário" onClick={props.onAddMember}><UserPlus className="size-4" /></button>
          </div>
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {props.workspace.members.map((member) => {
              const count = props.workspace.tasks.filter((task) => task.assigneeId === member.id).length;
              return (
                <div key={member.id} className="flex items-center gap-2 rounded-md p-2 hover:bg-[var(--muted)]">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-black text-white" style={{ backgroundColor: member.color }}>
                    {member.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">{member.name}</p>
                    <p className="muted truncate text-[10px]">{member.role} · {count}</p>
                  </div>
                  <button type="button" className="icon-button" aria-label={`Editar funcionário ${member.name}`} onClick={() => props.onEditMember(member)}><Pencil className="size-3" /></button>
                  <button type="button" className="icon-button danger" aria-label={`Excluir funcionário ${member.name}`} onClick={() => props.onDeleteMember(member)}><Trash2 className="size-3" /></button>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}

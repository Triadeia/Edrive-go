"use client";

import { AlertCircle, CalendarDays, Download, FileJson, KanbanSquare, ListTodo, Plus, RefreshCw, Search, ShieldCheck, X } from "lucide-react";
import { useMemo, useState } from "react";

import { TaskDialog } from "@/components/tasks/task-dialog";
import { TaskCalendarView, TaskKanbanView, TaskListView, priorityLabels, statusLabels } from "@/components/tasks/task-views";
import { ListDialog, MemberDialog, SpaceDialog, StructureDeleteDialog, TaskDeleteDialog } from "@/components/tasks/workspace-dialogs";
import { WorkspaceSidebar } from "@/components/tasks/workspace-sidebar";
import { useTaskWorkspace } from "@/hooks/use-task-workspace";
import { exportWorkspaceCsv, exportWorkspaceJson } from "@/lib/tasks/workspace-export";
import type { TaskPriority, TaskStatus } from "@/lib/tasks/workspace-schema";
import type { CreateTaskInput, UpdateTaskInput, WorkspaceList, WorkspaceMember, WorkspaceSpace, WorkspaceTask } from "@/lib/tasks/workspace-store";

type ViewMode = "list" | "kanban" | "calendar";
type StructureDelete =
  | { kind: "member"; entity: WorkspaceMember }
  | { kind: "list"; entity: WorkspaceList }
  | { kind: "space"; entity: WorkspaceSpace };

function downloadFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function TasksWorkspace() {
  const taskWorkspace = useTaskWorkspace();
  const workspace = taskWorkspace.workspace;
  const [view, setView] = useState<ViewMode>("list");
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<TaskStatus | "all">("all");
  const [priority, setPriority] = useState<TaskPriority | "all">("all");
  const [assigneeId, setAssigneeId] = useState<string | "all" | "unassigned">("all");
  const [phase, setPhase] = useState("all");
  const [taskDialog, setTaskDialog] = useState<{ task: WorkspaceTask | null; initialDate?: string } | null>(null);
  const [memberDialog, setMemberDialog] = useState<{ member: WorkspaceMember | null } | null>(null);
  const [spaceDialog, setSpaceDialog] = useState<{ space: WorkspaceSpace | null } | null>(null);
  const [listDialog, setListDialog] = useState<{ list: WorkspaceList | null; spaceId?: string } | null>(null);
  const [deleteTask, setDeleteTask] = useState<WorkspaceTask | null>(null);
  const [deleteStructure, setDeleteStructure] = useState<StructureDelete | null>(null);

  const filteredTasks = useMemo(() => {
    if (!workspace) return [];
    const needle = query.trim().toLocaleLowerCase("pt-BR");
    return [...workspace.tasks]
      .filter((task) => selectedListId === null || task.listId === selectedListId)
      .filter((task) => status === "all" || task.status === status)
      .filter((task) => priority === "all" || task.priority === priority)
      .filter((task) => assigneeId === "all" || (assigneeId === "unassigned" ? task.assigneeId === null : task.assigneeId === assigneeId))
      .filter((task) => phase === "all" || task.phase === phase)
      .filter((task) => !needle || [task.externalId, task.title, task.description, task.subarea, task.phase, task.tags.join(" "), workspace.members.find((member) => member.id === task.assigneeId)?.name ?? ""].join(" ").toLocaleLowerCase("pt-BR").includes(needle))
      .sort((left, right) => left.position - right.position || left.externalId.localeCompare(right.externalId));
  }, [assigneeId, phase, priority, query, selectedListId, status, workspace]);

  const stats = useMemo(() => {
    const tasks = workspace?.tasks ?? [];
    return {
      total: tasks.length,
      open: tasks.filter((task) => !["done", "cancelled"].includes(task.status)).length,
      urgent: tasks.filter((task) => task.priority === "urgent" && !["done", "cancelled"].includes(task.status)).length,
      blocked: tasks.filter((task) => task.status === "blocked").length,
      done: tasks.filter((task) => task.status === "done").length,
    };
  }, [workspace]);

  if (!workspace) {
    return <section className="panel grid min-h-72 place-items-center p-8"><div className="text-center"><RefreshCw className="mx-auto size-7 animate-spin text-[var(--primary)]" /><p className="mt-3 font-black">Abrindo dados deste navegador…</p>{taskWorkspace.error ? <p className="mt-2 max-w-xl text-sm text-red-300">{taskWorkspace.error}</p> : null}</div></section>;
  }

  const phases = [...new Set(workspace.tasks.map((task) => task.phase))].sort();
  const clearFilters = () => { setQuery(""); setStatus("all"); setPriority("all"); setAssigneeId("all"); setPhase("all"); };

  return (
    <section className="tasks-workspace-shell">
      <WorkspaceSidebar
        workspace={workspace}
        selectedListId={selectedListId}
        onSelectList={setSelectedListId}
        onAddMember={() => setMemberDialog({ member: null })}
        onEditMember={(member) => setMemberDialog({ member })}
        onDeleteMember={(entity) => setDeleteStructure({ kind: "member", entity })}
        onAddSpace={() => setSpaceDialog({ space: null })}
        onEditSpace={(space) => setSpaceDialog({ space })}
        onDeleteSpace={(entity) => setDeleteStructure({ kind: "space", entity })}
        onAddList={(space) => setListDialog({ list: null, spaceId: space.id })}
        onEditList={(list) => setListDialog({ list })}
        onDeleteList={(entity) => setDeleteStructure({ kind: "list", entity })}
      />

      <div className="min-w-0 space-y-4">
        {taskWorkspace.error ? <div role="alert" className="flex items-start gap-3 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-100"><AlertCircle className="mt-0.5 size-5 shrink-0" /><p className="flex-1">{taskWorkspace.error}</p><button type="button" aria-label="Fechar erro" onClick={taskWorkspace.clearError}><X className="size-4" /></button></div> : null}

        <header className="panel p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-3 py-1 text-xs font-black text-[var(--primary)]"><ShieldCheck className="size-3.5" /> Dados neste navegador</span>
              <h2 className="mt-3 text-2xl font-black">Tarefas do painel <span className="text-[var(--accent)]">eDrive Go</span></h2>
              <p className="muted mt-1 text-sm">Persistência local neste dispositivo · exporte backups regularmente.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="secondary-button" onClick={() => void taskWorkspace.importLaunchSeed()}><Download className="size-4" /> Importar checklist do lançamento</button>
              <button type="button" className="secondary-button" aria-label="Exportar CSV" onClick={() => downloadFile("edrive-go-tarefas.csv", exportWorkspaceCsv(workspace), "text/csv;charset=utf-8")}><Download className="size-4" /> CSV</button>
              <button type="button" className="secondary-button" aria-label="Exportar JSON" onClick={() => downloadFile("edrive-go-workspace.json", exportWorkspaceJson(workspace), "application/json")}><FileJson className="size-4" /> JSON</button>
              <button type="button" className="primary-button" onClick={() => setTaskDialog({ task: null })}><Plus className="size-4" /> Nova tarefa</button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <Metric label="Total" value={stats.total} testId="task-total" />
          <Metric label="Abertas" value={stats.open} />
          <Metric label="Urgentes" value={stats.urgent} tone="text-red-300" />
          <Metric label="Bloqueadas" value={stats.blocked} tone="text-amber-300" />
          <Metric label="Concluídas" value={stats.done} tone="text-[var(--primary)]" />
        </div>

        <section className="panel p-3 sm:p-4">
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_repeat(4,minmax(130px,auto))_auto]">
            <label className="relative"><span className="sr-only">Buscar tarefas</span><Search className="muted absolute left-3 top-3 size-4" /><input className="form-control pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar tarefas" /></label>
            <label><span className="sr-only">Filtrar por status</span><select className="form-control" value={status} onChange={(event) => setStatus(event.target.value as TaskStatus | "all")}><option value="all">Todos os status</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label><span className="sr-only">Filtrar por prioridade</span><select className="form-control" value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority | "all")}><option value="all">Todas as prioridades</option>{Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label><span className="sr-only">Filtrar por responsável</span><select className="form-control" value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}><option value="all">Todos os responsáveis</option><option value="unassigned">Sem responsável</option>{workspace.members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
            <label><span className="sr-only">Filtrar por fase</span><select className="form-control" value={phase} onChange={(event) => setPhase(event.target.value)}><option value="all">Todas as fases</option>{phases.map((value) => <option key={value}>{value}</option>)}</select></label>
            <button type="button" className="secondary-button" onClick={clearFilters}>Limpar</button>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-3">
            <p className="muted text-xs">Exibindo <strong className="text-[var(--foreground)]">{filteredTasks.length}</strong> de {workspace.tasks.length} tarefas</p>
            <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-1">
              <ViewButton active={view === "list"} onClick={() => setView("list")}><ListTodo className="size-4" /> Lista</ViewButton>
              <ViewButton active={view === "kanban"} onClick={() => setView("kanban")}><KanbanSquare className="size-4" /> Quadro</ViewButton>
              <ViewButton active={view === "calendar"} onClick={() => setView("calendar")}><CalendarDays className="size-4" /> Calendário</ViewButton>
            </div>
          </div>
        </section>

        <section className="panel overflow-x-auto p-3 sm:p-4">
          {view === "list" ? <TaskListView workspace={workspace} tasks={filteredTasks} onCreate={() => setTaskDialog({ task: null })} onEdit={(task) => setTaskDialog({ task })} onDelete={setDeleteTask} /> : null}
          {view === "kanban" ? <TaskKanbanView workspace={workspace} tasks={filteredTasks} onCreate={() => setTaskDialog({ task: null })} onEdit={(task) => setTaskDialog({ task })} onDelete={setDeleteTask} onMoveStatus={(task, nextStatus) => { void taskWorkspace.moveTask(task.id, { status: nextStatus }); }} /> : null}
          {view === "calendar" ? <TaskCalendarView workspace={workspace} tasks={filteredTasks} onCreate={(date) => setTaskDialog({ task: null, initialDate: date })} onEdit={(task) => setTaskDialog({ task })} onMoveDueDate={(task, date) => { const time = task.dueAt?.slice(11, 19) ?? "18:00:00"; void taskWorkspace.updateTask(task.id, { dueAt: new Date(`${date}T${time}`).toISOString() }); }} /> : null}
        </section>

        <div className="flex justify-end"><button type="button" className="muted text-xs underline hover:text-[var(--foreground)]" onClick={async () => { if (window.confirm("Redefinir o workspace deste navegador? Exporte um backup antes de continuar.")) { const result = await taskWorkspace.resetBrowserWorkspace(); if (result) setSelectedListId(null); } }}>Redefinir dados deste navegador</button></div>
      </div>

      {taskDialog ? <TaskDialog workspace={workspace} task={taskDialog.task} initialDate={taskDialog.initialDate} onClose={() => setTaskDialog(null)} onSave={async (input) => { const result = taskDialog.task ? await taskWorkspace.updateTask(taskDialog.task.id, input as UpdateTaskInput) : await taskWorkspace.createTask(input as CreateTaskInput); if (result) setTaskDialog(null); }} /> : null}
      {memberDialog ? <MemberDialog member={memberDialog.member} onClose={() => setMemberDialog(null)} onSave={async (input) => { const result = memberDialog.member ? await taskWorkspace.updateMember(memberDialog.member.id, input) : await taskWorkspace.createMember(input); if (result) setMemberDialog(null); }} /> : null}
      {spaceDialog ? <SpaceDialog space={spaceDialog.space} onClose={() => setSpaceDialog(null)} onSave={async (input) => { const result = spaceDialog.space ? await taskWorkspace.updateSpace(spaceDialog.space.id, input) : await taskWorkspace.createSpace(input); if (result) setSpaceDialog(null); }} /> : null}
      {listDialog ? <ListDialog workspace={workspace} list={listDialog.list} spaceId={listDialog.spaceId} onClose={() => setListDialog(null)} onSave={async (input) => { const result = listDialog.list ? await taskWorkspace.updateList(listDialog.list.id, input) : await taskWorkspace.createList(input); if (result) { setSelectedListId(result.id); setListDialog(null); } }} /> : null}
      {deleteTask ? <TaskDeleteDialog task={deleteTask} onClose={() => setDeleteTask(null)} onConfirm={async () => { if (await taskWorkspace.deleteTask(deleteTask.id)) setDeleteTask(null); }} /> : null}
      {deleteStructure ? <StructureDeleteDialog workspace={workspace} target={deleteStructure} onClose={() => setDeleteStructure(null)} onConfirm={async (destinationListId) => { let successful = false; if (deleteStructure.kind === "member") successful = await taskWorkspace.deleteMember(deleteStructure.entity.id); if (deleteStructure.kind === "list" && destinationListId) successful = await taskWorkspace.deleteList(deleteStructure.entity.id, destinationListId); if (deleteStructure.kind === "space" && destinationListId) successful = await taskWorkspace.deleteSpace(deleteStructure.entity.id, { destinationListId }); if (successful) { if (deleteStructure.kind !== "member" && selectedListId && (deleteStructure.kind === "list" ? deleteStructure.entity.id === selectedListId : workspace.lists.some((list) => list.id === selectedListId && list.spaceId === deleteStructure.entity.id))) setSelectedListId(null); setDeleteStructure(null); } }} /> : null}
    </section>
  );
}

function Metric({ label, value, tone = "", testId }: { label: string; value: number; tone?: string; testId?: string }) {
  return <div className="panel p-3 text-center"><p className="muted text-[10px] font-black uppercase tracking-wider">{label}</p><p data-testid={testId} className={`mt-1 text-2xl font-black ${tone}`}>{value}</p></div>;
}

function ViewButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-pressed={active} className={`inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-xs font-black ${active ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--muted-foreground)]"}`} onClick={onClick}>{children}</button>;
}

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Filter,
  KanbanSquare,
  ListTodo,
  Loader2,
  Plus,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import {
  seedTasks,
  taskPriorities,
  taskStatuses,
  type LibertTask,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/tasks-data";

type ViewMode = "list" | "kanban" | "calendar";
type DraftTask = Pick<LibertTask, "title" | "description" | "status" | "priority" | "owner" | "area" | "project" | "dueDate">;

const STORAGE_KEY = "libert-drive:tasks:v1";

const defaultDraft: DraftTask = {
  title: "",
  description: "",
  status: "A Fazer",
  priority: "Media",
  owner: "Equipe Libert Drive",
  area: "Operacao",
  project: "Painel Libert Drive",
  dueDate: new Date().toISOString().slice(0, 10),
};

const priorityTone: Record<TaskPriority, string> = {
  Urgente: "text-red-300 bg-red-400/12 border-red-400/25",
  Alta: "text-[var(--warning)] bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] border-[color-mix(in_srgb,var(--warning)_24%,transparent)]",
  Media: "text-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] border-[color-mix(in_srgb,var(--primary)_24%,transparent)]",
  Baixa: "text-sky-300 bg-sky-400/12 border-sky-400/25",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(`${date}T12:00:00`));
}

function saveLocal(tasks: LibertTask[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {}
}

function loadLocal() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    return Array.isArray(parsed) ? parsed as LibertTask[] : null;
  } catch {
    return null;
  }
}

export function TasksWorkspace() {
  const [tasks, setTasks] = useState<LibertTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<ViewMode>("list");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "Todas">("Todas");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "Todas">("Todas");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LibertTask | null>(null);
  const [draft, setDraft] = useState<DraftTask>(defaultDraft);
  const [command, setCommand] = useState("");
  const [assistantMessage, setAssistantMessage] = useState("Posso criar, filtrar, resumir e mover tarefas do painel Libert Drive.");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const response = await fetch("/api/tasks", { cache: "no-store" });
        const data = await response.json();
        if (!cancelled) {
          const loaded = Array.isArray(data.tasks) && data.tasks.length ? data.tasks as LibertTask[] : seedTasks;
          setTasks(loaded);
          saveLocal(loaded);
        }
      } catch {
        if (!cancelled) setTasks(loadLocal() || seedTasks);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTasks = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pt-BR");
    return tasks.filter((task) => {
      const matchesSearch = !term || [task.title, task.description, task.owner, task.area, task.project].join(" ").toLocaleLowerCase("pt-BR").includes(term);
      const matchesStatus = statusFilter === "Todas" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "Todas" || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [priorityFilter, query, statusFilter, tasks]);

  const stats = useMemo(() => {
    const open = tasks.filter((task) => !["Concluida", "Cancelada"].includes(task.status)).length;
    const blocked = tasks.filter((task) => task.status === "Bloqueada").length;
    const done = tasks.filter((task) => task.status === "Concluida").length;
    const urgent = tasks.filter((task) => task.priority === "Urgente").length;
    return { open, blocked, done, urgent };
  }, [tasks]);

  async function persist(nextTasks: LibertTask[]) {
    setTasks(nextTasks);
    saveLocal(nextTasks);
  }

  function openCreate(date?: string) {
    setEditing(null);
    setDraft({ ...defaultDraft, dueDate: date || new Date().toISOString().slice(0, 10) });
    setDialogOpen(true);
  }

  function openEdit(task: LibertTask) {
    setEditing(task);
    setDraft({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      owner: task.owner,
      area: task.area,
      project: task.project,
      dueDate: task.dueDate,
    });
    setDialogOpen(true);
  }

  async function submitTask() {
    if (!draft.title.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const response = await fetch(`/api/tasks/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
        const updated = await response.json();
        await persist(tasks.map((task) => task.id === editing.id ? updated : task));
      } else {
        const response = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
        const created = await response.json();
        await persist([created, ...tasks]);
      }
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function updateTask(id: string, patch: Partial<LibertTask>) {
    const previous = tasks;
    const optimistic = tasks.map((task) => task.id === id ? { ...task, ...patch, updatedAt: new Date().toISOString() } : task);
    await persist(optimistic);
    try {
      const response = await fetch(`/api/tasks/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
      const updated = await response.json();
      await persist(optimistic.map((task) => task.id === id ? updated : task));
    } catch {
      await persist(previous);
    }
  }

  async function deleteTask(id: string) {
    const previous = tasks;
    await persist(tasks.filter((task) => task.id !== id));
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    } catch {
      await persist(previous);
    }
  }

  function runCommand() {
    const raw = command.trim();
    if (!raw) return;
    const lower = raw.toLocaleLowerCase("pt-BR");
    if (lower.includes("bloquead")) {
      setStatusFilter("Bloqueada");
      setAssistantMessage("Filtro aplicado: tarefas bloqueadas.");
    } else if (lower.includes("urgente")) {
      setPriorityFilter("Urgente");
      setAssistantMessage("Filtro aplicado: prioridades urgentes.");
    } else if (lower.startsWith("crie") || lower.startsWith("criar")) {
      const title = raw.replace(/^crie\s+tarefa\s*/i, "").replace(/^criar\s+tarefa\s*/i, "") || "Nova tarefa Libert Drive";
      setEditing(null);
      setDraft({ ...defaultDraft, title });
      setDialogOpen(true);
      setAssistantMessage("Preparei a nova tarefa. Confirme os dados para salvar no backend.");
    } else {
      setAssistantMessage(`Resumo: ${stats.open} abertas, ${stats.blocked} bloqueadas, ${stats.done} concluidas e ${stats.urgent} urgentes.`);
    }
    setCommand("");
  }

  return (
    <div className="space-y-6">
      <section className="tasks-metrics">
        <TaskMetric label="Abertas" value={stats.open} />
        <TaskMetric label="Urgentes" value={stats.urgent} />
        <TaskMetric label="Bloqueadas" value={stats.blocked} />
        <TaskMetric label="Concluidas" value={stats.done} />
      </section>

      <section className="panel p-5">
        <div className="grid gap-5 xl:grid-cols-[1fr_auto]">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]"><Send className="size-5" /></div>
              <div>
                <h2 className="text-lg font-black">Chat de Comando</h2>
                <p className="muted text-xs">Crie, filtre e resuma tarefas com comandos simples.</p>
              </div>
            </div>
            <p className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-3 text-sm font-bold">{assistantMessage}</p>
            <div className="mt-3 flex gap-2">
              <input value={command} onChange={(event) => setCommand(event.target.value)} onKeyDown={(event) => event.key === "Enter" ? runCommand() : null} className="topbar-search min-h-11 flex-1 rounded-lg border border-[var(--border)] px-3 text-sm outline-none" placeholder='Ex.: "Crie tarefa revisar brandbook" ou "mostrar bloqueadas"' />
              <button onClick={runCommand} className="grid min-h-11 w-12 place-items-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]" aria-label="Executar comando"><Send className="size-4" /></button>
            </div>
          </div>
          <div className="flex flex-wrap items-start gap-2">
            <ViewButton active={view === "list"} onClick={() => setView("list")} icon={<ListTodo className="size-4" />}>Lista</ViewButton>
            <ViewButton active={view === "kanban"} onClick={() => setView("kanban")} icon={<KanbanSquare className="size-4" />}>Kanban</ViewButton>
            <ViewButton active={view === "calendar"} onClick={() => setView("calendar")} icon={<CalendarDays className="size-4" />}>Calendario</ViewButton>
            <button onClick={() => openCreate()} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-black text-[var(--primary-foreground)]"><Plus className="size-4" /> Nova tarefa</button>
          </div>
        </div>
      </section>

      <section className="panel p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="muted absolute left-3 top-3 size-4" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="topbar-search min-h-10 w-full rounded-lg border border-[var(--border)] pl-9 pr-3 text-sm outline-none" placeholder="Buscar por tarefa, dono, area ou projeto..." />
          </div>
          <Filter className="size-4 text-[var(--primary)]" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as TaskStatus | "Todas")} className="topbar-search min-h-10 rounded-lg border border-[var(--border)] px-3 text-sm outline-none">
            <option>Todas</option>
            {taskStatuses.map((status) => <option key={status}>{status}</option>)}
          </select>
          <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as TaskPriority | "Todas")} className="topbar-search min-h-10 rounded-lg border border-[var(--border)] px-3 text-sm outline-none">
            <option>Todas</option>
            {taskPriorities.map((priority) => <option key={priority}>{priority}</option>)}
          </select>
          <p className="muted text-sm">Exibindo <strong className="text-[var(--foreground)]">{filteredTasks.length}</strong> de {tasks.length}</p>
        </div>
      </section>

      {loading ? (
        <div className="panel grid min-h-72 place-items-center"><Loader2 className="size-8 animate-spin text-[var(--primary)]" /></div>
      ) : view === "list" ? (
        <ListView tasks={filteredTasks} onEdit={openEdit} onDelete={deleteTask} onStatusChange={(id, status) => updateTask(id, { status })} />
      ) : view === "kanban" ? (
        <KanbanView tasks={filteredTasks} onEdit={openEdit} onStatusChange={(id, status) => updateTask(id, { status })} />
      ) : (
        <CalendarView tasks={filteredTasks} onCreate={openCreate} onEdit={openEdit} onMove={(id, dueDate) => updateTask(id, { dueDate })} />
      )}

      {dialogOpen ? (
        <TaskDialog
          draft={draft}
          editing={editing}
          saving={saving}
          onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
          onClose={() => setDialogOpen(false)}
          onSubmit={submitTask}
        />
      ) : null}
    </div>
  );
}

function TaskMetric({ label, value }: { label: string; value: number }) {
  return (
    <article className="panel p-5">
      <CheckCircle2 className="size-5 text-[var(--primary)]" />
      <p className="muted mt-4 text-xs font-black uppercase tracking-[0.12em]">{label}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
    </article>
  );
}

function ViewButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return <button onClick={onClick} className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-black ${active ? "border-transparent bg-[var(--primary)] text-[var(--primary-foreground)]" : "border-[var(--border)] bg-[var(--muted)]"}`}>{icon}{children}</button>;
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <span className={`rounded-md border px-2 py-1 text-[11px] font-black ${priorityTone[priority]}`}>{priority}</span>;
}

function ListView({ tasks, onEdit, onDelete, onStatusChange }: { tasks: LibertTask[]; onEdit: (task: LibertTask) => void; onDelete: (id: string) => void; onStatusChange: (id: string, status: TaskStatus) => void }) {
  return (
    <section className="panel overflow-hidden">
      <div className="grid grid-cols-[1.4fr_.8fr_.75fr_.55fr_.35fr] gap-3 border-b border-[var(--border)] p-4 text-xs font-black uppercase tracking-[0.12em] text-[var(--muted-foreground)] max-lg:hidden">
        <span>Tarefa</span><span>Status</span><span>Responsavel</span><span>Prazo</span><span>IA</span>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {tasks.map((task) => (
          <article key={task.id} className="grid gap-3 p-4 lg:grid-cols-[1.4fr_.8fr_.75fr_.55fr_.35fr] lg:items-center">
            <button onClick={() => onEdit(task)} className="text-left">
              <p className="font-black">{task.title}</p>
              <p className="muted mt-1 text-sm">{task.project} · {task.area}</p>
            </button>
            <select value={task.status} onChange={(event) => onStatusChange(task.id, event.target.value as TaskStatus)} className="topbar-search min-h-9 rounded-lg border border-[var(--border)] px-2 text-sm outline-none">
              {taskStatuses.map((status) => <option key={status}>{status}</option>)}
            </select>
            <div><p className="text-sm font-bold">{task.owner}</p><PriorityBadge priority={task.priority} /></div>
            <p className="text-sm font-black">{formatDate(task.dueDate)}</p>
            <div className="flex items-center justify-between gap-2"><span className="text-lg font-black text-[var(--primary)]">{task.score}</span><button onClick={() => onDelete(task.id)} className="text-red-300" aria-label="Excluir tarefa"><Trash2 className="size-4" /></button></div>
          </article>
        ))}
      </div>
    </section>
  );
}

function KanbanView({ tasks, onEdit, onStatusChange }: { tasks: LibertTask[]; onEdit: (task: LibertTask) => void; onStatusChange: (id: string, status: TaskStatus) => void }) {
  return (
    <section className="grid gap-4 xl:grid-cols-4">
      {taskStatuses.filter((status) => status !== "Cancelada").map((status) => {
        const column = tasks.filter((task) => task.status === status);
        return (
          <div key={status} onDragOver={(event) => event.preventDefault()} onDrop={(event) => onStatusChange(event.dataTransfer.getData("task/id"), status)} className="panel min-h-72 p-4">
            <div className="mb-4 flex items-center justify-between"><h3 className="font-black">{status}</h3><span className="rounded-md bg-[var(--muted)] px-2 py-1 text-xs font-black">{column.length}</span></div>
            <div className="space-y-3">
              {column.map((task) => (
                <button key={task.id} draggable onDragStart={(event) => event.dataTransfer.setData("task/id", task.id)} onClick={() => onEdit(task)} className="w-full rounded-lg border border-[var(--border)] bg-[var(--muted)] p-3 text-left transition hover:border-[var(--border-strong)]">
                  <p className="font-black">{task.title}</p>
                  <p className="muted mt-2 text-xs leading-5">{task.owner} · {formatDate(task.dueDate)}</p>
                  <div className="mt-3 flex items-center justify-between"><PriorityBadge priority={task.priority} /><span className="text-xs font-black text-[var(--primary)]">{task.score}</span></div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function CalendarView({ tasks, onCreate, onEdit, onMove }: { tasks: LibertTask[]; onCreate: (date?: string) => void; onEdit: (task: LibertTask) => void; onMove: (id: string, date: string) => void }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
  return (
    <section className="panel overflow-hidden p-4">
      <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black">Calendario de execucao</h2><p className="muted text-sm">{today.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</p></div>
      <div className="grid grid-cols-7 gap-2">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => <p key={day} className="muted text-center text-xs font-black uppercase">{day}</p>)}
        {days.map((date) => {
          const iso = date.toISOString().slice(0, 10);
          const dayTasks = tasks.filter((task) => task.dueDate === iso);
          return (
            <div key={iso} onDragOver={(event) => event.preventDefault()} onDrop={(event) => onMove(event.dataTransfer.getData("task/id"), iso)} className={`min-h-32 rounded-lg border border-[var(--border)] p-2 ${date.getMonth() === month ? "bg-[var(--muted)]" : "bg-transparent opacity-50"}`}>
              <button onClick={() => onCreate(iso)} className="mb-2 text-xs font-black text-[var(--primary)]">{date.getDate()}</button>
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map((task) => (
                  <button key={task.id} draggable onDragStart={(event) => event.dataTransfer.setData("task/id", task.id)} onClick={() => onEdit(task)} className="block w-full truncate rounded-md bg-[var(--card)] px-2 py-1 text-left text-[11px] font-bold">{task.title}</button>
                ))}
                {dayTasks.length > 3 ? <p className="muted text-[11px]">+{dayTasks.length - 3} mais</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TaskDialog({ draft, editing, saving, onChange, onClose, onSubmit }: { draft: DraftTask; editing: LibertTask | null; saving: boolean; onChange: (patch: Partial<DraftTask>) => void; onClose: () => void; onSubmit: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4">
      <div className="panel w-full max-w-2xl p-5">
        <div className="mb-5 flex items-center justify-between">
          <div><p className="kicker">{editing ? "Editar tarefa" : "Nova tarefa"}</p><h2 className="mt-2 text-2xl font-black">Execucao Libert Drive</h2></div>
          <button onClick={onClose} aria-label="Fechar"><X className="size-5" /></button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="md:col-span-2"><span className="text-sm font-black">Titulo</span><input value={draft.title} onChange={(event) => onChange({ title: event.target.value })} className="topbar-search mt-2 min-h-11 w-full rounded-lg border border-[var(--border)] px-3 outline-none" /></label>
          <label className="md:col-span-2"><span className="text-sm font-black">Descricao</span><textarea value={draft.description} onChange={(event) => onChange({ description: event.target.value })} className="topbar-search mt-2 min-h-24 w-full rounded-lg border border-[var(--border)] p-3 outline-none" /></label>
          <TaskSelect label="Status" value={draft.status} values={taskStatuses} onChange={(value) => onChange({ status: value as TaskStatus })} />
          <TaskSelect label="Prioridade" value={draft.priority} values={taskPriorities} onChange={(value) => onChange({ priority: value as TaskPriority })} />
          <label><span className="text-sm font-black">Responsavel</span><input value={draft.owner} onChange={(event) => onChange({ owner: event.target.value })} className="topbar-search mt-2 min-h-11 w-full rounded-lg border border-[var(--border)] px-3 outline-none" /></label>
          <label><span className="text-sm font-black">Area</span><input value={draft.area} onChange={(event) => onChange({ area: event.target.value })} className="topbar-search mt-2 min-h-11 w-full rounded-lg border border-[var(--border)] px-3 outline-none" /></label>
          <label><span className="text-sm font-black">Projeto</span><input value={draft.project} onChange={(event) => onChange({ project: event.target.value })} className="topbar-search mt-2 min-h-11 w-full rounded-lg border border-[var(--border)] px-3 outline-none" /></label>
          <label><span className="text-sm font-black">Prazo</span><input type="date" value={draft.dueDate} onChange={(event) => onChange({ dueDate: event.target.value })} className="topbar-search mt-2 min-h-11 w-full rounded-lg border border-[var(--border)] px-3 outline-none" /></label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="min-h-10 rounded-lg border border-[var(--border)] px-4 text-sm font-black">Cancelar</button>
          <button onClick={onSubmit} disabled={saving} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-black text-[var(--primary-foreground)] disabled:opacity-60">{saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Salvar</button>
        </div>
      </div>
    </div>
  );
}

function TaskSelect({ label, value, values, onChange }: { label: string; value: string; values: readonly string[]; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="text-sm font-black">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="topbar-search mt-2 min-h-11 w-full rounded-lg border border-[var(--border)] px-3 outline-none">
        {values.map((item) => <option key={item}>{item}</option>)}
      </select>
    </label>
  );
}

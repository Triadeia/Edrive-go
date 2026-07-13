"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type KeyboardCoordinateGetter,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ArrowRight, CalendarPlus, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";

import type { TaskStatus } from "@/lib/tasks/workspace-schema";
import type { WorkspaceEnvelope, WorkspaceTask } from "@/lib/tasks/workspace-store";
import { bahiaDateKey, formatBahiaDate, formatBahiaDateTime } from "@/lib/tasks/workspace-dates";

export const statusLabels: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "A fazer",
  in_progress: "Em andamento",
  in_review: "Em revisão",
  blocked: "Bloqueada",
  done: "Concluída",
  cancelled: "Cancelada",
};

export const priorityLabels = {
  urgent: "Urgente",
  high: "Alta",
  medium: "Média",
  low: "Baixa",
} as const;

const visibleKanbanStatuses: TaskStatus[] = ["backlog", "todo", "in_progress", "in_review", "blocked", "done", "cancelled"];

const workspaceCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  return pointerCollisions.length > 0 ? pointerCollisions : closestCenter(args);
};

function directionalKeyboardCoordinates(targetPrefix: string): KeyboardCoordinateGetter {
  return (event, { context, currentCoordinates }) => {
    const collisionRect = context.collisionRect;
    if (!collisionRect || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.code)) return;
    event.preventDefault();
    const activeCenter = {
      x: collisionRect.left + collisionRect.width / 2,
      y: collisionRect.top + collisionRect.height / 2,
    };
    const candidates = context.droppableContainers.getEnabled().flatMap((container) => {
      if (!String(container.id).startsWith(targetPrefix)) return [];
      const rect = context.droppableRects.get(container.id);
      if (!rect) return [];
      const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      const inDirection = event.code === "ArrowRight"
        ? center.x > activeCenter.x + 1
        : event.code === "ArrowLeft"
          ? center.x < activeCenter.x - 1
          : event.code === "ArrowDown"
            ? center.y > activeCenter.y + 1
            : center.y < activeCenter.y - 1;
      if (!inDirection) return [];
      const primaryDistance = event.code === "ArrowLeft" || event.code === "ArrowRight"
        ? Math.abs(center.x - activeCenter.x)
        : Math.abs(center.y - activeCenter.y);
      const crossDistance = event.code === "ArrowLeft" || event.code === "ArrowRight"
        ? Math.abs(center.y - activeCenter.y)
        : Math.abs(center.x - activeCenter.x);
      return [{ rect, score: primaryDistance + crossDistance * 4 }];
    });
    const target = candidates.sort((left, right) => left.score - right.score)[0];
    return target ? { x: target.rect.left, y: target.rect.top } : currentCoordinates;
  };
}

const kanbanKeyboardCoordinates = directionalKeyboardCoordinates("status:");
const calendarKeyboardCoordinates = directionalKeyboardCoordinates("calendar-date:");

function TaskIdentity({ workspace, task }: { workspace: WorkspaceEnvelope; task: WorkspaceTask }) {
  const assignee = workspace.members.find((member) => member.id === task.assigneeId);
  const list = workspace.lists.find((candidate) => candidate.id === task.listId);
  return (
    <div className="muted mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
      <span>{task.externalId}</span>
      <span>{list?.name ?? "Lista removida"}</span>
      <span>{assignee?.name ?? "Sem responsável"}</span>
      <span>{priorityLabels[task.priority]}</span>
      <span>{task.dueAt ? formatBahiaDateTime(task.dueAt) : "Sem prazo"}</span>
    </div>
  );
}

function EmptyView({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="grid min-h-52 place-items-center rounded-lg border border-dashed border-[var(--border)] p-8 text-center">
      <div>
        <p className="text-lg font-black">Nenhuma tarefa encontrada</p>
        <p className="muted mt-2 text-sm">Ajuste os filtros ou registre uma nova entrega.</p>
        <button type="button" className="primary-button mt-4" onClick={onCreate}><Plus className="size-4" /> Nova tarefa</button>
      </div>
    </div>
  );
}

export function TaskListView({
  workspace,
  tasks,
  onCreate,
  onEdit,
  onDelete,
}: {
  workspace: WorkspaceEnvelope;
  tasks: WorkspaceTask[];
  onCreate: () => void;
  onEdit: (task: WorkspaceTask) => void;
  onDelete: (task: WorkspaceTask) => void;
}) {
  if (!tasks.length) return <EmptyView onCreate={onCreate} />;
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
      <table className="w-full min-w-[900px] border-collapse text-left">
        <thead className="bg-[var(--muted)] text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
          <tr><th className="p-3">ID</th><th className="p-3">Tarefa</th><th className="p-3">Status</th><th className="p-3">Responsável</th><th className="p-3">Prioridade</th><th className="p-3">Prazo</th><th className="p-3 text-right">Ações</th></tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const assignee = workspace.members.find((member) => member.id === task.assigneeId);
            return (
              <tr key={task.id} className="border-t border-[var(--border)] align-top hover:bg-[var(--muted)]/50">
                <td className="p-3 text-xs font-black text-[var(--primary)]">{task.externalId}</td>
                <td className="max-w-xl p-3"><button type="button" className="text-left font-bold hover:text-[var(--primary)]" onClick={() => onEdit(task)}>{task.title}</button><p className="muted mt-1 line-clamp-2 text-xs">{task.description}</p></td>
                <td className="p-3"><span className={`task-status status-${task.status}`}>{statusLabels[task.status]}</span></td>
                <td className="p-3 text-sm">{assignee?.name ?? "Sem responsável"}</td>
                <td className="p-3 text-sm font-bold">{priorityLabels[task.priority]}</td>
                <td className="p-3 text-sm">{task.dueAt ? formatBahiaDate(task.dueAt) : "—"}</td>
                <td className="p-3"><div className="flex justify-end gap-1"><button type="button" className="icon-button" aria-label={`Editar ${task.title}`} onClick={() => onEdit(task)}><Pencil className="size-4" /></button><button type="button" className="icon-button danger" aria-label={`Excluir ${task.title}`} onClick={() => onDelete(task)}><Trash2 className="size-4" /></button></div></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DraggableCard({ workspace, task, onEdit, onDelete, onMoveStatus }: {
  workspace: WorkspaceEnvelope;
  task: WorkspaceTask;
  onEdit: (task: WorkspaceTask) => void;
  onDelete: (task: WorkspaceTask) => void;
  onMoveStatus: (task: WorkspaceTask, status: TaskStatus) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const currentIndex = visibleKanbanStatuses.indexOf(task.status);
  const nextStatus = visibleKanbanStatuses[Math.min(Math.max(currentIndex + 1, 0), visibleKanbanStatuses.length - 1)];
  return (
    <article ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.55 : 1 }} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm">
      <div className="flex items-start gap-2">
        <button type="button" className="muted mt-0.5 cursor-grab" aria-label={`Arrastar ${task.title}`} {...listeners} {...attributes}><GripVertical className="size-4" /></button>
        <button type="button" className="min-w-0 flex-1 text-left font-black hover:text-[var(--primary)]" onClick={() => onEdit(task)}>{task.title}</button>
      </div>
      <TaskIdentity workspace={workspace} task={task} />
      <div className="mt-3 flex items-center justify-between gap-2">
        {nextStatus && nextStatus !== task.status ? <button type="button" className="secondary-button !min-h-8 !px-2 !text-[11px]" aria-label={`Mover ${task.title} para ${statusLabels[nextStatus]}`} onClick={() => onMoveStatus(task, nextStatus)}>Mover <ArrowRight className="size-3" /></button> : <span />}
        <button type="button" className="icon-button danger" aria-label={`Excluir ${task.title}`} onClick={() => onDelete(task)}><Trash2 className="size-3.5" /></button>
      </div>
    </article>
  );
}

function KanbanColumn(props: {
  workspace: WorkspaceEnvelope;
  status: TaskStatus;
  tasks: WorkspaceTask[];
  onEdit: (task: WorkspaceTask) => void;
  onDelete: (task: WorkspaceTask) => void;
  onMoveStatus: (task: WorkspaceTask, status: TaskStatus) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `status:${props.status}` });
  return (
    <section ref={setNodeRef} data-testid={`kanban-${props.status}`} className={`min-h-64 rounded-lg border p-3 ${isOver ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]" : "border-[var(--border)] bg-[var(--card-strong)]"}`}>
      <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-black">{statusLabels[props.status]}</h3><span className="rounded bg-[var(--muted)] px-2 py-1 text-xs font-black">{props.tasks.length}</span></div>
      <div className="space-y-2">
        {props.tasks.map((task) => <DraggableCard key={task.id} workspace={props.workspace} task={task} onEdit={props.onEdit} onDelete={props.onDelete} onMoveStatus={props.onMoveStatus} />)}
      </div>
    </section>
  );
}

export function TaskKanbanView(props: {
  workspace: WorkspaceEnvelope;
  tasks: WorkspaceTask[];
  onCreate: () => void;
  onEdit: (task: WorkspaceTask) => void;
  onDelete: (task: WorkspaceTask) => void;
  onMoveStatus: (task: WorkspaceTask, status: TaskStatus) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: kanbanKeyboardCoordinates, scrollBehavior: "auto" }),
  );
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || !String(over.id).startsWith("status:")) return;
    const task = props.tasks.find((candidate) => candidate.id === active.id);
    if (task) props.onMoveStatus(task, String(over.id).slice(7) as TaskStatus);
  };
  if (!props.tasks.length) return <EmptyView onCreate={props.onCreate} />;
  return (
    <DndContext sensors={sensors} collisionDetection={workspaceCollisionDetection} onDragEnd={onDragEnd}>
      <div className="grid min-w-[1250px] grid-cols-7 gap-3">
        {visibleKanbanStatuses.map((status) => <KanbanColumn key={status} workspace={props.workspace} status={status} tasks={props.tasks.filter((task) => task.status === status)} onEdit={props.onEdit} onDelete={props.onDelete} onMoveStatus={props.onMoveStatus} />)}
      </div>
    </DndContext>
  );
}

export function TaskCalendarView(props: {
  workspace: WorkspaceEnvelope;
  tasks: WorkspaceTask[];
  onCreate: (date?: string) => void;
  onEdit: (task: WorkspaceTask) => void;
  onMoveDueDate: (task: WorkspaceTask, date: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: calendarKeyboardCoordinates, scrollBehavior: "auto" }),
  );
  const [year, month] = props.workspace.workspace.eventDate.split("-").map(Number);
  const first = new Date(Date.UTC(year, month - 1, 1));
  const start = new Date(first);
  start.setUTCDate(first.getUTCDate() - first.getUTCDay());
  const days = Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + index);
    return day;
  });
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const activeId = String(active.id);
    const overId = String(over?.id ?? "");
    if (!activeId.startsWith("calendar-task:") || !overId.startsWith("calendar-date:")) return;
    const task = props.tasks.find((candidate) => candidate.id === activeId.slice("calendar-task:".length));
    if (task) props.onMoveDueDate(task, overId.slice("calendar-date:".length));
  };
  return (
    <DndContext sensors={sensors} collisionDetection={workspaceCollisionDetection} onDragEnd={onDragEnd}>
    <div className="min-w-[850px] rounded-lg border border-[var(--border)] p-3">
      <div className="mb-3 flex items-center justify-between"><h3 className="font-black">{first.toLocaleDateString("pt-BR", { timeZone: "UTC", month: "long", year: "numeric" })}</h3><CalendarPlus className="size-5 text-[var(--primary)]" /></div>
      <div className="grid grid-cols-7 gap-1">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((label) => <div key={label} className="muted p-2 text-center text-xs font-black uppercase">{label}</div>)}
        {days.map((day) => {
          const iso = day.toISOString().slice(0, 10);
          const dayTasks = props.tasks.filter((task) => task.dueAt ? bahiaDateKey(task.dueAt) === iso : false);
          return <CalendarDay key={iso} date={iso} outside={day.getUTCMonth() !== month - 1} tasks={dayTasks} onCreate={props.onCreate} onEdit={props.onEdit} onMoveDueDate={props.onMoveDueDate} />;
        })}
      </div>
    </div>
    </DndContext>
  );
}

function CalendarDay(props: { date: string; outside: boolean; tasks: WorkspaceTask[]; onCreate: (date?: string) => void; onEdit: (task: WorkspaceTask) => void; onMoveDueDate: (task: WorkspaceTask, date: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: `calendar-date:${props.date}` });
  const tomorrow = new Date(`${props.date}T12:00:00Z`);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const nextDate = tomorrow.toISOString().slice(0, 10);
  return (
    <div ref={setNodeRef} data-testid={`calendar-day-${props.date}`} className={`min-h-28 rounded-md border p-1.5 ${props.outside ? "opacity-40" : ""} ${isOver ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]" : "border-[var(--border)]"}`}>
      <button type="button" className="mb-1 text-xs font-black hover:text-[var(--primary)]" onClick={() => props.onCreate(props.date)}>{Number(props.date.slice(-2))}</button>
      <div className="space-y-1">{props.tasks.slice(0, 4).map((task) => <CalendarTask key={task.id} task={task} nextDate={nextDate} onEdit={props.onEdit} onMoveDueDate={props.onMoveDueDate} />)}</div>
    </div>
  );
}

function CalendarTask({ task, nextDate, onEdit, onMoveDueDate }: { task: WorkspaceTask; nextDate: string; onEdit: (task: WorkspaceTask) => void; onMoveDueDate: (task: WorkspaceTask, date: string) => void }) {
  const draggableId = `calendar-task:${task.id}`;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: draggableId });
  return <div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.55 : 1 }} className="flex items-center rounded bg-[var(--muted)]"><button type="button" className="cursor-grab p-1 text-[var(--muted-foreground)]" aria-label={`Arrastar prazo de ${task.title}`} {...listeners} {...attributes}><GripVertical className="size-3" /></button><button type="button" className="min-w-0 flex-1 truncate p-1 text-left text-[10px] font-bold" onClick={() => onEdit(task)}>{task.title}</button><button type="button" className="p-1 text-[var(--primary)]" aria-label={`Mover prazo de ${task.title} para o dia seguinte`} onClick={() => onMoveDueDate(task, nextDate)}><ArrowRight className="size-3" /></button></div>;
}

import { TasksWorkspace } from "@/components/tasks-workspace";

export default function TasksPage() {
  return (
    <article className="space-y-4">
      <section className="panel overflow-hidden p-5 sm:p-6">
        <p className="kicker">Operação e lançamento</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">Gestor de tarefas eDrive Go</h1>
        <p className="muted mt-3 max-w-3xl text-sm leading-6">
          Organize responsáveis, spaces, listas e o checklist do lançamento em um workspace persistente no navegador atual.
        </p>
      </section>
      <TasksWorkspace />
    </article>
  );
}

import { TasksWorkspace } from "@/components/tasks-workspace";

export default function TasksPage() {
  return (
    <article className="space-y-6">
      <section className="panel overflow-hidden p-6 sm:p-8">
        <p className="kicker">Execucao conectada</p>
        <h1 className="page-title mt-4 max-w-4xl">Tarefas do painel Libert Drive.</h1>
        <p className="muted mt-5 max-w-3xl text-base leading-8">
          Planeje, priorize e acompanhe o trabalho do modulo 01 com backend via API, interface local responsiva,
          kanban, calendario, filtros e comando rapido.
        </p>
      </section>
      <TasksWorkspace />
    </article>
  );
}

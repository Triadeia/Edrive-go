import { makeTask, normalizeTask, seedTasks, type LibertTask } from "@/lib/tasks-data";

type TaskDb = { tasks: LibertTask[] };

declare global {
  // eslint-disable-next-line no-var
  var __libertTasksDb: TaskDb | undefined;
}

function db() {
  if (!globalThis.__libertTasksDb) {
    globalThis.__libertTasksDb = { tasks: seedTasks.map((task) => ({ ...task })) };
  }
  return globalThis.__libertTasksDb;
}

export const tasksStore = {
  list() {
    return [...db().tasks].sort((a, b) => b.score - a.score || a.dueDate.localeCompare(b.dueDate));
  },
  create(input: unknown) {
    const task = makeTask(normalizeTask(input as Partial<LibertTask>));
    db().tasks = [task, ...db().tasks];
    return task;
  },
  update(id: string, input: unknown) {
    let updated: LibertTask | null = null;
    db().tasks = db().tasks.map((task) => {
      if (task.id !== id) return task;
      updated = {
        ...task,
        ...normalizeTask({ ...task, ...(input as Partial<LibertTask>) }),
        id: task.id,
        score: typeof (input as Partial<LibertTask>).score === "number" ? (input as LibertTask).score : task.score,
        createdAt: task.createdAt,
        updatedAt: new Date().toISOString(),
      };
      return updated;
    });
    return updated;
  },
  remove(id: string) {
    const before = db().tasks.length;
    db().tasks = db().tasks.filter((task) => task.id !== id);
    return db().tasks.length !== before;
  },
  reset() {
    db().tasks = seedTasks.map((task) => ({ ...task }));
    return this.list();
  },
};

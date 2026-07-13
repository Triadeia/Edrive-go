import { makeTask, normalizeTask, seedTasks, type EdriveTask } from "@/lib/tasks-data";

type TaskDb = { tasks: EdriveTask[] };

declare global {
  var __edriveTasksDb: TaskDb | undefined;
}

function db() {
  if (!globalThis.__edriveTasksDb) {
    globalThis.__edriveTasksDb = { tasks: seedTasks.map((task) => ({ ...task })) };
  }
  return globalThis.__edriveTasksDb;
}

export const tasksStore = {
  list() {
    return [...db().tasks].sort((a, b) => b.score - a.score || a.dueDate.localeCompare(b.dueDate));
  },
  create(input: unknown) {
    const task = makeTask(normalizeTask(input as Partial<EdriveTask>));
    db().tasks = [task, ...db().tasks];
    return task;
  },
  update(id: string, input: unknown) {
    let updated: EdriveTask | null = null;
    db().tasks = db().tasks.map((task) => {
      if (task.id !== id) return task;
      updated = {
        ...task,
        ...normalizeTask({ ...task, ...(input as Partial<EdriveTask>) }),
        id: task.id,
        score: typeof (input as Partial<EdriveTask>).score === "number" ? (input as EdriveTask).score : task.score,
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

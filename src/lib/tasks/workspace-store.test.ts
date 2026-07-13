import assert from "node:assert/strict";
import test from "node:test";

import { LAUNCH_SOURCE_HEADER_MAP, launchWorkspaceSeed } from "./workspace-seed";
import {
  WORKSPACE_STORAGE_KEY,
  WorkspaceStore,
  WorkspaceStoreError,
  type KeyValueStorage,
  type WorkspaceLockManager,
} from "./workspace-store";
import { exportWorkspaceCsv, exportWorkspaceJson } from "./workspace-export";

class MemoryStorage implements KeyValueStorage {
  readonly values = new Map<string, string>();
  writes = 0;
  failNextWrite = false;
  afterWorkspaceWrite?: () => void;

  get length() {
    return this.values.size;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    if (key === WORKSPACE_STORAGE_KEY) this.writes += 1;
    if (key === WORKSPACE_STORAGE_KEY && this.failNextWrite) {
      this.failNextWrite = false;
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    }
    this.values.set(key, value);
    if (key === WORKSPACE_STORAGE_KEY) this.afterWorkspaceWrite?.();
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

class QueueLockManager implements WorkspaceLockManager {
  private active = false;
  private readonly queue: Array<() => Promise<void>> = [];

  request<T>(
    _name: string,
    callback: () => T | Promise<T>,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        this.active = true;
        try {
          resolve(await callback());
        } catch (error) {
          reject(error);
        } finally {
          this.active = false;
          this.drain();
        }
      });
      this.drain();
    });
  }

  private drain() {
    if (this.active) return;
    void this.queue.shift()?.();
  }
}

function taskInput(
  store: WorkspaceStore,
  externalId: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    externalId,
    title: `Task ${externalId}`,
    description: "Detailed description",
    status: "todo" as const,
    priority: "high" as const,
    assigneeId: null,
    backupAssignee: null,
    listId: store.getSnapshot().lists[0].id,
    subarea: "Operations",
    phase: "Launch",
    startAt: null,
    dueAt: null,
    tags: ["CC-01"],
    vendor: null,
    cost: null,
    blockers: null,
    nextAction: null,
    notes: null,
    evidence: null,
    approval: null,
    risk: null,
    definitionOfDone: null,
    source: null,
    sourceUrl: null,
    dependencies: [],
    checklist: [],
    sourceMeta: Object.fromEntries(
      LAUNCH_SOURCE_HEADER_MAP.map(({ header }) => [header, ""]),
    ),
    ...overrides,
  };
}

test("creates, edits and deletes tasks while preserving relations", () => {
  const storage = new MemoryStorage();
  const store = new WorkspaceStore({ storage });
  const first = store.createTask(taskInput(store, "T900"));
  const second = store.createTask(
    taskInput(store, "T901", {
      dependencies: [{ externalId: first.externalId, taskId: first.id }],
      checklist: [{ title: "Proof", completed: false }],
    }),
  );

  const edited = store.updateTask(second.id, {
    status: "in_progress",
    title: "Edited",
    checklist: [{ ...second.checklist[0], completed: true }],
  });
  assert.equal(edited.title, "Edited");
  assert.equal(edited.checklist[0].completed, true);

  store.deleteTask(first.id);
  assert.deepEqual(store.getSnapshot().tasks[0].dependencies, []);
  assert.equal(storage.writes, 4);
});

test("createTask inserts at the requested position and reindexes its list", () => {
  const store = new WorkspaceStore({ storage: new MemoryStorage() });
  const first = store.createTask(taskInput(store, "T900"));
  const second = store.createTask(taskInput(store, "T901"));
  const inserted = store.createTask(taskInput(store, "T902", { position: 1 }));

  const tasks = store.getSnapshot().tasks
    .filter(({ listId }) => listId === first.listId)
    .sort((left, right) => left.position - right.position);
  assert.deepEqual(tasks.map(({ id }) => id), [first.id, inserted.id, second.id]);
  assert.deepEqual(tasks.map(({ position }) => position), [0, 1, 2]);
});

test("automatically generated custom task IDs start after the reserved launch range", () => {
  const store = new WorkspaceStore({ storage: new MemoryStorage() });
  const input = taskInput(store, "T900");
  delete (input as { externalId?: string }).externalId;

  const task = store.createTask(input);

  assert.equal(task.externalId, "T205");
});

test("updateTask moves between lists with insertion semantics and no position gaps", () => {
  const store = new WorkspaceStore({ storage: new MemoryStorage() });
  const sourceList = store.getSnapshot().lists[0];
  const destinationList = store.getSnapshot().lists[1];
  const sourceFirst = store.createTask(taskInput(store, "T900", { listId: sourceList.id }));
  const moved = store.createTask(taskInput(store, "T901", { listId: sourceList.id }));
  const destinationFirst = store.createTask(
    taskInput(store, "T902", { listId: destinationList.id }),
  );

  store.updateTask(moved.id, { listId: destinationList.id, position: 0 });

  const snapshot = store.getSnapshot();
  const sourceTasks = snapshot.tasks
    .filter(({ listId }) => listId === sourceList.id)
    .sort((left, right) => left.position - right.position);
  const destinationTasks = snapshot.tasks
    .filter(({ listId }) => listId === destinationList.id)
    .sort((left, right) => left.position - right.position);
  assert.deepEqual(sourceTasks.map(({ id }) => id), [sourceFirst.id]);
  assert.deepEqual(sourceTasks.map(({ position }) => position), [0]);
  assert.deepEqual(destinationTasks.map(({ id }) => id), [moved.id, destinationFirst.id]);
  assert.deepEqual(destinationTasks.map(({ position }) => position), [0, 1]);
});

test("moves a task to an exact list/status position", () => {
  const store = new WorkspaceStore({ storage: new MemoryStorage() });
  const first = store.createTask(taskInput(store, "T900"));
  const second = store.createTask(taskInput(store, "T901"));

  const moved = store.moveTask(second.id, { status: "blocked", position: 0 });
  const orderedIds = store.getSnapshot().tasks
    .filter(({ listId }) => listId === first.listId)
    .sort((left, right) => left.position - right.position)
    .map(({ id }) => id);

  assert.equal(moved.status, "blocked");
  assert.equal(moved.position, 0);
  assert.deepEqual(orderedIds, [second.id, first.id]);
});

test("moves a task between lists without changing its identity", () => {
  const store = new WorkspaceStore({ storage: new MemoryStorage() });
  const task = store.createTask(taskInput(store, "T900"));
  const destinationList = store.getSnapshot().lists[1];

  const moved = store.moveTask(task.id, {
    listId: destinationList.id,
    status: "in_review",
    position: 0,
  });

  assert.equal(moved.id, task.id);
  assert.equal(moved.listId, destinationList.id);
  assert.equal(moved.position, 0);
  assert.equal(moved.status, "in_review");
});

test("renaming a member preserves stable task assignee IDs", () => {
  const store = new WorkspaceStore({ storage: new MemoryStorage() });
  const member = store.createMember({ name: "Ana", role: "PM", color: "#112233" });
  const task = store.createTask(taskInput(store, "T900", { assigneeId: member.id }));

  store.updateMember(member.id, { name: "Ana Silva" });
  assert.equal(store.getSnapshot().tasks.find(({ id }) => id === task.id)?.assigneeId, member.id);
});

test("deleting a member nulls assignee and matching backup references", () => {
  const store = new WorkspaceStore({ storage: new MemoryStorage() });
  const member = store.createMember({ name: "Ana", role: "PM", color: "#112233" });
  store.createTask(
    taskInput(store, "T900", { assigneeId: member.id, backupAssignee: "Ana" }),
  );

  store.deleteMember(member.id);
  assert.equal(store.getSnapshot().tasks[0].assigneeId, null);
  assert.equal(store.getSnapshot().tasks[0].backupAssignee, null);
});

test("creates, renames and deletes lists/spaces through explicit destinations", () => {
  const store = new WorkspaceStore({ storage: new MemoryStorage() });
  const destinationListId = store.getSnapshot().lists[0].id;
  const space = store.createSpace({ name: "New space", emoji: "🧪" });
  const list = store.createList({ spaceId: space.id, name: "New list" });
  store.renameSpace(space.id, "Renamed space");
  store.renameList(list.id, "Renamed list");
  const task = store.createTask(taskInput(store, "T900", { listId: list.id }));

  store.deleteList(list.id, destinationListId);
  assert.equal(store.getSnapshot().tasks.find(({ id }) => id === task.id)?.listId, destinationListId);
  store.deleteSpace(space.id, { destinationListId });
  assert.equal(store.getSnapshot().spaces.some(({ id }) => id === space.id), false);
});

test("reorders spaces and lists by stable IDs", () => {
  const store = new WorkspaceStore({ storage: new MemoryStorage() });
  const before = store.getSnapshot();
  const spaceIds = before.spaces.map(({ id }) => id).reverse();
  const firstSpaceId = before.spaces[0].id;
  const listIds = before.lists
    .filter(({ spaceId }) => spaceId === firstSpaceId)
    .map(({ id }) => id)
    .reverse();

  store.reorderSpaces(spaceIds);
  store.reorderLists(firstSpaceId, listIds);

  const after = store.getSnapshot();
  assert.deepEqual(
    after.spaces.sort((left, right) => left.position - right.position).map(({ id }) => id),
    spaceIds,
  );
  assert.deepEqual(
    after.lists
      .filter(({ spaceId }) => spaceId === firstSpaceId)
      .sort((left, right) => left.position - right.position)
      .map(({ id }) => id),
    listIds,
  );
});

test("updates a space name and emoji without changing its ID", () => {
  const store = new WorkspaceStore({ storage: new MemoryStorage() });
  const space = store.getSnapshot().spaces[0];

  const updated = store.updateSpace(space.id, { name: "Operations", emoji: "⚡" });

  assert.equal(updated.id, space.id);
  assert.equal(updated.name, "Operations");
  assert.equal(updated.emoji, "⚡");
});

test("updateSpace inserts the last space at index zero and normalizes positions", () => {
  const store = new WorkspaceStore({ storage: new MemoryStorage() });
  const before = store.getSnapshot().spaces.sort((left, right) => left.position - right.position);
  const moved = before.at(-1);
  assert.ok(moved);

  store.updateSpace(moved.id, { position: 0 });

  const after = store.getSnapshot().spaces.sort((left, right) => left.position - right.position);
  assert.equal(after[0].id, moved.id);
  assert.deepEqual(after.map(({ position }) => position), [0, 1, 2, 3, 4]);
});

test("createSpace inserts at index one and normalizes positions", () => {
  const store = new WorkspaceStore({ storage: new MemoryStorage() });

  const created = store.createSpace({ name: "Inserted", emoji: "🧭", position: 1 });

  const spaces = store.getSnapshot().spaces.sort((left, right) => left.position - right.position);
  assert.equal(spaces[1].id, created.id);
  assert.deepEqual(spaces.map(({ position }) => position), [0, 1, 2, 3, 4, 5]);
});

test("createList inserts at the exact index and normalizes sibling positions", () => {
  const store = new WorkspaceStore({ storage: new MemoryStorage() });
  const space = store.getSnapshot().spaces[0];
  const before = store.getSnapshot().lists
    .filter(({ spaceId }) => spaceId === space.id)
    .sort((left, right) => left.position - right.position);

  const created = store.createList({
    spaceId: space.id,
    name: "Inserted list",
    position: 1,
  });

  const after = store.getSnapshot().lists
    .filter(({ spaceId }) => spaceId === space.id)
    .sort((left, right) => left.position - right.position);
  assert.deepEqual(
    after.map(({ id }) => id),
    [before[0].id, created.id, ...before.slice(1).map(({ id }) => id)],
  );
  assert.deepEqual(after.map(({ position }) => position), [0, 1, 2, 3]);
});

test("updates a list and moves it between valid spaces while tasks retain listId", () => {
  const store = new WorkspaceStore({ storage: new MemoryStorage() });
  const list = store.getSnapshot().lists[0];
  const destinationSpace = store.getSnapshot().spaces.find(({ id }) => id !== list.spaceId);
  assert.ok(destinationSpace);
  const task = store.createTask(taskInput(store, "T900", { listId: list.id }));

  const updated = store.updateList(list.id, {
    name: "Execution",
    color: "#123abc",
    spaceId: destinationSpace.id,
  });

  assert.equal(updated.id, list.id);
  assert.equal(updated.name, "Execution");
  assert.equal(Reflect.get(updated, "color"), "#123abc");
  assert.equal(updated.spaceId, destinationSpace.id);
  assert.equal(store.getSnapshot().tasks.find(({ id }) => id === task.id)?.listId, list.id);
});

test("rejects moving a list to an unknown space without writing", () => {
  const storage = new MemoryStorage();
  const store = new WorkspaceStore({ storage });
  const list = store.getSnapshot().lists[0];
  const before = store.getSnapshot();

  assert.throws(
    () => store.updateList(list.id, { spaceId: crypto.randomUUID() }),
    WorkspaceStoreError,
  );
  assert.equal(storage.writes, 0);
  assert.deepEqual(store.getSnapshot(), before);
});

test("updateList rejects invalid positions without writing", () => {
  for (const position of [Number.NaN, -1, 1.5]) {
    const storage = new MemoryStorage();
    const store = new WorkspaceStore({ storage });
    const list = store.getSnapshot().lists[0];
    const before = store.getSnapshot();

    assert.throws(
      () => store.updateList(list.id, { position }),
      WorkspaceStoreError,
    );
    assert.equal(storage.writes, 0);
    assert.deepEqual(store.getSnapshot(), before);
  }
});

test("deleting a populated space migrates tasks and positions atomically", () => {
  const storage = new MemoryStorage();
  const store = new WorkspaceStore({ storage });
  const destinationList = store.getSnapshot().lists[0];
  const space = store.createSpace({ name: "Temporary", emoji: "🧪" });
  const list = store.createList({ spaceId: space.id, name: "Temporary list" });
  const first = store.createTask(taskInput(store, "T900", { listId: list.id }));
  const second = store.createTask(taskInput(store, "T901", { listId: list.id }));
  const writesBefore = storage.writes;

  store.deleteSpace(space.id, { destinationListId: destinationList.id });

  const snapshot = store.getSnapshot();
  const migrated = snapshot.tasks
    .filter(({ id }) => id === first.id || id === second.id)
    .sort((left, right) => left.position - right.position);
  assert.equal(storage.writes, writesBefore + 1);
  assert.equal(snapshot.spaces.some(({ id }) => id === space.id), false);
  assert.equal(snapshot.lists.some(({ id }) => id === list.id), false);
  assert.deepEqual(migrated.map(({ listId }) => listId), [destinationList.id, destinationList.id]);
  assert.deepEqual(migrated.map(({ position }) => position), [0, 1]);
});

test("unsafe space deletion rolls back the complete snapshot", () => {
  const storage = new MemoryStorage();
  const store = new WorkspaceStore({ storage });
  const space = store.createSpace({ name: "Temporary", emoji: "🧪" });
  const list = store.createList({ spaceId: space.id, name: "Temporary list" });
  store.createTask(taskInput(store, "T900", { listId: list.id }));
  const rawBefore = storage.getItem(WORKSPACE_STORAGE_KEY);
  const snapshotBefore = store.getSnapshot();
  const writesBefore = storage.writes;

  assert.throws(
    () => store.deleteSpace(space.id, { destinationListId: list.id }),
    WorkspaceStoreError,
  );
  assert.equal(storage.writes, writesBefore);
  assert.equal(storage.getItem(WORKSPACE_STORAGE_KEY), rawBefore);
  assert.deepEqual(store.getSnapshot(), snapshotBefore);
});

test("protects the last space without writing", () => {
  const storage = new MemoryStorage();
  const initial = new WorkspaceStore({ storage }).getSnapshot();
  initial.spaces = initial.spaces.slice(0, 1);
  initial.lists = initial.lists.filter(({ spaceId }) => spaceId === initial.spaces[0].id).slice(0, 1);
  storage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(initial));
  const store = new WorkspaceStore({ storage });
  const writesBefore = storage.writes;

  assert.throws(
    () => store.deleteSpace(initial.spaces[0].id, { destinationListId: initial.lists[0].id }),
    WorkspaceStoreError,
  );
  assert.equal(storage.writes, writesBefore);
});

test("created entities use UUID v4 and persist under the versioned envelope key", () => {
  const storage = new MemoryStorage();
  const store = new WorkspaceStore({ storage });
  const member = store.createMember({ name: "Ana", role: "PM", color: "#112233" });
  const space = store.createSpace({ name: "Temporary", emoji: "🧪" });
  const list = store.createList({ spaceId: space.id, name: "Temporary list" });
  const task = store.createTask(
    taskInput(store, "T900", { checklist: [{ title: "Proof", completed: false }] }),
  );
  const v4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  assert.equal(WORKSPACE_STORAGE_KEY, "edrive-go:task-workspace:v1");
  for (const id of [member.id, space.id, list.id, task.id, task.checklist[0].id]) {
    assert.match(id, v4);
  }
  const stored = storage.getItem(WORKSPACE_STORAGE_KEY);
  assert.ok(stored);
  const envelope = JSON.parse(stored);
  assert.equal(envelope.version, 1);
  assert.equal(envelope.tasks.some(({ id }: { id: string }) => id === task.id), true);
});

test("rejects deleting the last list or deleting without a destination", () => {
  const storage = new MemoryStorage();
  const initial = new WorkspaceStore({ storage }).getSnapshot();
  initial.spaces = initial.spaces.slice(0, 1);
  initial.lists = initial.lists.slice(0, 1);
  storage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(initial));
  const store = new WorkspaceStore({ storage });
  const before = storage.writes;

  assert.throws(() => store.deleteList(initial.lists[0].id), WorkspaceStoreError);
  assert.equal(storage.writes, before);
});

test("imports all 204 launch tasks idempotently without erasing edits", () => {
  const store = new WorkspaceStore({ storage: new MemoryStorage() });
  store.importLaunchSeed();
  const task = store.getSnapshot().tasks[0];
  store.updateTask(task.id, { title: "Local edit" });
  store.importLaunchSeed();

  assert.equal(store.getSnapshot().tasks.length, 204);
  assert.equal(store.getSnapshot().tasks.find(({ id }) => id === task.id)?.title, "Local edit");
});

test("syncs updated launch fields only for untouched canonical tasks", () => {
  const storage = new MemoryStorage();
  const store = new WorkspaceStore({ storage });
  store.importLaunchSeed();
  const stored = store.getSnapshot();
  const untouched = stored.tasks.find(({ externalId }) => externalId === "T147");
  const locallyEdited = stored.tasks.find(({ externalId }) => externalId === "T167");
  assert.ok(untouched);
  assert.ok(locallyEdited);

  untouched.status = "todo";
  untouched.sourceMeta.Status = "NAO INICIADO";
  untouched.updatedAt = untouched.createdAt;
  locallyEdited.status = "in_progress";
  locallyEdited.sourceMeta.Status = "EM ANDAMENTO";
  locallyEdited.updatedAt = "2026-07-13T12:00:00.000Z";
  storage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(stored));

  const reloaded = new WorkspaceStore({ storage });
  const writesBeforeSync = storage.writes;
  reloaded.syncLaunchSeedUpdates();
  const synced = reloaded.getSnapshot();

  assert.equal(
    synced.tasks.find(({ externalId }) => externalId === "T147")?.status,
    launchWorkspaceSeed.tasks.find(({ externalId }) => externalId === "T147")?.status,
  );
  assert.equal(
    synced.tasks.find(({ externalId }) => externalId === "T167")?.status,
    "in_progress",
  );
  assert.equal(storage.writes, writesBeforeSync + 1);

  reloaded.syncLaunchSeedUpdates();
  assert.equal(storage.writes, writesBeforeSync + 1);
});

test("remaps a legacy custom T001 before importing the canonical task idempotently", () => {
  const store = new WorkspaceStore({ storage: new MemoryStorage() });
  const custom = store.createTask(
    taskInput(store, "T001", { title: "Custom task before seed import" }),
  );

  store.importLaunchSeed();
  store.importLaunchSeed();

  const snapshot = store.getSnapshot();
  const canonicalT001 = snapshot.tasks.find(
    ({ id }) => id === launchWorkspaceSeed.tasks[0].id,
  );
  const preservedCustom = snapshot.tasks.find(({ id }) => id === custom.id);
  assert.equal(snapshot.tasks.length, 205);
  assert.deepEqual(canonicalT001, launchWorkspaceSeed.tasks[0]);
  assert.equal(preservedCustom?.title, "Custom task before seed import");
  assert.equal(preservedCustom?.externalId, "T205");
  assert.equal(new Set(snapshot.tasks.map(({ externalId }) => externalId)).size, 205);
});

test("persists an explicitly empty task collection across repository reloads", () => {
  const storage = new MemoryStorage();
  const store = new WorkspaceStore({ storage });
  const task = store.createTask(taskInput(store, "T900"));
  store.deleteTask(task.id);

  assert.equal(new WorkspaceStore({ storage }).getSnapshot().tasks.length, 0);
});

test("rolls back snapshot and storage when a quota write fails", () => {
  const storage = new MemoryStorage();
  const store = new WorkspaceStore({ storage });
  store.importLaunchSeed();
  const rawBefore = storage.getItem(WORKSPACE_STORAGE_KEY);
  const snapshotBefore = store.getSnapshot();
  storage.failNextWrite = true;

  assert.throws(
    () => store.createMember({ name: "Nope", role: "PM", color: "#112233" }),
    (error: unknown) => error instanceof WorkspaceStoreError && error.code === "storage_write",
  );
  assert.equal(storage.getItem(WORKSPACE_STORAGE_KEY), rawBefore);
  assert.deepEqual(store.getSnapshot(), snapshotBefore);
});

test("rejects a stale store write and refreshes safely before retrying", () => {
  const storage = new MemoryStorage();
  const firstStore = new WorkspaceStore({ storage });
  const staleStore = new WorkspaceStore({ storage });
  const firstMember = firstStore.createMember({
    name: "First writer",
    role: "PM",
    color: "#112233",
  });
  const rawAfterFirstWrite = storage.getItem(WORKSPACE_STORAGE_KEY);
  const writesAfterFirstWrite = storage.writes;

  assert.throws(
    () =>
      staleStore.createMember({
        name: "Stale writer",
        role: "PM",
        color: "#445566",
      }),
    (error: unknown) => error instanceof WorkspaceStoreError && error.code === "conflict",
  );
  assert.equal(storage.writes, writesAfterFirstWrite);
  assert.equal(storage.getItem(WORKSPACE_STORAGE_KEY), rawAfterFirstWrite);

  staleStore.refresh();
  const secondMember = staleStore.createMember({
    name: "Refreshed writer",
    role: "PM",
    color: "#445566",
  });
  const members = staleStore.getSnapshot().members;
  assert.equal(members.some(({ id }) => id === firstMember.id), true);
  assert.equal(members.some(({ id }) => id === secondMember.id), true);
});

test("an active earlier mutation intent prevents a second writer from overwriting", () => {
  const storage = new MemoryStorage();
  const firstStore = new WorkspaceStore({ storage });
  const secondStore = new WorkspaceStore({ storage });
  firstStore.createMember({
    name: "Persisted first writer",
    role: "PM",
    color: "#112233",
  });
  secondStore.refresh();
  const rawAfterFirstWrite = storage.getItem(WORKSPACE_STORAGE_KEY);
  const writesAfterFirstWrite = storage.writes;
  const intentKey = `${WORKSPACE_STORAGE_KEY}:mutation-intent:first-tab`;
  storage.setItem(
    intentKey,
    JSON.stringify({
      owner: "first-tab",
      announcedAt: Date.now() - 1,
      expiresAt: Date.now() + 60_000,
    }),
  );

  assert.throws(
    () =>
      secondStore.createMember({
        name: "Blocked second writer",
        role: "PM",
        color: "#445566",
      }),
    (error: unknown) => error instanceof WorkspaceStoreError && error.code === "conflict",
  );
  assert.equal(storage.getItem(WORKSPACE_STORAGE_KEY), rawAfterFirstWrite);
  assert.equal(storage.writes, writesAfterFirstWrite);
  assert.ok(storage.getItem(intentKey), "the winning owner's intent is untouched");
});

test("runExclusive holds one browser lock across suspension and serializes callers", async () => {
  const storage = new MemoryStorage();
  const lockManager = new QueueLockManager();
  const firstStore = new WorkspaceStore({ storage, lockManager });
  const secondStore = new WorkspaceStore({ storage, lockManager });
  const events: string[] = [];
  let releaseFirst!: () => void;
  let markFirstEntered!: () => void;
  const firstEntered = new Promise<void>((resolve) => {
    markFirstEntered = resolve;
  });
  const suspended = new Promise<void>((resolve) => {
    releaseFirst = resolve;
  });

  const firstMutation = firstStore.runExclusive(async (store) => {
    events.push("first-enter");
    markFirstEntered();
    await suspended;
    store.createMember({ name: "First", role: "PM", color: "#112233" });
    events.push("first-exit");
  });
  await firstEntered;
  const secondMutation = secondStore.runExclusive((store) => {
    events.push("second-enter");
    store.createMember({ name: "Second", role: "PM", color: "#445566" });
    events.push("second-exit");
  });
  await Promise.resolve();
  assert.deepEqual(events, ["first-enter"]);

  releaseFirst();
  await Promise.all([firstMutation, secondMutation]);

  assert.deepEqual(events, ["first-enter", "first-exit", "second-enter", "second-exit"]);
  assert.deepEqual(
    secondStore.getSnapshot().members.slice(-2).map(({ name }) => name),
    ["First", "Second"],
  );
});

test("runExclusive ignores an expired fallback lease during a slow workspace write", async () => {
  const storage = new MemoryStorage();
  const store = new WorkspaceStore({
    storage,
    lockManager: new QueueLockManager(),
  });
  const actualNow = Date.now;
  let clockDrift = 0;
  Date.now = () => actualNow() + clockDrift;
  storage.afterWorkspaceWrite = () => {
    clockDrift += 3_000;
  };

  try {
    const member = await store.runExclusive((lockedStore) =>
      lockedStore.createMember({
        name: "Slow persisted write",
        role: "PM",
        color: "#112233",
      }),
    );

    assert.equal(store.getSnapshot().members.some(({ id }) => id === member.id), true);
    const persisted = JSON.parse(storage.getItem(WORKSPACE_STORAGE_KEY) as string);
    assert.equal(persisted.members.some(({ id }: { id: string }) => id === member.id), true);
  } finally {
    Date.now = actualNow;
  }
});

test("browser-coordinated stores reject direct mutations outside runExclusive", async () => {
  const storage = new MemoryStorage();
  const store = new WorkspaceStore({
    storage,
    lockManager: new QueueLockManager(),
  });

  assert.throws(
    () => store.createMember({ name: "Unsafe", role: "PM", color: "#112233" }),
    WorkspaceStoreError,
  );
  assert.equal(storage.getItem(WORKSPACE_STORAGE_KEY), null);

  const member = await store.runExclusive((lockedStore) =>
    lockedStore.createMember({ name: "Safe", role: "PM", color: "#112233" }),
  );
  assert.equal(member.name, "Safe");
});

test("resetWorkspace persists the canonical empty structure inside runExclusive", async () => {
  const storage = new MemoryStorage();
  const lockManager = new QueueLockManager();
  const store = new WorkspaceStore({ storage, lockManager });
  await store.runExclusive((lockedStore) => lockedStore.importLaunchSeed());
  assert.equal(store.getSnapshot().tasks.length, 204);

  const reset = await store.runExclusive((lockedStore) => lockedStore.resetWorkspace());

  assert.equal(reset.tasks.length, 0);
  assert.equal(reset.spaces.length, 5);
  assert.equal(reset.lists.length, 20);
  assert.equal(reset.members.length, 6);
  const reloaded = new WorkspaceStore({ storage, lockManager });
  assert.equal(reloaded.getSnapshot().tasks.length, 0);
  assert.deepEqual(reloaded.getSnapshot(), reset);
});

test("non-finite mutation leases are discarded instead of blocking forever", () => {
  const storage = new MemoryStorage();
  const corruptIntentKey = `${WORKSPACE_STORAGE_KEY}:mutation-intent:corrupt`;
  const lockKey = `${WORKSPACE_STORAGE_KEY}:mutation-lock`;
  const corruptLease = '{"owner":"corrupt","announcedAt":0,"expiresAt":1e999}';
  storage.setItem(corruptIntentKey, corruptLease);
  storage.setItem(lockKey, corruptLease);
  const store = new WorkspaceStore({ storage });

  const member = store.createMember({
    name: "Recovered",
    role: "PM",
    color: "#112233",
  });

  assert.equal(member.name, "Recovered");
  assert.equal(storage.getItem(corruptIntentKey), null);
  assert.equal(storage.getItem(lockKey), null);
});

test("refresh without storage preserves in-memory mutations", () => {
  const store = new WorkspaceStore({ storage: null });
  const member = store.createMember({
    name: "Memory only",
    role: "PM",
    color: "#112233",
  });

  const refreshed = store.refresh();

  assert.equal(refreshed.members.some(({ id }) => id === member.id), true);
  assert.equal(store.getSnapshot().members.some(({ id }) => id === member.id), true);
});

test("mutation returns the canonical Zod-stripped entity", () => {
  const store = new WorkspaceStore({ storage: new MemoryStorage() });
  const input = {
    name: "Canonical member",
    role: "PM",
    color: "#112233",
    unknownProperty: "must be stripped",
  };

  const member = store.createMember(input);

  assert.equal(Reflect.get(member, "unknownProperty"), undefined);
  assert.equal(
    Reflect.get(
      store.getSnapshot().members.find(({ id }) => id === member.id) as object,
      "unknownProperty",
    ),
    undefined,
  );
});

test("rejects invalid mutations before writing and keeps the previous snapshot", () => {
  const storage = new MemoryStorage();
  const store = new WorkspaceStore({ storage });
  const before = store.getSnapshot();

  assert.throws(
    () =>
      store.createTask(
        taskInput(store, "T900", {
          dependencies: [{ externalId: "T999", taskId: crypto.randomUUID() }],
        }),
      ),
    WorkspaceStoreError,
  );
  assert.equal(storage.writes, 0);
  assert.deepEqual(store.getSnapshot(), before);
});

test("rejects self and cyclic task dependencies atomically", () => {
  const storage = new MemoryStorage();
  const store = new WorkspaceStore({ storage });
  const first = store.createTask(taskInput(store, "T900"));
  assert.throws(
    () =>
      store.updateTask(first.id, {
        dependencies: [{ externalId: first.externalId, taskId: first.id }],
      }),
    WorkspaceStoreError,
  );
  const second = store.createTask(
    taskInput(store, "T901", {
      dependencies: [{ externalId: first.externalId, taskId: first.id }],
    }),
  );
  const writesBeforeCycle = storage.writes;
  assert.throws(
    () =>
      store.updateTask(first.id, {
        dependencies: [{ externalId: second.externalId, taskId: second.id }],
      }),
    WorkspaceStoreError,
  );
  assert.equal(storage.writes, writesBeforeCycle);
});

test("exports versioned JSON and safe CSV with all 28 original headers", () => {
  const store = new WorkspaceStore({ storage: new MemoryStorage() });
  store.createTask(
    taskInput(store, "T900", {
      title: "=SUM(1,2)\n\"danger\"",
      notes: "@formula",
    }),
  );
  const snapshot = store.getSnapshot();
  const csv = exportWorkspaceCsv(snapshot);
  const json = exportWorkspaceJson(snapshot);

  assert.equal(csv.split("\n", 1)[0], LAUNCH_SOURCE_HEADER_MAP.map(({ header }) => header).join(","));
  assert.match(csv, /"'=SUM\(1,2\)\n""danger"""/);
  assert.match(csv, /'@formula/);
  assert.equal(JSON.parse(json).version, 1);
  assert.equal(JSON.parse(json).tasks[0].title, "=SUM(1,2)\n\"danger\"");
});

test("CSV current task fields overwrite all corresponding source metadata", () => {
  const store = new WorkspaceStore({ storage: new MemoryStorage() });
  const member = store.createMember({ name: "Current assignee", role: "PM", color: "#112233" });
  const sourceMeta = Object.fromEntries(
    LAUNCH_SOURCE_HEADER_MAP.map(({ header }) => [header, "STALE"]),
  );
  sourceMeta.Responsavel_Funcao = "Current role metadata";
  sourceMeta.Tipo_Custo = "Current cost metadata";
  store.createTask(
    taskInput(store, "T900", {
      title: "Current title",
      subarea: "Current subarea",
      phase: "Current phase",
      assigneeId: member.id,
      backupAssignee: "Current backup",
      priority: "urgent",
      status: "done",
      startAt: "2026-07-13T12:34:00-03:00",
      dueAt: "2026-07-14T18:45:00-03:00",
      tags: ["Current center"],
      vendor: "Current vendor",
      cost: 42.5,
      blockers: "Current blockers",
      approval: "Current approval",
      evidence: "Current evidence",
      definitionOfDone: "Current DoD",
      risk: "Current risk",
      nextAction: "Current action",
      notes: "Current notes",
      source: "Current source",
      sourceUrl: "https://current.example",
      sourceMeta,
    }),
  );

  const [headerLine, rowLine] = exportWorkspaceCsv(store.getSnapshot()).split("\n");
  const headers = headerLine.split(",");
  const values = rowLine.split(",");
  const row = Object.fromEntries(headers.map((header, index) => [header, values[index]]));

  assert.equal(headers.length, 28);
  assert.deepEqual(row, {
    ID: "T900",
    Frente: store.getSnapshot().lists[0].name,
    Subfrente: "Current subarea",
    Fase: "Current phase",
    Descricao_da_Tarefa: "Current title",
    Responsavel_Funcao: "Current role metadata",
    Responsavel_Nominal_Sugerido: "Current assignee",
    Responsavel_Substituto: "Current backup",
    Prioridade: "urgent",
    Status: "done",
    Data_Inicio: "2026-07-13",
    Hora_Inicio: "12:34",
    Prazo: "2026-07-14",
    Hora_Limite: "18:45",
    Dependencias: "",
    Bloqueadores: "Current blockers",
    Aprovacao_Necessaria: "Current approval",
    Fornecedor: "Current vendor",
    Custo_Previsto: "42.5",
    Tipo_Custo: "Current cost metadata",
    Centro_Custo: "Current center",
    Evidencia_Exigida: "Current evidence",
    Definicao_de_Concluido: "Current DoD",
    Risco_Associado: "Current risk",
    Proxima_Acao: "Current action",
    Observacoes: "Current notes",
    Fonte_da_Informacao: "Current source",
    Link_Comprovante: "https://current.example",
  });
});

test("CSV neutralizes formula injection after leading whitespace", () => {
  const store = new WorkspaceStore({ storage: new MemoryStorage() });
  store.createTask(
    taskInput(store, "T900", {
      title: " \t=SUM(1,2)",
      notes: "\n@danger",
    }),
  );

  const csv = exportWorkspaceCsv(store.getSnapshot());

  assert.match(csv, /"' \t=SUM\(1,2\)"/);
  assert.match(csv, /"'\n@danger"/);
});

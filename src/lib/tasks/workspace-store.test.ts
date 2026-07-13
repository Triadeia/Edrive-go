import assert from "node:assert/strict";
import test from "node:test";

import { LAUNCH_SOURCE_HEADER_MAP } from "./workspace-seed";
import {
  WORKSPACE_STORAGE_KEY,
  WorkspaceStore,
  WorkspaceStoreError,
  type KeyValueStorage,
} from "./workspace-store";
import { exportWorkspaceCsv, exportWorkspaceJson } from "./workspace-export";

class MemoryStorage implements KeyValueStorage {
  readonly values = new Map<string, string>();
  writes = 0;
  failNextWrite = false;

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.writes += 1;
    if (this.failNextWrite) {
      this.failNextWrite = false;
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    }
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
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

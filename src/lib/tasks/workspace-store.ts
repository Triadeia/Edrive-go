import { z } from "zod";

import { workspaceEnvelopeSchema } from "./workspace-schema";
import { launchWorkspaceSeed } from "./workspace-seed";

export const WORKSPACE_STORAGE_KEY = "edrive-go:task-workspace:v1";
export const WORKSPACE_MUTATION_LOCK_KEY = `${WORKSPACE_STORAGE_KEY}:mutation-lock`;
export const WORKSPACE_MUTATION_INTENT_PREFIX = `${WORKSPACE_STORAGE_KEY}:mutation-intent:`;
export const WORKSPACE_BROWSER_LOCK_NAME = `${WORKSPACE_STORAGE_KEY}:exclusive`;

const MUTATION_LEASE_MS = 2_000;
const MUTATION_SETTLE_MS = 2;

export interface KeyValueStorage {
  readonly length?: number;
  getItem(key: string): string | null;
  key?(index: number): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface WorkspaceLockManager {
  request<T>(name: string, callback: () => T | Promise<T>): Promise<T>;
}

export type WorkspaceEnvelope = z.infer<typeof workspaceEnvelopeSchema>;
export type WorkspaceTask = WorkspaceEnvelope["tasks"][number];
export type WorkspaceMember = WorkspaceEnvelope["members"][number];
export type WorkspaceSpace = WorkspaceEnvelope["spaces"][number];
export type WorkspaceList = WorkspaceEnvelope["lists"][number];

export type WorkspaceStoreErrorCode =
  | "storage_read"
  | "storage_write"
  | "validation"
  | "not_found"
  | "conflict"
  | "invalid_operation";

export class WorkspaceStoreError extends Error {
  readonly code: WorkspaceStoreErrorCode;

  constructor(code: WorkspaceStoreErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "WorkspaceStoreError";
    this.code = code;
  }
}

type ChecklistInput = Omit<WorkspaceTask["checklist"][number], "id"> & {
  id?: string;
};

export type CreateTaskInput = Omit<
  WorkspaceTask,
  "id" | "externalId" | "position" | "createdAt" | "updatedAt" | "checklist" | "sourceMeta"
> & {
  externalId?: string;
  position?: number;
  checklist: ChecklistInput[];
  sourceMeta: Record<string, string>;
};

export type UpdateTaskInput = Partial<
  Omit<WorkspaceTask, "id" | "createdAt" | "updatedAt" | "checklist">
> & {
  checklist?: ChecklistInput[];
};

export interface MoveTaskInput {
  listId?: string;
  status?: WorkspaceTask["status"];
  position?: number;
}

export interface WorkspaceStoreOptions {
  storage?: KeyValueStorage | null;
  lockManager?: WorkspaceLockManager | null;
  idFactory?: () => string;
  now?: () => Date | string;
}

export interface DeleteSpaceOptions {
  destinationListId: string;
  destinationSpaceId?: string;
  listMapping?: Record<string, string>;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function initialWorkspace(): WorkspaceEnvelope {
  const workspace = clone(launchWorkspaceSeed);
  workspace.tasks = [];
  return workspace;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function requireEntity<T>(entity: T | undefined, label: string): T {
  if (!entity) {
    throw new WorkspaceStoreError("not_found", `${label} not found`);
  }
  return entity;
}

function assertUniqueIds(workspace: WorkspaceEnvelope): void {
  const identifiers = [
    workspace.workspace.id,
    ...workspace.members.map(({ id }) => id),
    ...workspace.spaces.map(({ id }) => id),
    ...workspace.lists.map(({ id }) => id),
    ...workspace.tasks.flatMap((task) => [
      task.id,
      ...task.checklist.map(({ id }) => id),
    ]),
  ];
  if (new Set(identifiers).size !== identifiers.length) {
    throw new WorkspaceStoreError("validation", "Entity IDs must be globally unique");
  }
}

function assertTaskGraph(workspace: WorkspaceEnvelope): void {
  const taskById = new Map(workspace.tasks.map((task) => [task.id, task]));
  const taskByExternalId = new Map<string, WorkspaceTask>();

  for (const task of workspace.tasks) {
    if (taskByExternalId.has(task.externalId)) {
      throw new WorkspaceStoreError(
        "validation",
        `Duplicate external task ID: ${task.externalId}`,
      );
    }
    taskByExternalId.set(task.externalId, task);
  }

  for (const task of workspace.tasks) {
    const seenDependencies = new Set<string>();
    for (const dependency of task.dependencies) {
      const byId = dependency.taskId ? taskById.get(dependency.taskId) : undefined;
      const byExternalId = taskByExternalId.get(dependency.externalId);
      if (!byId || !byExternalId || byId.id !== byExternalId.id) {
        throw new WorkspaceStoreError(
          "validation",
          `Dependency ${dependency.externalId} does not resolve to one task`,
        );
      }
      if (byId.id === task.id) {
        throw new WorkspaceStoreError(
          "validation",
          `Task ${task.externalId} cannot depend on itself`,
        );
      }
      if (seenDependencies.has(byId.id)) {
        throw new WorkspaceStoreError(
          "validation",
          `Task ${task.externalId} contains a duplicate dependency`,
        );
      }
      seenDependencies.add(byId.id);
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (task: WorkspaceTask): void => {
    if (visiting.has(task.id)) {
      throw new WorkspaceStoreError("validation", "Cyclic task dependency detected");
    }
    if (visited.has(task.id)) return;
    visiting.add(task.id);
    for (const dependency of task.dependencies) {
      visit(taskById.get(dependency.taskId as string) as WorkspaceTask);
    }
    visiting.delete(task.id);
    visited.add(task.id);
  };
  workspace.tasks.forEach(visit);
}

export function validateWorkspaceEnvelope(candidate: unknown): WorkspaceEnvelope {
  const result = workspaceEnvelopeSchema.safeParse(candidate);
  if (!result.success) {
    throw new WorkspaceStoreError(
      "validation",
      "Workspace envelope is invalid",
      { cause: result.error },
    );
  }

  const workspace = result.data;
  if (workspace.spaces.length === 0 || workspace.lists.length === 0) {
    throw new WorkspaceStoreError(
      "validation",
      "Workspace must retain at least one space and one list",
    );
  }
  assertUniqueIds(workspace);

  const memberIds = new Set(workspace.members.map(({ id }) => id));
  const spaceIds = new Set(workspace.spaces.map(({ id }) => id));
  const listIds = new Set(workspace.lists.map(({ id }) => id));
  for (const list of workspace.lists) {
    if (!spaceIds.has(list.spaceId)) {
      throw new WorkspaceStoreError("validation", `List ${list.id} has an unknown space`);
    }
  }
  for (const task of workspace.tasks) {
    if (!listIds.has(task.listId)) {
      throw new WorkspaceStoreError("validation", `Task ${task.externalId} has an unknown list`);
    }
    if (task.assigneeId !== null && !memberIds.has(task.assigneeId)) {
      throw new WorkspaceStoreError(
        "validation",
        `Task ${task.externalId} has an unknown assignee`,
      );
    }
  }
  assertTaskGraph(workspace);
  return workspace;
}

export function getBrowserWorkspaceStorage(): KeyValueStorage | undefined {
  if (typeof window === "undefined") return undefined;
  return window.localStorage;
}

export function getBrowserWorkspaceLockManager(): WorkspaceLockManager | undefined {
  if (typeof navigator === "undefined" || !navigator.locks) return undefined;
  return {
    request<T>(name: string, callback: () => T | Promise<T>): Promise<T> {
      return navigator.locks
        .request<Promise<T>>(name, () => Promise.resolve(callback()))
        .then((result) => result);
    },
  };
}

function normalizePositions<T extends { position: number }>(items: T[]): void {
  items
    .sort((left, right) => left.position - right.position)
    .forEach((item, index) => {
      item.position = index;
    });
}

function insertAtPosition<T extends { position: number }>(
  items: T[],
  item: T,
  requestedPosition: number,
): void {
  if (!Number.isInteger(requestedPosition) || requestedPosition < 0) {
    throw new WorkspaceStoreError(
      "validation",
      "Position must be a non-negative integer",
    );
  }
  const ordered = items
    .filter((candidate) => candidate !== item)
    .sort((left, right) => left.position - right.position);
  ordered.splice(Math.min(requestedPosition, ordered.length), 0, item);
  ordered.forEach((candidate, index) => {
    candidate.position = index;
  });
  items.splice(0, items.length, ...ordered);
}

function findCanonicalEntity(
  workspace: WorkspaceEnvelope,
  id: string,
): { id: string } | undefined {
  return [
    ...workspace.members,
    ...workspace.spaces,
    ...workspace.lists,
    ...workspace.tasks,
    ...workspace.tasks.flatMap(({ checklist }) => checklist),
  ].find((entity) => entity.id === id);
}

function canonicalMutationResult<T>(
  workspace: WorkspaceEnvelope,
  draft: WorkspaceEnvelope,
  result: T,
): T {
  if (result === draft) return workspace as T;
  if (Array.isArray(result)) {
    return result.map((item) => {
      if (item && typeof item === "object" && "id" in item) {
        return requireEntity(
          findCanonicalEntity(workspace, String(item.id)),
          `Canonical entity ${String(item.id)}`,
        );
      }
      return item;
    }) as T;
  }
  if (result && typeof result === "object" && "id" in result) {
    return requireEntity(
      findCanonicalEntity(workspace, String(result.id)),
      `Canonical entity ${String(result.id)}`,
    ) as T;
  }
  return result;
}

interface MutationLease {
  owner: string;
  announcedAt: number;
  expiresAt: number;
}

function parseMutationLease(raw: string | null): MutationLease | undefined {
  if (raw === null) return undefined;
  try {
    const value = JSON.parse(raw) as Partial<MutationLease>;
    if (
      typeof value.owner !== "string" ||
      typeof value.announcedAt !== "number" ||
      !Number.isFinite(value.announcedAt) ||
      typeof value.expiresAt !== "number" ||
      !Number.isFinite(value.expiresAt)
    ) {
      return undefined;
    }
    return value as MutationLease;
  } catch {
    return undefined;
  }
}

export class WorkspaceStore {
  private snapshot: WorkspaceEnvelope;
  private readonly storage?: KeyValueStorage;
  private readonly idFactory: () => string;
  private readonly now: () => Date | string;
  private readonly storeId = globalThis.crypto.randomUUID();
  private readonly lockManager?: WorkspaceLockManager;
  private readonly requiresExclusiveMutations: boolean;
  private exclusiveDepth = 0;
  private storageBaseline: string | null;

  constructor(options: WorkspaceStoreOptions = {}) {
    const browserStorage = getBrowserWorkspaceStorage();
    this.storage = options.storage === undefined
      ? browserStorage
      : options.storage ?? undefined;
    const browserBacked = browserStorage !== undefined && this.storage === browserStorage;
    this.lockManager = options.lockManager === undefined
      ? browserBacked
        ? getBrowserWorkspaceLockManager()
        : undefined
      : options.lockManager ?? undefined;
    this.requiresExclusiveMutations = browserBacked || options.lockManager != null;
    this.idFactory = options.idFactory ?? (() => globalThis.crypto.randomUUID());
    this.now = options.now ?? (() => new Date());

    const stored = this.readStoredValue();
    this.storageBaseline = stored;
    this.snapshot = stored === null ? validateWorkspaceEnvelope(initialWorkspace()) : this.parseStored(stored);
  }

  getSnapshot(): WorkspaceEnvelope {
    return clone(this.snapshot);
  }

  async runExclusive<T>(
    callback: (store: WorkspaceStore) => T | Promise<T>,
  ): Promise<T> {
    if (!this.requiresExclusiveMutations) return await callback(this);
    if (!this.lockManager) {
      throw new WorkspaceStoreError(
        "invalid_operation",
        "Web Locks API is required for browser workspace mutations",
      );
    }
    return this.lockManager.request(WORKSPACE_BROWSER_LOCK_NAME, async () => {
      this.exclusiveDepth += 1;
      try {
        this.refresh();
        return await callback(this);
      } finally {
        this.exclusiveDepth -= 1;
      }
    });
  }

  refresh(): WorkspaceEnvelope {
    if (!this.storage) return this.getSnapshot();
    const stored = this.readStoredValue();
    const snapshot = stored === null
      ? validateWorkspaceEnvelope(initialWorkspace())
      : this.parseStored(stored);
    this.snapshot = snapshot;
    this.storageBaseline = stored;
    return clone(snapshot);
  }

  importLaunchSeed(): WorkspaceEnvelope {
    return this.mutate("import launch seed", (draft) => {
      const addMissingById = <T extends { id: string }>(target: T[], source: readonly T[]) => {
        const ids = new Set(target.map(({ id }) => id));
        for (const entity of source) {
          if (!ids.has(entity.id)) {
            target.push(clone(entity));
            ids.add(entity.id);
          }
        }
      };
      addMissingById(draft.members, launchWorkspaceSeed.members);
      addMissingById(draft.spaces, launchWorkspaceSeed.spaces);
      addMissingById(draft.lists, launchWorkspaceSeed.lists);

      const existingById = new Map(draft.tasks.map((task) => [task.id, task]));
      const existingByExternalId = new Map(
        draft.tasks.map((task) => [task.externalId, task]),
      );
      const resolved = new Map<string, WorkspaceTask>();
      const additions: WorkspaceTask[] = [];
      for (const seedTask of launchWorkspaceSeed.tasks) {
        const existing = existingById.get(seedTask.id) ?? existingByExternalId.get(seedTask.externalId);
        const task = existing ?? clone(seedTask);
        resolved.set(seedTask.id, task);
        if (!existing) additions.push(task);
      }
      for (const task of additions) {
        const seedTask = requireEntity(
          launchWorkspaceSeed.tasks.find(({ id }) => id === task.id),
          `Seed task ${task.id}`,
        );
        task.dependencies = seedTask.dependencies.map((dependency) => {
          const canonicalTarget = requireEntity(
            launchWorkspaceSeed.tasks.find(({ id }) => id === dependency.taskId),
            `Seed dependency ${dependency.externalId}`,
          );
          const target = requireEntity(resolved.get(canonicalTarget.id), "Resolved seed dependency");
          return { externalId: target.externalId, taskId: target.id };
        });
      }
      draft.tasks.push(...additions);
      return draft;
    });
  }

  resetWorkspace(): WorkspaceEnvelope {
    return this.mutate("reset workspace", (draft) => {
      Object.assign(draft, initialWorkspace());
      return draft;
    });
  }

  createTask(input: CreateTaskInput): WorkspaceTask {
    return this.mutate("create task", (draft) => {
      const timestamp = this.timestamp();
      const externalId = input.externalId ?? this.nextExternalId(draft);
      const position = input.position ?? this.nextTaskPosition(draft, input.listId);
      const task = {
        ...clone(input),
        id: this.idFactory(),
        externalId,
        position,
        checklist: input.checklist.map((item) => ({
          ...clone(item),
          id: item.id ?? this.idFactory(),
        })),
        createdAt: timestamp,
        updatedAt: timestamp,
      } as WorkspaceTask;
      const siblings = draft.tasks.filter(({ listId }) => listId === task.listId);
      insertAtPosition(siblings, task, task.position);
      draft.tasks.push(task);
      return task;
    });
  }

  updateTask(taskId: string, patch: UpdateTaskInput): WorkspaceTask {
    return this.mutate("update task", (draft) => {
      const task = requireEntity(
        draft.tasks.find(({ id }) => id === taskId),
        `Task ${taskId}`,
      );
      const previousListId = task.listId;
      const previousPosition = task.position;
      const targetListId = patch.listId ?? previousListId;
      requireEntity(
        draft.lists.find(({ id }) => id === targetListId),
        `List ${targetListId}`,
      );
      Object.assign(task, clone(patch), { updatedAt: this.timestamp() });
      if (patch.checklist) {
        task.checklist = patch.checklist.map((item) => ({
          ...clone(item),
          id: item.id ?? this.idFactory(),
        }));
      }
      if (patch.listId !== undefined || patch.position !== undefined) {
        const sourceTasks = draft.tasks.filter(
          (candidate) => candidate.listId === previousListId && candidate.id !== task.id,
        );
        normalizePositions(sourceTasks);
        const targetTasks = draft.tasks.filter(
          (candidate) => candidate.listId === targetListId && candidate.id !== task.id,
        );
        task.listId = targetListId;
        insertAtPosition(
          targetTasks,
          task,
          patch.position ?? (targetListId === previousListId ? previousPosition : targetTasks.length),
        );
      }
      return task;
    });
  }

  moveTask(taskId: string, move: MoveTaskInput): WorkspaceTask {
    return this.updateTask(taskId, move);
  }

  deleteTask(taskId: string): void {
    this.mutate("delete task", (draft) => {
      const index = draft.tasks.findIndex(({ id }) => id === taskId);
      const task = requireEntity(draft.tasks[index], `Task ${taskId}`);
      draft.tasks.splice(index, 1);
      for (const candidate of draft.tasks) {
        candidate.dependencies = candidate.dependencies.filter(
          (dependency) =>
            dependency.taskId !== task.id && dependency.externalId !== task.externalId,
        );
      }
      normalizePositions(draft.tasks.filter(({ listId }) => listId === task.listId));
    });
  }

  createMember(input: Omit<WorkspaceMember, "id">): WorkspaceMember {
    return this.mutate("create member", (draft) => {
      const member = { id: this.idFactory(), ...clone(input) };
      draft.members.push(member);
      return member;
    });
  }

  updateMember(
    memberId: string,
    patch: Partial<Omit<WorkspaceMember, "id">>,
  ): WorkspaceMember {
    return this.mutate("update member", (draft) => {
      const member = requireEntity(
        draft.members.find(({ id }) => id === memberId),
        `Member ${memberId}`,
      );
      Object.assign(member, clone(patch));
      return member;
    });
  }

  deleteMember(memberId: string): void {
    this.mutate("delete member", (draft) => {
      const index = draft.members.findIndex(({ id }) => id === memberId);
      const member = requireEntity(draft.members[index], `Member ${memberId}`);
      draft.members.splice(index, 1);
      for (const task of draft.tasks) {
        if (task.assigneeId === member.id) task.assigneeId = null;
        if (task.backupAssignee?.trim() === member.name.trim()) {
          task.backupAssignee = null;
        }
      }
    });
  }

  createSpace(input: Omit<WorkspaceSpace, "id" | "position"> & { position?: number }): WorkspaceSpace {
    return this.mutate("create space", (draft) => {
      const space = {
        id: this.idFactory(),
        ...clone(input),
        position: input.position ?? draft.spaces.length,
      };
      insertAtPosition(draft.spaces, space, space.position);
      return space;
    });
  }

  renameSpace(spaceId: string, name: string): WorkspaceSpace {
    return this.updateSpace(spaceId, { name });
  }

  updateSpace(
    spaceId: string,
    patch: Partial<Omit<WorkspaceSpace, "id">>,
  ): WorkspaceSpace {
    return this.mutate("update space", (draft) => {
      const space = requireEntity(
        draft.spaces.find(({ id }) => id === spaceId),
        `Space ${spaceId}`,
      );
      Object.assign(space, clone(patch));
      if (patch.position === undefined) {
        normalizePositions(draft.spaces);
      } else {
        insertAtPosition(draft.spaces, space, patch.position);
      }
      return space;
    });
  }

  reorderSpaces(spaceIds: string[]): WorkspaceSpace[] {
    return this.mutate("reorder spaces", (draft) => {
      this.assertExactOrder(spaceIds, draft.spaces.map(({ id }) => id), "spaces");
      const positionById = new Map(spaceIds.map((id, index) => [id, index]));
      draft.spaces.forEach((space) => {
        space.position = positionById.get(space.id) as number;
      });
      normalizePositions(draft.spaces);
      return draft.spaces;
    });
  }

  deleteSpace(spaceId: string, options: DeleteSpaceOptions): void {
    this.mutate("delete space", (draft) => {
      if (draft.spaces.length === 1) {
        throw new WorkspaceStoreError("invalid_operation", "Cannot delete the last space");
      }
      const spaceIndex = draft.spaces.findIndex(({ id }) => id === spaceId);
      requireEntity(draft.spaces[spaceIndex], `Space ${spaceId}`);
      const destination = requireEntity(
        draft.lists.find(({ id }) => id === options.destinationListId),
        `Destination list ${options.destinationListId}`,
      );
      if (destination.spaceId === spaceId) {
        throw new WorkspaceStoreError(
          "invalid_operation",
          "Destination list must be outside the deleted space",
        );
      }
      if (options.destinationSpaceId && destination.spaceId !== options.destinationSpaceId) {
        throw new WorkspaceStoreError(
          "invalid_operation",
          "Destination list does not belong to destination space",
        );
      }

      const removedListIds = new Set(
        draft.lists.filter(({ spaceId: ownerId }) => ownerId === spaceId).map(({ id }) => id),
      );
      for (const task of draft.tasks) {
        if (!removedListIds.has(task.listId)) continue;
        const mappedId = options.listMapping?.[task.listId] ?? destination.id;
        const mappedList = requireEntity(
          draft.lists.find(({ id }) => id === mappedId),
          `Mapped destination list ${mappedId}`,
        );
        if (removedListIds.has(mappedList.id)) {
          throw new WorkspaceStoreError(
            "invalid_operation",
            "Mapped destination cannot be deleted with its source space",
          );
        }
        task.listId = mappedList.id;
        task.position = this.nextTaskPosition(draft, mappedList.id, task.id);
      }
      draft.lists = draft.lists.filter(({ id }) => !removedListIds.has(id));
      draft.spaces.splice(spaceIndex, 1);
      normalizePositions(draft.spaces);
      for (const remainingSpace of draft.spaces) {
        normalizePositions(draft.lists.filter(({ spaceId: ownerId }) => ownerId === remainingSpace.id));
      }
      for (const list of draft.lists) {
        normalizePositions(draft.tasks.filter(({ listId }) => listId === list.id));
      }
    });
  }

  createList(input: Omit<WorkspaceList, "id" | "position"> & { position?: number }): WorkspaceList {
    return this.mutate("create list", (draft) => {
      requireEntity(draft.spaces.find(({ id }) => id === input.spaceId), `Space ${input.spaceId}`);
      const siblings = draft.lists.filter(({ spaceId }) => spaceId === input.spaceId);
      const list = {
        id: this.idFactory(),
        ...clone(input),
        position: input.position ?? siblings.length,
      };
      insertAtPosition(siblings, list, list.position);
      draft.lists.push(list);
      return list;
    });
  }

  renameList(listId: string, name: string): WorkspaceList {
    return this.updateList(listId, { name });
  }

  updateList(
    listId: string,
    patch: Partial<Omit<WorkspaceList, "id">>,
  ): WorkspaceList {
    return this.mutate("update list", (draft) => {
      const list = requireEntity(
        draft.lists.find(({ id }) => id === listId),
        `List ${listId}`,
      );
      const previousSpaceId = list.spaceId;
      const targetSpaceId = patch.spaceId ?? previousSpaceId;
      requireEntity(
        draft.spaces.find(({ id }) => id === targetSpaceId),
        `Space ${targetSpaceId}`,
      );

      const previousSiblings = draft.lists.filter(
        (candidate) => candidate.spaceId === previousSpaceId && candidate.id !== list.id,
      );
      normalizePositions(previousSiblings);
      const targetSiblings = draft.lists
        .filter((candidate) => candidate.spaceId === targetSpaceId && candidate.id !== list.id)
        .sort((left, right) => left.position - right.position);
      const requestedPosition = patch.position ?? (
        targetSpaceId === previousSpaceId ? list.position : targetSiblings.length
      );

      Object.assign(list, clone(patch), { spaceId: targetSpaceId });
      insertAtPosition(targetSiblings, list, requestedPosition);
      return list;
    });
  }

  reorderLists(spaceId: string, listIds: string[]): WorkspaceList[] {
    return this.mutate("reorder lists", (draft) => {
      const lists = draft.lists.filter((list) => list.spaceId === spaceId);
      this.assertExactOrder(listIds, lists.map(({ id }) => id), "lists");
      const positionById = new Map(listIds.map((id, index) => [id, index]));
      lists.forEach((list) => {
        list.position = positionById.get(list.id) as number;
      });
      normalizePositions(lists);
      return lists;
    });
  }

  deleteList(listId: string, destinationListId?: string): void {
    this.mutate("delete list", (draft) => {
      if (draft.lists.length === 1) {
        throw new WorkspaceStoreError("invalid_operation", "Cannot delete the last list");
      }
      const index = draft.lists.findIndex(({ id }) => id === listId);
      const list = requireEntity(draft.lists[index], `List ${listId}`);
      if (!destinationListId) {
        throw new WorkspaceStoreError(
          "invalid_operation",
          "A destination list is required",
        );
      }
      if (destinationListId === listId) {
        throw new WorkspaceStoreError(
          "invalid_operation",
          "Destination list must differ from the deleted list",
        );
      }
      const destination = requireEntity(
        draft.lists.find(({ id }) => id === destinationListId),
        `Destination list ${destinationListId}`,
      );
      let nextPosition = this.nextTaskPosition(draft, destination.id);
      for (const task of draft.tasks) {
        if (task.listId === list.id) {
          task.listId = destination.id;
          task.position = nextPosition;
          nextPosition += 1;
        }
      }
      draft.lists.splice(index, 1);
      normalizePositions(draft.lists.filter(({ spaceId }) => spaceId === list.spaceId));
      normalizePositions(draft.tasks.filter(({ listId: ownerId }) => ownerId === destination.id));
    });
  }

  private readStoredValue(): string | null {
    if (!this.storage) return null;
    try {
      return this.storage.getItem(WORKSPACE_STORAGE_KEY);
    } catch (error) {
      throw new WorkspaceStoreError(
        "storage_read",
        `Unable to read task workspace: ${errorMessage(error)}`,
        { cause: error },
      );
    }
  }

  private parseStored(raw: string): WorkspaceEnvelope {
    let candidate: unknown;
    try {
      candidate = JSON.parse(raw);
    } catch (error) {
      throw new WorkspaceStoreError("storage_read", "Stored task workspace is not valid JSON", {
        cause: error,
      });
    }
    return validateWorkspaceEnvelope(candidate);
  }

  private mutate<T>(label: string, mutation: (draft: WorkspaceEnvelope) => T): T {
    if (this.requiresExclusiveMutations && this.exclusiveDepth === 0) {
      throw new WorkspaceStoreError(
        "invalid_operation",
        "Browser workspace mutations must run inside runExclusive",
      );
    }
    const draft = clone(this.snapshot);
    let result: T;
    let validated: WorkspaceEnvelope;
    try {
      result = mutation(draft);
      validated = validateWorkspaceEnvelope(draft);
    } catch (error) {
      if (error instanceof WorkspaceStoreError) throw error;
      throw new WorkspaceStoreError(
        "validation",
        `Unable to ${label}: ${errorMessage(error)}`,
        { cause: error },
      );
    }
    const canonicalResult = canonicalMutationResult(validated, draft, result);

    if (this.storage) {
      const releaseLease = this.acquireMutationLease();
      try {
        const stored = this.readStoredValue();
        if (stored !== this.storageBaseline) {
          throw new WorkspaceStoreError(
            "conflict",
            "Task workspace changed in another store; refresh before retrying",
          );
        }
        this.assertMutationLeaseOwnership();
        const serialized = JSON.stringify(validated);
        try {
          this.storage.setItem(WORKSPACE_STORAGE_KEY, serialized);
        } catch (error) {
          throw new WorkspaceStoreError(
            "storage_write",
            `Unable to persist task workspace: ${errorMessage(error)}`,
            { cause: error },
          );
        }
        this.assertMutationLeaseOwnership();
        this.storageBaseline = serialized;
      } finally {
        releaseLease();
      }
    }
    this.snapshot = validated;
    return clone(canonicalResult);
  }

  private timestamp(): string {
    const value = this.now();
    return (value instanceof Date ? value : new Date(value)).toISOString();
  }

  private acquireMutationLease(): () => void {
    const storage = this.storage;
    if (!storage) return () => undefined;

    const announcedAt = Date.now();
    const intentKey = `${WORKSPACE_MUTATION_INTENT_PREFIX}${this.storeId}`;
    const lease: MutationLease = {
      owner: this.storeId,
      announcedAt,
      expiresAt: announcedAt + MUTATION_LEASE_MS,
    };
    const cleanupIntent = () => {
      try {
        storage.removeItem(intentKey);
      } catch {
        // A stale intent expires and can be removed by the next writer.
      }
    };
    const cleanupLock = () => {
      try {
        const activeLock = parseMutationLease(storage.getItem(WORKSPACE_MUTATION_LOCK_KEY));
        if (activeLock?.owner === this.storeId) {
          storage.removeItem(WORKSPACE_MUTATION_LOCK_KEY);
        }
      } catch {
        // A stale lock expires and can be removed by the next writer.
      }
    };

    try {
      storage.setItem(intentKey, JSON.stringify(lease));
      this.settleMutationIntents();
      const winner = this.firstActiveMutationIntent(Date.now());
      if (winner && winner.owner !== this.storeId) {
        throw new WorkspaceStoreError(
          "conflict",
          "Another task workspace mutation owns the current intent window",
        );
      }

      const activeLock = parseMutationLease(storage.getItem(WORKSPACE_MUTATION_LOCK_KEY));
      if (
        activeLock &&
        activeLock.owner !== this.storeId &&
        activeLock.expiresAt > Date.now()
      ) {
        throw new WorkspaceStoreError(
          "conflict",
          "Another task workspace mutation holds the active lease",
        );
      }
      storage.setItem(WORKSPACE_MUTATION_LOCK_KEY, JSON.stringify(lease));
      this.assertMutationLeaseOwnership();
    } catch (error) {
      cleanupLock();
      cleanupIntent();
      if (error instanceof WorkspaceStoreError) throw error;
      throw new WorkspaceStoreError(
        "storage_write",
        `Unable to coordinate task workspace mutation: ${errorMessage(error)}`,
        { cause: error },
      );
    }

    return () => {
      cleanupLock();
      cleanupIntent();
    };
  }

  private settleMutationIntents(): void {
    if (!this.storage?.key || typeof this.storage.length !== "number") return;
    const deadline = Date.now() + MUTATION_SETTLE_MS;
    while (Date.now() < deadline) {
      // The bounded settle window lets concurrent tabs announce their intents.
    }
  }

  private firstActiveMutationIntent(now: number): MutationLease | undefined {
    const storage = this.storage;
    if (!storage?.key || typeof storage.length !== "number") return undefined;

    const intents: Array<MutationLease & { order: number }> = [];
    const expiredKeys: string[] = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!key?.startsWith(WORKSPACE_MUTATION_INTENT_PREFIX)) continue;
      const intent = parseMutationLease(storage.getItem(key));
      if (!intent || intent.expiresAt <= now) {
        expiredKeys.push(key);
        continue;
      }
      intents.push({ ...intent, order: index });
    }
    for (const key of expiredKeys) storage.removeItem(key);
    return intents.sort(
      (left, right) =>
        left.announcedAt - right.announcedAt ||
        left.order - right.order ||
        left.owner.localeCompare(right.owner),
    )[0];
  }

  private assertMutationLeaseOwnership(): void {
    const winningIntent = this.firstActiveMutationIntent(Date.now());
    const activeLock = parseMutationLease(
      this.storage?.getItem(WORKSPACE_MUTATION_LOCK_KEY) ?? null,
    );
    if (
      (winningIntent && winningIntent.owner !== this.storeId) ||
      activeLock?.owner !== this.storeId ||
      activeLock.expiresAt <= Date.now()
    ) {
      throw new WorkspaceStoreError(
        "conflict",
        "Task workspace mutation lease ownership was lost",
      );
    }
  }

  private nextExternalId(workspace: WorkspaceEnvelope): string {
    const highest = workspace.tasks.reduce((value, task) => {
      const numeric = Number(task.externalId.slice(1));
      return Number.isInteger(numeric) ? Math.max(value, numeric) : value;
    }, 0);
    if (highest >= 999) {
      throw new WorkspaceStoreError("conflict", "No external task IDs remain");
    }
    return `T${String(highest + 1).padStart(3, "0")}`;
  }

  private nextTaskPosition(
    workspace: WorkspaceEnvelope,
    listId: string,
    excludingTaskId?: string,
  ): number {
    const positions = workspace.tasks
      .filter((task) => task.listId === listId && task.id !== excludingTaskId)
      .map(({ position }) => position);
    return positions.length === 0 ? 0 : Math.max(...positions) + 1;
  }

  private assertExactOrder(actual: string[], expected: string[], label: string): void {
    if (
      actual.length !== expected.length ||
      new Set(actual).size !== actual.length ||
      actual.some((id) => !expected.includes(id))
    ) {
      throw new WorkspaceStoreError(
        "invalid_operation",
        `Reordered ${label} must contain every existing ID exactly once`,
      );
    }
  }

}

export function createWorkspaceStore(options: WorkspaceStoreOptions = {}): WorkspaceStore {
  return new WorkspaceStore(options);
}

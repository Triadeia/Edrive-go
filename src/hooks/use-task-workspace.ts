"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  WORKSPACE_STORAGE_KEY,
  WORKSPACE_BROWSER_LOCK_NAME,
  WorkspaceStore,
  WorkspaceStoreError,
  type CreateTaskInput,
  type DeleteSpaceOptions,
  type MoveTaskInput,
  type UpdateTaskInput,
  type WorkspaceEnvelope,
  type WorkspaceList,
  type WorkspaceMember,
  type WorkspaceSpace,
  getBrowserWorkspaceLockManager,
} from "@/lib/tasks/workspace-store";

function friendlyError(error: unknown): string {
  if (!(error instanceof WorkspaceStoreError)) {
    return error instanceof Error ? error.message : "Não foi possível atualizar o painel.";
  }
  const prefixes: Record<WorkspaceStoreError["code"], string> = {
    storage_read: "Não foi possível ler os dados deste navegador",
    storage_write: "Não foi possível salvar os dados neste navegador",
    validation: "Os dados informados são inválidos",
    not_found: "O item não foi encontrado",
    conflict: "O painel mudou em outra aba. Recarregue antes de continuar",
    invalid_operation: "Esta operação não pode ser concluída",
  };
  return `${prefixes[error.code]}. ${error.message}`;
}

export function useTaskWorkspace() {
  const storeRef = useRef<WorkspaceStore | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceEnvelope | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStore = useCallback(() => {
    try {
      const store = new WorkspaceStore();
      storeRef.current = store;
      setWorkspace(store.getSnapshot());
      setError(null);
    } catch (loadError) {
      storeRef.current = null;
      setWorkspace(null);
      setError(friendlyError(loadError));
    }
  }, []);

  useEffect(() => {
    loadStore();
    const syncOtherTab = (event: StorageEvent) => {
      if (event.key === WORKSPACE_STORAGE_KEY) loadStore();
    };
    window.addEventListener("storage", syncOtherTab);
    return () => window.removeEventListener("storage", syncOtherTab);
  }, [loadStore]);

  const run = useCallback(async <T,>(mutation: (store: WorkspaceStore) => T): Promise<T | undefined> => {
    const store = storeRef.current;
    if (!store) return undefined;
    try {
      const result = await store.runExclusive((lockedStore) => mutation(lockedStore));
      setWorkspace(store.getSnapshot());
      setError(null);
      return result;
    } catch (mutationError) {
      setWorkspace(store.getSnapshot());
      setError(friendlyError(mutationError));
      return undefined;
    }
  }, []);

  return {
    workspace,
    error,
    clearError: () => setError(null),
    reload: loadStore,
    recoverCorruptedWorkspace: async () => {
      try {
        const removeCorruptedData = () => window.localStorage.removeItem(WORKSPACE_STORAGE_KEY);
        const lockManager = getBrowserWorkspaceLockManager();
        if (lockManager) {
          await lockManager.request(WORKSPACE_BROWSER_LOCK_NAME, removeCorruptedData);
        } else {
          removeCorruptedData();
        }
        loadStore();
      } catch (recoveryError) {
        setError(friendlyError(recoveryError));
      }
    },
    importLaunchSeed: () => run((store) => store.importLaunchSeed()),
    resetBrowserWorkspace: () => run((store) => store.resetWorkspace()),
    createTask: (input: CreateTaskInput) => run((store) => store.createTask(input)),
    updateTask: (id: string, patch: UpdateTaskInput) => run((store) => store.updateTask(id, patch)),
    moveTask: (id: string, move: MoveTaskInput) => run((store) => store.moveTask(id, move)),
    deleteTask: async (id: string) => await run((store) => { store.deleteTask(id); return true; }) === true,
    createMember: (input: Omit<WorkspaceMember, "id">) => run((store) => store.createMember(input)),
    updateMember: (id: string, patch: Partial<Omit<WorkspaceMember, "id">>) => run((store) => store.updateMember(id, patch)),
    deleteMember: async (id: string) => await run((store) => { store.deleteMember(id); return true; }) === true,
    createSpace: (input: Omit<WorkspaceSpace, "id" | "position"> & { position?: number }) => run((store) => store.createSpace(input)),
    updateSpace: (id: string, patch: Partial<Omit<WorkspaceSpace, "id">>) => run((store) => store.updateSpace(id, patch)),
    deleteSpace: async (id: string, options: DeleteSpaceOptions) => await run((store) => { store.deleteSpace(id, options); return true; }) === true,
    createList: (input: Omit<WorkspaceList, "id" | "position"> & { position?: number }) => run((store) => store.createList(input)),
    updateList: (id: string, patch: Partial<Omit<WorkspaceList, "id">>) => run((store) => store.updateList(id, patch)),
    deleteList: async (id: string, destinationListId: string) => await run((store) => { store.deleteList(id, destinationListId); return true; }) === true,
  };
}

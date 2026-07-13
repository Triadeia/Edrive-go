import { z } from "zod";

export const taskStatusSchema = z.enum([
  "backlog",
  "todo",
  "in_progress",
  "in_review",
  "blocked",
  "done",
  "cancelled",
]);

export const taskPrioritySchema = z.enum([
  "urgent",
  "high",
  "medium",
  "low",
]);

const sourceMetaSchema = z.object({
  ID: z.string(),
  Frente: z.string(),
  Subfrente: z.string(),
  Fase: z.string(),
  Descricao_da_Tarefa: z.string(),
  Responsavel_Funcao: z.string(),
  Responsavel_Nominal_Sugerido: z.string(),
  Responsavel_Substituto: z.string(),
  Prioridade: z.string(),
  Status: z.string(),
  Data_Inicio: z.string(),
  Hora_Inicio: z.string(),
  Prazo: z.string(),
  Hora_Limite: z.string(),
  Dependencias: z.string(),
  Bloqueadores: z.string(),
  Aprovacao_Necessaria: z.string(),
  Fornecedor: z.string(),
  Custo_Previsto: z.string(),
  Tipo_Custo: z.string(),
  Centro_Custo: z.string(),
  Evidencia_Exigida: z.string(),
  Definicao_de_Concluido: z.string(),
  Risco_Associado: z.string(),
  Proxima_Acao: z.string(),
  Observacoes: z.string(),
  Fonte_da_Informacao: z.string(),
  Link_Comprovante: z.string(),
});

const nullableText = z.string().min(1).nullable();
const isoDateTime = z.string().datetime({ offset: true }).nullable();
const uuid = z.string().uuid();

export const workspaceEnvelopeSchema = z
  .object({
    version: z.literal(1),
    workspace: z.object({
      id: uuid,
      name: z.string().min(1),
      eventName: z.string().min(1),
      eventDate: z.iso.date(),
      timezone: z.literal("America/Bahia"),
      currency: z.literal("BRL"),
      sourceArchive: z.string().min(1),
      sourceEntries: z.tuple([z.string().min(1), z.string().min(1)]),
    }),
    members: z.array(
      z.object({
        id: uuid,
        name: z.string().min(1),
        role: z.string().min(1),
        color: z.string().regex(/^#[0-9a-f]{6}$/i),
      }),
    ),
    spaces: z.array(
      z.object({
        id: uuid,
        name: z.string().min(1),
        emoji: z.string().min(1),
        position: z.number().int().nonnegative(),
      }),
    ),
    lists: z.array(
      z.object({
        id: uuid,
        spaceId: uuid,
        name: z.string().min(1),
        position: z.number().int().nonnegative(),
      }),
    ),
    tasks: z.array(
      z.object({
        id: uuid,
        externalId: z.string().regex(/^T\d{3}$/),
        title: z.string().min(1),
        description: z.string(),
        status: taskStatusSchema,
        priority: taskPrioritySchema,
        assigneeId: uuid.nullable(),
        backupAssignee: nullableText,
        listId: uuid,
        subarea: z.string().min(1),
        phase: z.string().min(1),
        startAt: isoDateTime,
        dueAt: isoDateTime,
        tags: z.array(z.string().min(1)),
        vendor: nullableText,
        cost: z.number().nonnegative().nullable(),
        blockers: nullableText,
        nextAction: nullableText,
        notes: nullableText,
        evidence: nullableText,
        approval: nullableText,
        risk: nullableText,
        definitionOfDone: nullableText,
        source: nullableText,
        sourceUrl: nullableText,
        dependencies: z.array(
          z.object({
            externalId: z.string().regex(/^T\d{3}$/),
            taskId: uuid.nullable(),
          }),
        ),
        checklist: z.array(
          z.object({
            id: uuid,
            title: z.string().min(1),
            completed: z.boolean(),
          }),
        ),
        position: z.number().int().nonnegative(),
        sourceMeta: sourceMetaSchema,
        createdAt: z.string().datetime({ offset: true }),
        updatedAt: z.string().datetime({ offset: true }),
      }),
    ),
  });

export const launchWorkspaceSchema = workspaceEnvelopeSchema.superRefine(
  (workspace, context) => {
    if (workspace.members.length !== 6) {
      context.addIssue({
        code: "custom",
        message: "Launch workspace must contain exactly 6 members",
        path: ["members"],
      });
    }
    if (workspace.spaces.length !== 5) {
      context.addIssue({
        code: "custom",
        message: "Launch workspace must contain exactly 5 spaces",
        path: ["spaces"],
      });
    }
    if (workspace.lists.length !== 20) {
      context.addIssue({
        code: "custom",
        message: "Launch workspace must contain exactly 20 lists",
        path: ["lists"],
      });
    }
    if (workspace.tasks.length !== 204) {
      context.addIssue({
        code: "custom",
        message: "Launch workspace must contain exactly 204 tasks",
        path: ["tasks"],
      });
    }

    const seenEntityIds = new Map<string, string>();
    const registerEntityId = (id: string, label: string, path: PropertyKey[]) => {
      const previousLabel = seenEntityIds.get(id);
      if (previousLabel) {
        context.addIssue({
          code: "custom",
          message: `Duplicate entity ID ${id}: ${previousLabel} and ${label}`,
          path,
        });
      } else {
        seenEntityIds.set(id, label);
      }
    };

    registerEntityId(workspace.workspace.id, "workspace", ["workspace", "id"]);
    workspace.members.forEach((member, index) => {
      registerEntityId(member.id, `member ${index}`, ["members", index, "id"]);
    });
    workspace.spaces.forEach((space, index) => {
      registerEntityId(space.id, `space ${index}`, ["spaces", index, "id"]);
    });
    workspace.lists.forEach((list, index) => {
      registerEntityId(list.id, `list ${index}`, ["lists", index, "id"]);
    });
    workspace.tasks.forEach((task, index) => {
      registerEntityId(task.id, `task ${index}`, ["tasks", index, "id"]);
      task.checklist.forEach((item, itemIndex) => {
        registerEntityId(item.id, `task ${index} checklist ${itemIndex}`, [
          "tasks",
          index,
          "checklist",
          itemIndex,
          "id",
        ]);
      });
    });

    const memberIds = new Set(workspace.members.map((member) => member.id));
    const spaceIds = new Set(workspace.spaces.map((space) => space.id));
    const listIds = new Set(workspace.lists.map((list) => list.id));
    const taskIds = new Set(workspace.tasks.map((task) => task.id));
    const taskByExternalId = new Map<
      string,
      (typeof workspace.tasks)[number]
    >();

    workspace.tasks.forEach((task, index) => {
      if (taskByExternalId.has(task.externalId)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate external task ID: ${task.externalId}`,
          path: ["tasks", index, "externalId"],
        });
      } else {
        taskByExternalId.set(task.externalId, task);
      }
    });

    workspace.lists.forEach((list, index) => {
      if (!spaceIds.has(list.spaceId)) {
        context.addIssue({
          code: "custom",
          message: `Unknown space reference: ${list.spaceId}`,
          path: ["lists", index, "spaceId"],
        });
      }
    });

    workspace.tasks.forEach((task, index) => {
      if (!listIds.has(task.listId)) {
        context.addIssue({
          code: "custom",
          message: `Unknown list reference: ${task.listId}`,
          path: ["tasks", index, "listId"],
        });
      }
      if (task.assigneeId !== null && !memberIds.has(task.assigneeId)) {
        context.addIssue({
          code: "custom",
          message: `Unknown member reference: ${task.assigneeId}`,
          path: ["tasks", index, "assigneeId"],
        });
      }
      task.dependencies.forEach((dependency, dependencyIndex) => {
        const dependencyPath = [
          "tasks",
          index,
          "dependencies",
          dependencyIndex,
        ];
        const targetTask = taskByExternalId.get(dependency.externalId);

        if (!targetTask) {
          context.addIssue({
            code: "custom",
            message: `Unknown external task reference: ${dependency.externalId}`,
            path: [...dependencyPath, "externalId"],
          });
        }
        if (dependency.taskId === null) {
          context.addIssue({
            code: "custom",
            message: `Dependency ${dependency.externalId} must resolve to a task ID`,
            path: [...dependencyPath, "taskId"],
          });
        } else if (!taskIds.has(dependency.taskId)) {
          context.addIssue({
            code: "custom",
            message: `Unknown task reference: ${dependency.taskId}`,
            path: [...dependencyPath, "taskId"],
          });
        } else if (targetTask && dependency.taskId !== targetTask.id) {
          context.addIssue({
            code: "custom",
            message: `Dependency ${dependency.externalId} must reference ${targetTask.id}`,
            path: [...dependencyPath, "taskId"],
          });
        }
        if (
          dependency.externalId === task.externalId ||
          dependency.taskId === task.id
        ) {
          context.addIssue({
            code: "custom",
            message: `Task ${task.externalId} cannot depend on itself`,
            path: dependencyPath,
          });
        }
      });
    });
  });

export type LaunchWorkspace = z.infer<typeof launchWorkspaceSchema>;
export type LaunchTask = LaunchWorkspace["tasks"][number];
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;

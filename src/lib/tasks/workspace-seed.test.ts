import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import launchSeedJson from "../../data/tasks/launch-workspace-seed.json";
import {
  LAUNCH_SOURCE_HEADER_MAP,
  launchWorkspaceSeed,
} from "./workspace-seed";
import * as workspaceSchemas from "./workspace-schema";

const { launchWorkspaceSchema } = workspaceSchemas;

const SOURCE_ZIP =
  "/Volumes/SSD-Nilton/[03] Edrive go /PAINEL TAREFAS - EDRIVE GO - CLAUDE DESIGNER/EDrive Go dashboard launch.zip";

const EXPECTED_HEADERS = [
  "ID",
  "Frente",
  "Subfrente",
  "Fase",
  "Descricao_da_Tarefa",
  "Responsavel_Funcao",
  "Responsavel_Nominal_Sugerido",
  "Responsavel_Substituto",
  "Prioridade",
  "Status",
  "Data_Inicio",
  "Hora_Inicio",
  "Prazo",
  "Hora_Limite",
  "Dependencias",
  "Bloqueadores",
  "Aprovacao_Necessaria",
  "Fornecedor",
  "Custo_Previsto",
  "Tipo_Custo",
  "Centro_Custo",
  "Evidencia_Exigida",
  "Definicao_de_Concluido",
  "Risco_Associado",
  "Proxima_Acao",
  "Observacoes",
  "Fonte_da_Informacao",
  "Link_Comprovante",
] as const;

const UUID_V5_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cloneLaunchSeed() {
  return structuredClone(launchWorkspaceSeed);
}

function launchTaskWithDependency(seed: ReturnType<typeof cloneLaunchSeed>) {
  const task = seed.tasks.find((candidate) => candidate.dependencies.length > 0);
  assert.ok(task, "canonical seed contains at least one dependency");
  return task;
}

test("uses stable UUID v5 identifiers for every canonical entity", () => {
  const identifiers = [
    launchWorkspaceSeed.workspace.id,
    ...launchWorkspaceSeed.members.map(({ id }) => id),
    ...launchWorkspaceSeed.spaces.map(({ id }) => id),
    ...launchWorkspaceSeed.lists.map(({ id }) => id),
    ...launchWorkspaceSeed.tasks.flatMap((task) => [
      task.id,
      ...task.checklist.map(({ id }) => id),
    ]),
  ];

  for (const identifier of identifiers) {
    assert.match(identifier, UUID_V5_PATTERN);
  }
});

test("rejects non-UUID identifiers in every entity shape", async (context) => {
  const mutations: Array<[
    string,
    (seed: ReturnType<typeof cloneLaunchSeed>) => void,
  ]> = [
    ["workspace", (seed) => {
      seed.workspace.id = "workspace-invalid";
    }],
    ["member", (seed) => {
      const previousId = seed.members[0].id;
      seed.members[0].id = "member-invalid";
      for (const task of seed.tasks) {
        if (task.assigneeId === previousId) task.assigneeId = "member-invalid";
      }
    }],
    ["space", (seed) => {
      const previousId = seed.spaces[0].id;
      seed.spaces[0].id = "space-invalid";
      for (const list of seed.lists) {
        if (list.spaceId === previousId) list.spaceId = "space-invalid";
      }
    }],
    ["list", (seed) => {
      const previousId = seed.lists[0].id;
      seed.lists[0].id = "list-invalid";
      for (const task of seed.tasks) {
        if (task.listId === previousId) task.listId = "list-invalid";
      }
    }],
    ["task", (seed) => {
      const previousId = seed.tasks[0].id;
      seed.tasks[0].id = "task-invalid";
      for (const task of seed.tasks) {
        for (const dependency of task.dependencies) {
          if (dependency.taskId === previousId) dependency.taskId = "task-invalid";
        }
      }
    }],
    ["checklist", (seed) => {
      seed.tasks[0].checklist.push({
        id: "checklist-invalid",
        title: "Invalid identifier fixture",
        completed: false,
      });
    }],
  ];

  for (const [label, mutate] of mutations) {
    await context.test(label, () => {
      const candidate = cloneLaunchSeed();
      mutate(candidate);
      assert.throws(() => launchWorkspaceSchema.parse(candidate));
    });
  }
});

test("stores the launch event name in workspace metadata", () => {
  assert.equal(
    Reflect.get(launchWorkspaceSeed.workspace, "eventName"),
    "Lançamento eDrive Go",
  );
});

test("rejects unresolved, mismatched, unknown, and self dependencies", async (context) => {
  await context.test("unknown externalId", () => {
    const candidate = cloneLaunchSeed();
    const task = launchTaskWithDependency(candidate);
    task.dependencies[0].externalId = "T999";
    task.dependencies[0].taskId = candidate.tasks[0].id;
    assert.throws(() => launchWorkspaceSchema.parse(candidate));
  });

  await context.test("null taskId", () => {
    const candidate = cloneLaunchSeed();
    const task = launchTaskWithDependency(candidate);
    task.dependencies[0].taskId = null;
    assert.throws(() => launchWorkspaceSchema.parse(candidate));
  });

  await context.test("mismatched taskId", () => {
    const candidate = cloneLaunchSeed();
    const task = launchTaskWithDependency(candidate);
    const otherTasks = candidate.tasks.filter(({ id }) => id !== task.id);
    task.dependencies[0] = {
      externalId: otherTasks[0].externalId,
      taskId: otherTasks[1].id,
    };
    assert.throws(() => launchWorkspaceSchema.parse(candidate));
  });

  await context.test("self reference", () => {
    const candidate = cloneLaunchSeed();
    const task = launchTaskWithDependency(candidate);
    task.dependencies[0] = {
      externalId: task.externalId,
      taskId: task.id,
    };
    assert.throws(() => launchWorkspaceSchema.parse(candidate));
  });
});

test("enforces canonical task count and unique entity/external IDs", async (context) => {
  await context.test("exactly 204 tasks", () => {
    const candidate = cloneLaunchSeed();
    candidate.tasks.pop();
    assert.throws(() => launchWorkspaceSchema.parse(candidate));
  });

  await context.test("unique task IDs", () => {
    const candidate = cloneLaunchSeed();
    const previousId = candidate.tasks[1].id;
    candidate.tasks[1].id = candidate.tasks[0].id;
    for (const task of candidate.tasks) {
      for (const dependency of task.dependencies) {
        if (dependency.taskId === previousId) {
          dependency.taskId = candidate.tasks[0].id;
        }
      }
    }
    assert.throws(() => launchWorkspaceSchema.parse(candidate));
  });

  await context.test("unique external IDs", () => {
    const candidate = cloneLaunchSeed();
    candidate.tasks[1].externalId = candidate.tasks[0].externalId;
    assert.throws(() => launchWorkspaceSchema.parse(candidate));
  });

  await context.test("globally unique entity IDs", () => {
    const candidate = cloneLaunchSeed();
    const previousId = candidate.members[0].id;
    candidate.members[0].id = candidate.spaces[0].id;
    for (const task of candidate.tasks) {
      if (task.assigneeId === previousId) {
        task.assigneeId = candidate.spaces[0].id;
      }
    }
    assert.throws(() => launchWorkspaceSchema.parse(candidate));
  });
});

test("keeps a reusable workspace envelope schema for future local seeds", () => {
  const envelopeSchema = Reflect.get(workspaceSchemas, "workspaceEnvelopeSchema");
  assert.ok(
    envelopeSchema &&
      typeof envelopeSchema === "object" &&
      "safeParse" in envelopeSchema &&
      typeof envelopeSchema.safeParse === "function",
  );

  const candidate = cloneLaunchSeed();
  candidate.members = candidate.members.slice(0, 1);
  candidate.spaces = candidate.spaces.slice(0, 1);
  candidate.lists = candidate.lists.slice(0, 1);
  candidate.tasks = candidate.tasks.slice(0, 1);

  assert.equal(envelopeSchema.safeParse(candidate).success, true);
});

test("loads the canonical launch workspace through the typed schema", () => {
  const parsed = launchWorkspaceSchema.parse(launchSeedJson);

  assert.deepEqual(launchWorkspaceSeed, parsed);
  assert.equal(parsed.tasks.length, 204);
  assert.equal(parsed.spaces.length, 5);
  assert.equal(parsed.lists.length, 20);
  assert.equal(parsed.members.length, 6);
});

test("preserves the exact T001-T204 external IDs without duplicates", () => {
  const externalIds = launchWorkspaceSeed.tasks.map((task) => task.externalId);
  const expectedIds = Array.from(
    { length: 204 },
    (_, index) => `T${String(index + 1).padStart(3, "0")}`,
  );

  assert.deepEqual(externalIds, expectedIds);
  assert.equal(new Set(externalIds).size, 204);
});

test("keeps all workspace references valid and placeholders unassigned", () => {
  const spaceIds = new Set(launchWorkspaceSeed.spaces.map((space) => space.id));
  const listIds = new Set(launchWorkspaceSeed.lists.map((list) => list.id));
  const memberIds = new Set(launchWorkspaceSeed.members.map((member) => member.id));

  for (const list of launchWorkspaceSeed.lists) {
    assert.ok(spaceIds.has(list.spaceId), `${list.id} references a known space`);
  }

  for (const task of launchWorkspaceSeed.tasks) {
    assert.ok(listIds.has(task.listId), `${task.externalId} references a known list`);
    if (task.assigneeId !== null) {
      assert.ok(
        memberIds.has(task.assigneeId),
        `${task.externalId} references a known member`,
      );
    }

    const rawAssignee = task.sourceMeta.Responsavel_Nominal_Sugerido;
    if (!rawAssignee.trim() || /A DEFINIR/i.test(rawAssignee)) {
      assert.equal(task.assigneeId, null, `${task.externalId} stays unassigned`);
    }
  }

  assert.equal(
    launchWorkspaceSeed.tasks.filter((task) => task.assigneeId === null).length,
    99,
  );
});

test("preserves the 113 distinct source Subfrente values on tasks", () => {
  const subareas = new Set(
    launchWorkspaceSeed.tasks.map((task) => task.subarea),
  );

  assert.equal(subareas.size, 113);
});

test("documents all 28 source headers and retains them in sourceMeta", () => {
  assert.deepEqual(
    LAUNCH_SOURCE_HEADER_MAP.map(({ header }) => header),
    EXPECTED_HEADERS,
  );
  assert.equal(new Set(LAUNCH_SOURCE_HEADER_MAP.map(({ field }) => field)).size, 28);

  for (const task of launchWorkspaceSeed.tasks) {
    assert.deepEqual(Object.keys(task.sourceMeta), EXPECTED_HEADERS);
  }
});

test(
  "generates byte-identical canonical JSON on repeated runs",
  { skip: !existsSync(SOURCE_ZIP) },
  () => {
    const tempDirectory = mkdtempSync(join(tmpdir(), "edrive-launch-seed-"));
    const firstOutput = join(tempDirectory, "first.json");
    const secondOutput = join(tempDirectory, "second.json");
    const generator = fileURLToPath(
      new URL("../../../scripts/build-launch-seed.mjs", import.meta.url),
    );

    try {
      execFileSync(process.execPath, [generator, SOURCE_ZIP, firstOutput]);
      execFileSync(process.execPath, [generator, SOURCE_ZIP, secondOutput]);

      const first = readFileSync(firstOutput);
      const second = readFileSync(secondOutput);
      const committed = readFileSync(
        fileURLToPath(
          new URL(
            "../../data/tasks/launch-workspace-seed.json",
            import.meta.url,
          ),
        ),
      );

      assert.deepEqual(first, second);
      assert.deepEqual(first, committed);
    } finally {
      rmSync(tempDirectory, { force: true, recursive: true });
    }
  },
);

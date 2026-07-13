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
import { launchWorkspaceSchema } from "./workspace-schema";

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

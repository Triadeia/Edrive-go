#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const DEFAULT_ZIP =
  "/Volumes/SSD-Nilton/[03] Edrive go /PAINEL TAREFAS - EDRIVE GO - CLAUDE DESIGNER/EDrive Go dashboard launch.zip";
const DASHBOARD_ROOT =
  "uploads/edrive-go-lancamento-2026-07-18/20_DASHBOARD";
const DATA_ENTRY = `${DASHBOARD_ROOT}/tarefas_dados.js`;
const APP_ENTRY = `${DASHBOARD_ROOT}/tarefas.js`;
const GENERATED_AT = "2026-07-12T03:00:00.000Z";
const UUID_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");
const zipPath = resolve(process.argv[2] ?? DEFAULT_ZIP);
const outputPath = resolve(
  process.argv[3] ??
    resolve(repositoryRoot, "src/data/tasks/launch-workspace-seed.json"),
);

function readZipEntry(entry) {
  return execFileSync("unzip", ["-p", zipPath, entry], {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
}

function evaluateLiteral(source, expression, label) {
  return vm.runInNewContext(`(${expression})`, Object.create(null), {
    filename: `${APP_ENTRY}:${label}`,
    timeout: 1_000,
  });
}

function readDashboardStructure() {
  const source = readZipEntry(APP_ENTRY);
  const spacesMatch = source.match(
    /var DEFAULT_SPACES = \(function \(\) \{\s*var base = (\[[\s\S]*?\]);\s*var i = 0;/,
  );
  const teamMatch = source.match(
    /var DEFAULT_TEAM = (\[[\s\S]*?\]);\s*var SPACES =/,
  );

  if (!spacesMatch || !teamMatch) {
    throw new Error(`Could not read DEFAULT_SPACES/DEFAULT_TEAM from ${APP_ENTRY}`);
  }

  return {
    spaces: evaluateLiteral(source, spacesMatch[1], "DEFAULT_SPACES"),
    team: evaluateLiteral(source, teamMatch[1], "DEFAULT_TEAM"),
  };
}

function readTasksData() {
  const context = vm.createContext({ window: {} });
  const source = readZipEntry(DATA_ENTRY);

  vm.runInContext(source, context, {
    filename: DATA_ENTRY,
    timeout: 2_000,
  });

  const headers = context.window.EDRIVE_HEADER;
  const tasks = context.window.EDRIVE_TASKS;
  if (!Array.isArray(headers) || !Array.isArray(tasks)) {
    throw new Error(`Could not read EDRIVE_HEADER/EDRIVE_TASKS from ${DATA_ENTRY}`);
  }

  return { headers, tasks };
}

function uuidV5(name) {
  const namespace = Buffer.from(UUID_NAMESPACE.replaceAll("-", ""), "hex");
  const bytes = createHash("sha1")
    .update(namespace)
    .update(name, "utf8")
    .digest()
    .subarray(0, 16);

  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytes.toString("hex");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}

function stableId(entity, sourceKey) {
  return uuidV5(`edrive-go-launch:${entity}:${sourceKey}`);
}

function valueOrNull(value) {
  const normalized = String(value ?? "").trim();
  return !normalized || normalized === "-" ? null : normalized;
}

function dateTime(date, time) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(date).trim());
  if (!match) return null;
  const normalizedTime = /^\d{2}:\d{2}$/.test(String(time).trim())
    ? String(time).trim()
    : "00:00";
  return `${match[3]}-${match[2]}-${match[1]}T${normalizedTime}:00-03:00`;
}

function normalizedStatus(value) {
  const statuses = {
    "NAO INICIADO": "todo",
    "EM ANDAMENTO": "in_progress",
    "EM REVISAO": "in_review",
    BLOQUEADA: "blocked",
    CONCLUIDO: "done",
    CANCELADA: "cancelled",
  };
  const normalized = String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
  return statuses[normalized] ?? "backlog";
}

function normalizedPriority(value) {
  return (
    {
      P0: "urgent",
      P1: "high",
      P2: "medium",
      P3: "low",
    }[String(value).toUpperCase()] ?? "low"
  );
}

function normalizedAssignee(value, memberIdByName) {
  const name = String(value ?? "").trim();
  if (!name || /A DEFINIR/i.test(name)) return null;
  return memberIdByName.get(name) ?? null;
}

function normalizedBackup(value) {
  const name = valueOrNull(value);
  if (!name || /A DEFINIR/i.test(name) || name === "VALIDAR") return null;
  return name;
}

function numericCost(value) {
  const normalized = valueOrNull(value);
  if (normalized === null) return null;
  const amount = Number(normalized.replace(/\./g, ".").replace(",", "."));
  return Number.isFinite(amount) ? amount : null;
}

function sourceMeta(raw, headers) {
  return Object.fromEntries(headers.map((header) => [header, String(raw[header] ?? "")]));
}

function buildSeed() {
  const { spaces: rawSpaces, team: rawTeam } = readDashboardStructure();
  const { headers, tasks: rawTasks } = readTasksData();

  const members = rawTeam.map((member) => ({
    id: stableId("member", member.nome),
    name: member.nome,
    role: member.role,
    color: member.cor,
  }));
  const memberIdByName = new Map(members.map((member) => [member.name, member.id]));

  const spaces = rawSpaces.map((space, position) => ({
    id: stableId("space", space.id),
    name: space.name,
    emoji: space.emoji,
    position,
  }));
  const spaceIdBySourceId = new Map(
    rawSpaces.map((space, position) => [space.id, spaces[position].id]),
  );
  const lists = rawSpaces.flatMap((space) =>
    space.lists.map((name, position) => ({
      id: stableId("list", `${space.id}:${name}`),
      spaceId: spaceIdBySourceId.get(space.id),
      name,
      position,
    })),
  );
  const listIdByName = new Map(lists.map((list) => [list.name, list.id]));
  const taskIdByExternalId = new Map(
    rawTasks.map((task) => [task.ID, stableId("task", task.ID)]),
  );

  const tasks = rawTasks.map((raw, position) => {
    const dependencyExternalIds = String(raw.Dependencias ?? "").match(/T\d{3}/g) ?? [];
    const centerCost = valueOrNull(raw.Centro_Custo);

    return {
      id: taskIdByExternalId.get(raw.ID),
      externalId: raw.ID,
      title: raw.Descricao_da_Tarefa,
      description: "",
      status: normalizedStatus(raw.Status),
      priority: normalizedPriority(raw.Prioridade),
      assigneeId: normalizedAssignee(
        raw.Responsavel_Nominal_Sugerido,
        memberIdByName,
      ),
      backupAssignee: normalizedBackup(raw.Responsavel_Substituto),
      listId: listIdByName.get(raw.Frente),
      subarea: raw.Subfrente,
      phase: raw.Fase,
      startAt: dateTime(raw.Data_Inicio, raw.Hora_Inicio),
      dueAt: dateTime(raw.Prazo, raw.Hora_Limite),
      tags: centerCost ? [centerCost] : [],
      vendor: valueOrNull(raw.Fornecedor),
      cost: numericCost(raw.Custo_Previsto),
      blockers: valueOrNull(raw.Bloqueadores),
      nextAction: valueOrNull(raw.Proxima_Acao),
      notes: valueOrNull(raw.Observacoes),
      evidence: valueOrNull(raw.Evidencia_Exigida),
      approval: valueOrNull(raw.Aprovacao_Necessaria),
      risk: valueOrNull(raw.Risco_Associado),
      definitionOfDone: valueOrNull(raw.Definicao_de_Concluido),
      source: valueOrNull(raw.Fonte_da_Informacao),
      sourceUrl: valueOrNull(raw.Link_Comprovante),
      dependencies: dependencyExternalIds.map((externalId) => ({
        externalId,
        taskId: taskIdByExternalId.get(externalId) ?? null,
      })),
      checklist: [],
      position,
      sourceMeta: sourceMeta(raw, headers),
      createdAt: GENERATED_AT,
      updatedAt: GENERATED_AT,
    };
  });

  return {
    version: 1,
    workspace: {
      id: stableId("workspace", "edrive-go-launch-2026-07-18"),
      name: "eDrive Go — Lançamento 18/07/2026",
      eventName: "Lançamento eDrive Go",
      eventDate: "2026-07-18",
      timezone: "America/Bahia",
      currency: "BRL",
      sourceArchive: "EDrive Go dashboard launch.zip",
      sourceEntries: [DATA_ENTRY, APP_ENTRY],
    },
    members,
    spaces,
    lists,
    tasks,
  };
}

const serialized = `${JSON.stringify(buildSeed(), null, 2)}\n`;
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, serialized, "utf8");

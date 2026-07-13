#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_ZIP =
  "/Volumes/SSD-Nilton/[03] Edrive go /PAINEL TAREFAS - EDRIVE GO - CLAUDE DESIGNER/EDrive Go dashboard launch.zip";
const DASHBOARD_ROOT =
  "uploads/edrive-go-lancamento-2026-07-18/20_DASHBOARD";
const DATA_ENTRY = `${DASHBOARD_ROOT}/tarefas_dados.js`;
const APP_ENTRY = `${DASHBOARD_ROOT}/tarefas.js`;
const GENERATED_AT = "2026-07-12T03:00:00.000Z";
const UUID_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

const DEFAULT_SPACES = [
  {
    id: "comando",
    emoji: "🎯",
    name: "Comando & Gestão",
    lists: ["PMO", "Juridico", "Orcamento"],
  },
  {
    id: "local",
    emoji: "📍",
    name: "Local & Operação",
    lists: ["Local", "Operacao", "Seguranca", "Equipe", "Buffet", "Grafica"],
  },
  {
    id: "veiculos",
    emoji: "🚗",
    name: "Veículos & Entrega",
    lists: ["Veiculos", "Motoristas", "DDay"],
  },
  {
    id: "comercial",
    emoji: "📣",
    name: "Marketing & Vendas",
    lists: ["Marketing", "Vendas", "Convidados", "Imprensa", "Cerimonial"],
  },
  {
    id: "conteudo",
    emoji: "🎬",
    name: "Conteúdo & Pós",
    lists: ["Audiovisual", "Podcast", "PosEvento"],
  },
];

const DEFAULT_TEAM = [
  { nome: "Will Trindade", role: "Diretor da Operação", cor: "#7c3aed" },
  { nome: "Eduard", role: "Jurídico", cor: "#2563eb" },
  { nome: "Luci", role: "Social · Conteúdo · CRM", cor: "#db2777" },
  { nome: "Vinicius", role: "Audiovisual · Marketing", cor: "#0d9488" },
  { nome: "Ian", role: "Audiovisual · Edição", cor: "#d97706" },
  { nome: "Nilton Macario", role: "Growth · Vendas", cor: "#65a30d" },
];

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");

function readZipEntry(zipPath, entry) {
  return execFileSync("unzip", ["-p", zipPath, entry], {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
}

function sourceRegion(source, startMarker, endMarker, label) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0) {
    throw new Error(`Could not validate ${label} in ${APP_ENTRY}`);
  }
  return source.slice(start, end);
}

function requireMarkers(source, markers, label) {
  const missing = markers.filter((marker) => !source.includes(marker));
  if (missing.length > 0) {
    throw new Error(`Unexpected ${label} in ${APP_ENTRY}: missing ${missing[0]}`);
  }
}

function readDashboardStructure(zipPath) {
  const source = readZipEntry(zipPath, APP_ENTRY);
  const spacesSource = sourceRegion(
    source,
    "var DEFAULT_SPACES = (function () {",
    "var i = 0;",
    "DEFAULT_SPACES",
  );
  const teamSource = sourceRegion(
    source,
    "var DEFAULT_TEAM = [",
    "var SPACES =",
    "DEFAULT_TEAM",
  );

  requireMarkers(
    spacesSource,
    [
      "id: 'comando'",
      "emoji: '🎯'",
      "name: 'Comando & Gestão'",
      "lists: ['PMO', 'Juridico', 'Orcamento']",
      "id: 'local'",
      "emoji: '📍'",
      "name: 'Local & Operação'",
      "lists: ['Local', 'Operacao', 'Seguranca', 'Equipe', 'Buffet', 'Grafica']",
      "id: 'veiculos'",
      "emoji: '🚗'",
      "name: 'Veículos & Entrega'",
      "lists: ['Veiculos', 'Motoristas', 'DDay']",
      "id: 'comercial'",
      "emoji: '📣'",
      "name: 'Marketing & Vendas'",
      "lists: ['Marketing', 'Vendas', 'Convidados', 'Imprensa', 'Cerimonial']",
      "id: 'conteudo'",
      "emoji: '🎬'",
      "name: 'Conteúdo & Pós'",
      "lists: ['Audiovisual', 'Podcast', 'PosEvento']",
    ],
    "DEFAULT_SPACES",
  );
  requireMarkers(
    teamSource,
    [
      "{ nome: 'Will Trindade', role: 'Diretor da Operação', cor: '#7c3aed' }",
      "{ nome: 'Eduard', role: 'Jurídico', cor: '#2563eb' }",
      "{ nome: 'Luci', role: 'Social · Conteúdo · CRM', cor: '#db2777' }",
      "{ nome: 'Vinicius', role: 'Audiovisual · Marketing', cor: '#0d9488' }",
      "{ nome: 'Ian', role: 'Audiovisual · Edição', cor: '#d97706' }",
      "{ nome: 'Nilton Macario', role: 'Growth · Vendas', cor: '#65a30d' }",
    ],
    "DEFAULT_TEAM",
  );

  const spaceCount = (spacesSource.match(/\bid\s*:/g) ?? []).length;
  const listCount = DEFAULT_SPACES.reduce(
    (total, space) => total + space.lists.length,
    0,
  );
  const memberCount = (teamSource.match(/\bnome\s*:/g) ?? []).length;
  if (spaceCount !== 5 || listCount !== 20 || memberCount !== 6) {
    throw new Error(`Unexpected workspace structure in ${APP_ENTRY}`);
  }

  return { spaces: DEFAULT_SPACES, team: DEFAULT_TEAM };
}

function dataSourceReader(source) {
  let position = source.charCodeAt(0) === 0xfeff ? 1 : 0;

  function skipTrivia() {
    while (position < source.length) {
      if (/\s/.test(source[position])) {
        position += 1;
      } else if (source.startsWith("//", position)) {
        const newline = source.indexOf("\n", position + 2);
        position = newline < 0 ? source.length : newline + 1;
      } else if (source.startsWith("/*", position)) {
        const end = source.indexOf("*/", position + 2);
        if (end < 0) throw new Error("Unterminated comment in data source");
        position = end + 2;
      } else {
        break;
      }
    }
  }

  function expect(marker) {
    skipTrivia();
    if (!source.startsWith(marker, position)) {
      throw new Error(`Unexpected data source content at offset ${position}`);
    }
    position += marker.length;
  }

  function jsonArray(label) {
    skipTrivia();
    if (source[position] !== "[") {
      throw new Error(`${label} must be a JSON array`);
    }

    const start = position;
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (; position < source.length; position += 1) {
      const character = source[position];
      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (character === "\\") {
          escaped = true;
        } else if (character === '"') {
          inString = false;
        }
      } else if (character === '"') {
        inString = true;
      } else if (character === "[") {
        depth += 1;
      } else if (character === "]") {
        depth -= 1;
        if (depth === 0) {
          position += 1;
          return JSON.parse(source.slice(start, position));
        }
      }
    }

    throw new Error(`Unterminated ${label} JSON array`);
  }

  function finish() {
    skipTrivia();
    if (position !== source.length) {
      throw new Error(`Unexpected data source content at offset ${position}`);
    }
  }

  return { expect, finish, jsonArray };
}

function parseTasksDataSource(source) {
  const reader = dataSourceReader(source);
  reader.expect("window.EDRIVE_HEADER");
  reader.expect("=");
  const headers = reader.jsonArray("EDRIVE_HEADER");
  reader.expect(";");
  reader.expect("window.EDRIVE_TASKS");
  reader.expect("=");
  const tasks = reader.jsonArray("EDRIVE_TASKS");
  reader.expect(";");
  reader.finish();

  if (
    !Array.isArray(headers) ||
    !headers.every((header) => typeof header === "string") ||
    !Array.isArray(tasks) ||
    !tasks.every(
      (task) => task !== null && typeof task === "object" && !Array.isArray(task),
    )
  ) {
    throw new Error(`Could not read EDRIVE_HEADER/EDRIVE_TASKS from ${DATA_ENTRY}`);
  }

  return { headers, tasks };
}

function readTasksData(zipPath) {
  return parseTasksDataSource(readZipEntry(zipPath, DATA_ENTRY));
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

function buildSeed(zipPath) {
  const { spaces: rawSpaces, team: rawTeam } = readDashboardStructure(zipPath);
  const { headers, tasks: rawTasks } = readTasksData(zipPath);

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

if (process.argv[2] === "--validate-data-source") {
  if (!process.argv[3]) {
    throw new Error("Usage: build-launch-seed.mjs --validate-data-source <file>");
  }
  const { headers, tasks } = parseTasksDataSource(
    readFileSync(resolve(process.argv[3]), "utf8"),
  );
  process.stdout.write(`${JSON.stringify({ headers: headers.length, tasks: tasks.length })}\n`);
} else {
  const zipPath = resolve(process.argv[2] ?? DEFAULT_ZIP);
  const outputPath = resolve(
    process.argv[3] ??
      resolve(repositoryRoot, "src/data/tasks/launch-workspace-seed.json"),
  );
  const serialized = `${JSON.stringify(buildSeed(zipPath), null, 2)}\n`;
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, serialized, "utf8");
}

import type { BodyItem, CalendarItem, CtaItem, Filters, HookItem, RoteiroItem, Variation } from "./video-types";

export const emptyFilters: Filters = {
  search: "",
  pillar: "Todos",
  icp: "Todos",
  persona: "Todos",
  format: "Todos",
  platform: "Todos",
  awareness: "Todos",
  compliance: "Todos",
  priority: "Todos",
  status: "Todos"
};

export function uniqueValues<T>(rows: T[], getter: (row: T) => string | undefined) {
  return ["Todos", ...Array.from(new Set(rows.map(getter).filter(Boolean) as string[])).sort()];
}

export function compactId(value = "") {
  return value.replace(/[^A-Z0-9]/gi, "").slice(-5).toUpperCase();
}

export function scoreCombination(hook: HookItem, b1: BodyItem, b2: BodyItem, cta: CtaItem) {
  let score = 40;
  const reasons: string[] = [];

  if (hook.Pilar === b1.Pilar) {
    score += 12;
    reasons.push("hook e body inicial no mesmo pilar");
  }
  if (b1.Pilar === b2.Pilar) {
    score += 12;
    reasons.push("B1 e B2 continuam a mesma narrativa");
  }
  if (hook.Nivel_Consciencia === cta.Nivel_Consciencia) {
    score += 8;
    reasons.push("CTA conversa com o nivel de consciencia");
  }
  if (hook.ICP_Principal && hook.ICP_Principal === b1.ICP_Principal) {
    score += 10;
    reasons.push("ICP principal alinhado");
  }
  if (hook.Persona_Principal && hook.Persona_Principal === cta.Persona_Principal) {
    score += 6;
    reasons.push("persona mantida ate o CTA");
  }
  if (hook.Mecanismo === b2.Mecanismo) {
    score += 6;
    reasons.push("mecanismo unico consistente");
  }
  if ((hook.Risco_Compliance || "").includes("BAIXO") && (cta.Risco_Compliance || "").includes("BAIXO")) {
    score += 4;
    reasons.push("baixo risco de compliance na abertura e CTA");
  }

  return { score: Math.min(score, 99), reasons };
}

export function generateVariations(
  hooks: HookItem[],
  b1s: BodyItem[],
  b2s: BodyItem[],
  ctas: CtaItem[],
  total = 90
) {
  const variations: Variation[] = [];
  const bestHooks = hooks
    .slice()
    .sort((a, b) => Number(b.Score_ICP || 0) - Number(a.Score_ICP || 0))
    .slice(0, 180);

  for (const hook of bestHooks) {
    const b1Pool = b1s
      .filter((b1) => b1.Pilar === hook.Pilar || b1.ICP_Principal === hook.ICP_Principal)
      .slice(0, 12);
    const b2Pool = b2s
      .filter((b2) => b2.Pilar === hook.Pilar || b2.Mecanismo === hook.Mecanismo)
      .slice(0, 12);
    const ctaPool = ctas
      .filter((cta) => cta.Nivel_Consciencia === hook.Nivel_Consciencia || cta.Destino === "WhatsApp")
      .slice(0, 12);

    for (const b1 of b1Pool) {
      for (const b2 of b2Pool) {
        const cta = ctaPool[(variations.length + b1Pool.indexOf(b1)) % Math.max(ctaPool.length, 1)];
        if (!cta) continue;
        const result = scoreCombination(hook, b1, b2, cta);
        if (result.score < 68) continue;

        const id = `VAR-${String(variations.length + 1).padStart(3, "0")}`;
        const title = `${hook.Pilar} | ${hook.Categoria} | ${hook.Persona_Principal || "ICP"}`;
        variations.push({
          id,
          title,
          hook,
          b1,
          b2,
          cta,
          pillar: hook.Pilar,
          format: hook.Formato_Compatível || b1.Formato,
          platform: hook.Plataforma || cta.Plataforma,
          presenter: hook.Apresentador || b1.Apresentador,
          awareness: hook.Nivel_Consciencia,
          icp: hook.ICP_Principal || "ICP nao definido",
          persona: hook.Persona_Principal || "Persona nao definida",
          score: result.score,
          why: result.reasons,
          script: [
            `HOOK: ${hook.Texto}`,
            `CONTEXTO: conecte a dor "${hook.Dor_Primaria || "dor do motorista"}" com a Maldicao da Gasolina.`,
            `B1: ${b1.Texto}`,
            `B2: ${b2.Texto}`,
            `CTA: ${cta.Texto}`
          ].join("\n\n"),
          screenText: `${hook.Mecanismo} | ${hook.Dor_Primaria || "faca a conta"}`,
          caption: `${hook.Texto} ${cta.Texto} #libertdrive #motoristalivre #byddolphin`,
          compliance:
            hook.Status_Validacao_Claim === "VALIDAR_CLAIM" || b1.Status_Validacao_Claim === "VALIDAR_CLAIM"
              ? "VALIDAR_CLAIM"
              : "OK_BASE",
          status: "SUGERIDO"
        });
        if (variations.length >= total) {
          return variations.sort((a, b) => b.score - a.score);
        }
      }
    }
  }

  return variations.sort((a, b) => b.score - a.score).slice(0, total);
}

export function filterCalendar(rows: CalendarItem[], filters: Filters) {
  const q = filters.search.trim().toLowerCase();
  return rows.filter((row) => {
    const text = JSON.stringify(row).toLowerCase();
    return (
      (!q || text.includes(q)) &&
      (filters.pillar === "Todos" || row.Pilar === filters.pillar) &&
      (filters.icp === "Todos" || row.ICP_Principal === filters.icp) &&
      (filters.persona === "Todos" || row.Persona_Principal === filters.persona) &&
      (filters.format === "Todos" || row.Formato === filters.format) &&
      (filters.platform === "Todos" || row.Plataformas.includes(filters.platform)) &&
      (filters.awareness === "Todos" || row.Nivel_Consciencia === filters.awareness) &&
      (filters.compliance === "Todos" || row.Compliance === filters.compliance) &&
      (filters.priority === "Todos" || row.Prioridade === filters.priority) &&
      (filters.status === "Todos" || row.Status === filters.status)
    );
  });
}

export function filterRoteiros(rows: RoteiroItem[], filters: Filters) {
  const q = filters.search.trim().toLowerCase();
  return rows.filter((row) => {
    const text = JSON.stringify(row).toLowerCase();
    return (
      (!q || text.includes(q)) &&
      (filters.pillar === "Todos" || row.Pilar === filters.pillar) &&
      (filters.icp === "Todos" || row.ICP_Principal === filters.icp) &&
      (filters.persona === "Todos" || row.Persona_Principal === filters.persona) &&
      (filters.format === "Todos" || row.Formato === filters.format) &&
      (filters.platform === "Todos" || row.Plataforma.includes(filters.platform)) &&
      (filters.awareness === "Todos" || row.Nivel_Consciencia === filters.awareness) &&
      (filters.compliance === "Todos" || row.Compliance === filters.compliance) &&
      (filters.priority === "Todos" || row.Prioridade_ICP === filters.priority)
    );
  });
}

export function explainCrossings(rows: RoteiroItem[]) {
  const sample = rows.slice(0, 300);
  const byPillar = new Map<string, number>();
  const byIcp = new Map<string, number>();
  const byCompliance = new Map<string, number>();

  for (const row of sample) {
    byPillar.set(row.Pilar, (byPillar.get(row.Pilar) || 0) + 1);
    byIcp.set(row.ICP_Principal || "Sem ICP", (byIcp.get(row.ICP_Principal || "Sem ICP") || 0) + 1);
    byCompliance.set(row.Compliance, (byCompliance.get(row.Compliance) || 0) + 1);
  }

  return {
    total: sample.length,
    byPillar: Array.from(byPillar.entries()),
    byIcp: Array.from(byIcp.entries()),
    byCompliance: Array.from(byCompliance.entries()),
    statement:
      "Os cruzamentos combinam Hook + Body Inicial + Body Meio/Final + CTA + Formato + Plataforma + Apresentador + Nivel de Consciencia + Pilar + ICP + Persona + Compliance."
  };
}

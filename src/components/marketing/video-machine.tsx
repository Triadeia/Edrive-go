"use client";

import {
  AlertTriangle,
  BarChart3,
  Check,
  ChevronRight,
  Download,
  Filter,
  Layers3,
  Library,
  ListChecks,
  PlayCircle,
  RefreshCcw,
  Save,
  Search,
  Shuffle,
  SlidersHorizontal,
  Sparkles,
  Video,
  Wand2
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  emptyFilters,
  explainCrossings,
  filterCalendar,
  filterRoteiros,
  generateVariations,
  uniqueValues
} from "@/lib/marketing/video-engine";
import type { DataPayload, Filters, Variation } from "@/lib/marketing/video-types";

const STORAGE_KEY = "edrive-go-video-machine-v1";

type ViewKey = "gerador" | "variacoes" | "cruzamentos" | "calendario" | "biblioteca" | "compliance";

type LocalState = {
  filters: Filters;
  selectedVariationIds: string[];
  notes: Record<string, string>;
  statuses: Record<string, string>;
};

const initialLocalState: LocalState = {
  filters: emptyFilters,
  selectedVariationIds: [],
  notes: {},
  statuses: {}
};

export function VideoMachine() {
  const [data, setData] = useState<DataPayload | null>(null);
  const [localState, setLocalState] = useState<LocalState>(initialLocalState);
  const [activeView, setActiveView] = useState<ViewKey>("gerador");
  const [activeVariation, setActiveVariation] = useState<Variation | null>(null);
  const [savedAt, setSavedAt] = useState<string>("nao salvo");

  useEffect(() => {
    fetch("/data/edrive-go-export-site.json")
      .then((response) => response.json())
      .then((payload: DataPayload) => setData(payload));

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      setLocalState({ ...initialLocalState, ...JSON.parse(raw) });
    }
  }, []);

  useEffect(() => {
    if (!data) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(localState));
    setSavedAt(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
  }, [data, localState]);

  const variations = useMemo(() => {
    if (!data) return [];
    return generateVariations(data.hooks, data.bodies_b1, data.bodies_b2, data.ctas, 90).map((variation) => ({
      ...variation,
      status: localState.statuses[variation.id] || variation.status
    }));
  }, [data, localState.statuses]);

  const filteredCalendar = useMemo(() => {
    if (!data) return [];
    return filterCalendar(data.calendario, localState.filters);
  }, [data, localState.filters]);

  const filteredRoteiros = useMemo(() => {
    if (!data) return [];
    return filterRoteiros(data.roteiros, localState.filters);
  }, [data, localState.filters]);

  const crossingReport = useMemo(() => {
    if (!data) return null;
    return explainCrossings(data.roteiros);
  }, [data]);

  const filterOptions = useMemo(() => {
    if (!data) {
      return {
        pillars: ["Todos"],
        icps: ["Todos"],
        personas: ["Todos"],
        formats: ["Todos"],
        platforms: ["Todos"],
        awareness: ["Todos"],
        compliance: ["Todos"],
        priority: ["Todos"],
        status: ["Todos"]
      };
    }

    return {
      pillars: uniqueValues(data.calendario, (row) => row.Pilar),
      icps: uniqueValues(data.calendario, (row) => row.ICP_Principal),
      personas: uniqueValues(data.calendario, (row) => row.Persona_Principal),
      formats: uniqueValues(data.calendario, (row) => row.Formato),
      platforms: ["Todos", "Instagram Reels", "TikTok", "YouTube Shorts", "Stories", "WhatsApp Status", "YouTube"],
      awareness: uniqueValues(data.calendario, (row) => row.Nivel_Consciencia),
      compliance: uniqueValues(data.calendario, (row) => row.Compliance),
      priority: uniqueValues(data.calendario, (row) => row.Prioridade),
      status: uniqueValues(data.calendario, (row) => row.Status)
    };
  }, [data]);

  function updateFilter(key: keyof Filters, value: string) {
    setLocalState((state) => ({ ...state, filters: { ...state.filters, [key]: value } }));
  }

  function setVariationStatus(id: string, status: string) {
    setLocalState((state) => ({
      ...state,
      statuses: { ...state.statuses, [id]: status }
    }));
  }

  function toggleSelectedVariation(id: string) {
    setLocalState((state) => {
      const exists = state.selectedVariationIds.includes(id);
      return {
        ...state,
        selectedVariationIds: exists
          ? state.selectedVariationIds.filter((item) => item !== id)
          : [...state.selectedVariationIds, id]
      };
    });
  }

  function exportPlan() {
    const payload = {
      exportedAt: new Date().toISOString(),
      filters: localState.filters,
      selectedVariations: variations.filter((variation) => localState.selectedVariationIds.includes(variation.id)),
      statuses: localState.statuses,
      notes: localState.notes
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "edrive-go-plano-videos-selecionados.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (!data) {
    return (
      <section className="loading-screen">
        <div className="loading-card">
          <Sparkles size={28} />
          <h1>Carregando Maquina de Videos</h1>
          <p>Importando hooks, roteiros, calendario, ICPs e regras de compliance do Excel.</p>
        </div>
      </section>
    );
  }

  const approvedCount = Object.values(localState.statuses).filter((status) => status === "APROVADO").length;
  const selectedCount = localState.selectedVariationIds.length;

  return (
    <section className="video-machine">
        <header className="panel video-machine-hero">
          <div>
            <p className="kicker">Marketing / Maquina de Geracao de Videos em Escala</p>
            <h1>Cruzamento inteligente de conteudos</h1>
            <p className="subtitle">
              Gere, filtre, aprove e salve combinacoes de Hook + B1 + B2 + CTA + ICP + plataforma direto no navegador.
            </p>
          </div>
          <div className="top-actions">
            <span className="save-chip"><Save size={15} /> salvo {savedAt}</span>
            <button onClick={exportPlan}><Download size={16} /> Exportar plano</button>
          </div>
        </header>

        <section className="metrics-grid">
          <Metric icon={<Library />} label="Hooks" value={data.hooks.length} />
          <Metric icon={<Layers3 />} label="Roteiros cruzados" value={data.roteiros.length} />
          <Metric icon={<Video />} label="Videos calendario" value={data.calendario.length} />
          <Metric icon={<Wand2 />} label="Variacoes prontas" value={variations.length} />
          <Metric icon={<Check />} label="Selecionados" value={selectedCount} />
          <Metric icon={<ListChecks />} label="Aprovados" value={approvedCount} />
        </section>

        <section className="filter-panel">
          <div className="filter-title"><SlidersHorizontal size={18} /> Filtros avancados</div>
          <label className="search-field">
            <Search size={17} />
            <input
              value={localState.filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Buscar por hook, persona, pilar, CTA, compliance..."
            />
          </label>
          <FilterSelect label="Pilar" value={localState.filters.pillar} options={filterOptions.pillars} onChange={(value) => updateFilter("pillar", value)} />
          <FilterSelect label="ICP" value={localState.filters.icp} options={filterOptions.icps} onChange={(value) => updateFilter("icp", value)} />
          <FilterSelect label="Persona" value={localState.filters.persona} options={filterOptions.personas} onChange={(value) => updateFilter("persona", value)} />
          <FilterSelect label="Formato" value={localState.filters.format} options={filterOptions.formats} onChange={(value) => updateFilter("format", value)} />
          <FilterSelect label="Plataforma" value={localState.filters.platform} options={filterOptions.platforms} onChange={(value) => updateFilter("platform", value)} />
          <FilterSelect label="Consciencia" value={localState.filters.awareness} options={filterOptions.awareness} onChange={(value) => updateFilter("awareness", value)} />
          <FilterSelect label="Compliance" value={localState.filters.compliance} options={filterOptions.compliance} onChange={(value) => updateFilter("compliance", value)} />
          <button className="ghost-button" onClick={() => setLocalState((state) => ({ ...state, filters: emptyFilters }))}>
            <RefreshCcw size={16} /> Limpar
          </button>
        </section>

        <section className="tabs">
          <TabButton active={activeView === "gerador"} onClick={() => setActiveView("gerador")} icon={<Shuffle />}>Gerador</TabButton>
          <TabButton active={activeView === "variacoes"} onClick={() => setActiveView("variacoes")} icon={<PlayCircle />}>90 variacoes</TabButton>
          <TabButton active={activeView === "cruzamentos"} onClick={() => setActiveView("cruzamentos")} icon={<Layers3 />}>Cruzamentos</TabButton>
          <TabButton active={activeView === "calendario"} onClick={() => setActiveView("calendario")} icon={<BarChart3 />}>Calendario</TabButton>
          <TabButton active={activeView === "biblioteca"} onClick={() => setActiveView("biblioteca")} icon={<Library />}>Biblioteca</TabButton>
          <TabButton active={activeView === "compliance"} onClick={() => setActiveView("compliance")} icon={<AlertTriangle />}>Compliance</TabButton>
        </section>

        {activeView === "gerador" && (
          <GeneratorView
            variations={variations}
            selectedIds={localState.selectedVariationIds}
            onOpen={setActiveVariation}
            onToggle={toggleSelectedVariation}
            onStatus={setVariationStatus}
          />
        )}

        {activeView === "variacoes" && (
          <VariationsView
            variations={variations}
            selectedIds={localState.selectedVariationIds}
            onOpen={setActiveVariation}
            onToggle={toggleSelectedVariation}
            onStatus={setVariationStatus}
          />
        )}

        {activeView === "cruzamentos" && crossingReport && (
          <CrossingView report={crossingReport} rows={filteredRoteiros} />
        )}

        {activeView === "calendario" && <CalendarView rows={filteredCalendar} />}

        {activeView === "biblioteca" && <LibraryView data={data} />}

        {activeView === "compliance" && <ComplianceView data={data} />}
      {activeVariation && (
        <VariationDrawer
          variation={activeVariation}
          selected={localState.selectedVariationIds.includes(activeVariation.id)}
          status={localState.statuses[activeVariation.id] || activeVariation.status}
          note={localState.notes[activeVariation.id] || ""}
          onClose={() => setActiveVariation(null)}
          onToggle={() => toggleSelectedVariation(activeVariation.id)}
          onStatus={(status) => setVariationStatus(activeVariation.id, status)}
          onNote={(note) => setLocalState((state) => ({ ...state, notes: { ...state.notes, [activeVariation.id]: note } }))}
        />
      )}
    </section>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <article className="metric-card">
      <span>{icon}</span>
      <div>
        <strong>{value}</strong>
        <small>{label}</small>
      </div>
    </article>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="filter-select">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function TabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button className={active ? "tab active" : "tab"} onClick={onClick}>
      {icon}
      {children}
    </button>
  );
}

function GeneratorView({
  variations,
  selectedIds,
  onOpen,
  onToggle,
  onStatus
}: {
  variations: Variation[];
  selectedIds: string[];
  onOpen: (variation: Variation) => void;
  onToggle: (id: string) => void;
  onStatus: (id: string, status: string) => void;
}) {
  const top = variations.slice(0, 18);
  return (
    <section className="panel-grid">
      <div className="section-heading">
        <div>
          <p className="kicker">Sugestao automatica</p>
          <h2>Videos com maior compatibilidade</h2>
        </div>
        <span>{top.length} sugestoes em destaque</span>
      </div>
      <div className="variation-grid">
        {top.map((variation) => (
          <VariationCard
            key={variation.id}
            variation={variation}
            selected={selectedIds.includes(variation.id)}
            onOpen={() => onOpen(variation)}
            onToggle={() => onToggle(variation.id)}
            onStatus={(status) => onStatus(variation.id, status)}
          />
        ))}
      </div>
    </section>
  );
}

function VariationsView(props: {
  variations: Variation[];
  selectedIds: string[];
  onOpen: (variation: Variation) => void;
  onToggle: (id: string) => void;
  onStatus: (id: string, status: string) => void;
}) {
  return (
    <section className="panel-grid">
      <div className="section-heading">
        <div>
          <p className="kicker">Prontos para gravar</p>
          <h2>90 variacoes de videos</h2>
        </div>
        <span>todos salvos no navegador ao editar status ou selecao</span>
      </div>
      <div className="data-table variation-table">
        <div className="table-row table-head">
          <span>ID</span><span>Titulo</span><span>ICP</span><span>Pilar</span><span>Formato</span><span>Score</span><span>Status</span><span></span>
        </div>
        {props.variations.map((variation) => (
          <div className="table-row" key={variation.id}>
            <span>{variation.id}</span>
            <strong>{variation.title}</strong>
            <span>{variation.icp}</span>
            <span>{variation.pillar}</span>
            <span>{variation.format}</span>
            <span className="score">{variation.score}</span>
            <select value={variation.status} onChange={(event) => props.onStatus(variation.id, event.target.value)}>
              <option>SUGERIDO</option>
              <option>EM_ROTEIRO</option>
              <option>APROVADO</option>
              <option>BLOQUEADO</option>
            </select>
            <button onClick={() => props.onOpen(variation)}>Abrir</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function VariationCard({
  variation,
  selected,
  onOpen,
  onToggle,
  onStatus
}: {
  variation: Variation;
  selected: boolean;
  onOpen: () => void;
  onToggle: () => void;
  onStatus: (status: string) => void;
}) {
  return (
    <article className="variation-card">
      <header>
        <span className="id-chip">{variation.id}</span>
        <span className="score">{variation.score}</span>
      </header>
      <h3>{variation.title}</h3>
      <p>{variation.hook.Texto}</p>
      <div className="meta-line">
        <span>{variation.pillar}</span>
        <span>{variation.format}</span>
        <span>{variation.platform}</span>
      </div>
      <div className="why">
        {variation.why.slice(0, 3).map((item) => <span key={item}>{item}</span>)}
      </div>
      <footer>
        <button className={selected ? "selected-button" : "ghost-button"} onClick={onToggle}>
          {selected ? <Check size={15} /> : <Filter size={15} />} {selected ? "Selecionado" : "Selecionar"}
        </button>
        <button onClick={onOpen}>Ver roteiro <ChevronRight size={15} /></button>
        <select value={variation.status} onChange={(event) => onStatus(event.target.value)}>
          <option>SUGERIDO</option>
          <option>EM_ROTEIRO</option>
          <option>APROVADO</option>
          <option>BLOQUEADO</option>
        </select>
      </footer>
    </article>
  );
}

function CrossingView({ report, rows }: { report: ReturnType<typeof explainCrossings>; rows: ReturnType<typeof filterRoteiros> }) {
  return (
    <section className="panel-grid">
      <div className="section-heading">
        <div>
          <p className="kicker">Cruzamentos realizados</p>
          <h2>{report.total} roteiros cruzados no sistema</h2>
        </div>
        <span>{report.statement}</span>
      </div>
      <div className="summary-columns">
        <SummaryList title="Por pilar" rows={report.byPillar} />
        <SummaryList title="Por ICP" rows={report.byIcp} />
        <SummaryList title="Por compliance" rows={report.byCompliance} />
      </div>
      <div className="data-table">
        <div className="table-row table-head">
          <span>Roteiro</span><span>Video</span><span>Pilar</span><span>Hook</span><span>B1/B2</span><span>CTA</span><span>Score</span>
        </div>
        {rows.slice(0, 80).map((row) => (
          <div className="table-row" key={row.Roteiro_ID}>
            <span>{row.Roteiro_ID}</span>
            <strong>{row.Video_ID}</strong>
            <span>{row.Pilar}</span>
            <span>{row.Hook_ID}</span>
            <span>{row.Body_Inicial_ID} / {row.Body_Meio_Final_ID}</span>
            <span>{row.CTA_ID}</span>
            <span className="score">{row.Score_Compatibilidade}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function SummaryList({ title, rows }: { title: string; rows: Array<[string, number]> }) {
  return (
    <article className="summary-card">
      <h3>{title}</h3>
      {rows.map(([label, count]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{count}</strong>
        </div>
      ))}
    </article>
  );
}

function CalendarView({ rows }: { rows: ReturnType<typeof filterCalendar> }) {
  return (
    <section className="panel-grid">
      <div className="section-heading">
        <div>
          <p className="kicker">Calendario editorial</p>
          <h2>{rows.length} videos filtrados</h2>
        </div>
        <span>30 dias / 10 videos por dia no plano completo</span>
      </div>
      <div className="data-table">
        <div className="table-row table-head">
          <span>Dia</span><span>Video</span><span>Titulo</span><span>Pilar</span><span>Formato</span><span>ICP</span><span>Compliance</span>
        </div>
        {rows.slice(0, 120).map((row) => (
          <div className="table-row" key={row.Video_ID}>
            <span>D{String(row.Dia).padStart(2, "0")} / S{row.Slot_Dia}</span>
            <strong>{row.Video_ID}</strong>
            <span>{row.Titulo}</span>
            <span>{row.Pilar}</span>
            <span>{row.Formato}</span>
            <span>{row.ICP_Principal}</span>
            <span className={row.Compliance === "OK_BASE" ? "ok-chip" : "warn-chip"}>{row.Compliance}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function LibraryView({ data }: { data: DataPayload }) {
  return (
    <section className="library-layout">
      <LibraryColumn title="Hooks" rows={data.hooks.slice(0, 80).map((row) => [row.Hook_ID, row.Texto, row.Pilar])} />
      <LibraryColumn title="Bodies B1" rows={data.bodies_b1.slice(0, 60).map((row) => [row.Body_ID, row.Texto, row.Pilar])} />
      <LibraryColumn title="CTAs" rows={data.ctas.slice(0, 60).map((row) => [row.CTA_ID, row.Texto, row.Destino])} />
    </section>
  );
}

function LibraryColumn({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <article className="library-column">
      <h2>{title}</h2>
      {rows.map(([id, text, meta]) => (
        <div key={id} className="library-item">
          <strong>{id}</strong>
          <p>{text}</p>
          <span>{meta}</span>
        </div>
      ))}
    </article>
  );
}

function ComplianceView({ data }: { data: DataPayload }) {
  return (
    <section className="panel-grid">
      <div className="section-heading">
        <div>
          <p className="kicker">Controle de risco</p>
          <h2>Claims que precisam de decisao humana</h2>
        </div>
        <span>{data.claims_validar?.length || 0} claims criticos importados do Excel</span>
      </div>
      <div className="claims-grid">
        {(data.claims_validar || []).map((claim) => (
          <article className="claim-card" key={claim.Claim}>
            <span>{claim.Risco}</span>
            <h3>{claim.Claim}</h3>
            <p><strong>Fonte 1:</strong> {claim.Fonte_1}</p>
            <p><strong>Fonte 2:</strong> {claim.Fonte_2}</p>
            <p>{claim.Decisao}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function VariationDrawer({
  variation,
  selected,
  status,
  note,
  onClose,
  onToggle,
  onStatus,
  onNote
}: {
  variation: Variation;
  selected: boolean;
  status: string;
  note: string;
  onClose: () => void;
  onToggle: () => void;
  onStatus: (status: string) => void;
  onNote: (note: string) => void;
}) {
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" onClick={(event) => event.stopPropagation()}>
        <header>
          <span className="id-chip">{variation.id}</span>
          <button onClick={onClose}>Fechar</button>
        </header>
        <h2>{variation.title}</h2>
        <div className="drawer-meta">
          <span>{variation.icp}</span>
          <span>{variation.persona}</span>
          <span>{variation.pillar}</span>
          <span>{variation.score} pontos</span>
        </div>
        <label className="drawer-select">
          Status
          <select value={status} onChange={(event) => onStatus(event.target.value)}>
            <option>SUGERIDO</option>
            <option>EM_ROTEIRO</option>
            <option>APROVADO</option>
            <option>BLOQUEADO</option>
          </select>
        </label>
        <button className={selected ? "selected-button full" : "ghost-button full"} onClick={onToggle}>
          {selected ? "Remover dos selecionados" : "Adicionar aos selecionados"}
        </button>
        <section>
          <h3>Roteiro pronto</h3>
          <pre>{variation.script}</pre>
        </section>
        <section>
          <h3>Texto na tela</h3>
          <p>{variation.screenText}</p>
        </section>
        <section>
          <h3>Legenda</h3>
          <p>{variation.caption}</p>
        </section>
        <section>
          <h3>Por que cruzou</h3>
          <ul>
            {variation.why.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
        <label className="note-field">
          Nota de producao
          <textarea value={note} onChange={(event) => onNote(event.target.value)} placeholder="Ex: gravar com Will, validar numero antes de publicar..." />
        </label>
      </aside>
    </div>
  );
}

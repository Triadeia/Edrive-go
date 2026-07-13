# eDrive Go Tasks Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar um gestor de tarefas local, completo e persistente em `https://edrive-go.vercel.app/app/tarefas`, incorporado ao painel Next.js oficial.

**Architecture:** O primeiro release usa um domínio tipado e um repositório `localStorage` versionado, deixando explícito que os dados pertencem ao navegador atual. As 204 tarefas e a estrutura inicial são importadas de um seed canônico validado. A página existente permanece no shell do painel e passa a orquestrar componentes menores para sidebar, views, formulários e configurações.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Zod, dnd-kit, tsx/node:test, Playwright, Vercel.

---

## Estrutura de arquivos

- `src/lib/tasks/workspace-schema.ts`: tipos Zod do workspace, membros, spaces, listas e tarefas.
- `src/lib/tasks/workspace-seed.ts`: converte e valida o JSON canônico no envelope local.
- `src/lib/tasks/workspace-store.ts`: CRUD e persistência atômica em `localStorage`.
- `src/lib/tasks/workspace-store.test.ts`: regressões de CRUD, relações e importação.
- `src/lib/tasks/workspace-export.ts`: serialização CSV/JSON segura dos 28 campos.
- `src/hooks/use-task-workspace.ts`: estado React e ações do repositório.
- `src/data/tasks/launch-workspace-seed.json`: seed reproduzível com estrutura e 204 tarefas.
- `src/data/tasks/README.md`: mapeamento dos 28 campos do checklist.
- `src/components/tasks/workspace-sidebar.tsx`: navegação e botões de CRUD estrutural.
- `src/components/tasks/task-views.tsx`: lista, Kanban e calendário sobre a mesma coleção.
- `src/components/tasks/task-dialog.tsx`: criação e edição de tarefas/checklists.
- `src/components/tasks/workspace-dialogs.tsx`: edição de membros, spaces e listas.
- `src/components/tasks-workspace.tsx`: orquestrador da rota e filtros.
- `src/app/app/tarefas/page.tsx`: cabeçalho compacto e montagem do workspace.
- `e2e/tasks-workspace.spec.ts`: teste de aceitação escrito antes da UI e usado até ficar verde.
- `playwright.config.ts`: servidor e base URL dos testes.
- `package.json`, `package-lock.json`: dependências e scripts de qualidade.

## Task 1: Preparar testes e dependências

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `playwright.config.ts`

- [ ] **Step 1: Adicionar scripts de verificação**

Adicionar:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test:unit": "tsx --test \"src/**/*.test.ts\"",
    "test:e2e": "playwright test",
    "check": "npm run lint && npm run typecheck && npm run test:unit && npm run build"
  }
}
```

- [ ] **Step 2: Instalar bibliotecas**

Run: `npm install zod @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities && npm install -D tsx @playwright/test`

Expected: lockfile atualizado e `npm ls` sem dependências inválidas.

- [ ] **Step 3: Criar configuração Playwright**

```ts
import { defineConfig, devices } from "@playwright/test";

const remoteBaseURL = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: remoteBaseURL || "http://127.0.0.1:3000", trace: "retain-on-failure" },
  webServer: remoteBaseURL ? undefined : { command: "npm run dev", url: "http://127.0.0.1:3000", reuseExistingServer: true },
  projects: [{ name: "chromium", use: devices["Desktop Chrome"] }],
});
```

- [ ] **Step 4: Instalar Chromium antes de qualquer E2E**

Run: `npx playwright install chromium`

Expected: navegador Chromium disponível para a Task 4.

- [ ] **Step 5: Verificar configuração**

Run: `npm run typecheck`

Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json playwright.config.ts
git commit -m "test: add tasks workspace verification"
```

## Task 2: Criar seed canônico e schema

**Files:**
- Create: `src/data/tasks/launch-workspace-seed.json`
- Create: `src/data/tasks/README.md`
- Create: `src/lib/tasks/workspace-schema.ts`
- Create: `src/lib/tasks/workspace-seed.ts`
- Create: `src/lib/tasks/workspace-seed.test.ts`

- [ ] **Step 1: Extrair o seed original mecanicamente**

Ler o arquivo interno `uploads/edrive-go-lancamento-2026-07-18/20_DASHBOARD/tarefas_dados.js` de `/Volumes/SSD-Nilton/[03] Edrive go /PAINEL TAREFAS - EDRIVE GO - CLAUDE DESIGNER/EDrive Go dashboard launch.zip`. Gerar JSON determinístico usando os 204 IDs `T001`…`T204` como fonte para UUID v5/IDs estáveis.

Usar as constantes executáveis `DEFAULT_SPACES` (linhas 38–48) e `DEFAULT_TEAM` (linhas 50–57) do mesmo `tarefas.js` como estrutura canônica: 5 spaces e 6 membros reais. `DEFAULT_SPACES` já contém o mapa exato das 20 listas: Comando & Gestão → PMO/Juridico/Orcamento; Local & Operação → Local/Operacao/Seguranca/Equipe/Buffet/Grafica; Veículos & Entrega → Veiculos/Motoristas/DDay; Marketing & Vendas → Marketing/Vendas/Convidados/Imprensa/Cerimonial; Conteúdo & Pós → Audiovisual/Podcast/PosEvento. As 113 `Subfrente` permanecem como campo da tarefa, não viram listas. Valores vazios/placeholder de responsável viram `assigneeId: null`, nunca um sétimo membro.

Gerar JSON com:

```ts
type LaunchSeed = {
  version: 1;
  workspace: { id: string; name: string; eventName: string; eventDate: string };
  members: Member[];
  spaces: Space[];
  lists: TaskList[];
  tasks: Task[];
};
```

Expected: exatamente 204 tarefas, 204 `externalId` únicos, 5 spaces, 20 listas e 6 membros.

- [ ] **Step 2: Escrever teste inicialmente falho**

```ts
test("seed do lançamento preserva a estrutura e as 204 tarefas", () => {
  const seed = buildLaunchWorkspaceSeed();
  assert.equal(seed.tasks.length, 204);
  assert.equal(new Set(seed.tasks.map((task) => task.externalId)).size, 204);
  assert.equal(seed.spaces.length, 5);
  assert.equal(seed.lists.length, 20);
  assert.equal(seed.members.length, 6);
});
```

- [ ] **Step 3: Rodar e observar a falha**

Run: `npm run test:unit -- src/lib/tasks/workspace-seed.test.ts`

Expected: FAIL porque schema/loader ainda não existem.

- [ ] **Step 4: Implementar schemas Zod e loader**

Definir IDs estáveis, enums, datas ISO, `assigneeId` anulável, listas pertencentes a spaces e tarefas pertencentes a listas. Validar referências após o parse.

- [ ] **Step 5: Documentar mapeamento dos 28 campos**

Registrar origem → campo do domínio, mapa das 20 frentes para os 5 spaces e quais dados ficam em `sourceMeta`. Incluir fornecedor, custo, evidência, aprovação, risco, dependências, substituto e definição de concluído.

- [ ] **Step 6: Rodar teste e validação TypeScript**

Run: `npm run test:unit -- src/lib/tasks/workspace-seed.test.ts && npm run typecheck`

Expected: PASS e exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/data/tasks src/lib/tasks/workspace-schema.ts src/lib/tasks/workspace-seed.ts src/lib/tasks/workspace-seed.test.ts
git commit -m "feat: import edrive launch workspace seed"
```

## Task 3: Implementar repositório local funcional

**Files:**
- Create: `src/lib/tasks/workspace-store.ts`
- Create: `src/lib/tasks/workspace-store.test.ts`
- Create: `src/lib/tasks/workspace-export.ts`

- [ ] **Step 1: Escrever testes falhos de CRUD e integridade**

Cobrir:

```ts
test("cria, edita e exclui tarefas sem perder relações", () => {});
test("cria e renomeia funcionário preservando assigneeId", () => {});
test("excluir funcionário deixa tarefa sem responsável", () => {});
test("cria, renomeia e exclui space/lista com destino", () => {});
test("não exclui última lista sem substituta", () => {});
test("importação repetida mantém 204 tarefas", () => {});
test("envelope vazio permanece vazio após reload", () => {});
test("falha de quota não altera snapshot confirmado e retorna erro", () => {});
test("mutação inválida faz rollback integral", () => {});
test("dependências rejeitam autorreferência e ciclo", () => {});
test("CSV e JSON preservam os 28 campos com escape seguro", () => {});
```

- [ ] **Step 2: Rodar testes e confirmar falha**

Run: `npm run test:unit -- src/lib/tasks/workspace-store.test.ts`

Expected: FAIL por módulo ausente.

- [ ] **Step 3: Implementar adaptador de storage injetável**

```ts
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
```

O repositório recebe essa interface, permitindo testes sem browser. Cada mutação clona, valida o envelope completo e só então grava uma vez.

- [ ] **Step 4: Implementar CRUD relacional**

Adicionar operações de task/member/space/list, reatribuição explícita, checklists, dependências editáveis e importação idempotente. Usar UUID e nunca usar nome como chave. Implementar exportação CSV com aspas/escape, neutralização de fórmulas e JSON versionado.

- [ ] **Step 5: Rodar testes**

Run: `npm run test:unit -- src/lib/tasks/workspace-store.test.ts`

Expected: todos PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/tasks/workspace-store.ts src/lib/tasks/workspace-store.test.ts
git commit -m "feat: add persistent local tasks repository"
```

## Task 4: Construir store React e interface operacional

**Files:**
- Create: `src/hooks/use-task-workspace.ts`
- Create: `src/components/tasks/workspace-sidebar.tsx`
- Create: `src/components/tasks/task-views.tsx`
- Create: `src/components/tasks/task-dialog.tsx`
- Create: `src/components/tasks/workspace-dialogs.tsx`
- Modify: `src/components/tasks-workspace.tsx`
- Modify: `src/app/app/tarefas/page.tsx`
- Modify: `src/app/globals.css`
- Delete: `src/app/api/tasks/route.ts`
- Delete: `src/app/api/tasks/[id]/route.ts`
- Delete: `src/lib/tasks-store.ts`
- Modify: `src/lib/tasks-data.ts`
- Create: `e2e/tasks-workspace.spec.ts`

- [ ] **Step 1: Escrever teste E2E falho antes da interface**

Criar um teste que limpa `localStorage`, abre `/app/tarefas`, importa o checklist, confirma 204 tarefas, cria funcionário/space/lista/tarefa, edita os campos operacionais, adiciona checklist/dependência, move no Kanban, recarrega e confirma persistência, exporta CSV/JSON e exclui os itens temporários.

Run: `npm run test:e2e -- e2e/tasks-workspace.spec.ts`

Expected: FAIL nos controles ainda inexistentes.

- [ ] **Step 2: Criar hook orquestrador**

Expor `workspace`, filtros e ações `create/update/delete/move/import` sem duplicar regras de integridade da camada de repositório.

- [ ] **Step 3: Criar sidebar**

Exibir workspace, spaces, listas, contagens e equipe. Incluir botões com nomes acessíveis: `Adicionar space`, `Adicionar lista`, `Adicionar funcionário`, `Editar` e `Excluir`.

- [ ] **Step 4: Criar Lista, Quadro e Calendário**

Todas recebem o mesmo array filtrado. O Quadro usa dnd-kit para alterar status; o Calendário permite mover prazo. Estados vazios precisam oferecer `Nova tarefa`.

- [ ] **Step 5: Criar formulários**

Task dialog edita título, descrição, status, prioridade, responsável, substituto, lista, subfrente, fase, início, prazo, tags, fornecedor, custo, bloqueios, próxima ação, notas, evidência, aprovação, risco, definição de concluído, origem, URL da origem, checklist e dependências. Workspace dialogs fazem CRUD de members/spaces/lists e mostram impacto antes da exclusão.

- [ ] **Step 6: Reescrever orquestrador existente**

Remover dependência da API em memória e do `edrive-go:tasks:v1`. Mostrar badge `Dados neste navegador`, botão `Importar checklist do lançamento`, exportação CSV/JSON, busca, filtros e métricas derivadas.

- [ ] **Step 7: Remover a API efêmera e a promessa de backend**

Excluir os Route Handlers de tarefas e `src/lib/tasks-store.ts`. Manter em `src/lib/tasks-data.ts` apenas compatibilidade de seed se outro módulo importar; remover da copy da página qualquer texto “backend via API”. Confirmar com `rg -n "api/tasks|backend via API|tasksStore" src` que não restam consumidores/promessas.

- [ ] **Step 8: Ajustar rota e responsividade**

Manter `/app/tarefas` dentro do shell atual; desktop usa sidebar + conteúdo e mobile usa navegação recolhível.

- [ ] **Step 9: Rodar E2E até ficar verde**

Run: `npm run test:e2e -- e2e/tasks-workspace.spec.ts`

Expected: PASS em todos os fluxos criados no Step 1.

- [ ] **Step 10: Rodar verificações estáticas**

Run: `npm run lint && npm run typecheck && npm run test:unit`

Expected: exit 0.

- [ ] **Step 11: Commit**

```bash
git add src/hooks src/components/tasks src/components/tasks-workspace.tsx src/app/app/tarefas/page.tsx src/app/globals.css src/app/api/tasks src/lib/tasks-store.ts src/lib/tasks-data.ts e2e/tasks-workspace.spec.ts
git commit -m "feat: build functional edrive tasks workspace"
```

## Task 5: Validar os fluxos críticos no navegador

**Files:**
- Modify: `e2e/tasks-workspace.spec.ts`

- [ ] **Step 1: Expandir o teste de aceitação com regressões visuais e de erro**

Cobrir criação e persistência após reload de:

- funcionário;
- space;
- lista;
- tarefa atribuída ao novo funcionário;
- movimentação no Kanban;
- edição e exclusão com confirmação.
- importação das 204 tarefas pela UI;
- exportação dos 28 campos;
- erro de storage exibido sem perder o snapshot visível.

- [ ] **Step 2: Rodar teste E2E**

Run: `npm run test:e2e -- e2e/tasks-workspace.spec.ts`

Expected: PASS em Chromium.

- [ ] **Step 3: Corrigir somente falhas comprovadas**

Reexecutar o teste específico após cada correção.

- [ ] **Step 4: Rodar check completo**

Run: `npm run check && npm run test:e2e -- e2e/tasks-workspace.spec.ts`

Expected: lint, typecheck, unit, build e E2E com zero falhas.

- [ ] **Step 5: Commit**

```bash
git add e2e/tasks-workspace.spec.ts src
git commit -m "test: cover edrive tasks workspace flows"
```

## Task 6: Publicar no GitHub e Vercel

**Files:**
- Modify only if required by build: `next.config.ts`, `vercel.json`

- [ ] **Step 1: Revisar escopo Git**

Run: `git status -sb && git diff origin/main...HEAD --stat`

Expected: somente alterações planejadas do painel e consolidação já existente na branch.

- [ ] **Step 2: Validar autenticação e remoto**

Run: `git remote -v && git ls-remote origin`

Expected: acesso ao `Triadeia/Edrive-go`.

- [ ] **Step 3: Push da branch**

Run: `git push -u origin codex/vercel-consolidation-2026-07`

Expected: branch publicada no GitHub.

- [ ] **Step 4: Build e deploy de preview**

Run: `npx vercel build && npx vercel deploy --prebuilt --yes`

Expected: URL de preview.

- [ ] **Step 5: Smoke test do preview**

Run: `PLAYWRIGHT_BASE_URL=<preview-url> npm run test:e2e -- e2e/tasks-workspace.spec.ts`

Executar contra a URL de preview, criar um item temporário, recarregar e confirmar persistência; então removê-lo.

- [ ] **Step 6: Publicar em produção**

Run: `npx vercel build --prod && npx vercel deploy --prebuilt --prod --yes`

Expected: alias `https://edrive-go.vercel.app` atualizado.

- [ ] **Step 7: Smoke test de produção**

Run: `PLAYWRIGHT_BASE_URL=https://edrive-go.vercel.app npm run test:e2e -- e2e/tasks-workspace.spec.ts`

Validar console sem erros e os mesmos fluxos críticos no domínio final.

- [ ] **Step 8: Abrir PR ou integrar branch conforme estado do repositório**

Preferir PR pronto se a branch estiver separada; registrar URL e commit implantado.

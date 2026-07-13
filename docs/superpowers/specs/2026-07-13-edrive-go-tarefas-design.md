# Painel de tarefas eDrive Go — desenho técnico

Data: 13 de julho de 2026

Projeto canônico: `Triadeia/Edrive-go`

Rota de produção: `https://edrive-go.vercel.app/app/tarefas`

## Objetivo

Transformar a rota de tarefas já existente no painel eDrive Go em um gestor operacional funcional. O gestor precisa permitir que a equipe crie, visualize, edite e exclua tarefas, funcionários, spaces e listas; deve importar as 204 tarefas do checklist de lançamento e manter uma única fonte de verdade para todas as visualizações.

## Base escolhida

A implementação continuará no aplicativo Next.js existente em `codex-work/Edrive-go-official`. O ZIP entregue pelo Claude Designer será usado como referência de experiência e como fonte das 204 tarefas. O módulo de tarefas do `painel-triade` será a principal referência de implementação, porque já contém componentes, validações, drag-and-drop, testes e integração opcional com Supabase.

Os repositórios externos serão usados somente como referência arquitetural:

- Paca: domínio relacional, tarefas compartilhadas entre visualizações e histórico de atividade.
- idimetrix/Planoda: interface escura, densa e orientada a teclado, sem copiar código.
- Deskive: catálogo de funcionalidades; nenhum código será copiado devido ao escopo e às restrições da AGPL.

## Arquitetura

O painel permanecerá um monólito modular Next.js. A página `/app/tarefas` será um orquestrador fino que combina módulos independentes:

- `task-domain`: tipos, validações, normalização, migrações e seed.
- `task-repository`: interface única para leitura e escrita.
- `workspace-domain`: members, spaces, listas e configurações.
- `task-store`: estado da interface, ações otimistas e tratamento de erro.
- `views`: lista, Kanban e calendário, todas alimentadas pelas mesmas tarefas.
- `task-detail`: drawer/formulário para os campos operacionais e checklists.
- `workspace-settings`: CRUD de funcionários, spaces e listas.
- `import-export`: importação inicial do seed e exportação CSV/JSON segura.

A rota e o shell geral do painel não serão substituídos. Navegação, tema e demais módulos do projeto permanecerão intactos.

## Modelo de dados

Cada entidade usará UUID estável; nomes serão atributos editáveis, não chaves relacionais. O banco será PostgreSQL/Supabase e todas as tabelas terão `created_at timestamptz`, `updated_at timestamptz` e os índices das chaves estrangeiras.

### Workspace

- `id uuid`, `name text`, `event_name text`, `event_date timestamptz`
- possui muitos spaces e membros

### Workspace member

- `workspace_id uuid`, `user_id uuid -> auth.users`, `role owner | admin | member`
- chave primária composta `(workspace_id, user_id)`
- concede acesso autenticado ao workspace; `owner` e `admin` podem administrar a equipe e a estrutura

### Member

- `id uuid`, `workspace_id uuid`, `user_id uuid null`, `name text`, `job_title text`, `color text`, `active boolean`
- tarefas apontam para `assigneeId`
- `user_id`, quando presente, vincula o funcionário a uma conta; funcionários sem login também são permitidos
- exclusão exige reatribuição ou define `assignee_id = null`

### Space

- `id uuid`, `workspace_id uuid`, `name text`, `emoji text`, `position bigint`
- `UNIQUE(workspace_id, name)`
- possui muitas listas

### List

- `id uuid`, `space_id uuid`, `name text`, `color text`, `position bigint`
- `UNIQUE(space_id, name)`
- tarefas apontam para `listId`
- o sistema nunca permite que o workspace fique sem ao menos um space e uma lista

### Task

- identidade: `id uuid`, `external_id text null`, `title text`, `description text`; tarefas criadas pelo usuário deixam `external_id` nulo
- organização: `list_id uuid`, `assignee_id uuid null`; o space e o workspace são derivados da lista, eliminando referências redundantes
- execução: `status task_status`, `priority task_priority`, `phase text null`, `start_at timestamptz null`, `due_at timestamptz null`, `position bigint`, `version integer`
- operação: `vendor text null`, `cost numeric(12,2) null` em BRL, `blockers text null`, `next_action text null`, `notes text null`
- qualidade: `definition_of_done text null`, `evidence text null`, `approval approval_state`, `risk risk_level`
- origem: `source text null`, `source_url text null`, `source_meta jsonb not null default '{}'`
- `workspace_id` será materializado somente para integridade/isolamento e validado por trigger contra a cadeia task → list → space → workspace; um índice único parcial cobre `(workspace_id, external_id) WHERE external_id IS NOT NULL`

Enums aceitos:

- `task_status`: `backlog | todo | in_progress | review | blocked | done | cancelled`
- `task_priority`: `urgent | high | medium | low`
- `approval_state`: `not_required | pending | approved | rejected`
- `risk_level`: `none | low | medium | high | critical`

Datas serão gravadas em UTC e exibidas em `America/Bahia`. Datas sem horário vindas do checklist usarão 18:00 no timezone do projeto, salvo horário explícito.

Checklists, dependências e tags serão normalizados:

- `task_checklist_items(id, task_id, title, completed, position)` com cascade ao excluir a tarefa;
- `task_dependencies(task_id, depends_on_task_id)` com chave primária composta, rejeição de autorreferência e validação de ciclos no repositório antes da transação;
- `tags(id, workspace_id, name, color)` e `task_tags(task_id, tag_id)` com unicidade por workspace.

`assignee_id` usa `ON DELETE SET NULL`. `list_id` usa `ON DELETE RESTRICT`; listas e spaces só são excluídos por uma operação transacional de migração. Todas as demais relações filhas usam `ON DELETE CASCADE` quando não representam dados independentes.

Os 28 campos do checklist original serão mapeados explicitamente em `src/data/tasks/launch-seed.json` e validados por Zod. Campos sem coluna própria ficam em `source_meta` com chaves documentadas. O `external_id` original (`T001`…`T204`) é a chave idempotente. Lista, quadro e calendário nunca terão armazenamento próprio.

## Persistência

O repositório terá dois adaptadores:

1. Supabase, quando `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` estiverem configuradas, para persistência compartilhada e durável.
2. `localStorage` versionado no navegador, como modo independente para desenvolvimento, primeira publicação e contingência offline.

A interface informará claramente `Supabase compartilhado` ou `Dados neste navegador`. O modo local é individual por navegador/origem e não promete sincronização posterior. Trocar para Supabase exige uma importação explícita; não haverá fila automática nem resolução de conflitos nesta entrega. Falhas de escrita não serão silenciosas; ações otimistas serão revertidas e uma mensagem de erro será exibida.

No modo Supabase, o cliente usa somente a chave publicável e uma sessão Supabase Auth. A seleção do adaptador ocorre no cliente após validar a configuração e a sessão. O `service_role` nunca será enviado ao navegador e será usado apenas por script administrativo local de migration/seed, se disponibilizado via ambiente seguro.

RLS exige uma linha em `workspace_members` para todas as operações. Policies de `SELECT`, `INSERT`, `UPDATE` e `DELETE` validam `auth.uid()` contra o workspace derivado da entidade. Administração de members, spaces e listas exige papel `owner` ou `admin`. O workspace ativo vem da associação do usuário e fica registrado nas preferências locais; nesta entrega, cada usuário opera um workspace ativo por vez.

O contrato do repositório inclui `list`, `get`, `create`, `update(expectedVersion)`, `remove`, `move`, `replaceWorkspaceStructure` e `importSeed`. Entradas passam por Zod antes da chamada; o Supabase repete constraints no banco. Conflitos de versão retornam `409`, validação `422`, sessão ausente `401`, permissão `403` e ausência `404`. No adaptador local, erros equivalentes são objetos tipados exibidos pela UI.

Operações simples usam o cliente Supabase com RLS. Operações que precisam alterar várias linhas — importação, exclusão/migração de lista ou space, reindexação e gravação de dependências — usam funções PostgreSQL/RPC versionadas nas migrations. As funções executam uma única transação, validam `auth.uid()`, membership/papel, cadeia workspace/space/lista e versão esperada antes de escrever. Funções `SECURITY DEFINER`, quando necessárias para bootstrap, fixam `search_path`, revogam execução pública ampla e repetem as verificações de identidade explicitamente.

`update` compara `version` e incrementa atomicamente. Drag-and-drop grava posições inteiras espaçadas; quando não houver intervalo, o repositório reindexa somente a lista afetada dentro da mesma transação. Em conflito, o cliente recarrega a lista e informa que houve uma edição concorrente.

## Experiência do usuário

A rota manterá o visual escuro do painel eDrive Go e adotará uma única sidebar operacional:

- cabeçalho com totais de abertas, urgentes, bloqueadas e concluídas;
- sidebar com spaces, listas e equipe;
- busca e filtros por status, prioridade, responsável, fase, space e lista;
- vistas Lista, Quadro e Calendário;
- criação rápida e edição completa em drawer/dialog;
- drag-and-drop entre colunas do Kanban e datas do calendário;
- CRUD de funcionários, spaces e listas com confirmações e migração segura das tarefas relacionadas;
- checklists e dependências editáveis;
- importação inicial idempotente das 204 tarefas;
- exportação CSV e JSON com escape correto;
- comandos locais apenas para operações determinísticas; ações destrutivas exigem confirmação.

## Regras de integridade

- nomes de membros, spaces e listas não podem ficar vazios;
- não haverá IDs duplicados;
- não será possível excluir o último space ou a última lista sem criar destino substituto;
- renomear uma entidade não quebra tarefas, pois referências usam IDs;
- exclusão mostra a quantidade de tarefas afetadas; excluir lista exige outra lista de destino e migra tarefas/posições atomicamente; excluir space exige outro space e um mapeamento de listas, com rollback integral em qualquer falha;
- tarefas vazias, datas inválidas e enums desconhecidos são rejeitados;
- dependências rejeitam tarefa inexistente, autorreferência e ciclos;
- importação repetida não duplica as 204 tarefas: faz upsert transacional por `(workspace_id, external_id)`;
- dashboard e contadores são calculados a partir das tarefas atuais.

O bundle canônico `src/data/tasks/launch-workspace-seed.json` contém IDs UUID fixos e os dados iniciais de workspace, 5 spaces, 20 listas, 6 membros e 204 tarefas. O mapeamento dos 28 campos fica documentado ao lado do schema Zod. `importSeed` cria ou resolve a estrutura pelos IDs canônicos e aplica toda a estrutura/tarefas como uma operação atômica: no modo local monta e valida um novo envelope completo e grava uma única vez; no Supabase chama a RPC transacional de importação. Qualquer falha preserva o estado anterior.

O seed é executado pelo botão administrativo `Importar checklist do lançamento` e exige confirmação. Em local, ele importa para o navegador atual. Em Supabase, somente owner/admin pode executá-lo. Preview e produção não importam automaticamente durante build ou deploy, evitando duplicações e alterações inesperadas.

No modo Supabase, usuário sem sessão vê a tela de login e não cai silenciosamente para local. Usuário autenticado sem workspace pode criar o primeiro workspace por uma RPC de bootstrap que cria `workspace` e membership `owner` na mesma transação, ou inserir um código de convite. Usuário com sessão mas sem associação/invite válido recebe estado vazio orientado, sem acesso a dados de terceiros. O adaptador local só é selecionado quando Supabase não está configurado ou quando o usuário escolhe explicitamente `Usar somente neste navegador` antes de autenticar.

## Erros e estados de interface

Cada leitura e escrita terá estados de carregamento, vazio, sucesso e erro. O usuário verá se os dados são compartilhados via Supabase ou locais neste navegador. Respostas não bem-sucedidas serão tratadas antes de atualizar o estado definitivo.

## Testes e verificação

- dependências: Zod, `@dnd-kit/core`, `@dnd-kit/sortable`, `@supabase/supabase-js`, `@supabase/ssr`, `tsx` e `@playwright/test`;
- scripts: `typecheck`, `test:unit` com `tsx --test`, `test:e2e` com Playwright e `check` combinando lint, typecheck, unitários e build;
- testes unitários: validação, migração, integridade referencial, importação idempotente, conflitos, filtros e exportação;
- testes de repositório: CRUD, migrações atômicas e códigos de erro; integração Supabase usa projeto/banco isolado definido por variáveis de teste;
- Playwright: criar/editar/excluir tarefa, funcionário, space e lista; drag-and-drop; persistência após reload; filtros; visualizações; o fluxo padrão roda em modo local e o fluxo Supabase é condicionado ao ambiente de teste;
- verificações finais: lint, typecheck, testes, build de produção e smoke test na URL Vercel, incluindo escrita, reload e restauração do dado criado;
- validação responsiva em desktop e viewport móvel.

## Publicação

A implementação ficará na branch `codex/vercel-consolidation-2026-07` do repositório oficial. As migrations SQL serão versionadas em `supabase/migrations`. Antes de habilitar o modo compartilhado, migrations e variáveis serão aplicadas e validadas em Preview; o seed continua manual. O rollback de aplicação usa a implantação Vercel anterior e o rollback de schema usa migrations compensatórias não destrutivas.

Após as verificações, as alterações serão commitadas e enviadas ao GitHub. O build validado será publicado no projeto Vercel já associado (`edrive-go`) e a rota de produção `/app/tarefas` receberá o smoke test de escrita/persistência. A primeira publicação pode operar declaradamente em modo local por navegador; ela não será apresentada como multiusuário até as variáveis, migrations, Auth e RLS do Supabase estarem validadas.

## Fora do escopo desta entrega

- marketplace de plugins;
- chat, vídeo, whiteboard e editor de documentos;
- automações genéricas em canvas;
- agentes autônomos com permissão para alterações destrutivas;
- múltiplos mecanismos de busca ou microsserviços.

Esses recursos poderão ser adicionados depois que o núcleo de tarefas estiver estável e persistente.

# Seed do workspace de lançamento

Este diretório contém o seed canônico e reproduzível do workspace **eDrive Go — Lançamento 18/07/2026**. A fonte é o arquivo `EDrive Go dashboard launch.zip`, especificamente `20_DASHBOARD/tarefas_dados.js` (204 tarefas e os 28 headers) e `20_DASHBOARD/tarefas.js` (`DEFAULT_SPACES` e `DEFAULT_TEAM`). O gerador lê somente os literais de dados; ele não executa o aplicativo nem seu DOM.

## Regeneração

Com o ZIP no caminho original:

```sh
node scripts/build-launch-seed.mjs
```

Com caminhos explícitos para fonte e saída:

```sh
node scripts/build-launch-seed.mjs "/caminho/EDrive Go dashboard launch.zip" "src/data/tasks/launch-workspace-seed.json"
```

A saída usa IDs derivados apenas dos dados, posições da fonte e timestamps fixos. Duas execuções com o mesmo ZIP produzem bytes idênticos.

## Spaces e listas

| Space | Listas (`Frente`) |
| --- | --- |
| Comando & Gestão | PMO, Juridico, Orcamento |
| Local & Operação | Local, Operacao, Seguranca, Equipe, Buffet, Grafica |
| Veículos & Entrega | Veiculos, Motoristas, DDay |
| Marketing & Vendas | Marketing, Vendas, Convidados, Imprensa, Cerimonial |
| Conteúdo & Pós | Audiovisual, Podcast, PosEvento |

`Subfrente` não cria listas: seus 113 valores distintos ficam em `task.subarea`.

## Mapeamento dos 28 headers

Todos os valores originais também são mantidos, sem transformação, em `task.sourceMeta`.

| Header | Campo canônico | Observação |
| --- | --- | --- |
| ID | `externalId` | `id` estável derivado como `task-t001` |
| Frente | `listId` | Referência à lista do mapa 20→5 |
| Subfrente | `subarea` | Campo da tarefa |
| Fase | `phase` | Texto da fase operacional |
| Descricao_da_Tarefa | `title` | Título da tarefa |
| Responsavel_Funcao | `sourceMeta.Responsavel_Funcao` | Função original preservada |
| Responsavel_Nominal_Sugerido | `assigneeId` | Nome conhecido vira membro; vazio/`A DEFINIR` vira `null` |
| Responsavel_Substituto | `backupAssignee` | Placeholder/`VALIDAR` vira `null` |
| Prioridade | `priority` | `P0/P1/P2/P3` → `urgent/high/medium/low` |
| Status | `status` | Normalizado para enum do workspace |
| Data_Inicio | `startAt` (data) | ISO 8601 em `America/Bahia` |
| Hora_Inicio | `startAt` (hora) | Combinado com `Data_Inicio` |
| Prazo | `dueAt` (data) | ISO 8601 em `America/Bahia` |
| Hora_Limite | `dueAt` (hora) | Combinado com `Prazo` |
| Dependencias | `dependencies` | Guarda `externalId` e `taskId` resolvido |
| Bloqueadores | `blockers` | `-` vira `null` |
| Aprovacao_Necessaria | `approval` | `-` vira `null` |
| Fornecedor | `vendor` | `-` vira `null` |
| Custo_Previsto | `cost` | Número em BRL; ausente vira `null` |
| Tipo_Custo | `sourceMeta.Tipo_Custo` | Classificação original preservada |
| Centro_Custo | `tags` | Centro de custo como tag; original em `sourceMeta` |
| Evidencia_Exigida | `evidence` | `-` vira `null` |
| Definicao_de_Concluido | `definitionOfDone` | `-` vira `null` |
| Risco_Associado | `risk` | `-` vira `null` |
| Proxima_Acao | `nextAction` | `-` vira `null` |
| Observacoes | `notes` | `-` vira `null` |
| Fonte_da_Informacao | `source` | `-` vira `null` |
| Link_Comprovante | `sourceUrl` | Caminho ou URL; `-` vira `null` |

Os seis membros canônicos são Will Trindade, Eduard, Luci, Vinicius, Ian e Nilton Macario. Placeholders nunca criam membros adicionais.

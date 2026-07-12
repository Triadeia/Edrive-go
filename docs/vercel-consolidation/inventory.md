# Inventário Vercel — eDrive Go

Levantamento somente leitura realizado em 2026-07-12 na equipe `team_gJ4rhMryEtOqdXyOv3cnoxC5`. Valores de variáveis de ambiente não foram lidos nem registrados.

## Estado principal

- Projeto oficial: `edrive-go` (`prj_5zlJa42PaicTedtnfMztLdjOzfHu`)
- Git: `Triadeia/Edrive-go`, production branch `main`
- Produção estável auditada: `dpl_GNDBNrdsGfxBVmiCW6zmC7Aa4Dm3`
- Commit informado pelo deployment: `c7d1c9595c9a952a7c29952eae40fa92077b548c`
- Domínios preservados: `e-drivego.app`, `e-drivego-locar.app`
- Alias desejado `edrive-go.vercel.app`: sem associação visível na equipe e retornando HTTP 404 antes da consolidação
- Variáveis no projeto oficial: nenhuma
- Cron jobs no projeto oficial: nenhum identificado

## Projetos auditados

| Projeto | ID | Origem/finalidade encontrada | Último deployment | Domínios/aliases | Decisão preliminar |
|---|---|---|---|---|---|
| edrive-go | prj_5zlJa42PaicTedtnfMztLdjOzfHu | Next.js, painel e calculadora; GitHub `Triadeia/Edrive-go` | dpl_GNDBNrdsGfxBVmiCW6zmC7Aa4Dm3, READY | e-drivego.app; e-drivego-locar.app | Preservar; consolidar aqui |
| pr-reserva-edrive-go-f03e613a | prj_sZ2lcYiuCR41UBB5DZW8dDYysJyG | Landing mais recente e `/api/byd`; deploy local sem Git | dpl_7HjakNXo8CktE8Tw4ReWc8f9iyk9, READY | pr-reserva-edrive-go-f03e613a.vercel.app | Preservar até produção consolidada e validação de tráfego |
| pr-reserva-edrive-go-9c8d87c4 | prj_sqR8UDGlrKjGQy4kAr9wWumUZViN | Snapshot temporário sem Git/env | dpl_9xQ8GgSDjQbUgwhZD5GhPEZCCFVb, READY | alias homônimo | Candidato; requer validação final de tráfego |
| pr-reserva-edrive-go-e25fa124 | prj_aSXao56pg0FJSMMNaxdy1CaNwrP2 | Snapshot temporário sem Git/env | dpl_5Zc5keiwzPu4uA5JAbbL44zhjiw7, READY | alias homônimo | Candidato; requer validação final de tráfego |
| pr-reserva-edrive-go-f7f9ad8b | prj_Tblo9rp216ejY96vNLt9TCN6FEpG | Snapshot temporário sem Git/env | dpl_8bRJ2MWzqP2N1Hku24oV5Bfe4SJT, READY | alias homônimo | Candidato; requer validação final de tráfego |
| pr-reserva-edrive-go-c226098a | prj_mIGMBbBoYAktZ0oX1LrpAHvvEMnW | Snapshot temporário sem Git/env | dpl_G5Z3KQEd331hcYcrDd5DfMi8uDTg, READY | alias homônimo | Candidato; requer validação final de tráfego |
| pr-reserva-edrive-go-59ea1e69 | prj_CXj0JmgdXx8ePFaGaKy1MsJifObR | Snapshot temporário sem Git/env | dpl_HMc24T97KVa7hYZLRa5ppW69bwLB, READY | alias homônimo | Candidato; requer validação final de tráfego |
| pr-reserva-edrive-go-bb4a1e98 | prj_RoXnFLf3KRmZWEkcKSKsGiq0poO2 | Snapshot temporário sem Git/env | dpl_6hGcNsV7cJzq1FpuMaatHMmRrKyv, READY | alias homônimo | Candidato; requer validação final de tráfego |
| pr-reserva-edrive-go-ea0ea9ae | prj_Hx1xSnuHHqBtbkZrf0hkCCnFrCNW | Snapshot temporário sem Git/env | dpl_5kTMkP7Xn4Wzp6V2Kv3ELjorngi8, READY | alias homônimo | Candidato; requer validação final de tráfego |
| pr-reserva-edrive-go-a7f88fe3 | prj_xQYaH16dgGuBZmdA8zADzG9IdnW5 | Ligação duplicada ao GitHub `Triadeia/Edrive-go` | dpl_HpoNCStSFgUtyWDecRKGb1PBuwPS, READY | alias homônimo | Candidato após desligar integração Git duplicada |
| pr-reserva-edrive-go-7e516d8c | prj_xMz6GijAc0KhQx9VzjQlbfYNkR62 | Snapshot temporário sem Git/env | dpl_DYVMcTnxumBNQgCvcLA7ufErqogA, READY | alias homônimo | Candidato; requer validação final de tráfego |
| pr-reserva-edrive-go-b079c0da | prj_S0dReWlHFjbaIFhRuigK9UBXFUmI | Snapshot temporário sem Git/env | dpl_CVNANBpH2nn9V58EGFs8CgoyfBiD, READY | alias homônimo | Candidato; requer validação final de tráfego |
| pr-reserva-edrive-go-8a1ab19d | prj_ncCdZRoPgxCJUcQ1pBKyAipqV2NS | Snapshot temporário sem Git/env | dpl_Ai9Qmj5Y9iUgrwNfuecbocUXpLL6, READY | alias homônimo | Candidato; requer validação final de tráfego |
| triadesaudeeperformance | prj_IQMMNHA15Zn453RFG6wuxz3l8eGh | Sistema multiárea com autenticação, Supabase, tarefas e reuniões | dpl_2p33QHUBatK1fLBWhoRyF3RZpiGy, READY | triadesaudeeperformance.vercel.app | Preservar; contém operações não eDrive |
| verificapix | prj_s23wNBwHVkAje2aTCweciJdSGECQ | Serviço financeiro separado; possui `AUTH_SECRET` | dpl_9jUy6NTwWGbGHw1Zi6xWC69uAZXZ, READY | verificapix-tau.vercel.app | Preservar; possível dependência financeira |

## Evidências relevantes

- Os 11 projetos temporários sem Git não possuem variáveis de ambiente cadastradas; `a7f88fe3` é o único temporário ligado ao repositório oficial.
- A landing `f03e613a` respondeu HTTP 200 e contém formulário, sete aceites, calculadora, PagBank e proxy para o webhook BYD.
- O snapshot do deployment oficial contém a calculadora que não estava registrada no commit remoto. O snapshot foi recuperado antes da consolidação.
- `triadesaudeeperformance` usa autenticação/Supabase e contém dados e módulos de outras operações; não é seguro copiá-lo integralmente nem excluí-lo.
- `verificapix` é isolado e possui segredo próprio; nenhuma alteração foi autorizada pela evidência disponível.

## Risco jurídico/comercial observado

A landing contém contador regressivo, contagem simulada de reservas e notificações com nomes/cidades. Esses sinais aparentam ser gerados no cliente, não por eventos reais. Foram preservados para evitar mudança visual/funcional não autorizada, mas devem passar por revisão jurídica e de credibilidade.

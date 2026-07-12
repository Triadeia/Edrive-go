# Rollback da consolidação Vercel

## Pontos preservados

- Branch local: `backup/vercel-consolidation-2026-07`
- Tag local: `pre-vercel-consolidation-2026-07`
- Commit/snapshot estável: `c7d1c9595c9a952a7c29952eae40fa92077b548c`
- Deployment estável: `dpl_GNDBNrdsGfxBVmiCW6zmC7Aa4Dm3`

## Rollback da aplicação

No Dashboard da Vercel, abra o projeto `edrive-go`, selecione o deployment estável acima e use **Promote to Production**. Alternativamente, com a CLI autenticada e vinculada ao projeto oficial:

```sh
vercel rollback dpl_GNDBNrdsGfxBVmiCW6zmC7Aa4Dm3 --scope triadecompanyio-gmailcoms-projects
```

## Rollback do Git

Crie um branch a partir da tag preservada, sem reescrever o histórico de `main`:

```sh
git switch -c rollback/vercel-consolidation pre-vercel-consolidation-2026-07
git push -u origin rollback/vercel-consolidation
```

Não exclua o deployment estável enquanto a consolidação não tiver período de observação aprovado.

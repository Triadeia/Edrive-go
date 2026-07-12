# Modelo Financeiro — Libert Drive

Gerador de planilha Excel (.xlsx) para a **Libert Drive**, locadora de **100 carros elétricos BYD Dolphin Mini** para motoristas de aplicativo.

O arquivo `Libert_Drive_Modelo_Financeiro.html` é **autossuficiente**: ao abrir no navegador e clicar no botão, ele constrói e **baixa automaticamente** um arquivo `.xlsx` **real e completo**, com **fórmulas nativas do Excel** (não valores estáticos). Todas as abas de saída referenciam a aba **Premissas** — ou seja, ao editar as premissas, **tudo recalcula sozinho** no Excel/LibreOffice.

---

## Como usar (passo a passo)

1. **Abra** o arquivo `Libert_Drive_Modelo_Financeiro.html` com um duplo clique (ou arraste para uma aba do navegador). Funciona em Chrome, Edge, Firefox e Safari.
   - Requer acesso à internet **na primeira abertura** para carregar a biblioteca SheetJS via CDN.
2. Clique no botão verde **"⬇ Baixar planilha .xlsx"**.
3. O navegador baixa **`Libert_Drive_Modelo_Financeiro.xlsx`** (16 abas).
4. Abra o `.xlsx` no **Microsoft Excel** ou **LibreOffice Calc**.
5. Para simular cenários, **edite apenas a aba `Premissas`** (as células amarelas da coluna **B**). Todas as demais abas recalculam automaticamente.

> Opcional: o botão **"⬇ Baixar CSVs de fallback"** gera CSVs simples (Premissas, Frota, Marketing e resumo da DRE) no cenário Base, caso você não consiga abrir o `.xlsx`. Os CSVs contêm **valores fixos** (sem fórmulas) e servem apenas como espelho de leitura.

---

## Regra de ouro: só se edita a aba Premissas

- **Você edita SOMENTE a aba `Premissas`** — coluna **B** (valores), destacada em **amarelo**.
- **Não altere** fórmulas das outras abas: elas apontam para `Premissas!B...` e recalculam sozinhas.
- Itens marcados como **"a validar"** (aluguel do veículo, seguro, custo/probabilidade de sinistro etc.) são **premissas iniciais** e **exigem confirmação** com **locadora, contador e jurídico** antes de qualquer decisão.

Observação fixada no topo da aba Premissas:
> *"Valores são premissas iniciais editáveis; itens marcados 'a validar' exigem confirmação com locadora, contador e jurídico."*

---

## O que cada aba faz

| # | Aba | Descrição |
|---|-----|-----------|
| 1 | **Premissas** | Todas as variáveis editáveis (rótulo, **valor/input**, unidade, observação). É a **única** aba que você edita. Células de input em amarelo. |
| 2 | **Frota** | Carros disponíveis/ativos, custo por carro, custo total da frota, custo de inatividade e sinistros. Fórmulas referenciam `Premissas`. |
| 3 | **Motoristas** | Receita por motorista e por carro ativo, perda por churn, perda por inadimplência, vida média e **LTV**. |
| 4 | **Marketing** | Funil de aquisição: investimento → leads → grupo → webinar → aplicações → aprovados → contratos. Calcula **CPL, CAC e ROAS**. |
| 5 | **Funil** | Taxas por etapa com metas **Conservador / Base / Agressivo**. |
| 6 | **Equipe** | Dimensiona SDRs, closers, atendentes, gestores, operadores e analistas com **ARREDONDAR.PARA.CIMA (ROUNDUP)** e soma o **custo total da equipe**. |
| 7 | **Consorcio** | Crédito e consórcio: interessados, conversões, comissões, receita complementar, provisões e **alertas de compliance** (texto). |
| 8 | **Custos** | Consolida frota + equipe + marketing + administrativo + provisões = **custo operacional total/mês**. |
| 9 | **DRE** | DRE mensal, **36 colunas (M1..M36)**, com linha de **Carros ativos** e **rampa de ativação** (M1..M6 subindo até ~92 carros). Receitas ligadas aos carros ativos do mês. Da Receita bruta ao **Lucro líquido** e Margem líquida. |
| 10 | **Fluxo** | Fluxo de caixa 36 meses: caixa inicial, entradas, saídas, caixa do mês e **caixa acumulado**. Puxa da DRE (bate com ela). Mostra menor caixa e aporte necessário. |
| 11 | **Unit** | Unit economics: receita/carro, custo/carro, **margem de contribuição/carro**, CAC, LTV, **LTV/CAC**, payback, **break-even em carros**. |
| 12 | **Cenarios** | Compara **Conservador / Base / Agressivo / Stress** em Receita, Custos, EBITDA, Lucro, Break-even e Caixa necessário (com *overrides* por cenário). |
| 13 | **Sensibilidade** | Tabela de 2 variáveis: **EBITDA** em função de `custoAluguelVeiculoMes` (2.400 a 3.400) × `valorMensalMotorista` (3.400 a 4.200). |
| 14 | **Dashboard** | Cards com os principais **KPIs** e o **status de break-even** (acima/abaixo). |
| 15 | **Riscos** | Matriz de riscos e mitigações: Risco, Categoria, Probabilidade, Impacto, Indicador, Mitigação, Responsável, Contingência. |
| 16 | **Roadmap** | Marcos de **7 / 30 / 60 / 90 dias e 12 meses** por área. |

---

## Premissas principais (valores BASE)

| Variável | Valor | Obs. |
|---|---|---|
| Total de carros | 100 | frota |
| Custo aluguel veículo /mês | R$ 2.800 | **a validar** com locadora (app/PJ, 100un) |
| Seguro /mês | R$ 0 | assumido incluso no aluguel — **validar** |
| Valor mensal por motorista | R$ 3.900 | receita/motorista |
| Taxa de ocupação | 92% | carros locados |
| % carros parados | 8% | inatividade |
| Churn mensal | 6% | |
| Inadimplência mensal | 7% | recuperação 50% |
| CPL | R$ 20 | investimento mkt R$ 30.000/mês |
| Taxa de fechamento | 40% | |
| Impostos sobre receita | 15% | |
| Caixa inicial | R$ 300.000 | |

> A lista completa (mais de 50 premissas) está na aba **Premissas** com unidade e observação de cada uma.

### Cenários (overrides sobre a Base)
- **Conservador:** CPL 35; fechamento 30%; aluguel 3.200; inadimplência 12%; ocupação 82%; churn 9%; valor motorista 3.600.
- **Agressivo:** CPL 12; fechamento 50%; aluguel 2.500; inadimplência 4%; ocupação 95%; churn 4%; valor motorista 4.100.
- **Stress:** CPL 60; fechamento 25%; aluguel 3.400; inadimplência 18%; ocupação 70%; churn 12%; % parados 15%; sinistro 4%.

---

## Notas técnicas

- Biblioteca: **SheetJS (xlsx) 0.18.5** via CDN `https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js`.
- As planilhas são montadas com `XLSX.utils.aoa_to_sheet` e as células usam **fórmulas** no formato `{f:'...'}`.
- As referências apontam para a aba **Premissas** por nome (ex.: `Premissas!$B$6`), garantindo recálculo global ao editar as premissas.
- Não é necessário rodar Node ou Python — tudo acontece no navegador.
- Depreciação = 0 e imposto sobre lucro embutido no imposto sobre receita, pois a **frota é alugada** (não é ativo próprio) e o regime assumido tributa o faturamento; ajuste na aba Premissas conforme orientação do contador.

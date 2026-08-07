# LAUNCH MASTER PLAN — eDRIVE GO

*Documento vivo. Atualizado em 2026-08-07. Tudo marcado como HIPOTESE deve
ser validado com dados reais antes de virar decisao definitiva — nada aqui
foi inventado como se fosse fato confirmado quando nao e.*

## 1. Situacao atual (fato, verificado no repositorio)

O repositorio `triadeia/edrive-go` contem hoje:

| Arquivo | O que e |
|---|---|
| `index.html` | Landing/proposta comercial de growth (conteudo + funis de webinario) |
| `PROPOSTA_EDRIVE_GO_REDESIGN.html` | Versao redesenhada com modelo financeiro de **aluguel de frota** a motoristas (R$200/dia, pre-reserva, meta de 35–45 motoristas M1 em 30 dias) |
| `PROPOSTA_SIMPLES.md` | Proposta original em Markdown do estrategista Nilton Macario |
| `qrcode01/` | Pagina de redirect QR (protótipo, path absoluto `/`) |
| `qr/` | **Novo**: sistema de QR codes rastreaveis por carro/motorista (ver `qr/README.md`) |

**Nao existe neste repositorio**: app mobile, backend, banco de dados,
integracao com WhatsApp Business API, CRM, Google/Meta Ads, analytics
(GA4/Pixel/Mixpanel), ou qualquer painel/dashboard. O modelo de negocio
descrito nos arquivos existentes e **aluguel de veiculos de frota a
motoristas** (nao um marketplace motorista×passageiro tipo Uber/99) — vale
confirmar se essa ainda e a tese vigente antes de aplicar qualquer
framework de densidade geografica tipo Uber.

## 2. Gaps criticos para qualquer lancamento em escala

1. **Sem analytics/CRM configurado.** QR codes e links vao gerar cliques,
   mas nada esta contando conversao hoje. Bloqueia qualquer calculo de CPA.
2. **Sem WhatsApp API oficial.** O unico canal ativo e um numero pessoal
   (`wa.me/5571992564840`), o que e o oposto do principio "nao depender de
   conta pessoal" do plano de contingencia.
3. **Sem confirmacao do dominio de publicacao** (sem `CNAME`, sem config de
   deploy). Isso bloqueia a impressao final dos QR codes fisicos.
4. **Numeros de motoristas (8.000–10.000 em grupos de WhatsApp) nao estao
   neste repositorio** — sao um dado de negocio que precisa ser confirmado/
   importado (planilha, export de grupos) para virar base real de CRM.
5. **Sem app mobile/produto no repo** — o "nosso app" mencionado ainda e,
   tecnicamente, a landing page comercial atual.

## 3. O que foi construido agora (executavel, [AUTO])

### Sistema de QR code rastreavel por carro/motorista — `qr/`

- 2 codigos gerados para os carros da frota: `CARRO_01`, `CARRO_02`.
- 1 codigo de exemplo para indicacao de motorista: `DRIVER_EXEMPLO`
  (template — gerar um por motorista real com
  `python3 qr/generate_qr.py --code DRIVER_<nome> --type motorista`).
- Cada codigo grava `utm_source`, `utm_medium` (diferencia carro vs.
  motorista vs. evento), `utm_campaign` e `ref` unicos ao redirecionar para
  a landing page — a base minima para depois medir CPA por carro/motorista.
- PNGs prontos em `qr/assets/*.png` — **nao imprimir ainda**, dominio de
  publicacao nao confirmado (ver gap #3).
- Registro em `qr/registry.json` + `qr/registry.xlsx`.

## 4. Proxima acao imediata [HUMAN]

Antes de qualquer campanha em escala com motoristas:

1. Confirmar o dominio real de publicacao (GitHub Pages / dominio proprio)
   → regerar PNGs com `--base-url` correto → so entao mandar para grafica.
2. Decidir se a landing page atual (proposta comercial) e o destino certo
   do QR publico, ou se precisa de uma pagina voltada a motorista/passageiro
   (a atual foi escrita para o cliente da Nilton Macario avaliar a proposta,
   nao para conversao publica).
3. Confirmar a base real de motoristas (planilha/export dos grupos de
   WhatsApp) para poder desenhar o programa de indicacao com dados reais
   em vez da hipotese de 8.000–10.000.
4. Decidir sobre WhatsApp Business API oficial antes de escalar disparo em
   massa (risco de bloqueio de numero pessoal).

## 5. Fora de escopo agora (nao fabricado)

O prompt de referencia deste projeto pede uma bateria de 9 documentos
(GEO_LAUNCH_PLAN, WHATSAPP_GROWTH_PLAN, ANALYTICS_TRACKING_PLAN, etc.) com
dados de densidade geografica, funis completos e dashboards. Gerar esses
documentos agora exigiria inventar numeros de motoristas por bairro, taxas
de aceite, ETA e outros dados que nao existem em lugar nenhum acessivel
neste ambiente. Nao vamos fabricar isso. Assim que houver uma fonte real
(planilha de motoristas, export de grupos, qualquer analytics ligado),
esses documentos podem ser construidos em cima de dados reais.

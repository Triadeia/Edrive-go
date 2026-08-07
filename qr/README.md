# Sistema de QR Codes Rastreaveis — eDRIVE GO

Cada QR code fisico (adesivo dentro de carro da frota, cartao de motorista,
material de evento etc.) aponta para uma pasta propria em `/qr/{CODIGO}/`
que redireciona para a landing page (`/index.html`) com parametros de UTM e
`ref` unicos. Isso permite saber, no Analytics/GA/Meta Pixel que estiver
plugado na landing page, exatamente qual carro, motorista ou campanha gerou
cada clique/cadastro.

## Como funciona

```
Pessoa escaneia QR fisico
      -> https://SEUDOMINIO/qr/CARRO_01/          (URL gravada no QR)
      -> /qr/CARRO_01/index.html redireciona para
      -> /index.html?utm_source=qrcode&utm_medium=qr_carro&utm_campaign=CARRO_01&ref=CARRO_01
```

Sem backend, sem servidor — funciona em qualquer hospedagem estatica
(GitHub Pages, Vercel, Netlify, dominio proprio) porque o redirecionamento
interno usa caminho relativo (`../../index.html`).

## ⚠️ Antes de imprimir qualquer QR fisico

O dominio final de publicacao ainda **nao foi confirmado**. Os PNGs atuais
foram gerados com o palpite `https://triadeia.github.io/Edrive-go` (padrao
GitHub Pages deste repo). Se o site for publicado em outro dominio, **regere
os PNGs** com `--base-url` (ver abaixo) antes de mandar para grafica —
senao o QR impresso vai levar a uma URL errada.

## Gerar um novo codigo

```bash
python3 qr/generate_qr.py --code CARRO_03 --type carro --label "Fleet car 03 - placa XYZ9K88"
python3 qr/generate_qr.py --code DRIVER_joaosilva --type motorista --label "Joao Silva - indicacao"
python3 qr/generate_qr.py --code EVENTO_faculdadeX --type evento --label "Feira X - Universidade Y"

# quando o dominio final estiver confirmado, regerar todos apontando pra ele:
for c in $(python3 -c "import json;print('\n'.join(e['code'] for e in json.load(open('qr/registry.json'))))"); do
  python3 qr/generate_qr.py --code "$c" --type <tipo-original> --base-url https://dominio-real.com.br --force
done
```

Tipos suportados: `carro`, `motorista`, `evento`, `parceiro`, `campanha`
(cada um usa um `utm_medium` diferente: `qr_carro`, `qr_motorista`, etc,
para segmentar a origem no funil).

## Convencao de nomes de codigo

- Carros da frota: `CARRO_01`, `CARRO_02`, ...
- Indicacao de motorista (motorista→motorista ou motorista→passageiro):
  `DRIVER_<slug-do-nome-ou-id-interno>`
- Eventos/parcerias: `EVENTO_<nome>`, `PARCEIRO_<nome>`
- Campanhas de midia/creators: `CAMPANHA_<nome>`

Todo codigo fica registrado em `qr/registry.json` (fonte da verdade,
maquina-legivel) e replicado em `qr/registry.xlsx` (planilha para o time de
growth acompanhar sem precisar mexer em JSON).

## Arquivos gerados por codigo

- `qr/{CODIGO}/index.html` — pagina de redirect (o que fica publicado)
- `qr/assets/{CODIGO}.png` — QR pronto para imprimir

## Limitacao conhecida

Como o site e 100% estatico (sem banco de dados), o rastreamento depende
inteiramente do `utm_campaign`/`ref` chegando no Analytics/CRM que estiver
plugado na landing page — hoje **nao existe nenhuma ferramenta de
analytics/CRM configurada neste repositorio** (ver `LAUNCH_MASTER_PLAN.md`
gap #1). Sem isso, o clique acontece mas ninguem esta contando. Configurar
o tracking do lado do destino é pre-requisito antes de escalar a impressao
de muitos codigos.

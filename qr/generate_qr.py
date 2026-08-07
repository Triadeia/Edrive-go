#!/usr/bin/env python3
"""
Gerador de QR codes rastreaveis para a eDRIVE GO.

Cada QR code vira uma pasta estatica /qr/{CODE}/index.html que redireciona
(via caminho relativo, funciona em qualquer subpasta/dominio) para a landing
page raiz com utm_source/utm_medium/utm_campaign/ref, e um PNG pronto para
imprimir em /qr/assets/{CODE}.png.

Uso:
  python3 qr/generate_qr.py --code CARRO_01 --type carro --label "Fleet car 01 - placa ABC1D23"
  python3 qr/generate_qr.py --code DRIVER_joaosilva --type motorista --label "Joao Silva"

Tipos suportados: carro, motorista, evento, parceiro, campanha
"""
import argparse
import json
import os
import sys
from datetime import date

try:
    import qrcode
except ImportError:
    sys.exit("Falta a lib 'qrcode'. Rode: pip3 install qrcode pillow")

QR_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(QR_DIR)
REGISTRY_PATH = os.path.join(QR_DIR, "registry.json")
ASSETS_DIR = os.path.join(QR_DIR, "assets")

# ASSUNCAO NAO CONFIRMADA: dominio de publicacao ainda nao foi definido pelo
# usuario (respondeu "sem preferencia"). Usando o dominio padrao do GitHub
# Pages para este repo como melhor palpite. Antes de IMPRIMIR qualquer QR
# fisico, confirme o dominio real e rode novamente com --base-url.
DEFAULT_BASE_URL = "https://triadeia.github.io/Edrive-go"

UTM_MEDIUM_BY_TYPE = {
    "carro": "qr_carro",
    "motorista": "qr_motorista",
    "evento": "qr_evento",
    "parceiro": "qr_parceiro",
    "campanha": "qr_campanha",
}

REDIRECT_TEMPLATE = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex, nofollow" />
<title>eDRIVE GO</title>
<meta http-equiv="refresh" content="0; url={target}" />
<style>
  html, body {{ margin: 0; height: 100%; background: #0B1B2B; }}
</style>
<script>
  window.location.replace("{target}");
</script>
</head>
<body></body>
</html>
"""


def load_registry():
    if os.path.exists(REGISTRY_PATH):
        with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_registry(entries):
    with open(REGISTRY_PATH, "w", encoding="utf-8") as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)
        f.write("\n")


def main():
    ap = argparse.ArgumentParser(description="Gera QR code rastreavel (pagina + PNG) e registra.")
    ap.add_argument("--code", required=True, help="Codigo unico, ex: CARRO_01, DRIVER_joaosilva")
    ap.add_argument("--type", required=True, choices=sorted(UTM_MEDIUM_BY_TYPE), help="Tipo de fonte")
    ap.add_argument("--label", default="", help="Nome/descricao legivel (motorista, placa, evento...)")
    ap.add_argument("--base-url", default=DEFAULT_BASE_URL, help="Dominio publicado (para o PNG)")
    ap.add_argument("--force", action="store_true", help="Sobrescreve codigo existente")
    args = ap.parse_args()

    code = args.code.strip()
    if not code or any(c in code for c in "/ \\?#"):
        sys.exit("Codigo invalido: use apenas letras, numeros, _ e -")

    registry = load_registry()
    if any(e["code"] == code for e in registry) and not args.force:
        sys.exit(f"Codigo '{code}' ja existe no registry.json. Use --force para sobrescrever.")

    utm_medium = UTM_MEDIUM_BY_TYPE[args.type]
    query = f"utm_source=qrcode&utm_medium={utm_medium}&utm_campaign={code}&ref={code}"

    # pagina de redirect fica em /qr/{code}/index.html -> raiz e dois niveis acima
    relative_target = f"../../index.html?{query}"
    page_dir = os.path.join(QR_DIR, code)
    os.makedirs(page_dir, exist_ok=True)
    with open(os.path.join(page_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(REDIRECT_TEMPLATE.format(target=relative_target))

    # URL absoluta e o que efetivamente vai dentro do QR fisico
    absolute_url = f"{args.base_url.rstrip('/')}/qr/{code}/"
    os.makedirs(ASSETS_DIR, exist_ok=True)
    png_path = os.path.join(ASSETS_DIR, f"{code}.png")
    img = qrcode.make(absolute_url)
    img.save(png_path)

    registry = [e for e in registry if e["code"] != code]
    registry.append({
        "code": code,
        "type": args.type,
        "label": args.label,
        "created": date.today().isoformat(),
        "page_path": f"qr/{code}/index.html",
        "png_path": f"qr/assets/{code}.png",
        "absolute_url": absolute_url,
        "redirect_query": query,
        "status": "active",
    })
    registry.sort(key=lambda e: (e["type"], e["code"]))
    save_registry(registry)

    print(f"OK: {code}")
    print(f"  pagina: qr/{code}/index.html")
    print(f"  png:    qr/assets/{code}.png")
    print(f"  URL no QR (fisico): {absolute_url}")
    print(f"  redireciona para:   /{relative_target}")


if __name__ == "__main__":
    main()

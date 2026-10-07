#!/bin/sh
# Kontrola ukázky v reálném Chrome (Playwright, channel="chrome" – nic se nestahuje).
# Použití: tools/kontrola/vse.sh [adresa]   výchozí http://localhost:4390/
# Každý řádek, který není „OK“/„hotovo“, je nález.
set -e
cd "$(dirname "$0")/../.."
A="${1:-http://localhost:4390/}"
K=tools/kontrola
spust() { uv run --with playwright python "$@" 2>&1 | grep -v "^Installed\|^Downloaded\|^ *Built"; }
echo "== stránky × šířky 320/375/768/1440 × světlý/tmavý";      spust $K/kontrola.py "$A"
echo "== všechna okna (dialogy) na mobilu a desktopu";          spust $K/okna.py "$A" | grep -v " OK$" || true
echo "== každý doklad na 320/375/414 px";                       spust $K/okna_nabidky.py "$A" $K/okna.py | grep -v "hotovo$" || true
echo "== úvodní animace doběhne a nic nezůstane skryté";        spust $K/animace.py "$A" | grep -v "'skryte': 0} *$" || true
echo "== uložený světlý/tmavý režim: klikání ho nesmí přepnout"; spust $K/tema.py "$A" | grep -v "^OK" || true
echo "== poptávka z webu → systém, ARES naživo";                spust $K/ares_live.py "$A"
echo "== konec kontroly"

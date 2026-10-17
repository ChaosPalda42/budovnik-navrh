#!/bin/sh
# Kontrast textu (WCAG 4.5, velký text 3.0) na všech stránkách a pohledech, světlý i tmavý režim.
#   ./tools/kontrast.sh http://localhost:4390
# Počítá jen NAMĚŘENÉ nálezy pod prahem; odpovědi „nevím“ (text na dvou podkladech, např. prvek
# ještě nevysunutý animací) vypíše zvlášť a za vadu je nepovažuje.
# Měří se ve vysokém okně (1440×2000): factory prohlizec u textu mimo viditelnou část okna
# v tmavém režimu vracel nesmyslná čísla (nahlášeno autorovi nástroje 17. 10. 2026).
Z="${1:-http://localhost:4390}"
NALEZY=0; NEVIM=0
STRANKY="index.html sluzby.html technicka-sprava.html provozni-sprava.html ekonomicka-sprava.html energeticky-management.html pro-koho.html bytove-domy.html komercni-objekty.html verejne-budovy.html reference.html reference-panelovy-dum.html system.html revize.html kalkulacka.html kariera.html o-nas.html kontakt.html o-ukazce.html 404.html"
for v in prehled zavady nahlasit revize dokumenty vyuctovani smlouva; do STRANKY="$STRANKY portal.html#$v"; done
for v in prehled poptavky klienti zakazky smlouvy vzory doklady statistiky zavady revize objekty dodavatele ukoly vyuctovani automatizace navstevnost tym nastaveni; do STRANKY="$STRANKY dispecink.html#$v"; done
for tema in svetlo tma; do
  for u in $STRANKY; do
    t=""; [ "$tema" = tma ] && t="tma; "
    vystup=$(factory prohlizec "$Z/o-ukazce.html" --krok "velikost 1440x2000; ${t}jdi o-ukazce.html; jdi $u; kontrast 4.5" --json 2>/dev/null)
    souhrn=$(echo "$vystup" | python3 -c '
import json, sys
try:
    d = json.load(sys.stdin)
except Exception:
    print("NEPROBĚHLO 0"); sys.exit()
if not d.get("proběhlo"):
    print("NEPROBĚHLO 0"); sys.exit()
k = d.get("mereni", {}).get("kontrast", [])
cisla = [x for x in k if x.get("kontrast") is not None]
nevim = len(k) - len(cisla)
print("OK" if not cisla else "NÁLEZ", nevim)
for x in sorted(cisla, key=lambda x: x["kontrast"])[:6]:
    print("     %.2f / %.1f  %spx  %s  %r" % (x["kontrast"], x["prah"], x.get("velikost"), x["kde"], x["text"][:40]))
')
    hlava=$(echo "$souhrn" | head -1)
    NEVIM=$((NEVIM + ${hlava##* }))
    case "$hlava" in
      OK*) ;;
      *) NALEZY=$((NALEZY + 1)); echo "${hlava% *} $tema $u"; echo "$souhrn" | tail -n +2 ;;
    esac
  done
done
echo "kontrast hotovo, stránek s nálezem: $NALEZY (odpovědí „nevím“: $NEVIM)"
[ "$NALEZY" -eq 0 ]

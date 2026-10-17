#!/bin/sh
# Kontrast textu (WCAG 4.5, velký text 3.0) na všech stránkách a pohledech, světlý i tmavý režim.
#   ./tools/kontrast.sh http://localhost:4390
# Tmavý režim se měří po čistém načtení (krok „tma“ + jdi jinam a zpět): web má plynulý přechod
# barev, a měření hned po přepnutí by vracelo nesmyslné hodnoty kolem 1,0.
Z="${1:-http://localhost:4390}"
NALEZY=0
STRANKY="index.html sluzby.html technicka-sprava.html provozni-sprava.html ekonomicka-sprava.html energeticky-management.html pro-koho.html bytove-domy.html komercni-objekty.html verejne-budovy.html reference.html reference-panelovy-dum.html system.html revize.html kalkulacka.html kariera.html o-nas.html kontakt.html o-ukazce.html 404.html"
for v in prehled zavady nahlasit revize dokumenty vyuctovani smlouva; do STRANKY="$STRANKY portal.html#$v"; done
for v in prehled poptavky klienti zakazky smlouvy vzory doklady statistiky zavady revize objekty dodavatele ukoly vyuctovani automatizace navstevnost tym nastaveni; do STRANKY="$STRANKY dispecink.html#$v"; done
for tema in svetlo tma; do
  for u in $STRANKY; do
    if [ "$tema" = tma ]; then k="tma; jdi /o-ukazce.html; jdi /$u; kontrast 4.5"; else k="jdi /o-ukazce.html; jdi /$u; kontrast 4.5"; fi
    vystup=$(factory prohlizec "$Z/o-ukazce.html" --krok "$k" 2>&1)
    if ! echo "$vystup" | grep -q "kontrast pod prahem: 0 nálezů"; then
      NALEZY=$((NALEZY + 1)); echo "NÁLEZ $tema $u"; echo "$vystup" | grep -E "kontrast pod prahem|^     |neproběhl" | head -5
    fi
  done
done
echo "kontrast hotovo, stránek s nálezem: $NALEZY"
[ "$NALEZY" -eq 0 ]

# OPERATOR — budovnik

## Co a proč
Návrh webu a klikacího dema systému pro Budovník – facility management (technická, infrastrukturní a ekonomická správa budov), organizace subdodavatelů, revize, smlouvy

## Kde jsme
Viz STATE.md (generuje harness). Poslední shrnutí operátora: —

## Rozhodnutí
- 2026-10-06: projekt založen.

## Pravidla projektu
- Stack: python
- Testy: `uv run pytest -q`
- Nic nad rámec harnessu; obecná pravidla jsou v ~/factory/docs.

## Jak spustit
- `factory run` — spustí běh (kontrakty → workeři → brány → checkpointy)
- `factory status` — stav, otevřené balíčky
- `factory packets` — balíčky čekající na rozhodnutí; `factory answer <id> …`

## 2026-10-07: první verze
- Zadání: web pro facility management společníka (SVJ, komerční, veřejné budovy) + systém
  na organizaci subdodavatelů, revize, smlouvy, dokumentaci. Jméno zvoleno **Budovník**
  (budovnik.cz volná, ARES bez shody k 6. 10. 2026). Samostatná značka, byPalda jen v patičce.
- Vzhled: beton + tuš + stavební žlutá, libela jako znak; řez budovou místo blueprintu
  (blueprint už má Fofrmont). Písmo Archivo + IBM Plex Mono (offline).
- Factory: 11 kontraktů (revize, pracovní dny, kalkulačka, dodavatelé, závady/SLA, smlouvy,
  rozúčtování, fakturace, automatizace, časová osa animace; validace převzata z Fofrmontu),
  **11/11 zelených na jeden běh, 33 iterací, 28 min, 66 testů**. Běh ve worktree
  `../Budovnik-factory` (větev `factory`), pak merge – mezitím šlo psát design bez PATH_POLICY.
- Šablony, CSS, řez budovou, web.js a demo.js (portál + dispečink) psal operátor.
- Build `node build.mjs`, testy `uv run pytest -q`, demo data `uv run python -m tools.demo_data`,
  balíček `./tools/pack.sh`, náhled `.claude/launch.json` v ~/Weby → `budovnik` (port 4390).

## 2026-10-07 (noc): rozsah systému jako CRM byPalda
- Michael: „rozsah systému stejně jak z byPalda.cz“ + texty bez zmínek o subdodávkách
  (subdodávky jen nenápadně ve smlouvě – bod o plnění třetími osobami, § 1935 OZ).
- C-012 až C-025: věrné převody PHP knihoven CRM byPalda do JS; akceptační testy volají
  stejné funkce v PHP (reference/bypalda) i JS a porovnávají výsledek (tests/phpref.py).
  Očekávané hodnoty tedy nepíšu ručně – pravdu drží PHP. C-026 poptávky, C-027 role,
  C-028 statistiky byznysu, C-029 návštěvnost (převzato z Fofrmontu).
- **29/29 zelených**, 109 testů. Pozor: background `factory run` má výchozí limit 30 min,
  druhý běh byl zabit uprostřed – pouštět s `timeout` 7200000 (pokračuje od zelených).
- QR kódy ověřeny nezávisle (OpenCV dekóduje přesně, vč. diakritiky a značky uprostřed).
- Kontrola před nasazením: tools nejsou v repu, skripty ve scratchpadu (Playwright +
  nainstalovaný Chrome, `channel="chrome"`): 245 kombinací stránka×šířka×téma bez nálezu,
  okna (dialogy) zvlášť – moje dřívější kontrola je vynechávala a přetékání dokladu na mobilu
  našly až snímky.

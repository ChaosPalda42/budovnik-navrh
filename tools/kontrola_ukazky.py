"""Kontrola ukázky před odevzdáním – rozložení, okna, doklady, úvodní animace.

    uv run --with playwright python -m tools.kontrola_ukazky http://localhost:4390/
    uv run --with playwright python -m tools.kontrola_ukazky https://chaospalda42.github.io/budovnik-navrh/

Používá nainstalovaný Google Chrome (channel="chrome"), nic nestahuje. Hlásí:
 - chyby JavaScriptu a konzole, selhané požadavky,
 - vodorovné přetékání stránky a prvků, uřezaný text, chybějící nadpis/obsah,
 - totéž uvnitř každého okna (dialogu) – plošná kontrola okna nevidí,
 - každý doklad v interním systému na třech šířkách telefonu,
 - úvodní animaci „web se postaví“ (musí doběhnout a nic nesmí zůstat skryté).
Kontrast se kontroluje zvlášť: `factory prohlizec <url> --krok "kontrast 4.5"`.
Návratový kód 1, když je jakýkoli nález.
"""
from __future__ import annotations

import asyncio
import sys

from playwright.async_api import async_playwright

WEB = ["index.html", "sluzby.html", "technicka-sprava.html", "provozni-sprava.html", "ekonomicka-sprava.html",
       "energeticky-management.html", "pro-koho.html", "bytove-domy.html", "komercni-objekty.html", "verejne-budovy.html",
       "reference.html", "reference-panelovy-dum.html", "reference-administrativni-budova.html", "reference-zakladni-skola.html",
       "reference-logisticky-areal.html", "system.html", "revize.html", "kalkulacka.html", "kariera.html", "o-nas.html",
       "kontakt.html", "o-ukazce.html", "ochrana-udaju.html", "404.html"]
PORTAL = ["portal.html#" + v for v in ["prehled", "zavady", "nahlasit", "revize", "dokumenty", "vyuctovani", "smlouva"]]
DISP = ["dispecink.html#" + v for v in ["prehled", "poptavky", "klienti", "zakazky", "smlouvy", "vzory", "doklady", "statistiky",
                                         "zavady", "revize", "objekty", "dodavatele", "ukoly", "vyuctovani", "automatizace",
                                         "navstevnost", "tym", "nastaveni"]]
VARIANTY = [(320, "light"), (375, "light"), (375, "dark"), (768, "light"), (1440, "light"), (1440, "dark")]
INIT = "try{sessionStorage.setItem('bv-postaveno','1');sessionStorage.setItem('bv-portal-role','vlastnik')}catch(e){}"

MER_STRANKA = """(sirka) => { const ch = [];
 if (document.documentElement.scrollWidth > sirka + 1) ch.push('scrollWidth ' + document.documentElement.scrollWidth);
 const app = /portal|dispecink/.test(location.pathname);
 if (app && !document.querySelector('.apl__hlava h1')) ch.push('bez obsahu');
 if (!app && !document.querySelector('main h1')) ch.push('bez h1');
 document.querySelectorAll('.odhal').forEach(e => e.classList.add('je-videt'));
 for (const e of document.querySelectorAll('main *')) {
  if (e.closest('.duvera, .kanban, .tab-obal, .apl__mobilnav, .laser, dialog, svg, .rez, .kalendar-mesic, .havarie-blok')) continue;
  const r = e.getBoundingClientRect(); if (!r.width) continue; const cs = getComputedStyle(e);
  if (cs.visibility === 'hidden' || cs.display === 'none') continue;
  if (r.right > sirka + 1) ch.push('ven:' + (e.className || e.tagName));
  else if (e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0 && cs.overflowX !== 'visible' && e.textContent.trim())
    ch.push('orez:' + (e.className || e.tagName) + " '" + e.textContent.trim().slice(0, 25) + "'");
  if (ch.length > 5) break; }
 return ch; }"""

MER_OKNO = """() => { const d = document.querySelector('dialog[open]'); if (!d) return ['žádné okno se neotevřelo'];
 const R = d.getBoundingClientRect(); const ch = [];
 if (d.scrollWidth > d.clientWidth + 1) ch.push('okno scrollWidth ' + d.scrollWidth + '>' + d.clientWidth);
 for (const e of d.querySelectorAll('*')) { if (e.closest('.tab-obal')) continue; const r = e.getBoundingClientRect();
   if (r.width && r.right > R.right + 1) { ch.push((typeof e.className === 'string' && e.className || e.tagName) + ' → ' + Math.round(r.right - R.right) + 'px'); if (ch.length > 4) break; } }
 return ch; }"""

OKNA = [
    ("dispecink.html#doklady", "[...document.querySelectorAll('[data-doklad]')][0].click()"),
    ("dispecink.html#doklady", "document.querySelector('[data-novy-doklad]').click()"),
    ("dispecink.html#klienti", "document.querySelector('[data-klient]').click()"),
    ("dispecink.html#klienti", "document.querySelector('[data-novy-klient]').click()"),
    ("dispecink.html#poptavky", "document.querySelector('[data-poptavka]').click()"),
    ("dispecink.html#zavady", "document.querySelector('[data-tiket]').click()"),
    ("dispecink.html#zavady", "[...document.querySelectorAll('[data-tiket]')].find(t => t.innerText.includes('odpad')).click()"),
    ("portal.html#zavady", "document.querySelector('[data-tiket]').click()"),
]

nalezy: list[str] = []


def hlas(*casti) -> None:
    text = " ".join(str(c) for c in casti)
    nalezy.append(text)
    print("NÁLEZ", text, flush=True)


async def stranky(b, z):
    pocet = 0
    for sirka, tema in VARIANTY:
        ctx = await b.new_context(viewport={"width": sirka, "height": 850}, color_scheme=tema, is_mobile=sirka < 700, has_touch=sirka < 700)
        await ctx.add_init_script(INIT)
        page = await ctx.new_page()
        chyby: list[str] = []
        page.on("pageerror", lambda e: chyby.append("JS: " + str(e)))
        page.on("console", lambda m: chyby.append("konzole: " + m.text) if m.type == "error" else None)
        page.on("requestfailed", lambda r: chyby.append("síť: " + r.url) if "ares.gov.cz" not in r.url else None)
        for url in WEB + PORTAL + DISP:
            chyby.clear()
            await page.goto(z + "o-ukazce.html" if "#" in url else z + url, wait_until="networkidle")
            if "#" in url:  # čisté načtení aplikace, ne jen změna kotvy
                await page.goto(z + url, wait_until="networkidle")
            await page.wait_for_timeout(350)
            r = await page.evaluate(MER_STRANKA, sirka)
            pocet += 1
            if r or chyby:
                hlas(sirka, tema, url, r, chyby)
        await ctx.close()
    print(f"stránky: {pocet} kombinací", flush=True)


async def okna(b, z):
    for sirka in (320, 375, 1440):
        ctx = await b.new_context(viewport={"width": sirka, "height": 812}, is_mobile=sirka < 700, has_touch=sirka < 700)
        await ctx.add_init_script(INIT.replace("vlastnik", "vybor"))
        for url, js in OKNA:
            page = await ctx.new_page()
            chyby: list[str] = []
            page.on("pageerror", lambda e: chyby.append(str(e)))
            await page.goto(z + url, wait_until="networkidle")
            await page.wait_for_timeout(400)
            await page.evaluate("async () => {" + js + "}")
            await page.wait_for_timeout(400)
            r = await page.evaluate(MER_OKNO)
            if r or chyby:
                hlas("okno", sirka, url, js[:40], r, chyby)
            await page.close()
        await ctx.close()
    print(f"okna: {len(OKNA) * 3} kombinací", flush=True)


async def doklady(b, z):
    pocet = 0
    for sirka in (320, 375, 414):
        ctx = await b.new_context(viewport={"width": sirka, "height": 812}, is_mobile=True, has_touch=True)
        await ctx.add_init_script(INIT)
        page = await ctx.new_page()
        await page.goto(z + "dispecink.html#doklady", wait_until="networkidle")
        await page.wait_for_timeout(400)
        for druh in ("faktura", "proforma", "nabidka"):
            await page.evaluate(f"() => document.querySelector('[data-druh-dokladu={druh}]').click()")
            await page.wait_for_timeout(150)
            cisla = await page.evaluate("() => [...document.querySelectorAll('[data-doklad]')].map(r => r.getAttribute('data-doklad'))")
            for c in cisla:
                await page.evaluate(f"() => document.querySelector('[data-doklad=\"{c}\"]').click()")
                await page.wait_for_timeout(120)
                r = await page.evaluate(MER_OKNO)
                pocet += 1
                if r:
                    hlas("doklad", sirka, c, r)
                await page.evaluate("() => document.querySelector('dialog[open] [data-zavrit]').click()")
        await ctx.close()
    print(f"doklady: {pocet} kombinací", flush=True)


async def animace(b, z):
    for sirka in (375, 1440):
        for url in ("index.html", "kontakt.html"):
            ctx = await b.new_context(viewport={"width": sirka, "height": 850}, is_mobile=sirka < 700)
            page = await ctx.new_page()
            chyby: list[str] = []
            page.on("pageerror", lambda e: chyby.append(str(e)))
            await page.goto(z + url)
            await page.wait_for_timeout(700)
            behem = await page.evaluate("() => !!document.querySelector('.stavba')")
            await page.wait_for_timeout(3500)
            po = await page.evaluate("""() => ({stavi: document.documentElement.classList.contains('stavi-se'), vrstva: !!document.querySelector('.stavba'),
              skryte: [...document.querySelectorAll('[data-stavba]')].filter(e => getComputedStyle(e).opacity !== '1' && e.getBoundingClientRect().width).length})""")
            if not behem or po["stavi"] or po["vrstva"] or po["skryte"] or chyby:
                hlas("animace", sirka, url, "během", behem, "po", po, chyby)
            await ctx.close()
    print("animace: 4 kombinace", flush=True)


async def main() -> int:
    z = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:4390/"
    if not z.endswith("/"):
        z += "/"
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="chrome", headless=True)
        await stranky(b, z)
        await okna(b, z)
        await doklady(b, z)
        await animace(b, z)
        await b.close()
    print(f"hotovo, nálezů: {len(nalezy)}")
    return 1 if nalezy else 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))

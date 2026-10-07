"""Závěrečná kontrola: každá stránka a pohled × šířka × téma. Hlásí chyby JS, přetékání do strany, uřezaný text a chybějící obsah."""
import asyncio, sys
from playwright.async_api import async_playwright
Z = sys.argv[1]
WEB = ["index.html","sluzby.html","technicka-sprava.html","provozni-sprava.html","ekonomicka-sprava.html","energeticky-management.html","pro-koho.html","bytove-domy.html","komercni-objekty.html","verejne-budovy.html","reference.html","reference-panelovy-dum.html","reference-administrativni-budova.html","reference-zakladni-skola.html","reference-logisticky-areal.html","system.html","revize.html","kalkulacka.html","kariera.html","o-nas.html","kontakt.html","o-ukazce.html","ochrana-udaju.html","404.html"]
PORTAL = ["portal.html#" + v for v in ["prehled","zavady","nahlasit","revize","dokumenty","vyuctovani","smlouva"]]
DISP = ["dispecink.html#" + v for v in ["prehled","poptavky","klienti","zakazky","smlouvy","vzory","doklady","statistiky","zavady","revize","objekty","dodavatele","ukoly","vyuctovani","automatizace","navstevnost","tym","nastaveni"]]
MER = """(sirka) => { const ch = [];
 if (document.documentElement.scrollWidth > sirka + 1) ch.push('scrollWidth ' + document.documentElement.scrollWidth);
 if (location.pathname.match(/portal|dispecink/) && !document.querySelector('.apl__hlava h1')) ch.push('bez obsahu');
 if (!location.pathname.match(/portal|dispecink/) && !document.querySelector('main h1')) ch.push('bez h1');
 document.querySelectorAll('.odhal').forEach(e => e.classList.add('je-videt'));
 for (const e of document.querySelectorAll('main *')) {
  if (e.closest('.duvera, .kanban, .tab-obal, .apl__mobilnav, .laser, dialog, svg, .rez, .kalendar-mesic, .havarie-blok')) continue;
  const r = e.getBoundingClientRect(); if (!r.width) continue; const cs = getComputedStyle(e);
  if (cs.visibility === 'hidden' || cs.display === 'none') continue;
  if (r.right > sirka + 1) ch.push('ven:' + (e.className || e.tagName));
  else if (e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0 && cs.overflowX !== 'visible' && e.textContent.trim()) ch.push('orez:' + (e.className || e.tagName) + " '" + e.textContent.trim().slice(0, 25) + "'");
  if (ch.length > 5) break; }
 return ch; }"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="chrome", headless=True)
        pocet = 0; nalezy = 0
        for sirka, tema in ((320, "light"), (375, "light"), (375, "dark"), (768, "light"), (1440, "light"), (1440, "dark")):
            ctx = await b.new_context(viewport={"width": sirka, "height": 850}, color_scheme=tema, is_mobile=sirka < 700, has_touch=sirka < 700)
            await ctx.add_init_script("try{sessionStorage.setItem('bv-postaveno','1');sessionStorage.setItem('bv-portal-role','vlastnik')}catch(e){}")
            page = await ctx.new_page(); chyby = []
            page.on("pageerror", lambda e: chyby.append("JS: " + str(e)))
            page.on("console", lambda m: chyby.append("console: " + m.text) if m.type == "error" else None)
            page.on("requestfailed", lambda r: chyby.append("síť: " + r.url) if "ares.gov.cz" not in r.url else None)
            for url in WEB + PORTAL + DISP:
                chyby.clear()
                await page.goto(Z + url, wait_until="networkidle")
                if "#" in url: await page.evaluate("() => { window.dispatchEvent(new HashChangeEvent('hashchange')); }")
                await page.wait_for_timeout(350)
                r = await page.evaluate(MER, sirka)
                pocet += 1
                if r or chyby:
                    nalezy += 1; print(sirka, tema, url, r, chyby)
            await ctx.close()
        await b.close()
        print(f"zkontrolováno {pocet} kombinací, nálezů {nalezy}")
asyncio.run(main())

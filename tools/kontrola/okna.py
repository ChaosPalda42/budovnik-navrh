import asyncio, sys
from playwright.async_api import async_playwright
Z = sys.argv[1]
MER = """() => { const d = document.querySelector('dialog[open]'); if (!d) return ['ŽÁDNÉ OKNO'];
 const R = d.getBoundingClientRect(); const ch = [];
 if (d.scrollWidth > d.clientWidth + 1) ch.push('dialog scrollWidth ' + d.scrollWidth + '>' + d.clientWidth);
 for (const e of d.querySelectorAll('*')) { if (e.closest('.tab-obal')) continue; const r = e.getBoundingClientRect(); if (r.width && r.right > R.right + 1) { ch.push((e.className.baseVal !== undefined ? e.tagName : (e.className || e.tagName)) + ' → ' + Math.round(r.right - R.right) + 'px'); if (ch.length > 5) break; } }
 return ch; }"""
OKNA = [
 ("dispecink.html#doklady", "[...document.querySelectorAll('[data-doklad]')].find(r=>r.innerText.includes('FA20260054')).click()"),
 ("dispecink.html#doklady", "document.querySelector('[data-druh-dokladu=nabidka]').click(); await new Promise(r=>setTimeout(r,200)); document.querySelector('[data-doklad]').click()"),
 ("dispecink.html#doklady", "document.querySelector('[data-novy-doklad]').click()"),
 ("dispecink.html#klienti", "document.querySelector('[data-klient]').click()"),
 ("dispecink.html#klienti", "document.querySelector('[data-novy-klient]').click()"),
 ("dispecink.html#poptavky", "document.querySelector('[data-poptavka]').click()"),
 ("dispecink.html#zavady", "document.querySelector('[data-tiket]').click()"),
 ("dispecink.html#zavady", "[...document.querySelectorAll('[data-tiket]')].find(t=>t.innerText.includes('odpad')).click()"),
 ("portal.html#zavady", "[...document.querySelectorAll('[data-tiket]')][0].click()"),
]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="chrome", headless=True)
        for sirka in (375, 1440):
            ctx = await b.new_context(viewport={"width": sirka, "height": 812}, is_mobile=sirka < 700, has_touch=sirka < 700)
            await ctx.add_init_script("try{sessionStorage.setItem('bv-postaveno','1');sessionStorage.setItem('bv-portal-role','vybor')}catch(e){}")
            for url, js in OKNA:
                page = await ctx.new_page(); chyby = []
                page.on("pageerror", lambda e: chyby.append(str(e)))
                await page.goto(Z + url, wait_until="networkidle"); await page.wait_for_timeout(500)
                await page.evaluate("async () => {" + js + "}"); await page.wait_for_timeout(500)
                r = await page.evaluate(MER)
                print(sirka, url, js[:50], "OK" if not r and not chyby else (r, chyby))
                await page.close()
            await ctx.close()
        await b.close()
asyncio.run(main())

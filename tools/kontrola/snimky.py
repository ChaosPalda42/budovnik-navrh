"""Snímky obrazovky ukázky přes Playwright + nainstalovaný Chrome (bez stahování prohlížeče)."""
import asyncio, json, sys
from playwright.async_api import async_playwright

ZAKLAD = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:4390/"
ULOHY = json.load(open(sys.argv[2]))  # [{jmeno, url, sirka, vyska, tema, js, cekat, cela}]

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="chrome", headless=True)
        for u in ULOHY:
            mobil = u.get("sirka", 1440) < 700
            ctx = await b.new_context(viewport={"width": u.get("sirka", 1440), "height": u.get("vyska", 900)}, device_scale_factor=1 if not mobil else 2,
                                      color_scheme=u.get("tema", "light"), is_mobile=mobil, has_touch=mobil)
            await ctx.add_init_script("try{sessionStorage.setItem('bv-postaveno','1')}catch(e){}" + u.get("init", ""))
            page = await ctx.new_page()
            chyby = []
            page.on("pageerror", lambda e: chyby.append(str(e)))
            page.on("console", lambda m: chyby.append(m.text) if m.type == "error" else None)
            await page.goto(ZAKLAD + u["url"], wait_until="networkidle")
            await page.wait_for_timeout(u.get("cekat", 900))
            if u.get("js"):
                await page.evaluate("async () => {" + u["js"] + "}")
                await page.wait_for_timeout(700)
            await page.screenshot(path=u["jmeno"] + ".png", full_page=u.get("cela", False))
            print(u["jmeno"], "CHYBY: " + " | ".join(chyby) if chyby else "ok")
            await ctx.close()
        await b.close()

asyncio.run(main())

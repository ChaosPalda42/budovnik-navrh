import asyncio, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="chrome", headless=True)
        for ulozeny in ("tmavy", "svetly", None):
            for sirka in (1280, 375):
                ctx = await b.new_context(viewport={"width": sirka, "height": 850}, is_mobile=sirka < 700, has_touch=sirka < 700)
                await ctx.add_init_script("sessionStorage.setItem('bv-postaveno','1');" + (f"localStorage.setItem('bv-tema','{ulozeny}');" if ulozeny else ""))
                pg = await ctx.new_page(); await pg.goto(sys.argv[1] + "revize.html", wait_until="networkidle"); await pg.wait_for_timeout(400)
                tema = lambda: pg.evaluate("() => document.documentElement.dataset.tema || '(systém)'")
                t0 = await tema()
                for sel in (".volba >> nth=1", ".volba >> nth=4", "h1", "main p >> nth=0", ".panel >> nth=0"):
                    await pg.locator(sel).first.click(); await pg.wait_for_timeout(150)
                po_klikani = await tema()
                await pg.locator("button.tema").click(); await pg.wait_for_timeout(300)
                po_prepnuti = await tema()
                await pg.locator(".volba >> nth=2").click(); await pg.wait_for_timeout(150)
                po_volbe = await tema()
                ok = t0 == po_klikani and po_prepnuti != t0 and po_volbe == po_prepnuti
                print("OK " if ok else "CHYBA", ulozeny, sirka, t0, "→ po klikání", po_klikani, "→ tlačítko", po_prepnuti, "→ volba", po_volbe)
                await ctx.close()
        await b.close()
asyncio.run(main())

import asyncio, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="chrome", headless=True)
        for sirka in (375, 1440):
            for url in ("index.html", "kontakt.html", "dispecink.html"):
                ctx = await b.new_context(viewport={"width": sirka, "height": 850}, is_mobile=sirka < 700)
                page = await ctx.new_page(); chyby = []
                page.on("pageerror", lambda e: chyby.append(str(e)))
                await page.goto(sys.argv[1] + url)
                await page.wait_for_timeout(700)
                behem = await page.evaluate("() => ({stavi: document.documentElement.classList.contains('stavi-se'), vrstva: !!document.querySelector('.stavba')})")
                await page.wait_for_timeout(3500)
                po = await page.evaluate("() => ({stavi: document.documentElement.classList.contains('stavi-se'), vrstva: !!document.querySelector('.stavba'), skryte: [...document.querySelectorAll('[data-stavba]')].filter(e => getComputedStyle(e).opacity !== '1' && e.getBoundingClientRect().width).length})")
                if url == "index.html" and sirka == 375: await page.screenshot(path="/tmp/budovnik-anim-konec.png")
                print(sirka, url, "během", behem, "po", po, chyby or "")
                await ctx.close()
        await b.close()
asyncio.run(main())

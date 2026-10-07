import asyncio, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="chrome", headless=True)
        ctx = await b.new_context(viewport={"width": 375, "height": 812}, is_mobile=True)
        await ctx.add_init_script("try{sessionStorage.setItem('bv-postaveno','1')}catch(e){}")
        page = await ctx.new_page(); chyby = []
        page.on("pageerror", lambda e: chyby.append(str(e)))
        # 1) poptávka z webu → objeví se v systému
        await page.goto(sys.argv[1] + "kontakt.html", wait_until="networkidle")
        await page.fill("#p-jmeno", "Kontrola Online"); await page.fill("#p-email", "kontrola@example.cz"); await page.fill("#p-adresa", "Testovací 1, Praha")
        await page.fill("#p-rozpocet", "kolem 20 tis. měsíčně"); await page.check("input[name=souhlas]")
        await page.click("#poptavka button[type=submit]"); await page.wait_for_timeout(300)
        await page.goto(sys.argv[1] + "dispecink.html#poptavky", wait_until="networkidle"); await page.wait_for_timeout(600)
        radek = await page.locator("[data-poptavka]").first.inner_text()
        # 2) ARES naživo
        await page.locator("[data-poptavka]").first.click(); await page.wait_for_timeout(400)
        await page.fill("[data-ares-ico]", "02911973"); await page.click("[data-ares-nacti]"); await page.wait_for_timeout(3500)
        ares = await page.locator("[data-ares-vysledek]").inner_text()
        print("poptávka:", radek.replace("\n", " | ")[:120]); print("ARES:", ares.replace("\n", " | ")); print("chyby:", chyby)
        await b.close()
asyncio.run(main())

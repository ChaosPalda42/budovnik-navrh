import asyncio, sys
from playwright.async_api import async_playwright
MER = open(sys.argv[2]).read().split('MER = """')[1].split('"""')[0]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="chrome", headless=True)
        for sirka in (320, 375, 414):
            ctx = await b.new_context(viewport={"width": sirka, "height": 812}, is_mobile=True)
            await ctx.add_init_script("try{sessionStorage.setItem('bv-postaveno','1')}catch(e){}")
            page = await ctx.new_page()
            await page.goto(sys.argv[1] + "dispecink.html#doklady", wait_until="networkidle"); await page.wait_for_timeout(500)
            for druh in ("faktura", "proforma", "nabidka"):
                await page.evaluate(f"() => document.querySelector('[data-druh-dokladu={druh}]').click()"); await page.wait_for_timeout(200)
                cisla = await page.evaluate("() => [...document.querySelectorAll('[data-doklad]')].map(r => r.getAttribute('data-doklad'))")
                for c in cisla:
                    await page.evaluate(f"() => document.querySelector('[data-doklad=\"{c}\"]').click()"); await page.wait_for_timeout(150)
                    r = await page.evaluate(MER)
                    if r: print(sirka, c, r)
                    await page.evaluate("() => document.querySelector('dialog[open] [data-zavrit]').click()")
            print(sirka, "hotovo")
            await ctx.close()
        await b.close()
asyncio.run(main())

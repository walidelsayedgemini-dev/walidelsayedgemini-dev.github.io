# Prints /tmp/cv-en.html and /tmp/cv-ar.html (from scripts/gen_cv.ts) to public/cv/*.pdf with headless Chromium.
import asyncio, os
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


async def main():
    async with async_playwright() as p:
        exe = "/usr/bin/chromium" if os.path.exists("/usr/bin/chromium") else None
        b = await p.chromium.launch(executable_path=exe, args=["--allow-file-access-from-files"])
        for l, name in (("en", "EN"), ("ar", "AR")):
            pg = await b.new_page()
            await pg.goto(f"file:///tmp/cv-{l}.html", wait_until="networkidle")
            await pg.evaluate("document.fonts.ready")
            await pg.wait_for_timeout(400)
            out = f"{ROOT}/public/cv/Walid-Sayed-CV-{name}.pdf"
            await pg.pdf(path=out, format="A4", print_background=True, margin={"top": "0", "bottom": "0", "left": "0", "right": "0"})
            print("wrote", out)
        await b.close()


asyncio.run(main())

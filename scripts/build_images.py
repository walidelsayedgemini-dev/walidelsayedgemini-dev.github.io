"""Builds optimized cover images for the portfolio from assets downloaded out of the user's GitHub repos."""
from PIL import Image, ImageDraw, ImageFilter
import os
A = "/home/ubuntu/assets"
OUT = "/home/ubuntu/walidfolio/public/img"
os.makedirs(OUT, exist_ok=True)
W, H = 1280, 800

def save(im, name, q=80):
    im.convert("RGB").save(f"{OUT}/{name}.webp", "WEBP", quality=q, method=6)
    print(name, os.path.getsize(f"{OUT}/{name}.webp") // 1024, "KB")

def cover_fit(path, size=(W, H)):
    im = Image.open(path).convert("RGB")
    r = max(size[0] / im.width, size[1] / im.height)
    im = im.resize((int(im.width * r + 1), int(im.height * r + 1)), Image.LANCZOS)
    x = (im.width - size[0]) // 2; y = (im.height - size[1]) // 2
    return im.crop((x, y, x + size[0], y + size[1]))

def radial(color, base=(8, 10, 16)):
    bg = Image.new("RGB", (W, H), base)
    glow = Image.new("RGB", (W, H), color)
    mask = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse((W * .15, -H * .1, W * .85, H * 1.1), fill=150)
    mask = mask.filter(ImageFilter.GaussianBlur(160))
    return Image.composite(glow, bg, mask)

def icon_cover(icon, color, name):
    bg = radial(color)
    ic = Image.open(icon).convert("RGBA")
    s = 520
    ic = ic.resize((s, s), Image.LANCZOS)
    m = Image.new("L", (s, s), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, s, s), radius=110, fill=255)
    halo = Image.new("RGBA", (s + 200, s + 200), (0, 0, 0, 0))
    halo.paste(ic, (100, 100), m)
    halo = halo.filter(ImageFilter.GaussianBlur(60))
    bg.paste(halo, ((W - s) // 2 - 100, (H - s) // 2 - 100), halo)
    bg.paste(ic, ((W - s) // 2, (H - s) // 2), m)
    save(bg, name)

# photo covers
save(cover_fit(f"{A}/repo/islamic_prayer_app/garden_sunset_eden.jpg"), "cover-firdaws")
save(cover_fit(f"{A}/repo/the-last-thread/alexandria-street.webp"), "cover-lastthread")
save(cover_fit(f"{A}/repo/who-ate-the-cheese/crew-hero.webp"), "cover-cheese")
save(cover_fit(f"{A}/repo/who-ate-the-cheese/home-night.webp"), "photo-night", 78)

# LinkMe: two mentor characters on blue gradient
bg = radial((40, 90, 230), (6, 12, 30))
for f, cx in (("adv_01.webp", .36), ("art_01.webp", .64)):
    im = Image.open(f"{A}/repo/LinkMe/{f}").convert("RGB").resize((470, 470), Image.LANCZOS)
    m = Image.new("L", (470, 470), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, 470, 470), radius=120, fill=255)
    bg.paste(im, (int(W * cx - 235), 170), m)
save(bg, "cover-linkme")

# Ludo: four character portraits
bg = radial((190, 120, 20), (14, 10, 6))
names = ["pharaoh", "captain", "falcon", "hagga"]
for i, n in enumerate(names):
    im = Image.open(f"{A}/repo/yaseenludo/{n}.webp").convert("RGB").resize((270, 270), Image.LANCZOS)
    m = Image.new("L", (270, 270), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, 270, 270), radius=60, fill=255)
    bg.paste(im, (110 + i * 295, 265 + (i % 2) * 40), m)
save(bg, "cover-ludo")

icon_cover(f"{A}/repo/yaseen-arcade/icon-1024.png", (150, 40, 220), "cover-arcade")
icon_cover(f"{A}/repo/ysn-crime-files/icon-512.png", (190, 30, 60), "cover-crime")
icon_cover(f"{A}/repo/ysn-fit/logo-1024.png", (0, 150, 190), "cover-fit")
icon_cover(f"{A}/repo/ysn-journal/icon-512.png", (90, 70, 210), "cover-journal")

# live screenshots (real, taken from the deployed sites)
for k in ("linkme", "firdaws", "lastthread"):
    im = Image.open(f"{A}/shot_{k}_d.png").convert("RGB").resize((1100, int(1100 * 860 / 1440)), Image.LANCZOS)
    save(im, f"shot-{k}", 82)
    m = Image.open(f"{A}/shot_{k}_m.png").convert("RGB")
    save(m.resize((300, int(300 * 844 / 390)), Image.LANCZOS), f"shotm-{k}", 82)

# avatar + OG
av = Image.open(f"{A}/avatar.jpg").convert("RGB")
save(av.resize((460, 460), Image.LANCZOS), "walid", 86)
og = radial((255, 178, 36), (6, 8, 13)).resize((1200, 630))
a2 = av.resize((380, 380), Image.LANCZOS)
m = Image.new("L", (380, 380), 0); ImageDraw.Draw(m).ellipse((0, 0, 380, 380), fill=255)
og.paste(a2, (110, 125), m)
og.convert("RGB").save(f"/home/ubuntu/walidfolio/public/og.png", optimize=True)

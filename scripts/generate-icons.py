from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
PUBLIC.mkdir(parents=True, exist_ok=True)


def make_icon(size: int) -> Image.Image:
    scale = size / 512
    image = Image.new("RGBA", (size, size), (8, 21, 33, 255))
    draw = ImageDraw.Draw(image)

    def box(coords):
        return tuple(round(value * scale) for value in coords)

    draw.rounded_rectangle(box((18, 18, 494, 494)), radius=round(94 * scale), fill=(11, 35, 49, 255), outline=(42, 101, 117, 255), width=max(1, round(7 * scale)))
    draw.ellipse(box((88, 90, 424, 426)), outline=(66, 214, 206, 255), width=max(2, round(20 * scale)))
    draw.ellipse(box((145, 147, 367, 369)), outline=(240, 195, 106, 255), width=max(2, round(16 * scale)))
    draw.polygon([box((256, 112))[0:2], box((348, 282))[0:2], box((256, 399))[0:2], box((164, 282))[0:2]], fill=(11, 35, 49, 255), outline=(238, 248, 246, 255))
    draw.line([box((256, 142))[0:2], box((256, 360))[0:2]], fill=(238, 248, 246, 255), width=max(2, round(18 * scale)))
    draw.arc(box((197, 178, 315, 320)), 265, 95, fill=(240, 195, 106, 255), width=max(2, round(17 * scale)))
    draw.arc(box((197, 178, 315, 320)), 85, 275, fill=(66, 214, 206, 255), width=max(2, round(17 * scale)))
    return image


master = make_icon(512)
master.save(PUBLIC / "icon-512.png", format="PNG", optimize=True)
make_icon(180).save(PUBLIC / "apple-touch-icon.png", format="PNG", optimize=True)
make_icon(32).save(PUBLIC / "favicon-32.png", format="PNG", optimize=True)

ico_sizes = [16, 32, 48, 64, 128, 256]
ico_images = [make_icon(size) for size in ico_sizes]
ico_images[-1].save(PUBLIC / "favicon.ico", format="ICO", append_images=ico_images[:-1], sizes=[(size, size) for size in ico_sizes])

(PUBLIC / "site.webmanifest").write_text(
    '{\n  "name": "Isle of Reveries Guide",\n  "short_name": "Reveries Guide",\n  "start_url": "/",\n  "display": "standalone",\n  "background_color": "#081521",\n  "theme_color": "#081521",\n  "icons": [\n    {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},\n    {"src": "/apple-touch-icon.png", "sizes": "180x180", "type": "image/png", "purpose": "any"}\n  ]\n}\n',
    encoding="utf-8",
)

print("Generated PNG and multi-size ICO assets in", PUBLIC)

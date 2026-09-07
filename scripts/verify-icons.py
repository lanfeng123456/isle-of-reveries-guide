from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
for base in (ROOT / "public", ROOT / "dist"):
    expected = {
        "icon-512.png": ("PNG", (512, 512)),
        "favicon-32.png": ("PNG", (32, 32)),
        "apple-touch-icon.png": ("PNG", (180, 180)),
    }
    for name, (kind, dimensions) in expected.items():
        with Image.open(base / name) as image:
            assert image.format == kind, f"{base / name}: expected {kind}, got {image.format}"
            assert image.size == dimensions, f"{base / name}: expected {dimensions}, got {image.size}"
    with Image.open(base / "favicon.ico") as ico:
        assert ico.format == "ICO", f"{base / 'favicon.ico'} is not ICO"
        sizes = set(ico.info.get("sizes", []))
        required = {(16, 16), (32, 32), (48, 48)}
        assert required.issubset(sizes), f"ICO missing required sizes: {required - sizes}"
        print(f"{base}: PNG dimensions and ICO sizes verified: {sorted(sizes)}")

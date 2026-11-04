"""Download the Microsoft Learn diagrams referenced in slides/outline/*.md into slides/template/mslearn/.

build_deck.py embeds a downloaded image (PNG/JPG with the same file stem as the URL) instead of the
placeholder panel. SVG files are converted to PNG with cairosvg or rsvg-convert when available.

Usage (needs outbound HTTPS to learn.microsoft.com):
    python3 scripts/slides/fetch_mslearn_images.py
    python3 scripts/slides/build_deck.py
"""
import re
import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "slides" / "template" / "mslearn"


def svg_to_png(svg: Path) -> bool:
    png = svg.with_suffix(".png")
    try:
        import cairosvg  # type: ignore
        cairosvg.svg2png(url=str(svg), write_to=str(png), output_width=1600)
        return True
    except Exception:
        pass
    if shutil.which("rsvg-convert"):
        subprocess.run(["rsvg-convert", "-w", "1600", "-o", str(png), str(svg)], check=True)
        return True
    return False


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    urls = set()
    for md in (ROOT / "slides" / "outline").glob("hari-*.md"):
        urls.update(re.findall(r"https://learn\.microsoft\.com/\S+?\.(?:png|svg|jpg|jpeg)", md.read_text(encoding="utf-8")))
    ok = fail = 0
    for url in sorted(urls):
        dest = OUT / Path(url).name
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "training-slide-builder"})
            with urllib.request.urlopen(req, timeout=30) as r:
                dest.write_bytes(r.read())
            if dest.suffix == ".svg" and not svg_to_png(dest):
                print(f"SVG belum dikonversi (pasang cairosvg atau rsvg-convert): {dest.name}")
            ok += 1
        except Exception as e:  # noqa: BLE001
            print(f"GAGAL {url}: {e}")
            fail += 1
    print(f"Selesai: {ok} berhasil, {fail} gagal. Folder: {OUT}")
    sys.exit(1 if fail else 0)


if __name__ == "__main__":
    main()

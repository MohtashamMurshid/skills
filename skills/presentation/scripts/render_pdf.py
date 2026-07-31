#!/usr/bin/env python3
"""Render a fixed-page HTML presentation to PDF and optional review artifacts."""

from __future__ import annotations

import argparse
import glob
import html
import math
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


def command(name: str) -> str | None:
    return shutil.which(name)


def find_chrome() -> str:
    configured = os.environ.get("CHROME_PATH")
    candidates = [
        configured,
        command("google-chrome"),
        command("google-chrome-stable"),
        command("chromium"),
        command("chromium-browser"),
        command("chrome"),
    ]
    candidates.extend(
        sorted(
            glob.glob(str(Path.home() / ".cache/ms-playwright/chromium-*/chrome-linux*/chrome")),
            reverse=True,
        )
    )
    for candidate in candidates:
        if candidate and Path(candidate).is_file() and os.access(candidate, os.X_OK):
            return candidate
    raise SystemExit("Chrome/Chromium not found. Set CHROME_PATH to an executable browser.")


def run(args: list[str]) -> None:
    subprocess.run(args, check=True)


def print_pdf(chrome: str, source: Path, output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    run(
        [
            chrome,
            "--headless=new",
            "--no-sandbox",
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--run-all-compositor-stages-before-draw",
            f"--print-to-pdf={output}",
            "--no-pdf-header-footer",
            source.resolve().as_uri(),
        ]
    )


def page_count(pdf: Path) -> int | None:
    pdfinfo = command("pdfinfo")
    if not pdfinfo:
        return None
    result = subprocess.run([pdfinfo, str(pdf)], check=True, text=True, capture_output=True)
    for line in result.stdout.splitlines():
        if line.startswith("Pages:"):
            return int(line.split(":", 1)[1].strip())
    return None


def document_title(source: Path) -> str:
    match = re.search(
        r"<title[^>]*>(.*?)</title>",
        source.read_text(encoding="utf-8", errors="replace"),
        flags=re.IGNORECASE | re.DOTALL,
    )
    return re.sub(r"\s+", " ", match.group(1)).strip() if match else source.stem


def flatten_pdf(
    chrome: str, vector_pdf: Path, output: Path, dpi: int, title: str
) -> None:
    pdftoppm = command("pdftoppm")
    if not pdftoppm:
        raise SystemExit("--fast-open requires pdftoppm from Poppler.")

    with tempfile.TemporaryDirectory(prefix="presentation-flat-") as temporary:
        root = Path(temporary)
        pages = root / "pages"
        pages.mkdir()
        run(
            [
                pdftoppm,
                "-jpeg",
                "-r",
                str(dpi),
                "-jpegopt",
                "quality=86,progressive=y,optimize=y",
                str(vector_pdf),
                str(pages / "slide"),
            ]
        )
        images = sorted(pages.glob("slide-*.jpg"))
        if not images:
            raise SystemExit("No slide images were generated while flattening the PDF.")

        page_markup = "\n".join(
            f'<div class="page"><img src="{image.resolve().as_uri()}" alt=""></div>'
            for image in images
        )
        wrapper = root / "flattened.html"
        wrapper.write_text(
            """<!doctype html><html><head><meta charset=\"utf-8\"><title>"""
            + html.escape(title)
            + """</title><style>
@page { size: 13.333333in 7.5in; margin: 0; }
* { box-sizing: border-box; } html, body { margin: 0; padding: 0; }
.page { width: 13.333333in; height: 7.5in; overflow: hidden; break-after: page; }
.page:last-child { break-after: auto; } img { display: block; width: 100%; height: 100%; object-fit: cover; }
</style></head><body>"""
            + page_markup
            + "</body></html>",
            encoding="utf-8",
        )
        print_pdf(chrome, wrapper, output)


def render_review(pdf: Path, review_dir: Path) -> None:
    pdftoppm = command("pdftoppm")
    if not pdftoppm:
        print("warning: pdftoppm unavailable; skipping review images", file=sys.stderr)
        return

    review_dir.mkdir(parents=True, exist_ok=True)
    for existing in review_dir.glob("page-*.png"):
        existing.unlink()
    run([pdftoppm, "-png", "-r", "90", str(pdf), str(review_dir / "page")])

    ffmpeg = command("ffmpeg")
    pages = sorted(review_dir.glob("page-*.png"))
    if not ffmpeg or not pages:
        return

    columns = min(4, max(1, math.ceil(math.sqrt(len(pages)))))
    rows = math.ceil(len(pages) / columns)
    run(
        [
            ffmpeg,
            "-loglevel",
            "error",
            "-y",
            "-pattern_type",
            "glob",
            "-i",
            str(review_dir / "page-*.png"),
            "-vf",
            f"scale=480:-1,tile={columns}x{rows}:padding=12:margin=12:color=eeeeee",
            "-frames:v",
            "1",
            str(review_dir / "contact-sheet.png"),
        ]
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="HTML deck entrypoint")
    parser.add_argument("output", type=Path, help="final PDF path")
    parser.add_argument("--review", action="store_true", help="render page PNGs and a contact sheet")
    parser.add_argument("--review-dir", type=Path, help="review output directory; defaults beside the PDF")
    parser.add_argument("--fast-open", action="store_true", help="deliver a rasterized browser-friendly PDF")
    parser.add_argument("--dpi", type=int, default=144, help="flattening DPI; default: 144")
    parser.add_argument("--keep-vector", action="store_true", help="retain the intermediate vector PDF")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    source = args.source.resolve()
    output = args.output.resolve()
    if not source.is_file():
        raise SystemExit(f"HTML source not found: {source}")
    if args.dpi < 72:
        raise SystemExit("--dpi must be at least 72")

    chrome = find_chrome()
    vector = output.with_name(f"{output.stem}-vector{output.suffix}") if args.fast_open else output
    print_pdf(chrome, source, vector)
    if args.fast_open:
        flatten_pdf(chrome, vector, output, args.dpi, document_title(source))
        if not args.keep_vector:
            vector.unlink(missing_ok=True)

    if args.review:
        review_dir = (args.review_dir or output.parent / f"{output.stem}-review").resolve()
        render_review(output, review_dir)

    pages = page_count(output)
    size_mb = output.stat().st_size / (1024 * 1024)
    page_label = f", {pages} pages" if pages is not None else ""
    print(f"Rendered {output} ({size_mb:.2f} MB{page_label})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

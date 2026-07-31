# Production and validation

## Choose the production surface

- Use HTML/CSS for deterministic PDF output, unusual editorial layouts, procedural texture, or when no editable office format is required.
- Use native PPTX when the user needs PowerPoint editing, speaker notes, or corporate handoff.
- Use native Google Slides when collaboration and browser editing matter.
- Preserve the existing format when redesigning an existing deck unless conversion is requested.

Do not deliver a screenshot-only PPTX or Google Slides deck. Keep text, shapes, tables, and charts editable when editability is part of the request.

## HTML/PDF tooling

- Require Python 3 and Chrome or Chromium. Set `CHROME_PATH` when the browser is not discoverable on `PATH` or in a Playwright cache.
- Require Poppler's `pdftoppm` for `--fast-open` and review PNGs.
- Use ffmpeg when available to assemble `contact-sheet.png`; otherwise inspect individual review PNGs.

Create temporary working files outside the source repository when they are not meant to be committed:

```bash
DECK_DIR=$(mktemp -d /tmp/presentation.XXXXXX)
cp -R <skill-dir>/assets/starters/technical-grid/. "$DECK_DIR/"
```

Substitute `chromatic-grain` or a newly derived system as appropriate.

## Print contract

Use fixed 16:9 pages:

```css
@page { size: 13.333333in 7.5in; margin: 0; }
.slide { width: 13.333333in; height: 7.5in; overflow: hidden; break-after: page; }
```

Avoid viewport units, asynchronous layout changes, CSS animation, hover-dependent content, and remote fonts. Prefer local or embedded assets.

## Render and optimize

Render a vector PDF plus review images:

```bash
python3 <skill-dir>/scripts/render_pdf.py index.html presentation.pdf --review
```

Add `--fast-open` to rasterize each slide at 144 DPI and rewrap it into a browser-friendly PDF. This sacrifices text selection, semantic tagging, and perfect vector scaling.

Use vector output for archival, accessible, or print delivery. Use fast-opening output for browser sharing, especially when grain or procedural texture makes the vector PDF very large. Preserve editable source even when the delivery PDF is flattened.

## Visual review

Inspect the contact sheet first, then open high-risk pages individually:

- cover and logo contrast;
- long editorial statement;
- chart or concentric-data slide;
- process diagram;
- dense comparison, example, or limitations slide;
- closing and references.

Check clipping, headline wrapping, collisions, alignment, chart totals, denominators, source notes, image crops, safe margins, folios, and starter leftovers. Passing lint or export is not visual validation.

If layered textured shapes fragment in browser print, consolidate them into a single SVG, pseudo-element, or radial gradient. If copy collides at the intended display scale, shorten or split it rather than shrinking the whole deck.

## Technical checks

Use `pdfinfo` when available to verify page count, 16:9 page size, encryption state, title, and file size. Open the final shared URL—not only the local file—and confirm HTTP 200, `application/pdf`, and a plausible content length.

For PPTX or Slides, reopen the exported file, inspect thumbnails and representative slides, verify fonts or fallbacks, and confirm text and chart editability.

## Delivery

Provide a direct preview and a download link when serving through an environment. An HTML wrapper with a `download` attribute avoids browser viewers intercepting the download gesture.

State whether temporary paths can disappear after restart. Do not imply that `/tmp` is durable storage.

# Production and validation

## Tooling

- Require Python 3 and Chrome or Chromium to render the PDF. Set `CHROME_PATH` when the browser is not discoverable on `PATH` or in a Playwright cache.
- Require Poppler's `pdftoppm` for `--fast-open` and review PNGs.
- Use ffmpeg when available to assemble `contact-sheet.png`; without it, inspect the individual review PNGs.

## Working directory

Create the deck outside the source repository when editable sources are not meant to be committed:

```bash
DECK_DIR=$(mktemp -d /tmp/editorial-pdf-deck.XXXXXX)
cp -R <skill-dir>/assets/starter/. "$DECK_DIR/"
```

Keep the HTML, rasterized pages, and contact sheet there. Copy only the requested final artifact to a durable location.

## Print contract

The starter uses:

```css
@page { size: 13.333333in 7.5in; margin: 0; }
.slide { width: 13.333333in; height: 7.5in; break-after: page; }
```

Every slide must be a fixed-size page with `overflow: hidden`. Avoid viewport units, asynchronous layout changes, CSS animation, and content that depends on hover or user input.

Wait for fonts before printing. Prefer local or embedded fonts; remote font requests make rendering fragile and non-reproducible.

## Rendering

Render a vector PDF plus review images:

```bash
python3 <skill-dir>/scripts/render_pdf.py index.html presentation.pdf --review
```

Add `--fast-open` to rasterize each slide at 144 DPI and rewrap the pages into a browser-friendly PDF. This output loads predictably in browser PDF viewers but sacrifices text selection, semantic tagging, and perfect vector scaling.

Use the vector PDF for archival, accessible, or print-oriented delivery. Use the fast-opening PDF for investor sharing and quick browser preview. When practical, retain both and label them clearly.

## Visual review

Inspect `review/contact-sheet.png` first, then open individual page PNGs for anything suspicious.

Check every slide for:

- clipping at page edges;
- unexpected headline wrapping;
- collisions between labels, arrows, cards, and footer;
- inconsistent baseline or card heights;
- unreadable body text or citations;
- low-contrast logos and marks over gradients;
- chart totals, denominators, and source notes;
- sequential folios and correct page count;
- accidental leftovers from the starter.

The contact sheet is a navigation aid, not the final proof. Inspect dense, diagrammatic, and code-heavy slides at full resolution.

## Technical checks

Use `pdfinfo` when available to verify:

- expected page count;
- `960 × 540 pt` or equivalent 16:9 page size;
- no encryption;
- reasonable file size.

Open the final served or downloaded URL, not only the local file. Confirm an HTTP 200 response, the `application/pdf` content type, and a plausible content length.

## Delivery

Provide a direct file link and, when serving through an environment, a separate download page with an HTML `download` attribute. The direct PDF route is useful for preview; the wrapper avoids browser viewers intercepting the download gesture.

State whether temporary files may disappear after a restart. Do not imply that a file in `/tmp` is durable storage.

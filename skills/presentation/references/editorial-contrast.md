# Editorial contrast

Use this system when the user wants a deck with stark editorial authority: black and warm paper, oversized display-serif claims, red evidence labels, small monospaced notation, thin technical rules, and a few tactile image-led slides.

The approved sample is the Oikina project overview:

- `../assets/references/editorial-contrast/oikina-contact-sheet.jpg`
- `../assets/references/editorial-contrast/oikina-project-overview.pdf`

Inspect the contact sheet first. Open the PDF only when a specific slide needs full-resolution study. The sample is design evidence. Do not carry over Oikina's name, copy, logo, generated hero, product claims, or amber-and-blue brand palette unless Oikina is the actual subject.

## What to transfer

### Hierarchy

- Use one dominant display-serif sentence per slide.
- Let a headline occupy roughly half the canvas when the slide is a thesis, definition, or transition.
- Keep body copy to one short paragraph or a few terse rows. Mono labels should feel like evidence stamps, not navigation chrome.

### Rhythm

Alternate modes rather than repeating one template:

1. image-led cover;
2. warm-paper thesis and compact evidence form;
3. black comparison or positioning map;
4. large editorial claim over a ruled process;
5. definition or is/is-not comparison;
6. current-state architecture with a truth ledger;
7. product or interface evidence;
8. target-system or boundary diagram;
9. use-case matrix;
10. roadmap and image-led close.

The sequence is a menu, not a required slide count. Preserve the alternation between sparse statements, structured evidence, and image moments.

### Color and texture

- Start with near-black `#090907`, warm paper `#eeeae1`, and vermilion `#ef351d`.
- Derive secondary colors from the subject's brand. Keep them low-chroma inside images or small status marks.
- Add fine scan lines or paper grain at low opacity. Never put noisy texture directly behind body copy.
- Use imagery sparingly. One strange, tactile image with negative space is stronger than a collage of generic technology pictures.

### Type

- Display: Bodoni, Didot, or another high-contrast serif with tight leading and optical sizing when available.
- Body: a plain grotesk or humanist sans.
- Labels and folios: a restrained mono.
- Fit the copy to the intended type scale. Shorten the sentence before shrinking the headline.

### Geometry

- Use a stable 4–6% outer margin and a thin footer strip.
- Draw comparisons and timelines with 1px rules, square corners, and minimal fill.
- Use circles only for containment, boundaries, or network reach.
- Keep diagrams sparse. A small number of exact labels carries more authority than decorative circuitry.

## Truth labeling

This system often puts product reality beside product direction. Label states directly:

- `LIVE`, `CURRENT`, or `OBSERVED` for verified behavior;
- `TARGET`, `PLANNED`, or `PHASE N` for direction;
- `ILLUSTRATIVE` for mock interfaces, modeled values, and conceptual diagrams.

Do not let a beautiful target-state slide read as shipped capability. Place the status label near the headline or the specific element it qualifies.

## Imagery

Generated imagery is appropriate for a cover, boundary metaphor, or closing image when the reference depends on tactile photographic texture. Request negative space for copy and exclude readable text, logos, generic server racks, and glossy corporate 3D. Use native geometry for every diagram and data-bearing element.

## Production

Copy `assets/starters/editorial-contrast/` into the working directory. Replace every starter sentence, token, and footer label.

Render and inspect the vector source first. For browser sharing, create a separate flattened PDF:

```bash
python3 <skill-dir>/scripts/render_pdf.py deck.html deck.pdf \
  --fast-open --keep-vector --dpi 120
```

Use 120 DPI for fast screen review and 144 DPI when the deck contains fine interface screenshots. The flattened PDF opens faster because each page has one raster image. Keep the vector PDF for selectable text, accessibility, and print scaling.

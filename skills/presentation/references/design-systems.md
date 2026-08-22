# Design systems

Use these systems as reusable grammars, not fixed brands. Keep one system coherent across a deck unless a section divider intentionally changes mode.

## Shared foundations

- Default canvas: 16:9 landscape.
- Safe margin: 4–6% on every edge.
- Use a modern neo-grotesk sans and a restrained mono face for labels when available.
- Give each slide one dominant message and reserve 30–50% negative space on many slides.
- Use sentence case, tight display leading, direct labels, quiet folios, and exact source notes.
- Alternate composition types. Do not repeat the same card grid on every slide.
- Keep body text readable at fit-to-screen size; restructure instead of shrinking.
- Use code-native or native-slide geometry for charts and diagrams that carry exact values.

## Technical grid

Choose this for research, infrastructure, governance, architecture, technical investor, and evidence-heavy narratives.

### Visual grammar

- Near-white paper with a faint 12-column technical grid.
- One primary color, derived dark and pale tones, plus rare lavender and peach distinctions.
- Oversized sentence-case headlines with at most one colored phrase.
- Thin bordered evidence cards, small monospaced labels, fine rules, and precise folios.
- Atmospheric cover made from soft radial color fields rather than literal imagery.
- Flat diagrams, direct labels, minimal shadows, and restrained corner radius.

### Starting tokens

```css
:root {
  --primary: #0789df;
  --primary-dark: #005ca8;
  --primary-pale: #dff1ff;
  --ink: #111820;
  --muted: #60707c;
  --paper: #fbfcfd;
  --line: #dce4ea;
  --lavender: #d9d8ff;
  --peach: #ffdcd2;
}
```

Use `#ef9700` as a useful orange starting point or `#0789df` for blue; tune for contrast and brand fit.

### Recurring compositions

1. cloud-gradient cover with framed safe area;
2. thesis plus four evidence cards;
3. six-metric grid;
4. left-to-right pipeline;
5. stacked source-composition bar;
6. structured example or interface evidence;
7. limitations matrix;
8. closing thesis and next milestone.

## Chromatic grain

Choose this for brand, studio, product, creative, launch, and research decks that need a more expressive public-facing presence.

### Visual grammar

- White slides with sparse black type and small edge chrome.
- Full-bleed cover built from orange, pink, violet, blue, and gold color fields with controlled grain.
- Large, tightly led headlines; emphasize one phrase with a warm-to-cool gradient.
- Thin black rules and columns instead of card-heavy layout.
- Organic gradient blobs used asymmetrically, often touching or leaving the page edge.
- Soft concentric forms for truly nested magnitude or audience hierarchy.
- Simple icon-led process nodes on a thin line.
- Small, quiet brand and section labels in the top corners.

### Starting tokens

```css
:root {
  --ink: #0c0d0f;
  --paper: #ffffff;
  --orange: #ff5328;
  --gold: #ffc33d;
  --pink: #ff61bd;
  --violet: #9a63ff;
  --blue: #174ee9;
  --line: #cfd1d5;
}
```

Use a compact noise tile or frozen raster texture. Keep grain visible in color fields but absent from body-copy areas.

### Recurring compositions

1. full-bleed chromatic cover with a very large title at the lower edge;
2. large editorial paragraph on white with one organic blob occupying the opposite half;
3. centered claim above three ruled columns;
4. left thesis plus right concentric magnitude form;
5. five-step icon process over a thin horizontal rule;
6. paired comparison inside one large rounded frame;
7. three numbered study or service columns;
8. white closing slide with a cropped blob and one next milestone.

### Production lessons

- Procedural noise can make a vector PDF tens of megabytes. Preserve the editable source, then use a fast-opening flattened delivery PDF when text selection is not required.
- Build concentric textured forms as one radial-gradient or SVG shape. Multiple overlapping absolute circles can fragment during browser printing.
- Large editorial copy must be rewritten to fit the reference's scale. Do not keep every source sentence and then compensate with smaller type.
- Keep colored headline gradients short. Long multicolor paragraphs lose hierarchy.

## Editorial contrast

Choose this for project overviews, company narratives, product positioning, manifestos, and design-partner decks that need a sharper editorial voice than either bundled system.

Before using it, read [editorial-contrast.md](editorial-contrast.md) and inspect the approved contact sheet in `../assets/references/editorial-contrast/`.

### Visual grammar

- Alternate deep black and warm paper slides. Use a saturated vermilion label or phrase as the recurring signal.
- Pair a high-contrast display serif with a plain sans and compact mono. Headlines should occupy real space and often carry the whole slide.
- Keep fine rules, outlined evidence boxes, sparse diagrams, and a narrow light footer strip consistent across the deck.
- Use amber, rust, and muted blue inside images. Keep diagrams mostly monochrome with rare red or amber status marks.
- Treat dense slides as editorial plates: align content to a few strong anchors, then let small captions and technical notation supply detail.
- Use tactile generated or sourced imagery only on selected cover, boundary, or closing slides. Preserve large areas of quiet black or paper.

### Starting tokens

```css
:root {
  --ink: #090907;
  --paper: #eeeae1;
  --red: #ef351d;
  --amber: #dfa216;
  --blue: #7aa4b3;
  --display: "Bodoni MT", Didot, Georgia, serif;
  --sans: Manrope, Arial, sans-serif;
  --mono: "DM Mono", Consolas, monospace;
}
```

### Recurring compositions

1. image-led black cover with a left-aligned display headline and the subject held to one side;
2. warm-paper thesis with a large two- or three-line claim and a compact evidence form;
3. black comparison or architecture slide with sparse outlined geometry;
4. current-versus-target product boundary with explicit status labels;
5. interface or artifact evidence framed beside a short editorial claim;
6. three-column roadmap with the current phase rendered as a solid red field;
7. dark closing image with one final imperative and direct contact action.

### Production lessons

- Rewrite source prose to preserve the display scale. A smaller headline weakens the system faster than a shorter sentence does.
- Use the red signal consistently for evidence labels, current-state emphasis, or one decisive phrase. Do not scatter it as decoration.
- Keep capability truth visible. Mark `current`, `target`, `planned`, or `illustrative` directly on the slide when states differ.
- Flatten textured sharing PDFs with `scripts/render_pdf.py --fast-open`; keep the vector HTML render separately when print scaling or selectable text matters.

## Selection guide

| Signal | Technical grid | Chromatic grain | Editorial contrast |
| --- | --- | --- | --- |
| Audience | technical, investor, governance | public, brand, product, conference | design partners, company, product, manifesto |
| Mood | precise, quiet, credible | expressive, confident, memorable | stark, literary, tactile, evidence-aware |
| Data density | medium to high | low to medium | low to medium, with selected dense plates |
| Structure | grid, cards, fine diagrams | rules, columns, large shapes | oversized claims, ruled plates, sparse maps |
| Color | one dominant hue | coordinated warm-to-cool spectrum | black/paper plus one signal color |
| Texture | subtle cloud or line texture | visible grain inside color fields | scan lines, paper grain, selective imagery |

If the user provides a distinct reference, derive another grammar instead of forcing it into a bundled system.

## Anti-patterns

- Matching only the palette while ignoring layout, type scale, density, and image treatment.
- Generic templates with excessive pills, rounding, gradients, or shadows.
- Dense paragraphs copied directly from source material.
- Decorative charts, unlabeled curves, or invented values.
- More visual motifs than the reference can support coherently.
- Logos placed over low-contrast areas.
- Tiny citations or body copy that fail at fit-to-screen size.
- Flattening editable PPTX or Slides deliverables into full-slide screenshots.

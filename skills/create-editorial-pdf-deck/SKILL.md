---
name: create-editorial-pdf-deck
description: Create polished 16:9 PDF presentations from papers, briefs, repositories, notes, and product material using an airy editorial system of oversized typography, fine grids, soft color-field gradients, evidence cards, and restrained diagrams. Use when asked for an investor deck, research presentation, technical narrative, company overview, or conference-style PDF—especially when the user references the bundled grid-and-gradient style, wants a chosen primary color, needs a fast-opening downloadable PDF, or explicitly wants a PDF rather than PowerPoint or Google Slides.
---

# Create Editorial PDF Deck

Produce the finished PDF, not only an outline. Treat the bundled design as a reusable grammar: clear thesis, large type, fine technical grids, thin rules, diffuse color fields, precise labels, and generous negative space.

## Operating rules

- Ground every factual claim, number, date, attribution, and quotation in supplied or verified material.
- Invent framing and visual language; never invent traction, market size, experimental results, citations, or capabilities.
- Prefer 10–16 slides unless the source demands otherwise. Give every slide one job and one memorable sentence.
- Default to 16:9 landscape PDF. Do not create PPTX unless the user separately asks for an editable deck.
- Use the requested primary color. Derive pale, dark, and secondary tones from it; keep the palette restrained.
- Keep body text large enough to read at fit-to-screen size. Move detail into notes, appendices, or source material rather than shrinking type.
- Work with the available browser and PDF tools. Do not require a specific model, agent, or vendor.

## Workflow

### 1. Inspect the source

Read the supplied paper, repository, brief, screenshots, and brand assets before designing. Build a private fact ledger with:

- exact claim or metric;
- authoritative source and location;
- confidence or uncertainty;
- intended slide;
- whether the item is observed, estimated, planned, or illustrative.

If the source is a paper, inspect the bibliography, tables, figures, limitations, and evaluation protocol. If it is a company deck, inspect product, market, traction, business model, competition, team, and ask. Label absent investor metrics instead of fabricating them.

### 2. Choose the narrative track

Read [references/narrative-blueprints.md](references/narrative-blueprints.md), then choose the investor, research, or hybrid blueprint.

Write a one-line thesis for the deck and a one-line job for each slide. Test the sequence as plain text before styling. Remove slides that repeat the same argument.

### 3. Apply the design system

Read [references/design-language.md](references/design-language.md) before implementation.

Required visual characteristics:

- a quiet 12-column technical grid on light slides;
- one atmospheric color-field cover or section divider;
- oversized sentence-case headlines with one colored phrase;
- small monospaced labels, folios, rules, and source notes;
- thin bordered evidence cards and code-native diagrams;
- abundant white space and restrained use of the primary color.

Copy `assets/starter/` into a temporary working directory. Replace its sample content, set the `--primary` CSS variable in `deck.css`, and extend the existing components instead of rebuilding the visual system from scratch.

### 4. Compose evidence, not decoration

Use the smallest visual that makes the relationship obvious:

- exact comparisons: table or aligned cards;
- composition: stacked bar or 100% strip;
- process: left-to-right stages with short verbs;
- hierarchy: tree or nested frames;
- sequence: timeline;
- one decisive number: oversized metric with a short qualifier.

Build charts and diagrams in HTML/CSS/SVG so values and labels remain exact. Use generated imagery only as an atmospheric layer, never as the authoritative representation of data.

### 5. Render and review

Read [references/production.md](references/production.md), then run:

```bash
python3 <skill-dir>/scripts/render_pdf.py ./deck/index.html ./deck/presentation.pdf --review --fast-open
```

Inspect the generated contact sheet and any suspicious slides individually. Check headline wrapping, card alignment, chart labels, citations, safe margins, contrast, and page count. Revise and rerender until the visual proof is clean.

Use `--fast-open` for browser-friendly delivery when selectable text is not required. Also retain the vector PDF when accessibility, selectable text, or print fidelity matters.

### 6. Deliver

Report:

- final PDF path and file size;
- page count and aspect ratio;
- whether the PDF is vector or fast-opening rasterized output;
- source and citation limitations;
- any claims intentionally omitted because evidence was unavailable.

Keep working HTML, rasterized pages, and review images in a temporary directory unless the user asks to retain editable sources.

## Resources

- [references/design-language.md](references/design-language.md) — palette, grid, typography, components, and anti-patterns.
- [references/narrative-blueprints.md](references/narrative-blueprints.md) — investor, research, and hybrid slide sequences.
- [references/production.md](references/production.md) — rendering, review, optimization, and delivery guidance.
- `assets/starter/` — runnable three-slide HTML/CSS deck using the visual system.
- `scripts/render_pdf.py` — Chromium PDF renderer with optional fast-open flattening and review sheets.

## Completion contract

Deliver a visually inspected, source-grounded PDF that opens reliably. Do not claim completion from a successful render alone; inspect the rendered pages, correct layout defects, and verify the final download artifact.

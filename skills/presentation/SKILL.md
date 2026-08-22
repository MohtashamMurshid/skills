---
name: presentation
description: Create, redesign, and deliver polished presentation decks from papers, briefs, repositories, notes, product material, or existing slides. Use when asked for a presentation, slide deck, pitch deck, investor deck, research talk, technical narrative, company overview, product story, conference deck, or a restyle based on reference images. Support PDF, editable HTML, PPTX, and Google Slides according to the requested output; use the bundled technical-grid, chromatic-grain, or editorial-contrast systems when they fit, and derive a new design grammar when another visual reference is supplied.
---

# Presentation

Produce the finished deck, not only an outline. Convert evidence into a coherent argument, then give that argument an intentional visual system and validate the rendered slides.

## Operating rules

- Ground every factual claim, number, date, attribution, and quotation in supplied or verified material.
- Invent framing and visual language; never invent traction, market size, experimental results, citations, testimonials, or capabilities.
- Prefer 10–16 slides unless the purpose demands otherwise. Give every slide one job and one memorable sentence.
- Respect the requested format. Default to a 16:9 PDF plus editable HTML source only when the user does not specify a format.
- Treat reference images as design evidence. Transfer their grammar—hierarchy, composition, texture, color behavior, and rhythm—not their brand identity or proprietary copy.
- Keep text readable at fit-to-screen size. Shorten and restructure copy before reducing type.
- Work with the available presentation, browser, image, and PDF capabilities. Do not require a specific agent, model, or provider.

## Workflow

### 1. Inspect the source and deliverable

Read the supplied paper, repository, brief, screenshots, existing deck, and brand assets before designing. Establish audience, decision, speaking context, output format, deadline, and whether editable sources must remain.

Build a private fact ledger with the exact claim, source, confidence, intended slide, and whether it is observed, estimated, planned, or illustrative. Label missing evidence instead of filling gaps with plausible numbers.

### 2. Build the narrative spine

Read [references/narrative-blueprints.md](references/narrative-blueprints.md) and choose the closest blueprint. Write:

- one sentence for the deck thesis;
- one sentence for each slide's job;
- the full headline sequence without body copy.

The headlines alone should form an argument. Remove repeated slides and topic-label headings such as “Market” or “Methodology.”

### 3. Select or derive the visual system

When reference images are supplied, read [references/reference-analysis.md](references/reference-analysis.md) before styling. Otherwise, read [references/design-systems.md](references/design-systems.md) and select a bundled system:

- `technical-grid` for restrained research, infrastructure, governance, and investor narratives;
- `chromatic-grain` for bold brand, studio, product, and high-energy research narratives.
- `editorial-contrast` for high-contrast product, brand, manifesto, and project-overview narratives with display-serif headlines, black/paper alternation, evidence labels, and tactile image moments. Read [references/editorial-contrast.md](references/editorial-contrast.md) and inspect its approved Oikina sample before using it.

Copy the matching folder from `assets/starters/` into a temporary working directory. Adapt its components and tokens; never leave starter copy in the final deck.

### 4. Compose evidence

Use the smallest visual that makes the relationship obvious:

- exact comparisons: table or aligned columns;
- composition: stacked bar or 100% strip;
- process: stages with short verbs;
- hierarchy: tree or nested frames;
- sequence: timeline;
- nested magnitude: concentric forms only when containment is real;
- one decisive number: oversized metric with its unit, denominator, and source.

Build authoritative charts and diagrams in native presentation geometry, HTML/CSS/SVG, or the target slide tool. Generated imagery may create atmosphere, never the data layer.

### 5. Implement the requested format

- **PDF or HTML:** use a bundled HTML starter and [references/production.md](references/production.md).
- **PPTX:** preserve editability with native text, shapes, tables, charts, and image assets; do not flatten the whole deck into slide screenshots.
- **Google Slides:** use native Slides elements and preserve the selected system's geometry, type scale, and color tokens.
- **Existing deck:** preserve its format and architecture unless the user explicitly requests conversion.

For a newly supplied or materially different visual reference, show a representative proof before treating the style as settled. Apply feedback to the whole deck only after the direction is validated.

### 6. Render and inspect

Never claim completion from a successful export alone. Inspect a contact sheet, then examine dense, diagrammatic, and texture-heavy slides at full resolution.

Check headline wrapping, collisions, alignment, chart labels, citations, safe margins, contrast, logo visibility, page order, and accidental starter content. Revise and rerender until the proof is clean.

### 7. Deliver

Provide the final artifact, editable source when requested, page count, aspect ratio, file size, and validation performed. State source limitations and any claims omitted for lack of evidence.

Keep intermediate HTML, rasterized pages, and review images in a temporary directory unless the user asks to retain them.

## Resources

- [references/reference-analysis.md](references/reference-analysis.md) — extract a reusable design grammar from screenshots or an existing deck.
- [references/design-systems.md](references/design-systems.md) — shared foundations plus the technical-grid, chromatic-grain, and editorial-contrast systems.
- [references/editorial-contrast.md](references/editorial-contrast.md) — the approved Oikina-derived editorial system, slide archetypes, truth-labeling rules, and fast-open delivery pattern.
- [references/narrative-blueprints.md](references/narrative-blueprints.md) — investor, research, product, and hybrid story structures.
- [references/production.md](references/production.md) — HTML/PDF rendering, optimization, review, and delivery.
- `assets/starters/technical-grid/` — restrained grid-and-gradient HTML starter.
- `assets/starters/chromatic-grain/` — bold grain, oversized-type, and concentric-form HTML starter.
- `assets/starters/editorial-contrast/` — stark serif-led HTML starter for high-contrast product and company narratives.
- `assets/references/editorial-contrast/` — approved Oikina contact sheet and fast-opening reference PDF. Treat these as design evidence, not copy or brand assets.
- `scripts/render_pdf.py` — Chromium renderer with optional fast-open flattening and review sheets.

## Completion contract

Deliver a source-grounded, visually inspected presentation that opens reliably in the requested format. Preserve editability when requested, and verify the actual shared or downloaded artifact rather than only the local source.

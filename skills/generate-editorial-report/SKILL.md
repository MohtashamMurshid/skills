---
name: generate-editorial-report
description: Transform arbitrary source material into an art-directed editorial report inspired by vintage annual reports, with evidence-led writing, responsive horizontal web presentation, optional static/PDF export, SEO, and generated archival figures. Use when Codex is asked to turn notes, research, project data, company information, portfolios, case studies, or mixed source files into a report, field guide, annual report, dossier, visual essay, or sliding/paginated report—especially when the user wants image generation, strong editorial art direction, or the bundled reference design.
---

# Generate Editorial Report

Turn supplied facts into a coherent, visually authored report. Default to a responsive sliding website that becomes a vertical document on compact screens. Support print/PDF or static HTML when requested.

## Operating defaults

- Preserve facts, dates, names, quotations, measurements, and source attribution.
- Invent presentation language, section titles, folio labels, and visual metaphors; never invent evidence.
- Treat the report as an editorial argument, not a decorated data dump.
- Use the bundled design as a grammar, not a brand to copy verbatim.
- Ask only when audience, output format, or publication authority cannot be inferred safely. Otherwise proceed with labeled assumptions.
- Produce the artifact and validate it; do not stop at a plan or mood board.

## Workflow

### 1. Inspect the source and environment

Read the supplied material and explore the codebase before asking questions. Establish:

- authoritative inputs and their recency;
- report audience and purpose;
- output surface and existing framework;
- claims requiring citations or uncertainty labels;
- available media, logos, charts, and brand constraints.

Create a compact fact ledger before writing: claim, evidence, source, confidence, and destination section. Do not expose this ledger unless useful to the user.

### 2. Choose the report form

Use these defaults:

- **Web report:** responsive horizontal spreads on desktop, vertical reading on compact screens.
- **Print/PDF:** paginated portrait or landscape pages with the same hierarchy and restrained motion removed.
- **Existing app:** adapt the current stack and components; avoid replacing architecture unnecessarily.
- **No requested length:** use 6–10 spreads/pages. Every page must have one job.

Read [references/report-blueprint.md](references/report-blueprint.md) before mapping a long or heterogeneous source.

### 3. Build the editorial spine

Select only the sections supported by the material:

1. Cover: title, author/entity, edition/date, one visual premise.
2. Preface or executive memorandum: why the report exists and what changed.
3. Overview: the central findings, operations, or thesis.
4. Dossiers: one subject, project, or finding per spread.
5. Evidence: interfaces, photographs, quotations, tables, or diagrams.
6. Register/inventory: structured facts, capabilities, chronology, or metrics.
7. Field notes: process, uncertainty, limitations, or future work.
8. Colophon/sources: authorship, methods, credits, and contact/citations.

Write headings that carry meaning. Keep body copy concise enough to preserve negative space. Use captions as evidence, not decoration.

### 4. Apply the visual system

Read [references/design-language.md](references/design-language.md) before styling or laying out the artifact.

Required characteristics:

- warm paper, near-black ink, one muted oxidized accent, and one cool institutional accent;
- high-contrast editorial serif plus restrained monospaced labels;
- large asymmetric headlines, hairline rules, folios, registers, and generous negative space;
- photographs, interfaces, and illustrations treated as evidence plates;
- deliberate alignment to a grid even when elements overlap;
- subtle paper texture without reducing legibility.

Avoid pasted-on rectangles, random vintage decoration, excessive sepia, tiny body text, ornamental charts, or overlaps that cross important content and navigation.

### 5. Create figures and diagrams

Read [references/image-direction.md](references/image-direction.md) before generating any visual.

- Use the `imagegen` skill and image-generation tool for covers, metaphorical figures, engravings, textures, and photo treatments.
- Generate one distinct asset per prompt/call and validate each output before integration.
- Use code-native SVG/HTML/canvas for charts, maps, timelines, and diagrams requiring exact values or labels. Image generation may provide a decorative companion plate, never the authoritative data layer.
- Prefer transparent cutouts or backgrounds matched to the report paper. Remove chroma keys and validate alpha edges when needed.
- Give every informative figure accurate alt text, a caption, and a source/credit when applicable.
- Do not reuse a bundled illustration merely because it exists. Reuse only when its metaphor fits; otherwise use it as a style reference for a new report-specific asset.

### 6. Implement the default web report

Read [references/implementation-notes.md](references/implementation-notes.md) before coding a website.

Core behavior:

- desktop: one viewport-wide spread at a time, horizontal snap, wheel-to-horizontal navigation, keyboard controls, visible progress, and reduced-motion support;
- compact: normal vertical document flow, sticky compact header, no horizontal overflow, and no full-screen navigation overlay;
- content remains semantic and indexable; do not render primary copy into images or canvas;
- images use stable aspect ratios and intentional focal positions; never crop faces or essential diagram labels;
- add metadata, canonical URL, social cards, JSON-LD when appropriate, semantic headings, descriptive links, and alt text.

Use `assets/reference-implementation/` as an implementation reference. Adapt it rather than copying its personal content, titles, routes, or data.

### 7. Validate proportionally to risk

For web reports, verify at least:

- 390px phone;
- 899px compact boundary;
- 900px presentation boundary;
- 1280px desktop;
- a short desktop viewport near 720px height.

Check:

- no horizontal document overflow in compact mode;
- header height and safe-area behavior;
- every spread can be reached by pointer, wheel, and keyboard;
- no figure covers text, captions, folios, or controls;
- image crops preserve subjects and labels;
- reduced-motion behavior;
- console, lint, type, and build checks supported by the project;
- print/PDF pagination when requested;
- factual claims against the source ledger.

Iterate after visual inspection. Passing lint is not visual validation.

## Bundled resources

- `references/design-language.md`: palette, typography, grid, and art-direction rules.
- `references/report-blueprint.md`: source-to-section mapping patterns.
- `references/image-direction.md`: figure selection and image-generation prompts.
- `references/implementation-notes.md`: responsive web, SEO, accessibility, and validation guidance.
- `assets/reference-implementation/`: the original Next.js/CSS report implementation; reference only.
- `assets/figures/`: reusable or reference-only generated artwork. Consult the asset roles in the image-direction reference.

## Completion contract

Deliver the finished artifact, a concise summary of the editorial choices, generated-asset paths and prompts, source/citation notes, and the validation performed. State any unresolved factual or production limitations explicitly.

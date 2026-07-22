# Design language

## Core idea

Combine the authority of a late-20th-century annual report with a speculative field dossier. The result should feel printed, measured, quiet, and slightly uncanny—not like a generic “vintage” theme.

## Palette

Use these values as a starting point, then adjust for supplied branding:

| Role | Default |
|---|---|
| Paper | `#eee8d2` |
| Light paper | `#f5f0de` |
| Ink | `#181c17` |
| Muted ink | `#5f604f` |
| Oxide accent | `#9e542f` |
| Institutional teal | `#426863` |
| Ochre | `#b8954c` |

Keep contrast accessible. Use accents sparingly for evidence, states, or rules—not every heading.

## Typography

- Display/editorial: EB Garamond or a similarly expressive old-style serif.
- Registry/metadata: IBM Plex Mono or a restrained monospaced face.
- Body: the editorial serif at a comfortable measure and line height.
- Use very large headings with tight leading; use mono labels at small but readable sizes with tracking.
- Avoid using more than two font families unless an existing brand system requires it.

## Page anatomy

- Use a consistent outer frame: roughly 7vw side padding and 8–12vh vertical padding on desktop.
- Align headlines, evidence cards, figures, captions, folios, and rules to a small number of shared axes.
- Reserve 30–50% of many spreads as negative space.
- Use one dominant idea per spread.
- Let rules, page numbers, and register labels establish continuity.
- Overlap only when the relationship is meaningful and both elements remain legible.

## Evidence plates

- Interfaces: place inside a thin ruled card with a metadata header/footer.
- Photography: use documentary crops, visible captions, and restrained contrast/sepia treatment.
- Engravings: integrate as transparent ink on paper or match the exact paper tone.
- Tables: use hairline rules, generous row spacing, and mono metadata.
- Quotations: treat as findings with clear attribution, not oversized filler.

Never leave a visibly different rectangular paper color behind an illustration. Never allow an image to collide with the footer or cover ledger text.

## Motion

- Use calm 500–700ms reveals and snap transitions.
- Avoid parallax, bouncing, gratuitous rotation, and continuous motion.
- Respect `prefers-reduced-motion` and keep the report fully usable without animation.

## Responsive transformation

Desktop behaves like a bound presentation: horizontal spreads, fixed chrome, and page progress. Compact mode behaves like a readable document: vertical flow, sticky compact header, normal scrolling, and smaller but still meaningful plates.

Do not merely shrink the desktop composition. Reorder and restack it.

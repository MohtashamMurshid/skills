# Design language

Use this system as a grammar, not a fixed brand. Replace the primary color and content while preserving the hierarchy, geometry, restraint, and evidence-first composition.

## Canvas and grid

- Format: 16:9 landscape, `13.333333in × 7.5in` in print CSS.
- Safe margin: `0.55in–0.7in` on all sides.
- Base grid: 12 columns with faint 1px lines; add horizontal divisions at the same visual weight.
- Align headline edges, card boundaries, diagrams, captions, and folios to the grid.
- Reserve roughly 30–50% of many slides as negative space.

Use a white or near-white base. Keep grid lines between 6% and 12% opacity so they structure the page without becoming the subject.

## Color system

Set one primary color and derive the rest:

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

- Primary: headlines, key metrics, process arrows, and one chart series.
- Pale primary: callout backgrounds and subtle bands.
- Ink: almost all body copy and structural text.
- Lavender and peach: rare category differentiation; never compete with the primary.
- Cover: use soft radial gradients that bloom from white into the primary color, with one darker edge for depth.

For orange decks, start around `#ef9700`. For blue decks, start around `#0789df`. Adjust for contrast rather than preserving an exact hex value.

## Typography

- Use a modern neo-grotesk sans when available; otherwise `Inter`, `Arial`, or `Helvetica Neue`.
- Use a monospaced face for eyebrow labels, folios, units, and source notes.
- Cover title: 52–72px equivalent, tightly led.
- Slide title: 36–52px equivalent, 0.92–1.02 line-height.
- Card title: 16–22px equivalent.
- Body: 13–18px equivalent; never solve overflow with tiny type.
- Labels: 8–11px equivalent, uppercase, moderate tracking.

Use sentence case. Color no more than one phrase in a headline. Avoid all-caps display text and excessive bolding.

## Recurring components

### Cover

- Atmospheric full-bleed gradient.
- Small date/category label above the title.
- Two-line thesis-sized title in the lower-left quadrant.
- Short descriptor in the lower-right quadrant.
- Small brand or project lockup in the upper-right.
- Thin white frame and corner ticks.

### Evidence cards

- White fill, 1px neutral border, square or barely rounded corners.
- Tiny blue index in the upper-right.
- One bold heading, one or two lines of explanation, optional source note.
- Equal heights within a row.

### Metrics

- Large primary-colored number.
- Short black descriptor.
- Small qualifier that defines denominator, date, source, or status.
- Never show a number without its unit or scope.

### Diagrams and charts

- Prefer flat geometry, fine strokes, and direct labels.
- Use arrows only to show actual direction or dependency.
- Annotate axes and denominators; do not use unlabeled decorative curves.
- Avoid 3D, shadows, glossy fills, gauges, donut charts with many segments, and stock illustration.

### Footer

- Small section label on the left, source or confidentiality marker near the center, and folio on the right.
- Keep the footer inside the safe margin and visually quieter than all slide content.

## Density and rhythm

Alternate slide types to create pace:

1. atmospheric cover;
2. thesis with four evidence cards;
3. metric grid;
4. process or system diagram;
5. full-width data composition;
6. example or interface evidence;
7. limitations or decision slide;
8. closing thesis.

Do not use the same card grid on every slide. Use at least three composition types across a deck while keeping typography and alignment consistent.

## Anti-patterns

- Generic presentation templates with pills, gradients on every card, or excessive rounding.
- Dense paragraphs copied from the source.
- Tiny citations that become unreadable after export.
- Decorative charts with invented values.
- More than two saturated colors on one slide.
- Multiple unrelated claims competing in one headline.
- Logos placed over a low-contrast portion of the cover.
- Raster screenshots when the same evidence can be represented more clearly as native text or geometry.

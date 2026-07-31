---
name: draw-technical-diagrams
description: Draw precise SVG technical figures in the idiom of an engineering manual — isometric exploded views, cutaway sections, height-field surfaces — with computed geometry, leader-line callouts, hatched section fills, and CSS-only hover interactions. Use when asked for a technical illustration, isometric or exploded diagram, cutaway or section drawing, blueprint, patent-style or drafted figure, an annotated architecture diagram, or a diagram that animates on hover; and when hand-written SVG looks geometrically sloppy and needs rebuilding.
---

# Draw Technical Diagrams

Produce figures that look drafted, not drawn. The difference is almost never artistic skill — it is that every coordinate was computed by a projection function, every stroke belongs to one deliberate hierarchy, and every label is attached to its part by a leader line.

Hand-typed coordinates are the single largest source of ugly SVG. A human cannot keep parallel edges parallel across forty vertices, so the drawing reads as approximate no matter how carefully it is tweaked. Compute the geometry and the precision is free.

## The contract

Seven rules produce the drafted look. Breaking any one is visible immediately.

1. **Spatial coordinates are computed, never typed.** Anything with depth comes from a projection function. Only flat 2D sections may use literal coordinates.
2. **One stroke hierarchy across the whole set**: silhouette `1.4`, surface `1`, detail `0.6`. Three weights, reused everywhere.
3. **Strokes are declared in device pixels** via `vector-effect: non-scaling-stroke`. Figures are scaled by their container, so hairlines must stay hairlines.
4. **Depth is paint order, not opacity.** Nearer parts are opaque and painted last. Never fake occlusion with alpha — translucent overlaps are the tell of an amateur figure.
5. **Every label is a callout**: a leader line with an arrowhead touching the part, and the label aligned to the plate margin so all callouts share one edge.
6. **Label text gets a paper-coloured knockout** (`paint-order: stroke`) so leaders and text can cross artwork and stay legible.
7. **One hue plus paper.** Derive tints with `color-mix`, never with opacity.

## Workflow

```
- [ ] 1. Choose the projection
- [ ] 2. Set up the plate
- [ ] 3. Compute the geometry
- [ ] 4. Paint back to front
- [ ] 5. Annotate with callouts
- [ ] 6. Make it perform on hover
- [ ] 7. Verify enlarged in a browser
- [ ] 8. Check the set reads as one document
```

### 1. Choose the projection

| Subject | Projection |
| --- | --- |
| Parts stacked, layered, or assembled | Isometric exploded view on a shared vertical axis |
| Interior of a physical object | Orthographic section, hatched where the cut plane passes through material |
| Two-variable data or a landscape | Isometric height field |
| Pure topology with no spatial claim | Flat plan view — do not fake 3D |

Mixing an isometric figure with a section figure in one document is good practice; it is what real manuals do. Mixing two different isometric angles is not.

### 2. Set up the plate

Every figure sits on a bordered plate: a hairline rectangle, tick marks along the edges, the figure number rotated into the left margin, and an optional caption rotated into the right margin. Give the `<svg>` a `role="img"`, a `<title>`, and a `<desc>` — a figure that carries real information must carry it for screen readers too.

Copy `assets/figure-scaffold.tsx` for the plate, callout, arrowhead, and hatch primitives, and `assets/diagram.css` for the stroke vocabulary. The scaffold is plain SVG in JSX; the same markup ports to any template language.

### 3. Compute the geometry

Copy `assets/iso.ts`. It projects world `(x, y, z)` to screen space with `y` up, so vertical motion is a pure screen translate — which is what lets an exploded stack share one axis and lets hover lift parts apart cleanly.

It provides plates, slabs with walls and a silhouette outline, ruled grids, individual grid cells and their centres, discs and cylinder walls, and depth-sorted height-field quads.

For a section view, work in flat 2D coordinates on a single centre axis, and read [references/projection.md](references/projection.md) for how to build hollow shells, springs, and cut material.

### 4. Paint back to front

Order is the whole algorithm for hidden-line removal:

1. Ghosted construction lines and the explode axis.
2. Solids from farthest to nearest. Per solid: side walls, then the opaque top face, then interior detail, then the heavier silhouette outline last.
3. Any path that travels *through* the assembly — after the solids it crosses, or it will be painted over and vanish.
4. Callouts, always last.

### 5. Annotate with callouts

Give the label its own vertical level when it cannot sit level with its part, and let the leader elbow across. Stack all labels against one margin edge; never scatter them next to the parts. Number them `01`, `02`, `03` in reading order.

A leader may cross hatched material to reach an interior part — that is standard drafting practice, and the text knockout keeps it readable.

Details, spacing rules, and stroke conventions: [references/drafting-language.md](references/drafting-language.md).

### 6. Make it perform on hover

The figure should demonstrate what it documents. An exploded stack pulls further apart; a key switch presses and fires its signal; a surface highlights the cell under the pointer. Decorative motion that has nothing to do with the subject cheapens a technical figure.

Four moves cover almost everything, all CSS-only, so figures stay static markup with no client-side JavaScript:

```css
.diagram:hover .part      { transform: translateY(var(--lift)); }   /* explode further   */
.diagram:hover .travel    { transform: translateY(var(--travel)); } /* actuate a part    */
.diagram:hover .compress  { transform: scaleY(var(--compress)); }   /* compress a spring */
.diagram:hover .trace     { animation: march 700ms linear infinite; } /* signal travels  */
```

Per-part `--lift` is set inline from the part's own height, so the explode is proportional rather than uniform. Isolating one part on hover uses `:has`:

```css
.diagram:has(.part:hover) .part:not(:hover) { opacity: 0.32; }
```

Full catalogue, easing, and the reduced-motion contract: [references/interaction.md](references/interaction.md).

### 7. Verify enlarged in a browser

Do not trust the geometry, and do not judge a figure at its rendered size. Enlarge it to roughly full viewport width and screenshot it. Every defect listed under Failure modes was invisible at page scale and obvious at full width.

Then verify hover by forcing the `:hover` pseudo-state and **measuring**, rather than eyeballing two screenshots — a 13px shift is easy to miss by eye and trivial to confirm from a bounding box.

Expect three or four rounds. Method, including a fallback when no browser automation is available: [references/verification.md](references/verification.md).

### 8. Check the set reads as one document

Lay the figures side by side and confirm shared stroke weights, one type scale, one hue, consistent callout alignment, matching plate margins, and continuous figure numbering. A set that shares conventions reads as a manual; a set that does not reads as clip art.

## Failure modes

| Symptom | Cause |
| --- | --- |
| Hatch or gradient fill silently missing | `fill: url(#id)` in an external stylesheet resolves the fragment against the *stylesheet's* URL, not the document. Set the paint as an attribute instead. |
| Hatch renders but is nearly invisible | `vector-effect: non-scaling-stroke` was inherited into the `<pattern>` tile, or the tile's line sits on the tile boundary where half of it is clipped. Exempt pattern content and centre the line in the tile. |
| A near part is overlapped by a far one | Wrong paint order, or the near part's fill is `none` instead of the paper colour. |
| A dashed path through the assembly is invisible | It was painted before the opaque solids it crosses. |
| Leader lines collapse into stubs | The label edge sits too close to the target. Move the margin out, or give the label its own level. |
| Sub-captions clipped at the plate border | Long sub-caption text. Shorten it or move the label edge inward; measure, do not guess. |
| A highlighted grid cell lands in the wrong place | The `divisions` used to rule the grid differs from the one used to look the cell up. Derive both from one constant. |
| `transform-origin` ignored on an SVG group | SVG defaults to `transform-box: fill-box`. Set `transform-box: view-box` to use viewBox coordinates. |
| Marching dashes stutter each loop | The `stroke-dashoffset` keyframe must equal exactly one dash period. |
| Text is unreadable where it crosses mesh | Missing the `paint-order: stroke` knockout. |
| Ellipses look wrong on an isometric plane | A circle on a horizontal plane projects to an axis-aligned ellipse with a fixed axis ratio; compute it, do not guess `ry`. |

## Resources

- [references/projection.md](references/projection.md) — isometric math, slabs, height fields, discs, section construction
- [references/drafting-language.md](references/drafting-language.md) — stroke hierarchy, hatching, callouts, plates, type, colour
- [references/interaction.md](references/interaction.md) — hover catalogue, SVG transform rules, reduced motion
- [references/verification.md](references/verification.md) — the enlarge-and-measure loop, forcing hover states
- `assets/iso.ts` — isometric geometry module, no dependencies
- `assets/diagram.css` — stroke, type, and interaction vocabulary
- `assets/figure-scaffold.tsx` — plate, callout, arrowhead, and hatch primitives

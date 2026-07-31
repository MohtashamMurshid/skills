# Drafting language

The conventions that separate a technical figure from a generic illustration. They are worth following exactly, because their whole value is that they are shared: a reader who knows one figure can read the next.

## Stroke hierarchy

Three weights, no more:

| Weight | Role |
| --- | --- |
| `1.4` | Silhouette of a solid — the outer boundary, drawn last over its own surface lines |
| `1` | Surface edges, faces, walls |
| `0.6` | Detail: grids, mesh, interior hairlines |

Plus the annotation and construction weights: leaders `0.85`, plate frame and dashed construction lines `0.75`, section cut outlines `1.1`.

Declare all of them in **device pixels** with `vector-effect: non-scaling-stroke`. Figures get scaled by their container, and without this a 0.6 detail line scaled 1.6× lands at 0.96 and stops reading as a detail line. The one exception is `<pattern>` content: pattern tiles are only a few units across, so their strokes must scale with the tile.

## Line types

| Line | Style | Means |
| --- | --- | --- |
| Explode axis | `2 6` dashes, 50% opacity | The line parts are pulled apart along |
| Ghost / construction | `4 5` dashes, 40% opacity | Where something was, or a projection guide |
| Centre line | `14 4 2 4` long-dash/short-dash | Axis of symmetry |
| Trace | `5 3.5` dashes, full weight | A path travelling through solid material |
| Hatch | 45°, 7-unit tile | Material the cut plane passes through |

The centre-line dash pattern is not decorative — long-dash/short-dash specifically means "axis of symmetry" to anyone who reads drawings.

## Depth

**Never use opacity to suggest depth.** Nearer parts are opaque and painted later. A face filled with the paper colour occludes what is behind it, which is all hidden-line removal requires.

Translucent overlapping planes are the single clearest signal of a diagram that was drawn rather than drafted, because they show geometry that a real drawing would have hidden.

Tint with `color-mix(in srgb, var(--accent) N%, var(--paper))`. The result is opaque at every tint level, so overpainting still occludes.

## Callouts

Every label is attached to its part:

- Leader line from the label's margin, level with the label, elbowing to the part.
- Arrowhead touching the feature, using `orient="auto-start-reverse"` so one marker works in both directions.
- Label aligned to a shared margin edge — all left labels end at one x, all right labels start at one x. Labels scattered beside their parts destroy the drafted look faster than anything else.
- Index numbers `01`, `02`, `03` in reading order, at 50% opacity.
- Optional sub-caption beneath the title at 8.5px, 52% opacity: a unit, a material, a pair of keywords.

When a label cannot sit level with its part, give it its own level and let the leader elbow across. Keep at least ~24 units between label levels so title and sub-caption blocks do not collide.

Leaders may cross hatched material to reach an interior part. This is standard drafting practice, and the text knockout keeps everything legible.

### Knockout

Label text needs a paper-coloured outline painted *under* the glyphs:

```css
paint-order: stroke;
stroke: var(--paper);
stroke-width: 3.5px;
stroke-linejoin: round;
```

Without `paint-order: stroke` the stroke paints over the glyphs and the text turns into paper-coloured mush. With it, text stays readable over mesh, hatch, and leader lines, which in turn frees the layout from having to route around artwork.

## The plate

Every figure sits on the same furniture:

- Hairline border rectangle inset by half a unit, so the stroke lands on the pixel.
- Tick marks every 24 units along the top and bottom edges, 5 units long.
- Figure number rotated `-90°` into the left margin.
- Optional caption rotated `-90°` into the right margin — the view name, a state, a scale note: `SECTION A—A / SWITCH AT REST`, `EXPLODED VIEW / TRACE THE SIGNAL`.

Keep top and bottom margins within a few units of each other. An asymmetric plate looks like a mistake even when the artwork is good.

## Type

One mono family for every piece of text in the figure. Sizes: plate margin 8px, callout title 10px, sub-caption 8.5px, prose note 9px italic. Letter-spacing 0.09–0.16em, widest on the smallest text.

Uppercase for callout titles and margins; sentence case only for a prose note. Avoid sub-captions longer than about 20 characters — they overrun the plate border, and the fix is always to shorten the words rather than to move the margin.

## Colour

One hue plus paper. The accent carries every stroke through `currentColor`, so a figure re-brands by changing one custom property.

Resist a second hue for emphasis. Emphasis comes from stroke weight, from the `01`/`02` indices, and from tint level — all of which survive being printed in grey.

# Motion language

Numbers and judgements that make a coded sequence read as designed rather than
programmed. Treat them as defaults to depart from deliberately.

## Timing

| Element | Duration |
| --- | --- |
| Whole film | 40–60s |
| One shot | 5–8s |
| Cross-shot fade | 0.35–0.45s, shots overlapping by the same amount |
| Text or card entrance | 0.9–1.3s |
| Stagger step between siblings | 0.10–0.18s |
| Typed line | 0.9–1.3s regardless of length |
| Travel across the frame | 2.5–3.5s |
| Hold after the last element lands | ≥1.0s |
| Endcard hold | 1.2–1.8s |

The hold is not padding. A shot whose last element arrives 0.2s before the cut
feels rushed no matter how well it animates, and the viewer never gets to read
the thing the shot exists to say.

Under 0.6s an entrance reads as a pop. Over 1.6s it reads as a stall.

## Easing

| Ease | Use |
| --- | --- |
| `outQuint` | Authoritative arrivals: masked headlines, cards locking in, drawn paths |
| `outCubic` | General entrances, fades, typing progress |
| `inOut` | Travel, sweeps, progress bars, counters |
| `outBack` | A mark or badge landing, with slight overshoot. Once per film |

Never use linear for anything an eye tracks. Never use a bounce or elastic ease
in a product film; it reads as a toy.

Only one element should overshoot in the whole sequence. Overshoot is emphasis,
and emphasis everywhere is emphasis nowhere.

## Movement

Entrance offsets: 20–50px translate, or 0.94→1 scale. Larger distances read as a
different scene arriving rather than an element settling.

Combine at most two properties per element — usually opacity plus one transform.
Three or more and the motion turns to mush.

Move in one direction per shot. If cards rise, the label should not slide down to
meet them.

Loops must be sinusoidal and small: `1 + Math.sin(t * 1.4) * 0.012` is a
breathing scale a viewer feels but cannot point to. Rotation of a brand mark
almost always looks like a bug.

## Typography at 1080p

| Role | Size |
| --- | --- |
| Hero headline | 130–170px |
| Section headline | 60–90px |
| Card title | 28–34px |
| Body and lede | 18–24px |
| Mono labels and eyebrows | 11–14px, letter-spaced 0.06em |
| Absolute floor | 16px |

Tighten tracking as size grows: −0.07em at hero scale, −0.02em at body scale.
Untracked large type is the clearest tell of a coded film.

Two families at most: one sans for statements, one mono for machine text.
Machine text — commands, paths, keys, durations, versions — belongs in mono and
must never be uppercased by a utility class.

## Composition

Keep a consistent margin, 100–120px at 1080p, and let the vignette do the rest.

Fill the frame or centre in it, but do not stack everything in the top half. A
top-heavy shot with 300px of dead space at the bottom is the most common
composition failure in a coded film, and it only becomes visible in a still.

One idea per shot. If a shot needs a second column to feel balanced, make that
column subordinate: a short mono list, a caption, a count — never a second
headline competing with the first.

Never let a connector line cross type. Route it around, or move the type.

## Colour and light

Take the palette from the product. Add nothing except neutral steps between the
values already there.

One accent carries emphasis. A second accent halves the meaning of the first.

Large blurred radial glows (60–100px blur) do most of the atmospheric work.
Animate their opacity, not their position; a moving glow draws attention to
itself instead of to the content.

Vignette every frame — a radial fade to near-black at the corners keeps 1080p
from looking like a web page screenshot.

## Copy

Every line on screen should be a fact or a claim the product can defend. Read
the source material and quote it.

Headlines under seven words. Body copy under 25. If a sentence needs a comma to
survive, it belongs in the docs, not the film.

Mono eyebrows should label, not sell: `01 · install`, not `blazing fast setup`.

If the film shows something unshipped, mark it once, visibly, on the title card
and nowhere else.

## Frame furniture

Corner ticks, a timecode, a shot index, a project slug. It costs four small
elements and makes the sequence feel like a broadcast asset rather than a web
animation.

Fade furniture in after the cold open and out before the endcard, so the first
and last frames are clean and usable as thumbnails. Keep it under 20% opacity
white and 10–11px; furniture that competes with content is a mistake.

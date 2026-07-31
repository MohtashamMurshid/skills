# Projection and geometry

## The isometric transform

`assets/iso.ts` is the whole of it:

```ts
const COS_30 = Math.cos(Math.PI / 6);

export function iso(x: number, y: number, z: number): Point {
  return [(x - z) * COS_30, (x + z) / 2 - y];
}
```

World `x` runs to the lower-right, `z` to the lower-left, `y` is up. Screen `y` grows downward, so world `y` appears with its sign flipped.

The property worth understanding: **world `y` contributes only to screen `y`**. Vertical motion in the world is therefore a pure screen translate. That is what lets an exploded stack share a single vertical axis, and what lets a CSS `translateY` on hover pull parts apart while keeping the projection exact.

## Circles on a horizontal plane

A circle on a horizontal plane projects to an axis-aligned ellipse with a fixed axis ratio. Do not guess it:

```ts
const DISC_RX = Math.SQRT2 * COS_30;  // ≈ 1.2247
const DISC_RY = Math.SQRT1_2;         // ≈ 0.7071
```

`disc(radius, y)` returns `{ cx, cy, rx, ry }` ready for an `<ellipse>`. Because the ellipse is axis-aligned, no rotation is needed — a guessed `ry` is the most common reason isometric cylinders look wrong.

`cylinderWall(radius, y, height)` returns the wall outline: down the left side, a half-ellipse arc across the bottom rim, back up the right. Paint the wall, then the top disc over it.

## Building solids

`slab(halfX, halfZ, y, thickness)` returns everything one rectangular solid needs:

| Field | Use |
| --- | --- |
| `face` | Upper surface. Fill with the paper colour so it occludes. |
| `leftWall`, `rightWall` | The two visible side walls. |
| `outline` | Silhouette of the whole solid, for the heavier final pass. |
| `front`, `right`, `back`, `left` | Corner points, for callout targets and axis lines. |

Paint order per solid: `leftWall`, `rightWall`, `face`, interior detail, then `outline`.

Target callouts at real vertices — `slab().left`, a `plateCellCenter`, a disc rim — rather than at coordinates near a part. An arrowhead that lands a few units off its feature is visible.

## Grids on a plane

`plateGrid(halfX, halfZ, y, divisions)` rules a full grid; `plateCell(...)` returns one cell's polygon and `plateCellCenter(...)` its centre point.

**Derive `divisions` from one shared constant.** Ruling a grid with 8 divisions while looking a cell up with 10 puts the highlight in the wrong place, and the drawing still looks plausible enough that the bug survives review.

## Height fields

`surfaceQuads(halfX, halfZ, divisions, amplitude, height)` samples a `(u, v) => number` function over `[-1, 1]²` and returns quads **already sorted back to front**, each with a normalised `level` for tinting.

Painting them in order gives correct hidden-line removal with no depth buffer and no per-frame sorting: each quad is opaque, so a nearer quad simply covers the one behind it. Tint from `level` with `color-mix`, never with opacity — translucent quads reveal the ones they should be hiding.

For a solid-looking landscape, add a skirt from the surface's outer edge down to a floor plane. Watch the winding: each skirt quad runs edge point, next edge point, next floor point, floor point. Getting that order wrong produces stray triangles that are hard to diagnose from the rendered result.

## Section views

A section is flat 2D, drawn on one vertical centre axis. Literal coordinates are correct here — there is no projection to get wrong — but keep every part symmetric about the axis by construction, mirroring offsets rather than typing both sides independently.

Conventions that make a section read as a section:

- **Hatch every region the cut plane passes through.** Unhatched interiors read as empty space.
- **Draw solid parts as one closed path** where they are one piece. A housing whose walls and base are separate polygons shows seams that imply parts that do not exist. Trace the outer boundary and back through the cavity in a single path:

  ```
  M204 152 H272 V176 H230 V268 H370 V176 H328 V152 H396 V286 H204 Z
  ```

  That is a U-shaped housing in section: outer wall down, across the bottom, up the far wall, in along the lip, and back through the cavity.

- **Hollow shells** use two subpaths and `fillRule="evenodd"` — outer profile plus inner profile — so the hatch fills only the wall thickness.
- **Distinguish materials.** Hatched for moulded or fibrous material, solid pale for metal. A narrow hatched part reads as blank, because a 10-unit-wide region only catches one or two hatch lines.
- **Centre line** in long-dash/short-dash, extending a little past the part.
- **Springs** are drawn with the schematic zigzag, closing on the coil axis at both ends:

  ```ts
  function springPath(axis, top, bottom, halfWidth, turns) {
    const step = (bottom - top) / turns;
    const points = [[axis, top]];
    for (let turn = 0; turn < turns; turn += 1) {
      points.push([axis + (turn % 2 === 0 ? halfWidth : -halfWidth), top + step * (turn + 0.5)]);
    }
    points.push([axis, bottom]);
    return polyline(points);
  }
  ```

  Keep the turn count low enough that each turn is not much wider than it is tall, or the coil reads as a zigzag line. Draw the spring *before* the shaft it surrounds so the shaft occludes its middle; drawn after, it reads as a squiggle lying on top.

- **Do not let mechanisms overlap.** Give the spring, the shaft tip, and the contacts their own vertical bands, meeting only where they actually touch. Crowding them into the same 20 units produces a tangle at exactly the point the figure is meant to explain.

/**
 * Geometry helpers for true isometric technical drawings.
 *
 * World axes: x runs to the lower-right, z to the lower-left, y is up.
 * Screen y grows downward, so vertical world motion is a pure screen translate —
 * which is what lets exploded stacks share one vertical axis.
 */

const COS_30 = Math.cos(Math.PI / 6);

/** A circle on a horizontal plane projects to an axis-aligned ellipse with these ratios. */
const DISC_RX = Math.SQRT2 * COS_30;
const DISC_RY = Math.SQRT1_2;

export type Point = readonly [number, number];

const round = (value: number) => Math.round(value * 100) / 100;

export function iso(x: number, y: number, z: number): Point {
  return [(x - z) * COS_30, (x + z) / 2 - y];
}

export function polyline(points: readonly Point[]): string {
  return points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${round(x)} ${round(y)}`)
    .join(" ");
}

export function polygon(points: readonly Point[]): string {
  return `${polyline(points)} Z`;
}

export function segment(from: Point, to: Point): string {
  return polyline([from, to]);
}

export function drop([x, y]: Point, distance: number): Point {
  return [x, y + distance];
}

/** The four corners of a horizontal rectangle, ordered front, right, back, left. */
export function plateCorners(halfX: number, halfZ: number, y: number): Point[] {
  return [
    iso(halfX, y, halfZ),
    iso(halfX, y, -halfZ),
    iso(-halfX, y, -halfZ),
    iso(-halfX, y, halfZ),
  ];
}

export function plate(halfX: number, halfZ: number, y: number): string {
  return polygon(plateCorners(halfX, halfZ, y));
}

export type Slab = {
  /** Upper surface. */
  readonly face: string;
  /** The +x wall, facing lower-right. */
  readonly rightWall: string;
  /** The +z wall, facing lower-left. */
  readonly leftWall: string;
  /** Outer edge of the whole solid, for a heavier silhouette pass. */
  readonly outline: string;
  readonly front: Point;
  readonly right: Point;
  readonly back: Point;
  readonly left: Point;
};

/** A rectangular slab of the given thickness hanging below plane `y`. */
export function slab(
  halfX: number,
  halfZ: number,
  y: number,
  thickness: number
): Slab {
  const [front, right, back, left] = plateCorners(halfX, halfZ, y) as [
    Point,
    Point,
    Point,
    Point,
  ];

  return {
    face: polygon([front, right, back, left]),
    rightWall: polygon([front, right, drop(right, thickness), drop(front, thickness)]),
    leftWall: polygon([front, left, drop(left, thickness), drop(front, thickness)]),
    outline: polygon([
      back,
      right,
      drop(right, thickness),
      drop(front, thickness),
      drop(left, thickness),
      left,
    ]),
    front,
    right,
    back,
    left,
  };
}

/** Evenly spaced lines ruled across a horizontal rectangle. */
export function plateGrid(
  halfX: number,
  halfZ: number,
  y: number,
  divisions: number
): string {
  const lines: string[] = [];

  for (let step = 1; step < divisions; step += 1) {
    const ratio = (step / divisions) * 2 - 1;
    lines.push(segment(iso(halfX * ratio, y, -halfZ), iso(halfX * ratio, y, halfZ)));
    lines.push(segment(iso(-halfX, y, halfZ * ratio), iso(halfX, y, halfZ * ratio)));
  }

  return lines.join(" ");
}

/** One cell of a `divisions`-square grid ruled across a horizontal rectangle. */
export function plateCell(
  halfX: number,
  halfZ: number,
  y: number,
  divisions: number,
  column: number,
  row: number
): string {
  const stepX = (halfX * 2) / divisions;
  const stepZ = (halfZ * 2) / divisions;
  const x0 = -halfX + column * stepX;
  const z0 = -halfZ + row * stepZ;

  return polygon([
    iso(x0, y, z0),
    iso(x0 + stepX, y, z0),
    iso(x0 + stepX, y, z0 + stepZ),
    iso(x0, y, z0 + stepZ),
  ]);
}

/** Centre of a grid cell, in screen space. */
export function plateCellCenter(
  halfX: number,
  halfZ: number,
  y: number,
  divisions: number,
  column: number,
  row: number
): Point {
  const stepX = (halfX * 2) / divisions;
  const stepZ = (halfZ * 2) / divisions;

  return iso(-halfX + (column + 0.5) * stepX, y, -halfZ + (row + 0.5) * stepZ);
}

export type Disc = {
  readonly cx: number;
  readonly cy: number;
  readonly rx: number;
  readonly ry: number;
};

export function disc(radius: number, y: number): Disc {
  return {
    cx: 0,
    cy: round(-y),
    rx: round(radius * DISC_RX),
    ry: round(radius * DISC_RY),
  };
}

/** Outline of a cylinder standing on plane `y - height`, top rim at `y`. */
export function cylinderWall(radius: number, y: number, height: number): string {
  const { rx, ry, cy } = disc(radius, y);

  return [
    `M${-rx} ${round(cy)}`,
    `V${round(cy + height)}`,
    `A${rx} ${ry} 0 0 0 ${rx} ${round(cy + height)}`,
    `V${round(cy)}`,
  ].join(" ");
}

/**
 * Back-to-front quads of a height field, so overlapping cells can be painted
 * opaque for hidden-line removal without any depth sorting at render time.
 */
export type SurfaceQuad = {
  readonly path: string;
  /** Mean height of the quad, 0 at the floor and 1 at the tallest peak. */
  readonly level: number;
};

export function surfaceQuads(
  halfX: number,
  halfZ: number,
  divisions: number,
  amplitude: number,
  height: (u: number, v: number) => number
): SurfaceQuad[] {
  const stepX = (halfX * 2) / divisions;
  const stepZ = (halfZ * 2) / divisions;
  const sample = (column: number, row: number) =>
    height((column / divisions) * 2 - 1, (row / divisions) * 2 - 1);

  const quads: (SurfaceQuad & { depth: number })[] = [];

  for (let column = 0; column < divisions; column += 1) {
    for (let row = 0; row < divisions; row += 1) {
      const corners: Point[] = [
        [column, row],
        [column + 1, row],
        [column + 1, row + 1],
        [column, row + 1],
      ].map(([c, r]) =>
        iso(-halfX + c * stepX, sample(c, r) * amplitude, -halfZ + r * stepZ)
      );

      const level =
        (sample(column, row) +
          sample(column + 1, row) +
          sample(column + 1, row + 1) +
          sample(column, row + 1)) /
        4;

      quads.push({ path: polygon(corners), level, depth: column + row });
    }
  }

  return quads.sort((a, b) => a.depth - b.depth);
}

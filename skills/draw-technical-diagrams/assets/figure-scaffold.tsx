/**
 * Primitives every figure in a set shares: the bordered plate, leader-line
 * callouts, an arrowhead marker, and the section hatch pattern.
 *
 * Pair with diagram.css and iso.ts. This is plain SVG expressed in JSX — the
 * same markup ports to any template language. If diagram.css is loaded as a
 * CSS module, swap the string class names for module lookups.
 */

import type { CSSProperties, ReactNode } from "react";
import { polyline, type Point } from "./iso";

/** Inline custom properties, which React's CSSProperties does not model. */
export const cssVars = (vars: Record<string, string | number>) => vars as CSSProperties;

/** Tint without translucency, so an overpainted quad still hides what is behind it. */
export const tint = (percent: number) =>
  `color-mix(in srgb, var(--accent) ${Math.round(percent)}%, var(--paper))`;

type FrameProps = {
  readonly children: ReactNode;
  readonly className?: string;
  /** Plate caption, rotated into the right margin. */
  readonly margin?: string;
  /** Figure number, rotated into the left margin. */
  readonly figure: string;
  readonly height: number;
  readonly width: number;
  /** Short label naming the figure, for assistive technology. */
  readonly title: string;
  /** Sentence or two describing what the figure shows, for assistive technology. */
  readonly summary: string;
  readonly titleId: string;
  readonly descriptionId: string;
};

/**
 * The bordered plate every figure sits on: hairline rule, edge ticks every 24
 * units, and captions set into the vertical margins.
 */
export function Frame({
  children,
  className,
  descriptionId,
  figure,
  height,
  margin,
  summary,
  title,
  titleId,
  width,
}: FrameProps) {
  const ticks: string[] = [];

  for (let x = 24; x < width; x += 24) {
    ticks.push(`M${x} 0 v5`, `M${x} ${height} v-5`);
  }

  return (
    <svg
      aria-labelledby={`${titleId} ${descriptionId}`}
      className={`diagram ${className ?? ""}`}
      role="img"
      viewBox={`0 0 ${width} ${height}`}
    >
      <title id={titleId}>{title}</title>
      <desc id={descriptionId}>{summary}</desc>

      <g className="frame">
        <rect height={height - 1} width={width - 1} x={0.5} y={0.5} />
        <path d={ticks.join(" ")} />
      </g>

      <g className="margin">
        <text transform={`rotate(-90 16 ${height - 18})`} x={16} y={height - 18}>
          {figure}
        </text>
        {margin ? (
          <text
            textAnchor="end"
            transform={`rotate(-90 ${width - 12} 18)`}
            x={width - 12}
            y={18}
          >
            {margin}
          </text>
        ) : null}
      </g>

      {children}
    </svg>
  );
}

type CalloutProps = {
  /** Id of the arrowhead marker to terminate the leader with. */
  readonly arrow: string;
  /** The margin all labels in this figure align to. */
  readonly edge: number;
  readonly index?: string;
  /** Where the label sits, when it cannot line up with the part it points at. */
  readonly labelY?: number;
  readonly side: "left" | "right";
  readonly sub?: string;
  readonly target: Point;
  readonly title: string;
};

/**
 * A leader line with an arrowhead on the part, plus its label stacked against
 * the plate margin so every callout in a figure shares one alignment. The
 * leader runs level with the label, then elbows towards the part.
 */
export function Callout({
  arrow,
  edge,
  index,
  labelY,
  side,
  sub,
  target,
  title,
}: CalloutProps) {
  const level = labelY ?? target[1];
  const start = side === "left" ? edge + 12 : edge - 12;
  const bend =
    side === "left" ? Math.min(start + 22, target[0]) : Math.max(start - 22, target[0]);

  return (
    <g>
      <path
        className="leader"
        d={polyline([[start, level], [bend, level], target])}
        markerEnd={`url(#${arrow})`}
      />
      <text
        className="leader-text"
        textAnchor={side === "left" ? "end" : "start"}
        x={edge}
        y={level - (sub ? 5 : -3)}
      >
        {index ? <tspan className="leader-index">{index} </tspan> : null}
        {title}
      </text>
      {sub ? (
        <text
          className="leader-sub"
          textAnchor={side === "left" ? "end" : "start"}
          x={edge}
          y={level + 11}
        >
          {sub}
        </text>
      ) : null}
    </g>
  );
}

/** Ids must be unique per document, so pass a figure-scoped id. */
export function ArrowMarker({ id }: { readonly id: string }) {
  return (
    <marker
      id={id}
      markerHeight="8"
      markerWidth="8"
      orient="auto-start-reverse"
      refX="7"
      refY="3"
      viewBox="0 0 8 6"
    >
      <path d="M0 0 7 3 0 6 1.6 3z" fill="var(--accent)" />
    </marker>
  );
}

/**
 * Section hatch at 45 degrees. Apply with fill="url(#id)" as an attribute, not
 * from a stylesheet, and keep the line centred in the tile so it is not clipped.
 */
export function HatchPattern({ id }: { readonly id: string }) {
  return (
    <pattern height="7" id={id} patternTransform="rotate(45)" patternUnits="userSpaceOnUse" width="7">
      <path className="hatch-line" d="M3.5 0V7" />
    </pattern>
  );
}

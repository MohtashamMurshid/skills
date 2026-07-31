# Hover interaction

## Principle

The figure performs what it documents. An exploded stack pulls further apart, a switch presses and fires its signal, a surface highlights the cell under the pointer. Motion that has nothing to do with the subject — a float, a glow, a wobble — reads as decoration and undercuts the drawing's authority.

Keep it CSS-only. Every pattern here works on static markup with no client-side JavaScript, so figures stay server-rendered.

## SVG transform rules

Two rules cause most of the confusion:

1. **`transform` in CSS uses the local user coordinate system.** On an SVG element, `translateY(10px)` moves 10 *user units*, not 10 CSS pixels. Sizes therefore stay consistent with the viewBox no matter how the figure is scaled.

2. **`transform-origin` needs `transform-box: view-box`.** SVG resolves `transform-origin` against each element's own bounding box by default, so a pivot expressed in viewBox coordinates is ignored until the box is switched:

   ```css
   .compress {
     transform-box: view-box;
     transform-origin: var(--pivot-x, 50%) var(--pivot);
   }
   ```

Do not put a CSS `transform` on a group that already carries a `transform` attribute — the CSS property replaces the attribute rather than composing with it. Wrap the group instead.

## The four moves

### Explode further

Set each part's displacement inline from its own height, so the spread is proportional rather than uniform:

```tsx
<g className="part" style={cssVars({ "--lift": `${(layer.y * -0.07).toFixed(1)}px` })}>
```

```css
.diagram:hover .part { transform: translateY(var(--lift, 0)); }
```

Parts above the middle get a negative lift and rise; parts below sink. The stack opens symmetrically about its centre.

### Isolate one part

```css
.diagram:has(.part:hover) .part:not(:hover) { opacity: 0.32; }
.part:hover .face { fill: var(--accent-faint); }
.part:hover .edge { stroke-width: 1.9; }
```

`:has` makes this possible without JavaScript: hovering any part dims its siblings. This is the one legitimate use of opacity in these figures — it is an interaction state, not a depth cue.

### Actuate a mechanism

Group the parts that move together and translate them as one, then compress what they push against:

```css
.diagram:hover .travel   { transform: translateY(var(--travel, 10px)); }
.diagram:hover .compress { transform: scaleY(var(--compress, 0.8)); }
```

For a spring, `--pivot` is its fixed base, so it compresses towards the base instead of shrinking about its own middle. Have the moving assembly close the gap it is meant to close — a key stem should reach the contacts, and the contacts should meet — so the mechanism reads as a mechanism.

### Send a signal

Animate `stroke-dashoffset` by exactly one dash period so the loop is seamless:

```css
@media (prefers-reduced-motion: no-preference) {
  .diagram:hover .trace { animation: march 700ms linear infinite; }
}

/* .trace uses stroke-dasharray: 5 3.5, so the period is 8.5. */
@keyframes march {
  to { stroke-dashoffset: -8.5; }
}
```

Any other offset makes the dashes jump on each iteration. If the dash array changes, update the keyframe to match.

Do not use `pathLength` normalisation to make dash units scale-independent: `stroke-dasharray` interacts with `vector-effect: non-scaling-stroke` in device units, and the two mechanisms fight. A fixed period that matches the dash array is reliable.

### Highlight a cell

The tint is set inline per quad, so the hover fill must win normally rather than through `!important`. Pass the tint as a custom property and let CSS own the `fill` declaration:

```tsx
<path d={quad.path} style={cssVars({ "--tint": tint(5 + quad.level * 40) })} />
```

```css
.mesh path       { fill: var(--tint); transition: fill 140ms ease; }
.mesh path:hover { fill: var(--accent-pale); }
```

Setting `fill` inline instead would force `!important` to override it — a smell that is easy to avoid by moving the variable, not the property.

## Timing

One easing for structural movement: `cubic-bezier(0.22, 0.68, 0.16, 1)` over `340ms`. Fast enough to feel responsive, slow enough that a six-part explode reads as parts separating rather than snapping.

Colour and opacity changes are quicker — `140–200ms` — so highlights feel immediate while geometry still moves deliberately.

## Reduced motion

Looping animation is gated behind `prefers-reduced-motion: no-preference`, so it never starts for a reader who has asked for less motion. Transitions are disabled under `prefers-reduced-motion: reduce`:

```css
@media (prefers-reduced-motion: reduce) {
  .part, .travel, .compress, .mesh path { transition: none; }
}
```

The hover *states* still apply — parts still separate and highlight, just instantly. The information stays reachable; only the movement is removed.

## Accessibility

Hover is an enhancement, never the only route to the information. Every callout, label, and figure number is present in the static drawing, and the `<title>` and `<desc>` describe the figure in full. Nothing is revealed *only* on hover.

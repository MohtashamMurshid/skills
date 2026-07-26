# Shot recipes

Eight patterns that cover most of a software launch film. Each is a
`shot(name, start, end, build)` body; helpers come from the engine. Mix them,
but do not use all eight in one film — repetition of *rhythm* is what makes a
sequence feel composed, and eight unrelated ideas feel like a demo reel.

## 1. Cold open — the mark assembles

Scattered parts converge into the logo, a ring closes around it, a slug fades
in. Sells craft in three seconds and needs no copy.

```js
shot("open", 0, 5.2, (root, q) => {
  const parts = [...q("mark").querySelectorAll("[data-part]")];
  const ring = q("ring");

  return (t) => {
    parts.forEach((part, i) => {
      const k = stag(t, 0.25, 1.4, i, 0.11, outQuint);
      const spread = 1 - k;
      const angle = (i / parts.length) * Math.PI * 2;
      T(part,
        Math.cos(angle) * 420 * spread,
        Math.sin(angle) * 300 * spread,
        mix(0.4, 1, k));
      O(part, k);
    });

    const close = inOut(p(t, 1.1, 1.5));
    ring.style.strokeDashoffset = String(1 - close);
    O(ring, close * (1 - p(t, 4.2, 0.8)));
  };
});
```

Give each part a slightly different `stag` index so the convergence is a
cascade, not a collapse.

## 2. Title claim — masked lines

The workhorse. Each line sits in an `overflow: hidden` box and rises from
below, so it appears to be revealed rather than moved.

```css
.mask { display: block; overflow: hidden; padding-bottom: 0.06em; }
```

```js
lines.forEach((line, i) => {
  const k = stag(t, 0.5, 1.2, i, 0.14, outQuint);
  line.style.transform = `translateY(${mix(118, 0, k)}%)`;
});
```

Use 118%, not 100%: descenders hang below the box and a 100% offset leaves their
tails visible before the reveal. The `padding-bottom` keeps them from being
clipped once the line lands.

## 3. The command — a terminal types itself

The single most convincing shot for a developer tool. Type the command, land
output rows on a beat, then a progress bar and a clock.

```js
const COMMAND = "npx create-thing my-app";
const ROWS = [["✓", "resolved 14 packages"], ["✓", "wrote 8 files"], ["→", "http://localhost:5173"]];

return (t) => {
  const typed = Math.round(COMMAND.length * outCubic(p(t, 0.6, 1.15)));
  cmd.textContent = COMMAND.slice(0, typed);
  O(caret, typed < COMMAND.length || Math.floor(t * 2.4) % 2 === 0 ? 1 : 0);

  rows.forEach((row, i) => {
    const k = stag(t, 2.0, 0.5, i, 0.42, outCubic);
    O(row, k);
    T(row, mix(-14, 0, k), 0);
  });

  const fill = inOut(p(t, 3.4, 1.6));
  bar.style.transform = `scaleX(${fill})`;
  clock.textContent = `${(fill * 8.7).toFixed(1)}s`;
};
```

Keep all rows in the DOM from the start at zero opacity so the panel never
resizes. Never apply `text-transform: uppercase` to a shot that shows real
commands, paths, or units — it turns `9.8s` into `9.8S` and `--flag` into a lie.

## 4. What you get — cards around a core

A staggered ring or grid of capability cards. Restrained: no more than five, or
the frame becomes a slide.

```js
return (t) => {
  const breathe = 1 + Math.sin(t * 1.4) * 0.012;      // subtle, never a spin
  T(core, 0, 0, breathe);
  O(glow, mix(0.5, 0.9, (Math.sin(t * 1.4) + 1) / 2));

  cards.forEach((card, i) => {
    const k = stag(t, 0.55, 1.05, i, 0.15, outQuint);
    O(card, k);
    T(card, 0, mix(46, 0, k), mix(0.94, 1, k));
  });
};
```

Do not rotate a logo. A brand mark tilted 12° reads as a mistake; a mark that
breathes reads as alive.

## 5. Proof in code — two panels and a bridge

Show the call site and the handler, then draw a curve from one to the other. The
bridge is what makes it an argument instead of two screenshots.

```js
const draw = outQuint(p(t, 2.6, 1.3));
bridge.style.strokeDashoffset = String(1 - draw);
O(bridge, draw);
```

Build the path from measured geometry on the first draw, and start it at the end
of the *text*, not the edge of the panel, or the curve appears to grow out of
empty space:

```js
const from = stagePos(fromNode);
const startX = from.x + textWidth(fromNode) + 10;
const to = stagePos(toNode);
const midX = (startX + to.x) / 2;
bridge.setAttribute("d",
  `M ${startX} ${from.y + from.h / 2} C ${midX} ${from.y + from.h / 2}, ` +
  `${midX} ${to.y + to.h / 2}, ${to.x - 10} ${to.y + to.h / 2}`);
```

Highlight code with a small tokeniser over escaped text — keyword, string,
comment, function name — rather than pulling in a syntax library. Four token
classes are enough at 1080p, and the film only ever shows a dozen lines.

## 6. How it runs — a packet crosses the pipeline

A horizontal track with stations. A packet travels along it and each station
lights as the packet passes.

```js
const travel = inOut(p(t, 1.2, 3.2));
T(packet, mix(0, trackWidth * 1.04, travel), 0);   // overshoot past the end

stations.forEach((station, i) => {
  const at = (i + 0.5) / stations.length;
  const lit = clamp01((travel - at + 0.06) / 0.06);
  O(station, mix(0.35, 1, lit));
  station.style.borderColor = lit > 0.5 ? "var(--accent)" : "var(--line)";
});
```

Send the packet slightly past the track end (`1.04`) or the final station never
fully lights, and the shot ends on a half-finished state.

If the composition is top-heavy, balance it with a short secondary column — a
list of what the system deliberately does *not* do reads as confidence and fills
the frame honestly.

## 7. What it becomes — layers collapse into one

Stacked layers slide together into a single unit. Good for "all of this becomes
one deployable thing".

```js
layers.forEach((layer, i) => {
  const k = stag(t, 0.5, 1.2, i, 0.13, outQuint);
  O(layer, k);
  T(layer, 0, mix(fromY[i], 0, k));         // fromY: outward offsets, top negative
});
```

Size the container for the largest state so nothing reflows, and keep type
inside layers at 18px or larger — anything smaller is unreadable after H.264
compression.

## 8. Endcard — the name, then the address

Letters stagger up, a rule draws under the word, the URL arrives last. Hold the
final frame for at least a second so the film can be paused on it.

```js
letters.forEach((letter, i) => {
  const k = stag(t, 0.7, 0.8, i, 0.055, outCubic);
  O(letter, k);
  letter.style.transform = `translateY(${mix(30, 0, k)}px)`;
});
```

Leave clear space between the word and the rule — descenders in a 128px setting
reach much further than the line box suggests, and a rule that grazes them looks
like a rendering bug.

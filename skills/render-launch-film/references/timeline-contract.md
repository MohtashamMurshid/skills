# Timeline contract

How the runtime works, what the helpers mean, and the specific ways
determinism gets broken. `assets/starter/engine.js` is the reference
implementation of everything described here.

## Why determinism matters

The renderer seeks to an arbitrary time, screenshots, and moves on. If a frame
depends on anything other than `t` — elapsed wall clock, a CSS transition still
in flight, a value mutated by the previous frame — then the same timestamp
produces different pixels on different runs, and the film flickers or drifts.

Determinism also buys the review loop: any moment can be re-rendered as a still
in isolation, out of order, without playing the film.

## The seek harness

Three globals are the entire interface between the page and the renderer.

```js
window.__duration = 54;          // film length in seconds

window.__seek = (t) => {         // draw frame t, resolve once it has painted
  playing = false;
  render(t);
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
};

window.__ready = true;           // set only after document.fonts.ready
```

The double `requestAnimationFrame` matters. One frame schedules the paint; the
second resolves after it has happened. Resolving too early screenshots the
previous frame.

## Query parameters

The renderer drives the page through its URL, and the page must honour these:

| Parameter | Effect |
| --- | --- |
| `chrome=0` | Hide playback UI. Always set during capture. |
| `frame=0` | Hide frame furniture (corner ticks, timecode, shot name). |
| `play=0` | Do not autoplay. |
| `t=12` | Open at 12 seconds. Authoring convenience. |
| `shot=surface` | Open at the start of a named shot. Authoring convenience. |

## The stage

Author at a fixed pixel size — 1920×1080 — and scale the whole stage to fit the
window for preview:

```js
stage.style.transform = `scale(${Math.min(
  window.innerWidth / stage.offsetWidth,
  window.innerHeight / stage.offsetHeight,
)})`;
```

Every coordinate in the film is then a real output pixel. During capture the
viewport is exactly the stage size, so the scale is 1 and the preview matches
the render exactly.

## Helper vocabulary

Keep the vocabulary tiny; it is used hundreds of times across a film.

```js
p(t, start, dur)        // 0→1 progress through a window, clamped
mix(a, b, k)            // interpolate, k clamped to 0..1
stag(t, start, dur, i, step, ease)   // eased progress for item i of a group

outCubic  // general entrances
outQuint  // authoritative arrivals, masked lines, cards locking into place
inOut     // travel across the frame, counters, sweeps
outBack   // a mark or badge popping in; slight overshoot

O(node, v)                     // opacity
T(node, x, y, scale, extra)    // transform
```

Everything else is `Math`. A shot's draw function is a list of windows:

```js
return (t) => {
  const enter = outQuint(p(t, 0.5, 1.2));   // 0.5s in, over 1.2s
  O(card, enter);
  T(card, 0, mix(40, 0, enter));            // slide up 40px into place
};
```

## Shots and crossfades

Each shot owns a `[data-shot="name"]` section and an absolute time range.
Overlap neighbours by the fade length; the runtime applies the envelope:

```js
O(root, Math.min(p(t, start, FADE), 1 - p(t, end - FADE, FADE)));
```

Shots outside their range are set to `visibility: hidden` and skipped, so an
element that never appears is almost always a window that falls outside its
shot's own range. Local time starts at 0 for each shot, which means shot
timings can be shifted without touching any inner window.

## Measuring geometry

Connector lines and callouts need real element positions. Two rules:

Accumulate `offsetLeft` / `offsetTop` up to the stage instead of using
`getBoundingClientRect`, because offsets are immune to the preview scale:

```js
function stagePos(node) {
  let x = 0, y = 0, n = node;
  while (n && n !== stage) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
  return { x, y, w: node.offsetWidth, h: node.offsetHeight };
}
```

Measure lazily on the first draw, not at build time, so fonts have loaded and
layout has settled. Cache the result.

To anchor to the end of a text run rather than the end of its block, measure the
text itself with a range, dividing out the preview scale:

```js
const range = document.createRange();
range.selectNodeContents(node);
const scale = node.getBoundingClientRect().width / node.offsetWidth;
const width = range.getBoundingClientRect().width / scale;
```

## Determinism traps

**CSS transitions and animations.** The most common cause of drift. Author them
in JavaScript instead. Keep them for UI outside the stage.

**Cursor blinks and loops.** Derive from `t`, never from a counter:

```js
O(caret, Math.floor(t * 2.4) % 2 === 0 ? 1 : 0);
```

**Typing effects.** Slice a string by progress rather than appending characters:

```js
const chars = Math.round(text.length * outCubic(p(t, 0.65, 0.95)));
node.textContent = text.slice(0, chars);
```

**Layout that grows.** If a card grows as rows appear, everything already on
screen shifts. Keep late elements in the DOM at zero opacity from the start so
the box never changes size.

**Overwritten transforms.** `T()` replaces the whole transform. An element
centred with `translate(-50%, -50%)` in CSS needs that translate re-stated in
every JavaScript transform, or use margins to centre instead.

**SVG path animation.** Set `pathLength="1"` and `stroke-dasharray="1 1"`, then
drive `stroke-dashoffset` from 1 to 0. The path draws itself at any length
without recomputing dash values.

## Webfonts

Load fonts with `display: block` and gate the first frame on
`document.fonts.ready`. A film whose type reflows in the opening second looks
broken, and any geometry measured before fonts land is wrong.

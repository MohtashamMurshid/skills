# Verification

Computed geometry is exact but not automatically correct: paint order, occlusion, label collisions, and clipping are all still easy to get wrong, and none of them are visible at the size a figure is rendered on a page. Every defect in the Failure modes table was found this way and would have shipped otherwise.

Requires a browser automation capability — Chrome DevTools Protocol, or any headless browser driver that can evaluate JavaScript and take screenshots. A fallback for when none is available is at the end.

## Enlarge before judging

A figure rendered 500px wide hides everything. Enlarge it to roughly full viewport width and screenshot it.

Modify the **real element**, not a clone. Cloning an SVG duplicates every `id` in it, so `url(#hatch)` and `url(#arrow)` references resolve against the wrong element and the copy renders differently from the original — which sends you chasing a bug that only exists in the probe.

```js
const style = document.createElement("style");
style.id = "probe";
style.textContent = `
  [class*=figureGrid] { grid-template-columns: 1fr !important }
  [class*=figurePanel] { display: none !important }
  [class*=figure] { width: 1010px !important }
`;
document.head.append(style);
document.querySelector('svg[aria-labelledby^="fig-key"]').scrollIntoView({ block: "center" });
```

Remove `#probe` afterwards. Attribute-substring selectors (`[class*=...]`) match through CSS-module hashing.

## Read the enlarged figure deliberately

Check, in order:

1. Does every part occlude what it should? Look for a far part showing through a near one.
2. Does every leader reach its feature, with the arrowhead touching it?
3. Is any text clipped by the plate border, or colliding with another label?
4. Are dashed paths visible where they cross solids, or were they painted underneath?
5. Do highlighted grid cells sit where intended?
6. Are the top and bottom plate margins balanced?

## Confirm a fill actually resolved

Silently failing paint references look identical to a missing fill. Ask the document rather than the screenshot:

```js
const el = document.querySelector(".cut");
getComputedStyle(el).fill;                 // 'url("#hatch")' means it resolved
document.querySelectorAll("#hatch").length; // 1 — more means a clone is interfering
```

A resolved-but-invisible pattern is usually stroke width: check that pattern content is exempt from `vector-effect: non-scaling-stroke` and that the tile's line is centred in the tile rather than sitting on its boundary.

## Force hover states

Hover cannot be triggered by moving a synthetic mouse in most automation contexts. Force the pseudo-state instead. Over CDP:

```
CSS.enable
DOM.getDocument { depth: 0 }                    -> root nodeId
DOM.querySelector { nodeId, selector }          -> node
CSS.forcePseudoState { nodeId, forcedPseudoClasses: ["hover"] }
```

Pass `forcedPseudoClasses: []` to release it.

## Measure, do not eyeball

This is the step most worth insisting on. A 13px shift between two screenshots is genuinely hard to see, so comparing images invites both false positives and false negatives. Measure instead:

```js
window.__measure = () => {
  const svg = document.querySelector('svg[aria-labelledby^="fig-key"]');
  const box = (sel) => {
    const el = svg.querySelector(sel);
    const r = el.getBoundingClientRect();
    return `${Math.round(r.top)}/${Math.round(r.height)}`;
  };
  return JSON.stringify({
    travel: box(".travel"),
    spring: box(".compress"),
    trace: getComputedStyle(svg.querySelector(".trace")).animationName,
  });
};
```

Call it with hover forced and again with it released. A working press produces something like:

```
hovered:  { travel: "356/264", spring: "538/62", trace: "march" }
at rest:  { travel: "343/264", spring: "522/78", trace: "none" }
```

which confirms three things at once: the assembly moved down 13px, the spring compressed from 78 to 62 against its base rather than merely translating, and the signal animates only while hovered.

Note that a horizontal move leaves `top`/`height` unchanged — measure the axis the transform actually acts on.

## Fallback without automation

Temporarily render the figure alone at large size in a scratch route or an HTML file and open it directly. Then, for each hover state, add the hover rule's declarations to the base class, look, and remove them again.

Slower and easier to leave half-reverted, so restore the file afterwards and re-read the diff before committing.

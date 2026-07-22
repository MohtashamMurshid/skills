# Image direction

## Asset roles

Bundled figures:

- `assets/figures/courier-birds-cutout.png`: reusable transparent metaphor for dispatch, communication, delivery, migration, or distributed work.
- `assets/figures/drafting-bird-cutout.png`: reusable transparent metaphor for design systems, automation, document production, mapping, or tooling.
- `assets/figures/cover-observatory.png`: reference-only cover composition unless an observatory/surveying metaphor genuinely fits.
- `assets/figures/root-server.png`: reference-only style/composition for infrastructure, systems, networks, and foundations.

Do not use personal portraits or project screenshots from the original portfolio as generic report assets.

## Choose the visual form

- Use generated archival illustration for metaphor, atmosphere, cover art, and conceptual figures.
- Use supplied photographs/screenshots for documentary evidence.
- Use code-native SVG/HTML/canvas for quantitative diagrams, charts, maps, and exact labeled systems.
- Use a hybrid when useful: exact code-native data plus a separate decorative engraving.

## Image-generation prompt scaffold

```text
Use case: stylized-concept
Asset type: editorial figure for a vintage annual report
Primary request: <report-specific subject and metaphor>
Source facts represented: <facts the image may imply>
Style/medium: meticulous black ink copperplate engraving, late-20th-century institutional annual-report illustration
Composition/framing: <wide plate / portrait cover / isolated cutout>; generous negative space; subject fully visible
Color palette: near-black ink with restrained warm paper tones
Constraints: no text, no watermark, no logo; no invented data; crisp fine lines; clear silhouette
Avoid: steampunk spectacle, fantasy clutter, photorealism, glossy 3D, generic stock illustration, yellow rectangular panel
```

For a transparent cutout, request a flat removable chroma background and follow the active `imagegen` skill’s extraction workflow. Validate the alpha channel, transparent corners, subject coverage, and edge fringe.

## Cover prompt scaffold

```text
Use case: stylized-concept
Asset type: full-bleed report cover
Primary request: one small human-scale observer confronting a large report-specific system or landscape
Style/medium: faded annual-report cover, screenprint/lithograph texture, restrained surrealism
Composition/framing: portrait or full-viewport; large quiet sky/negative space reserved for title; grounded horizon
Color palette: weathered paper, muted teal, ochre, rust, deep green-black
Constraints: no text or logos; title-safe negative space; print-like grain; one clear visual idea
Avoid: cinematic concept art, neon, dense collage, illegible busy background
```

## Integration rules

- Inspect the generated asset before placement.
- Preserve faces, heads, hands, data labels, and complete silhouettes.
- Give figures stable aspect ratios and explicit `object-position` where needed.
- Keep illustrations clear of body copy, ledgers, captions, folios, and navigation.
- Remove or match raster paper backgrounds; do not rely on blend modes to hide a bad panel.
- Reduce scale before sacrificing negative space.
- Caption the figure’s report function, not merely what it depicts.
- Record the final prompt and saved workspace path in the handoff.

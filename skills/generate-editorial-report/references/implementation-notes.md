# Web implementation notes

## Reference implementation

The exact source that inspired this skill is bundled at:

- `assets/reference-implementation/ReportExperience.tsx`
- `assets/reference-implementation/report.css`

Read them when implementing a React/Next.js report. In other stacks, translate the layout and interaction patterns instead of adding React or Next.js as a dependency. Reuse patterns selectively. Replace all personal copy, project links, image paths, route names, schema data, and branding.

## Structure

Use semantic markup:

```text
main.report-shell
  header.report-chrome
  nav.report-progress
  section.report-rail
    article.report-spread (cover)
    article.report-spread (preface)
    article.report-spread (dossier...)
```

Keep content server-rendered or present in semantic HTML for indexing and accessibility. Client logic should manage navigation and motion, not own the factual content unnecessarily.

## Desktop behavior

- Rail: `display:flex`, `height:100svh`, `overflow-x:auto`, `overflow-y:hidden`.
- Spread: `flex:0 0 100vw`, `width:100vw`, `height:100svh`, `scroll-snap-align:start`.
- Redirect dominant vertical wheel input to `scrollLeft` only in presentation mode.
- Provide progress buttons, previous/next controls, Home/End, PageUp/PageDown, and arrow keys.
- Keep controls outside evidence and figure hit areas.

## Compact behavior

- Rail: `display:block`, `height:auto`, normal vertical overflow, no scroll snap.
- Spread: `width:100%`, `height:auto`, `min-height:100svh` where appropriate.
- Header: `position:fixed` or sticky with `inset:0 0 auto`; never use `inset:0` unless a full-screen overlay is intentional.
- Use safe-area-aware padding.
- Restack grids and convert absolute plates to relative flow.
- Reset or normalize stale scroll state when crossing layout modes if the implementation retains offsets.

## Media and figures

- Use responsive `sizes` matching actual breakpoints.
- Prefer `object-fit:contain` for diagrams and engraved cutouts.
- Use `object-fit:cover` only for photographs with a chosen focal point.
- Match the frame aspect ratio to portrait assets when preserving the full composition matters.
- Avoid large raster files when an optimized derivative is sufficient.

## Accessibility

- Include a skip link.
- Make every navigation control a real button or link with an accessible name.
- Provide useful alt text for informative media and empty alt text for purely decorative textures.
- Respect reduced motion.
- Maintain readable text sizes and contrast over textures.
- Ensure the report remains usable without sound; sound must be opt-in.

## SEO

- Add a specific title, description, canonical URL, social metadata, and index/follow directives.
- Use a single meaningful `h1` and ordered section headings.
- Add JSON-LD appropriate to the report subject: `Person`, `Organization`, `CreativeWork`, `Report`, `SoftwareApplication`, or `Dataset` only when supported.
- Keep primary copy and captions in HTML.
- Add report/project routes to the sitemap.
- Avoid keyword stuffing and unsupported superlatives.

## Validation matrix

At each viewport, record header bounds, document overflow, spread/figure bounds, and major image crops. Use visual screenshots in addition to computed geometry. Run the project’s lint and type checks; run a production build when it will not conflict with an active development server.

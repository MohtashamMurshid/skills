---
name: render-launch-film
description: Build a launch video or motion-design sequence as a deterministic, seekable web page, then render it frame by frame into an MP4 with headless Chrome and ffmpeg. Use when asked for a launch film, product announcement video, release teaser, animated sequence, motion graphics, kinetic typography, sizzle reel, or an explainer video generated from a repository, docs, or spec — including requests to reproduce a motion-design sequence seen in a reference video or link.
---

# Render Launch Film

Produce a finished MP4, not a storyboard. The film is a web page whose every frame is a pure function of time; a renderer then asks headless Chrome for one screenshot per frame and hands the frames to ffmpeg.

This approach is chosen because it is the only way to author motion in an environment without a video editor and still deliver a real video file: the page is directly inspectable, the timeline is seekable, and any frame can be re-examined as a still.

## Requirements

- Node 22+ (for the bundled renderer), `ffmpeg` on PATH, and Chrome or Chromium (`CHROME_PATH` if it is installed somewhere unusual).
- If Chrome or ffmpeg is unavailable, still build the page and deliver it as a self-playing sequence, and say plainly that the MP4 could not be encoded.

## The contract

These five rules make the film renderable. Breaking any one of them produces frames that differ between runs.

1. A single `render(t)` writes every animated value from scratch, every frame.
2. No CSS transitions and no CSS animations anywhere inside the stage.
3. No frame reads state left by the previous frame.
4. The page exposes `window.__ready`, `window.__duration`, and `window.__seek(t)`.
5. The first frame waits for `document.fonts.ready`, so text metrics never shift mid-render.

`assets/starter/engine.js` already satisfies all five. Copy the starter rather than rebuilding the runtime.

## Workflow

Track progress explicitly:

```
- [ ] 1. Harvest facts
- [ ] 2. Steal the brand
- [ ] 3. Write the shot list
- [ ] 4. Scaffold from the starter
- [ ] 5. Author shots
- [ ] 6. Review as stills
- [ ] 7. Render and verify
- [ ] 8. Hand off
```

### 1. Harvest facts

Read the repository, spec, or docs before designing anything. Collect real numbers, real command names, real file names, real API signatures. A launch film is persuasive because the details are true, and invented details are the fastest way to lose a technical audience.

If the product does not yet do what the film shows, put a small honest marker on the title card — `target design`, `preview`, `coming in v1` — and tell the user which element to delete once it ships.

### 2. Steal the brand

Pull the palette, type scale, gradient recipes, and logo geometry out of the product's own stylesheet, icon files, or screenshots. Reuse its exact hex values and font families. A launch film that looks like the product is worth more than a beautiful film that looks like a template.

Rebuild the logo as inline SVG so its parts can be animated individually.

### 3. Write the shot list

Draft the whole film as a table of `start`, `end`, and one sentence per shot before writing code. Aim for 6–9 shots and 40–60 seconds. Give every shot exactly one job, and one number, name, or line the viewer should remember.

A structure that works for software: cold open → title claim → the command or gesture → what you get → proof in code → how it runs → what it becomes → endcard.

See [references/shot-recipes.md](references/shot-recipes.md) for eight shot patterns with working code.

### 4. Scaffold from the starter

Copy `assets/starter/` into the target directory and replace the tokens in `sequence.css` with the brand values. The starter is a runnable three-shot film: `engine.js` is boilerplate to keep, `sequence.js` is the film to replace.

### 5. Author shots

Register each shot on an absolute timeline, overlapping neighbours by the fade length so the engine crossfades them:

```js
shot("terminal", 12.4, 20.2, (root, q) => {
  const card = q("card");
  return (t) => {                       // t is local to the shot
    const enter = outQuint(p(t, 0, 1.1));
    O(card, enter);
    T(card, 0, mix(26, 0, enter));
  };
});
```

Read [references/timeline-contract.md](references/timeline-contract.md) for the helper vocabulary, geometry measurement, and the mistakes that silently break determinism.

Read [references/motion-language.md](references/motion-language.md) for easing choices, stagger steps, hold times, and composition rules.

### 6. Review as stills

Never assume the layout works. Rendering one still per shot is fast and is the only reliable way to judge composition:

```bash
node scripts/render.mjs --dir ./film --stills 3,9,16,24,33,40,46,52 --sheet
```

Inspect `film/stills/sheet.png` and fix what it exposes: elements colliding, dead space in half the frame, text too small at 1080p, a curve crossing type, uppercase transforms mangling a file path. Then re-render the stills. Expect three or four rounds.

Also sample the transition instants — the frames where two shots overlap — and the first and last second of the film.

### 7. Render and verify

```bash
node scripts/render.mjs --dir ./film --fps 30 --keep-frames --out film/launch.mp4
```

Then confirm the encode, not just the capture, by pulling frames back out of the MP4 and tiling them:

```bash
ffprobe -v error -show_entries format=duration -show_entries stream=width,height,nb_frames \
  -of default=noprint_wrappers=1 film/launch.mp4
```

Capture runs at roughly 4 frames per second at 1080p, so budget about 7 minutes for 54 seconds at 30 fps and double that at 60 fps. Deliver 30 fps unless the film has fast linear moves. Details and failure modes are in [references/rendering.md](references/rendering.md).

### 8. Hand off

Report the output path, resolution, frame rate, duration, and file size. Keep the MP4 and the frame and still directories out of version control — they are regenerated output, and an encoded film is megabytes that would land in history on every copy edit.

State clearly that the page is the source and the MP4 is a build artifact, so edits go into `sequence.js` and the film is re-rendered.

## Failure modes

| Symptom | Cause |
| --- | --- |
| Capture stalls with idle CPU | Frames were piped into the encoder and the pipe broke. Capture to disk, encode after. |
| Frames differ between runs | A CSS transition or animation survives inside the stage, or a value carries over between frames. |
| Text jumps in the first second | The first frame rendered before webfonts loaded. |
| Measured geometry is wrong | Positions were measured before layout settled, or viewport rects were used without dividing out the preview scale. |
| Contact sheet is out of order | Files were globbed instead of passed in timeline order. |
| An element never appears | Its window falls outside the shot's own `start`–`end` range. |

## Resources

- [references/timeline-contract.md](references/timeline-contract.md) — runtime contract, helpers, determinism traps
- [references/shot-recipes.md](references/shot-recipes.md) — eight shot patterns with code
- [references/motion-language.md](references/motion-language.md) — timing, easing, type, composition
- [references/rendering.md](references/rendering.md) — renderer flags, performance, encoding
- `scripts/render.mjs` — capture, stills, contact sheets, encoding
- `assets/starter/` — runnable three-shot film to copy

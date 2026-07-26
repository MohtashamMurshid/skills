# Rendering

How `scripts/render.mjs` works, its options, and how to survive long captures.

## Two passes, always

Capture writes numbered PNGs to a frames directory; ffmpeg then encodes that
directory. This is not an optimisation — it is the fix for the failure that
wastes the most time.

Piping frames straight into ffmpeg over stdin looks tidier and deadlocks: if the
encoder exits or stops draining, the capture blocks forever on a full pipe. The
symptom is a process at 0% CPU, no progress output, and a partially written MP4
with no error anywhere. Nothing recovers except killing it.

Frames on disk also mean a capture is resumable, an encode can be repeated at
different settings without re-capturing, and any suspect frame can be opened
directly.

## What the page must provide

The renderer drives the page over the Chrome DevTools Protocol and depends on
exactly three globals plus two query parameters:

- `window.__ready` — set to `true` only after `document.fonts.ready`
- `window.__duration` — film length in seconds
- `window.__seek(t)` — draws frame `t`, resolves after it has painted
- `chrome=0` hides playback UI; `frame=0` hides frame furniture

If `__ready` never appears, the renderer times out after 30 seconds and says so.
That almost always means a module failed to load — open the page in a normal
browser and read the console.

## Options

| Flag | Default | Notes |
| --- | --- | --- |
| `--dir` | cwd | Directory to serve; must contain the page |
| `--page` | `index.html` | Entry file |
| `--out` | `film.mp4` | Output path |
| `--fps` | `30` | 60 doubles capture time |
| `--width` `--height` | `1920` `1080` | Stage size; must match the page |
| `--scale` | `1` | Device scale factor; `2` for retina stills |
| `--from` `--to` | `0`, duration | Render one shot while iterating |
| `--stills` | — | Comma-separated seconds, e.g. `3,9,16` |
| `--sheet` | off | Tile the stills into `stills/sheet.png` |
| `--columns` | auto | Sheet columns |
| `--crf` | `16` | 14–18 is a good range; lower is bigger |
| `--preset` | `slow` | x264 preset |
| `--frames` | `<dir>/.frames` | Frame directory |
| `--keep-frames` | off | Keep frames after encoding |
| `--encode-only` | off | Re-encode kept frames, no capture |
| `--no-frame-marks` | off | Render without frame furniture |
| `--query` | — | Extra query parameters for the page |

`CHROME_PATH` overrides Chrome discovery.

## Reviewing without watching the film

Stills are the review mechanism. A contact sheet of one still per shot exposes
composition problems in a single glance that would take several playbacks to
notice:

```bash
node scripts/render.mjs --dir ./film --stills 3,9,16,24,33,40,46,52 --sheet
```

Inputs are concatenated in the order given rather than globbed, because glob
order is lexicographic and would place `t-13.1.png` before `t-5.9.png`. Pass
timestamps in timeline order and the sheet reads left to right.

Sample three kinds of moment: the middle of each shot, the overlap instants
between shots, and the first and last second of the film.

After the final encode, verify the MP4 itself rather than trusting the capture:

```bash
ffprobe -v error -show_entries format=duration \
  -show_entries stream=width,height,nb_frames \
  -of default=noprint_wrappers=1 film/launch.mp4
```

Frame count should equal `duration × fps`. To check the encode visually, extract
frames from the MP4 and tile them; a still that looks right at capture time can
still be ruined by compression if the type is too small or the gradients band.

## Performance

Capture runs at roughly 4 frames per second at 1080p, dominated by PNG encoding
inside Chrome. Practical budgets:

| Film | fps | Frames | Capture |
| --- | --- | --- | --- |
| 20s | 30 | 600 | ~2.5 min |
| 54s | 30 | 1620 | ~7 min |
| 54s | 60 | 3240 | ~14 min |

Encoding a 1620-frame film at `--preset slow --crf 16` takes well under a minute
and produces a few megabytes at 1080p.

Do not pipe the renderer's output through a pager or a line-limiting command
while it runs: those buffer, and the progress line disappears, which makes a
working capture indistinguishable from a hung one. Let it write to the terminal,
or redirect to a file and read the file.

Iterate with `--from` and `--to` on a single shot rather than re-rendering the
whole film. Only capture the full sequence when the contact sheet is clean.

## Delivery

Deliver 30 fps H.264 in an MP4 with `+faststart`, `yuv420p`, and even
dimensions. That combination plays everywhere, including in a pull request
preview and on social platforms.

Keep the MP4, the frames directory, and the stills directory out of version
control. They are build output: the page is the source, and an encoded film is
megabytes that would enter history on every copy edit. Ignore them explicitly
before the first render, not after.

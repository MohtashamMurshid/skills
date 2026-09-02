---
name: documentary-video-editor
description: Transcribe, review, edit, color-correct, subtitle, and quality-check documentary or interview footage from a folder of source video clips. Use when asked to turn raw investigation, location, travel, interview, or observational footage into a coherent documentary-style cut. Do not use for animation-first launch films or fully synthetic motion graphics.
---

# Documentary Video Editor

Turn raw camera footage into a finished documentary cut. Preserve the originals, make editorial choices from the evidence in the recordings, and deliver an encoded video plus the materials needed to revise it.

Read [references/editing-workflow.md](references/editing-workflow.md) before building the edit. It contains the detailed review, transition, grading, subtitle, and verification procedure.

## Requirements

- `ffmpeg` and `ffprobe` on `PATH`.
- A transcription system that can return word timestamps. Segment timestamps are an acceptable fallback, but allow less precise dialogue edits.
- Enough free disk space for proxies or intermediates, subtitle renders, and the final encode.
- An image library or subtitle renderer when subtitles must be burned in. Pillow is a portable fallback when the local ffmpeg build lacks `libass` and `drawtext`.

If a capability is missing, complete the safe portions of the workflow and state exactly what remains. Never overwrite or modify camera originals.

## Workflow

Track these stages explicitly:

```text
- [ ] 1. Inventory and inspect the footage
- [ ] 2. Transcribe every speaking clip
- [ ] 3. Build the story and edit decision list
- [ ] 4. Assemble with protected dialogue and transitions
- [ ] 5. Correct exposure and color per shot
- [ ] 6. Generate and review subtitles
- [ ] 7. Encode and inspect the finished video
- [ ] 8. Hand off the video and revision materials
```

### 1. Inventory and inspect

Create a working directory outside the source folder. Record codec, resolution, frame rate, duration, audio presence, and capture time for every media file:

```bash
python3 scripts/inventory_media.py /path/to/footage --recursive \
  --json /path/to/work/media-inventory.json \
  --csv /path/to/work/media-inventory.csv
```

Make chronological contact sheets and sample frames at several positions in each clip. Look for scene changes, usable establishing shots, camera movement, focus problems, exposure changes, and recurring subjects. Treat filesystem order as a fallback, not proof of chronology.

### 2. Transcribe everything

Transcribe each clip separately and retain the word-timestamp JSON, readable text, and SRT or VTT. Review names, places, numbers, clipped phrases, and suspicious repetition against the audio. Re-run or manually repair a clip when the transcript loops, invents speech over silence, or loses sync.

Keep uncertainty visible. Do not strengthen an ambiguous statement or turn an implication into a factual claim.

### 3. Build the story

Start from chronology unless the user requests a different structure. Select a clear opening, progression, and ending, then build an edit decision list with:

- segment and chapter name
- video source, in point, and out point
- audio source, in point, and out point
- transcript excerpt
- transition and grading notes

Allow picture and sound to come from different clips. Use B-roll over continuous speech when it improves clarity, but preserve the speaker's meaning and timing.

### 4. Protect speech and soften cuts

Never place a dialogue cut exactly on a syllable or breath. Find a real pause, keep short pre-roll and post-roll handles, and listen across the boundary. Preserve room tone beneath visual cutaways where possible.

Use short equal-power audio crossfades for ordinary dialogue edits. Use restrained picture dissolves when the user requests soft visual cuts, and longer transitions only for chapter or location changes. Transition overlaps must not remove words or duplicate speech. Leave a brief hold after an important line before changing scene.

### 5. Correct light per shot

Measure and review exposure shot by shot. Lift shadows or midtones on backlit material, reduce highlights before they clip, and keep faces and neutral surfaces consistent across adjacent shots. Do not apply one blanket correction to all footage. Add only light denoise and sharpening after exposure is stable.

### 6. Subtitle from the final timeline

Generate subtitles from the locked edit, or accurately remap retained word timestamps through the edit decision list. Keep cues short, readable, and within title-safe margins. Review every cue against the final audio before burning it in. Correct obvious recognition errors without rewriting the speaker.

Deliver a sidecar SRT even when subtitles are burned into the video, unless the user declines it.

### 7. Verify the encode

Run a complete decode and objective checks:

```bash
python3 scripts/qa_video.py /path/to/final.mp4 --json /path/to/work/final-qa.json
```

Treat black, freeze, and silence detections as review markers, not automatic failures. Inspect a contact sheet, full-resolution subtitle frames, every chapter boundary, the first and last seconds, and all complex dialogue transitions. Listen to the complete soundtrack once.

### 8. Hand off

Report the final path, duration, resolution, frame rate, file size, audio loudness, and checksum. Include the transcript, subtitle file, edit decision list, and QC report when available. Distinguish source materials from generated intermediates so future revisions are straightforward.

## Resources

- [references/editing-workflow.md](references/editing-workflow.md): detailed review, edit, transition, grading, subtitle, and QA guidance
- `scripts/inventory_media.py`: reproducible source-media inventory
- `scripts/qa_video.py`: full decode, loudness, black, freeze, silence, stream, and checksum report

# Documentary Editing Workflow

Use this reference while executing the skill. Adapt numbers to the footage, delivery format, and user preferences. The values here are starting points, not creative rules.

## 1. Preserve sources and establish chronology

Keep camera originals read-only. Put transcripts, proxies, edit lists, temporary renders, subtitle assets, and QC reports in a separate working directory.

Inventory all likely media extensions and probe the files before deciding on an edit format. Check:

- capture timestamp and filename sequence
- duration, dimensions, sample aspect ratio, and rotation metadata
- frame rate and whether it is constant or variable
- video and audio codecs
- channel layout and sample rate
- clips with no audio or unexpectedly short duration

Sort by trustworthy capture metadata when it is present across the set. Otherwise combine filename order, visual continuity, transcript content, and metadata rather than assuming any single source is authoritative.

Make contact sheets with several samples per clip. Add denser samples for long walk-throughs and clips with many scene changes. Review individual frames at full resolution when the contact sheet suggests clipping, focus problems, readable signs, or subtitle collisions.

## 2. Transcription and transcript QA

Transcribe one source clip at a time. Retain the transcription engine's raw output, including word timing and confidence when available. Also create a readable master transcript with source filenames and source timecodes.

Suspect a transcription problem when:

- a phrase repeats several times without matching visible speech
- words appear during wind, music, or silence
- the text switches language unexpectedly
- timecodes stop advancing normally
- a proper name changes spelling within one sentence
- a number or place name conflicts with another clear mention

Re-listen and correct only what is audible. Mark uncertain words rather than guessing. A subtitle cleanup may improve punctuation and obvious spelling, but it must not alter meaning.

## 3. Story map and edit decision list

Draft the story in plain language before rendering. For investigation and observational material, a useful progression is:

1. concrete opening image or claim
2. orientation to place and purpose
3. accumulating observations and evidence
4. contradiction, complication, or change in understanding
5. synthesis or reflective ending

Do not force this shape when the material supports a better one.

Keep the edit decision list machine-readable. JSON or CSV works well. At minimum, record:

```text
id, chapter, video_file, video_in, video_out,
audio_file, audio_in, audio_out, transcript, transition, notes
```

Picture and sound may use different source ranges. If speech continues under B-roll, keep one continuous audio range when possible. That avoids unnecessary dialogue joins and preserves natural room tone.

## 4. Dialogue-safe cut points

Word timestamps are guides, not permission to cut on their exact edges. Inspect the waveform or silence intervals near the proposed boundary, then listen to the result.

For an ordinary dialogue edit:

1. Locate the final audible phoneme, breath, or room-tone decay.
2. Keep roughly 80 to 250 ms of usable post-roll when the source allows it.
3. Keep roughly 80 to 250 ms of pre-roll before the next spoken phrase.
4. Overlap the audio with a short equal-power crossfade, often 60 to 180 ms.
5. Let the picture cut or dissolve independently when a J-cut or L-cut sounds better.
6. Leave a longer pause after a consequential line if the viewer needs time to absorb it.

Use smaller handles for rapid speech and longer ones for reflective pacing. If no clean pause exists, cover the join with B-roll and build a room-tone bed from the same location. Never time-compress speech merely to hide an editorial problem.

For a sequence of segment durations `d` with transition overlaps `t`, the assembled duration is:

```text
sum(d) - sum(t)
```

Include the overlap inside both adjoining source handles. Confirm that the overlap does not drop the end of one word, repeat a word, or create doubled room noise.

## 5. Picture transitions

Hard cuts remain appropriate inside continuous action, on camera movement, or when the edit needs energy. When softer cuts are requested:

- use a restrained dissolve of about 4 to 10 frames between related shots
- use 10 to 20 frames for a deliberate scene change
- avoid long dissolves across faces with large position changes, which can look like ghosting
- prefer a cutaway or motivated movement when a dissolve exposes mismatched framing

Do not apply the same transition length everywhere. Sample the middle and both ends of each transition at full resolution.

## 6. Exposure and color correction

Measure representative frames, then correct visually. Useful measurements include median luma, low and high percentiles, histogram clipping, and face exposure when faces are present.

Work in this order:

1. normalize rotation, pixel format, and color metadata
2. recover highlights if information exists
3. lift exposure, shadows, or midtones without crushing contrast
4. correct white balance and color cast
5. match adjacent shots
6. apply restrained denoise and sharpening if needed

Backlit footage usually needs selective midtone or shadow lift, not a global gain increase. Protect windows, skies, and practical lights from clipping. Compare neighboring shots in sequence because an individually pleasing grade can still cause visible brightness jumps at cuts.

## 7. Subtitle construction

Build subtitle cues after the edit timing is stable. Prefer phrase and clause boundaries over fixed word counts. Starting constraints:

- one or two lines per cue
- roughly 32 to 42 characters per line when the frame and language permit
- about 1 to 7 seconds on screen
- avoid cues shorter than about 700 ms
- leave a small gap between unrelated cues when possible
- keep names, short noun phrases, and grammatical units on the same line

Use a high-contrast style with a subtle outline or shadow and keep it inside title-safe margins. Check subtitles over both the brightest and darkest scenes. Reposition only when essential visual evidence or lower-third graphics would be covered.

If the local ffmpeg lacks `libass` and `drawtext`, render each cue to a transparent or chroma-keyed image with an available image library, then overlay the cue images at their exact time ranges. Always retain the sidecar SRT as the editable source.

## 8. Audio and export

Normalize dialogue conservatively and keep dynamics natural. For online documentary work, approximately -16 LUFS integrated stereo and peaks below -1 dBTP are sensible starting targets. Follow a broadcaster or platform specification when one is supplied.

Use a delivery codec and pixel format that play reliably on the target device, commonly H.264 video with `yuv420p` and AAC audio in MP4. Preserve a higher-quality mezzanine when further revisions are likely.

## 9. Quality-control pass

Objective analysis is only one layer. Complete all of these:

- probe the finished streams and duration
- decode the whole file and fail on corrupt frames or audio errors
- review black, freeze, and silence detector markers in context
- inspect a contact sheet from the encoded file
- inspect full-size frames for subtitles, exposure, and transitions
- listen through every dialogue join and the complete program
- verify sync near the beginning, middle, and end
- compare the final duration with the edit model
- compute a checksum after the file has reached its final location

Detector events are leads. A deliberate black frame, held shot, or quiet pause may be correct. A clean detector report does not prove that subtitles are accurate or cuts sound natural.

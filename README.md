# Mohtasham's agent skills

[![skills.sh](https://skills.sh/b/mohtashammurshid/skills)](https://skills.sh/mohtashammurshid/skills)
[![Validate skills](https://github.com/mohtashammurshid/skills/actions/workflows/validate.yml/badge.svg)](https://github.com/mohtashammurshid/skills/actions/workflows/validate.yml)

Reusable skills for AI coding agents, published through [skills.sh](https://skills.sh).

## Skills

### `generate-editorial-report`

Transform notes, research, project data, and mixed source material into evidence-led, art-directed editorial reports with responsive web presentation, optional PDF output, SEO, and generated archival figures.

```bash
npx skills add mohtashammurshid/skills --skill generate-editorial-report
```

### `documentary-video-editor`

Turn raw investigation, interview, travel, or observational footage into a transcript-led documentary cut with dialogue-safe transitions, per-shot exposure correction, reviewed subtitles, and end-to-end delivery QC.

```bash
npx skills add mohtashammurshid/skills --skill documentary-video-editor
```

### `render-launch-film`

Build a launch video or motion-design sequence as a deterministic, seekable web page, then render it frame by frame into an MP4 with headless Chrome and ffmpeg. Ships a runnable starter film, a timeline engine, and a renderer that also produces review stills and contact sheets.

```bash
npx skills add mohtashammurshid/skills --skill render-launch-film
```

## Install

List the skills in this collection:

```bash
npx skills add mohtashammurshid/skills --list
```

Install one skill:

```bash
npx skills add mohtashammurshid/skills --skill <skill-name>
```

Install all skills globally for the agents detected by the CLI:

```bash
npx skills add mohtashammurshid/skills --all -g
```

## Create a skill

1. Create a lowercase, hyphenated folder under `skills/`:

   ```bash
   cd skills
   npx skills init my-skill
   cd ..
   ```

2. Edit `skills/my-skill/SKILL.md`. Give it YAML frontmatter with a matching `name`, a precise `description` that explains when the skill should trigger, and concise imperative instructions.

3. Add only reusable resources the skill needs:

   ```text
   skills/my-skill/
   ├── SKILL.md
   ├── scripts/
   ├── references/
   └── assets/
   ```

4. Validate and test discovery locally:

   ```bash
   python3 scripts/validate-skills.py
   npx skills add . --list
   ```

5. Commit and push to `main`. No manual submission is required: skills.sh discovers skills through anonymous install telemetry when users run `npx skills add mohtashammurshid/skills`.

See the [skills.sh documentation](https://skills.sh/docs) and [contribution guide](CONTRIBUTING.md) for more detail.

## Repository layout

```text
.
├── skills/                 # One directory per publishable skill
├── scripts/                # Repository maintenance tools
└── .github/workflows/      # Automated validation
```

## License

[MIT](LICENSE)

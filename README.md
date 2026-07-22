# Mohtasham's agent skills

[![skills.sh](https://skills.sh/b/mohtashammurshid/skills)](https://skills.sh/mohtashammurshid/skills)
[![Validate skills](https://github.com/mohtashammurshid/skills/actions/workflows/validate.yml/badge.svg)](https://github.com/mohtashammurshid/skills/actions/workflows/validate.yml)

Reusable skills for AI coding agents, published through [skills.sh](https://skills.sh).

## Install

List the skills in this collection:

```bash
npx skills add mohtashammurshid/skills --list
```

Install one skill:

```bash
npx skills add mohtashammurshid/skills --skill <skill-name>
```

Install all skills globally for Codex:

```bash
npx skills add mohtashammurshid/skills --all -g -a codex
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
   ├── agents/
   │   └── openai.yaml
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

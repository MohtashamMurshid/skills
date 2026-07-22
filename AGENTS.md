# Repository instructions

This repository publishes agent skills through skills.sh.

- Store publishable skills at `skills/<skill-name>/SKILL.md`.
- Use the `skill-creator` skill when creating or substantially revising a skill.
- Keep skill names lowercase and hyphenated, and match the folder name to the frontmatter `name`.
- Treat the frontmatter `description` as the trigger definition: state what the skill does and when to use it.
- Keep `SKILL.md` concise. Put detailed documentation in `references/`, deterministic helpers in `scripts/`, and output resources in `assets/`.
- Keep published instructions agent-agnostic: express required capabilities without depending on a named agent or provider-specific tool, and include a fallback when a capability is optional.
- Do not add placeholder skills or empty resource directories.
- Run `python3 scripts/validate-skills.py` before committing.
- Preserve compatibility with `npx skills add . --list`.

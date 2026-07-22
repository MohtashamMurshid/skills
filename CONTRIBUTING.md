# Contributing

## Skill requirements

- Put each skill in `skills/<skill-name>/SKILL.md`.
- Use the same lowercase, hyphenated value for the directory and frontmatter `name`.
- Keep the frontmatter `description` specific about both capability and trigger conditions.
- Keep the main instructions concise and imperative. Move detailed material into `references/`.
- Include scripts only when they improve repeatability; test every added script.
- Never commit credentials, tokens, personal data, or generated dependency folders.

## Before opening a pull request

Run:

```bash
python3 scripts/validate-skills.py
npx skills add . --list
```

Then try the skill on at least one realistic prompt with a supported agent.

## Organizing the skills.sh page

When the repository contains several skills, add `skills.sh.json` at the repository root. Follow the [skills.sh customization schema](https://skills.sh/docs/customize) and group skills by their published slugs.

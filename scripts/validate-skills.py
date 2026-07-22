#!/usr/bin/env python3
"""Validate the repository's publishable skill definitions."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKILLS_DIR = ROOT / "skills"
NAME_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def parse_frontmatter(path: Path) -> tuple[dict[str, str], list[str]]:
    errors: list[str] = []
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()

    if not lines or lines[0].strip() != "---":
        return {}, ["must start with YAML frontmatter delimited by ---"]

    try:
        closing = next(i for i, line in enumerate(lines[1:], start=1) if line.strip() == "---")
    except StopIteration:
        return {}, ["frontmatter is missing its closing --- delimiter"]

    metadata: dict[str, str] = {}
    for number, line in enumerate(lines[1:closing], start=2):
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if line[:1].isspace() or ":" not in line:
            errors.append(f"line {number}: expected a top-level key: value field")
            continue
        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip().strip("'\"")
        if key in metadata:
            errors.append(f"line {number}: duplicate frontmatter field {key!r}")
        metadata[key] = value

    if not any(line.strip() for line in lines[closing + 1 :]):
        errors.append("must contain instructions after the frontmatter")

    return metadata, errors


def validate_skill(path: Path) -> list[str]:
    metadata, errors = parse_frontmatter(path)
    folder_name = path.parent.name
    name = metadata.get("name", "")
    description = metadata.get("description", "")

    if not name:
        errors.append("frontmatter requires a non-empty name")
    elif not NAME_PATTERN.fullmatch(name):
        errors.append("name must contain only lowercase letters, digits, and single hyphens")
    elif name != folder_name:
        errors.append(f"name {name!r} must match directory {folder_name!r}")

    if not description:
        errors.append("frontmatter requires a non-empty description")
    elif len(description) < 20:
        errors.append("description is too short to define useful trigger conditions")

    return errors


def validate_skills_config(skill_names: set[str]) -> list[str]:
    path = ROOT / "skills.sh.json"
    if not path.exists():
        return []

    try:
        config = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        return [f"must contain valid JSON: {error}"]

    groupings = config.get("groupings") if isinstance(config, dict) else None
    if not isinstance(groupings, list) or not groupings:
        return ["groupings must be a non-empty array"]

    errors: list[str] = []
    listed: set[str] = set()
    for index, grouping in enumerate(groupings, start=1):
        label = f"groupings[{index}]"
        if not isinstance(grouping, dict):
            errors.append(f"{label} must be an object")
            continue
        if not isinstance(grouping.get("title"), str) or not grouping["title"].strip():
            errors.append(f"{label}.title must be a non-empty string")
        skills = grouping.get("skills")
        if not isinstance(skills, list) or not skills:
            errors.append(f"{label}.skills must be a non-empty array")
            continue
        for skill in skills:
            if not isinstance(skill, str) or not skill.strip():
                errors.append(f"{label}.skills entries must be non-empty strings")
            elif skill not in skill_names:
                errors.append(f"{label} references unknown skill {skill!r}")
            elif skill in listed:
                errors.append(f"skill {skill!r} appears in more than one grouping")
            else:
                listed.add(skill)

    return errors


def main() -> int:
    if not SKILLS_DIR.is_dir():
        print(f"error: missing skills directory: {SKILLS_DIR.relative_to(ROOT)}", file=sys.stderr)
        return 1

    skill_files = sorted(SKILLS_DIR.glob("*/SKILL.md"))
    failures = 0

    for path in skill_files:
        errors = validate_skill(path)
        relative = path.relative_to(ROOT)
        if errors:
            failures += 1
            print(f"FAIL {relative}")
            for error in errors:
                print(f"  - {error}")
        else:
            print(f"PASS {relative}")

    nested = sorted(
        path for path in SKILLS_DIR.rglob("SKILL.md") if path not in skill_files
    )
    for path in nested:
        failures += 1
        print(f"FAIL {path.relative_to(ROOT)}")
        print("  - SKILL.md must be exactly one directory below skills/")

    config_errors = validate_skills_config({path.parent.name for path in skill_files})
    if config_errors:
        failures += 1
        print("FAIL skills.sh.json")
        for error in config_errors:
            print(f"  - {error}")
    elif (ROOT / "skills.sh.json").exists():
        print("PASS skills.sh.json")

    if failures:
        print(f"\nValidation failed for {failures} skill(s).", file=sys.stderr)
        return 1

    print(f"Validated {len(skill_files)} skill(s).")
    if not skill_files:
        print("No skills are published yet; add one under skills/<skill-name>/SKILL.md.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

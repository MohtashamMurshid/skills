#!/usr/bin/env python3
"""Inventory video and audio files with ffprobe."""

from __future__ import annotations

import argparse
import csv
import json
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any


DEFAULT_EXTENSIONS = {
    ".3gp", ".avi", ".flv", ".m2ts", ".m4a", ".m4v", ".mkv", ".mov",
    ".mp3", ".mp4", ".mts", ".mxf", ".ogg", ".wav", ".webm",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Probe a media folder and write a chronological inventory."
    )
    parser.add_argument("folder", type=Path, help="Folder containing source media")
    parser.add_argument("--recursive", action="store_true", help="Scan subfolders")
    parser.add_argument(
        "--extensions",
        help="Comma-separated extensions to include, such as mp4,mov,mxf",
    )
    parser.add_argument("--json", dest="json_path", help="JSON path, or - for stdout")
    parser.add_argument("--csv", dest="csv_path", help="Optional CSV output path")
    return parser.parse_args()


def require_ffprobe() -> str:
    executable = shutil.which("ffprobe")
    if not executable:
        raise RuntimeError("ffprobe is required but was not found on PATH")
    return executable


def normalize_extensions(value: str | None) -> set[str]:
    if not value:
        return DEFAULT_EXTENSIONS
    extensions = set()
    for item in value.split(","):
        item = item.strip().lower()
        if item:
            extensions.add(item if item.startswith(".") else f".{item}")
    if not extensions:
        raise ValueError("--extensions did not contain any usable extensions")
    return extensions


def parse_number(value: Any) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def parse_rate(value: str | None) -> float | None:
    if not value or value in {"0/0", "N/A"}:
        return None
    try:
        numerator, denominator = value.split("/", 1)
        return float(numerator) / float(denominator)
    except (ValueError, ZeroDivisionError):
        return parse_number(value)


def probe(ffprobe: str, path: Path) -> dict[str, Any]:
    command = [
        ffprobe,
        "-v", "error",
        "-show_format",
        "-show_streams",
        "-of", "json",
        str(path),
    ]
    completed = subprocess.run(command, capture_output=True, text=True)
    if completed.returncode:
        detail = completed.stderr.strip() or "unknown ffprobe error"
        raise RuntimeError(detail)
    return json.loads(completed.stdout)


def first_stream(streams: list[dict[str, Any]], kind: str) -> dict[str, Any] | None:
    return next((stream for stream in streams if stream.get("codec_type") == kind), None)


def creation_time(data: dict[str, Any], streams: list[dict[str, Any]]) -> str | None:
    candidates = [data.get("format", {}).get("tags", {}).get("creation_time")]
    candidates.extend(stream.get("tags", {}).get("creation_time") for stream in streams)
    return next((value for value in candidates if value), None)


def inspect_file(ffprobe: str, root: Path, path: Path) -> dict[str, Any]:
    data = probe(ffprobe, path)
    streams = data.get("streams", [])
    video = first_stream(streams, "video")
    audio = first_stream(streams, "audio")
    file_format = data.get("format", {})
    stat = path.stat()

    return {
        "path": str(path.resolve()),
        "relative_path": str(path.relative_to(root)),
        "filename": path.name,
        "size_bytes": stat.st_size,
        "modified_time_unix": stat.st_mtime,
        "creation_time": creation_time(data, streams),
        "duration_seconds": parse_number(file_format.get("duration")),
        "format_name": file_format.get("format_name"),
        "video_codec": video.get("codec_name") if video else None,
        "width": video.get("width") if video else None,
        "height": video.get("height") if video else None,
        "pixel_format": video.get("pix_fmt") if video else None,
        "frame_rate": parse_rate(video.get("avg_frame_rate")) if video else None,
        "rotation": video.get("tags", {}).get("rotate") if video else None,
        "audio_codec": audio.get("codec_name") if audio else None,
        "audio_channels": audio.get("channels") if audio else None,
        "audio_channel_layout": audio.get("channel_layout") if audio else None,
        "audio_sample_rate": (
            int(audio["sample_rate"])
            if audio and str(audio.get("sample_rate", "")).isdigit()
            else None
        ),
    }


def write_json(payload: dict[str, Any], destination: str | None) -> None:
    rendered = json.dumps(payload, indent=2, ensure_ascii=False) + "\n"
    if destination in {None, "-"}:
        sys.stdout.write(rendered)
        return
    path = Path(destination)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(rendered, encoding="utf-8")


def write_csv(items: list[dict[str, Any]], destination: str) -> None:
    path = Path(destination)
    path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = list(items[0].keys()) if items else ["path"]
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(items)


def main() -> int:
    args = parse_args()
    try:
        root = args.folder.expanduser().resolve(strict=True)
        if not root.is_dir():
            raise ValueError(f"not a directory: {root}")
        extensions = normalize_extensions(args.extensions)
        ffprobe = require_ffprobe()
        iterator = root.rglob("*") if args.recursive else root.glob("*")
        files = sorted(
            path for path in iterator
            if path.is_file() and path.suffix.lower() in extensions
        )
        items = [inspect_file(ffprobe, root, path) for path in files]
    except (OSError, ValueError, RuntimeError, json.JSONDecodeError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 1

    order = "creation_time" if items and all(item["creation_time"] for item in items) else "path"
    if order == "creation_time":
        items.sort(key=lambda item: (item["creation_time"], item["relative_path"]))
    else:
        items.sort(key=lambda item: item["relative_path"].casefold())
    for index, item in enumerate(items, start=1):
        item["sort_index"] = index

    payload = {
        "root": str(root),
        "file_count": len(items),
        "total_duration_seconds": sum(item["duration_seconds"] or 0 for item in items),
        "order": order,
        "files": items,
    }
    write_json(payload, args.json_path)
    if args.csv_path:
        write_csv(items, args.csv_path)
    if args.json_path and args.json_path != "-":
        print(
            f"Inventoried {len(items)} media files "
            f"({payload['total_duration_seconds']:.3f} seconds) by {order}."
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

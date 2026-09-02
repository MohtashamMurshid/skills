#!/usr/bin/env python3
"""Decode a finished video and report common delivery-QC signals."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run ffprobe, a full decode, loudness analysis, and anomaly detectors."
    )
    parser.add_argument("video", type=Path, help="Finished media file")
    parser.add_argument("--json", dest="json_path", help="JSON path, or - for stdout")
    parser.add_argument("--black-duration", type=float, default=0.5)
    parser.add_argument("--black-pixel-threshold", type=float, default=0.10)
    parser.add_argument("--freeze-duration", type=float, default=3.0)
    parser.add_argument("--freeze-noise-db", type=float, default=-60.0)
    parser.add_argument("--silence-duration", type=float, default=2.0)
    parser.add_argument("--silence-noise-db", type=float, default=-45.0)
    return parser.parse_args()


def require_tool(name: str) -> str:
    executable = shutil.which(name)
    if not executable:
        raise RuntimeError(f"{name} is required but was not found on PATH")
    return executable


def run(command: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(command, capture_output=True, text=True)


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


def checksum(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def probe(ffprobe: str, path: Path) -> dict[str, Any]:
    completed = run([
        ffprobe,
        "-v", "error",
        "-show_format",
        "-show_streams",
        "-of", "json",
        str(path),
    ])
    if completed.returncode:
        raise RuntimeError(completed.stderr.strip() or "ffprobe failed")
    return json.loads(completed.stdout)


def metric(log: str, label: str, unit: str) -> float | str | None:
    values = re.findall(
        rf"(?:^|\s){re.escape(label)}:\s*(-?inf|-?\d+(?:\.\d+)?)\s+{re.escape(unit)}",
        log,
        flags=re.MULTILINE | re.IGNORECASE,
    )
    if not values:
        return None
    value = values[-1].lower()
    return value if "inf" in value else float(value)


def triplet_events(log: str, prefix: str) -> list[dict[str, float | None]]:
    starts = [float(value) for value in re.findall(rf"{prefix}_start:\s*([0-9.]+)", log)]
    ends = [float(value) for value in re.findall(rf"{prefix}_end:\s*([0-9.]+)", log)]
    durations = [float(value) for value in re.findall(rf"{prefix}_duration:\s*([0-9.]+)", log)]
    count = max(len(starts), len(ends), len(durations))
    return [
        {
            "start": starts[index] if index < len(starts) else None,
            "end": ends[index] if index < len(ends) else None,
            "duration": durations[index] if index < len(durations) else None,
        }
        for index in range(count)
    ]


def silence_events(log: str) -> list[dict[str, float | None]]:
    events: list[dict[str, float | None]] = []
    active_start: float | None = None
    for line in log.splitlines():
        start = re.search(r"silence_start:\s*([0-9.]+)", line)
        if start:
            active_start = float(start.group(1))
        end = re.search(
            r"silence_end:\s*([0-9.]+)\s*\|\s*silence_duration:\s*([0-9.]+)",
            line,
        )
        if end:
            events.append({
                "start": active_start,
                "end": float(end.group(1)),
                "duration": float(end.group(2)),
            })
            active_start = None
    if active_start is not None:
        events.append({"start": active_start, "end": None, "duration": None})
    return events


def summarize_stream(stream: dict[str, Any]) -> dict[str, Any]:
    summary: dict[str, Any] = {
        "index": stream.get("index"),
        "type": stream.get("codec_type"),
        "codec": stream.get("codec_name"),
        "duration_seconds": parse_number(stream.get("duration")),
    }
    if stream.get("codec_type") == "video":
        summary.update({
            "width": stream.get("width"),
            "height": stream.get("height"),
            "pixel_format": stream.get("pix_fmt"),
            "frame_rate": parse_rate(stream.get("avg_frame_rate")),
        })
    elif stream.get("codec_type") == "audio":
        summary.update({
            "channels": stream.get("channels"),
            "channel_layout": stream.get("channel_layout"),
            "sample_rate": (
                int(stream["sample_rate"])
                if str(stream.get("sample_rate", "")).isdigit()
                else None
            ),
        })
    return summary


def analyze(
    ffmpeg: str,
    path: Path,
    streams: list[dict[str, Any]],
    args: argparse.Namespace,
) -> tuple[bool, str]:
    has_video = any(stream.get("codec_type") == "video" for stream in streams)
    has_audio = any(stream.get("codec_type") == "audio" for stream in streams)
    command = [ffmpeg, "-hide_banner", "-nostats", "-v", "info", "-i", str(path)]
    if has_video:
        command += [
            "-map", "0:v:0",
            "-vf",
            (
                f"blackdetect=d={args.black_duration}:pix_th={args.black_pixel_threshold},"
                f"freezedetect=n={args.freeze_noise_db}dB:d={args.freeze_duration}"
            ),
        ]
    if has_audio:
        command += [
            "-map", "0:a:0",
            "-af",
            (
                "ebur128=peak=true,"
                f"silencedetect=n={args.silence_noise_db}dB:d={args.silence_duration}"
            ),
        ]
    command += ["-f", "null", "-"]
    completed = run(command)
    return completed.returncode == 0, completed.stderr + completed.stdout


def write_json(payload: dict[str, Any], destination: str) -> None:
    rendered = json.dumps(payload, indent=2, ensure_ascii=False) + "\n"
    if destination == "-":
        sys.stdout.write(rendered)
        return
    path = Path(destination)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(rendered, encoding="utf-8")


def human_summary(report: dict[str, Any]) -> str:
    video = next((stream for stream in report["streams"] if stream["type"] == "video"), None)
    audio = next((stream for stream in report["streams"] if stream["type"] == "audio"), None)
    details = [
        f"QC {'passed' if report['decode_passed'] else 'failed'} for {report['path']}",
        (
            f"duration: {report['duration_seconds']:.3f} s"
            if report["duration_seconds"] is not None
            else "duration: unknown"
        ),
    ]
    if video:
        details.append(
            f"video: {video['width']}x{video['height']} "
            f"{video['frame_rate'] or 'unknown'} fps {video['codec']}"
        )
    if audio:
        details.append(
            f"audio: {audio['channels']} ch {audio['sample_rate']} Hz {audio['codec']}"
        )
    loudness = report["loudness"]
    if loudness["integrated_lufs"] is not None:
        details.append(
            f"loudness: {loudness['integrated_lufs']} LUFS, "
            f"peak {loudness['true_peak_dbtp']} dBTP"
        )
    details.append(
        "markers: "
        f"{len(report['black_events'])} black, "
        f"{len(report['freeze_events'])} freeze, "
        f"{len(report['silence_events'])} silence"
    )
    details.append(f"sha256: {report['sha256']}")
    return "\n".join(details)


def main() -> int:
    args = parse_args()
    try:
        path = args.video.expanduser().resolve(strict=True)
        if not path.is_file():
            raise ValueError(f"not a file: {path}")
        ffprobe = require_tool("ffprobe")
        ffmpeg = require_tool("ffmpeg")
        metadata = probe(ffprobe, path)
        raw_streams = metadata.get("streams", [])
        if not raw_streams:
            raise RuntimeError("no media streams found")
        decode_passed, log = analyze(ffmpeg, path, raw_streams, args)
    except (OSError, ValueError, RuntimeError, json.JSONDecodeError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 1

    report = {
        "path": str(path),
        "size_bytes": path.stat().st_size,
        "duration_seconds": parse_number(metadata.get("format", {}).get("duration")),
        "sha256": checksum(path),
        "decode_passed": decode_passed,
        "streams": [summarize_stream(stream) for stream in raw_streams],
        "loudness": {
            "integrated_lufs": metric(log, "I", "LUFS"),
            "loudness_range_lu": metric(log, "LRA", "LU"),
            "true_peak_dbtp": metric(log, "Peak", "dBFS"),
        },
        "black_events": triplet_events(log, "black"),
        "freeze_events": triplet_events(log, "freeze"),
        "silence_events": silence_events(log),
        "thresholds": {
            "black_duration_seconds": args.black_duration,
            "black_pixel_threshold": args.black_pixel_threshold,
            "freeze_duration_seconds": args.freeze_duration,
            "freeze_noise_db": args.freeze_noise_db,
            "silence_duration_seconds": args.silence_duration,
            "silence_noise_db": args.silence_noise_db,
        },
    }

    if args.json_path:
        write_json(report, args.json_path)
    if args.json_path != "-":
        print(human_summary(report))
    if not decode_passed:
        print("error: ffmpeg did not decode the complete file", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

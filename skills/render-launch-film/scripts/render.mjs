#!/usr/bin/env node
/*
 * render.mjs — turn a seekable web page into an MP4, one frame at a time.
 *
 * The page under --dir must expose the seek harness:
 *   window.__ready     true once fonts are loaded and the first frame is drawn
 *   window.__duration  film length in seconds
 *   window.__seek(t)   draws the frame at t and resolves after it has painted
 * It should also hide its own playback UI when the query string contains
 * chrome=0, and its frame furniture when it contains frame=0.
 *
 * Capture writes PNGs to a frames directory; ffmpeg then encodes that
 * directory. The two passes are deliberately separate — piping frames straight
 * into an encoder deadlocks the capture if the encoder ever goes away.
 *
 * Requirements: Node 22+, ffmpeg on PATH, and Chrome or Chromium. Set
 * CHROME_PATH if the binary lives outside the usual locations.
 *
 *   node render.mjs                          # 1080p30 -> film.mp4
 *   node render.mjs --dir ./film --fps 60    # smoother, twice the capture time
 *   node render.mjs --from 12 --to 20        # one shot only
 *   node render.mjs --stills 2,9,24 --sheet  # review grid, order preserved
 *   node render.mjs --encode-only            # re-encode kept frames
 */

import { spawn } from "node:child_process";
import { once } from "node:events";
import { createReadStream, existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";

const MIME = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/snap/bin/chromium",
].filter(Boolean);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* -------------------------------------------------------------------- args */

const NUMERIC = new Set([
  "fps",
  "width",
  "height",
  "crf",
  "from",
  "to",
  "still",
  "columns",
  "scale",
]);
const STRING = new Set(["dir", "page", "out", "preset", "frames", "query"]);

function parseArgs(argv) {
  const options = {
    dir: process.cwd(),
    page: "index.html",
    out: "film.mp4",
    fps: 30,
    width: 1920,
    height: 1080,
    scale: 1,
    from: 0,
    to: null,
    still: null,
    stills: null,
    sheet: false,
    columns: null,
    crf: 16,
    preset: "slow",
    frames: null,
    keepFrames: false,
    encodeOnly: false,
    frameMarks: true,
    query: "",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (!flag.startsWith("--")) throw new Error(`Unexpected argument: ${flag}`);
    const key = flag.slice(2);
    const value = argv[i + 1];

    if (NUMERIC.has(key)) {
      options[key] = Number(value);
      i += 1;
    } else if (STRING.has(key)) {
      options[key] = value;
      i += 1;
    } else if (key === "stills") {
      options.stills = value.split(",").map(Number);
      i += 1;
    } else if (key === "sheet") {
      options.sheet = true;
    } else if (key === "keep-frames") {
      options.keepFrames = true;
    } else if (key === "encode-only") {
      options.encodeOnly = true;
      options.keepFrames = true;
    } else if (key === "no-frame-marks") {
      options.frameMarks = false;
    } else {
      throw new Error(`Unknown flag: ${flag}`);
    }
  }

  options.dir = path.resolve(options.dir);
  options.out = path.resolve(options.out);
  options.frames = path.resolve(options.frames ?? path.join(options.dir, ".frames"));
  return options;
}

/* ------------------------------------------------------------ static files */

async function serveDirectory(root) {
  const server = createServer((req, res) => {
    const name = decodeURIComponent(new URL(req.url, "http://local").pathname);
    const file = path.join(root, name === "/" ? "index.html" : name);
    if (!file.startsWith(root)) {
      res.writeHead(403).end();
      return;
    }
    const stream = createReadStream(file);
    stream.on("error", () => res.writeHead(404).end());
    stream.on("open", () => {
      res.writeHead(200, {
        "cache-control": "no-store",
        "content-type": MIME[path.extname(file)] ?? "application/octet-stream",
      });
      stream.pipe(res);
    });
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return { server, port: server.address().port };
}

/* ------------------------------------------------------------------ chrome */

async function launchChrome({ width, height, scale }) {
  const binary = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));
  if (!binary) {
    throw new Error(
      "No Chrome or Chromium found. Install one, or set CHROME_PATH to its binary.",
    );
  }

  const profile = await mkdtemp(path.join(tmpdir(), "render-film-"));
  const child = spawn(
    binary,
    [
      "--headless=new",
      "--remote-debugging-port=0",
      `--user-data-dir=${profile}`,
      `--window-size=${width},${height}`,
      `--force-device-scale-factor=${scale}`,
      "--hide-scrollbars",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
      "--mute-audio",
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );

  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr = `${stderr}${chunk}`.slice(-2000);
  });

  const portFile = path.join(profile, "DevToolsActivePort");
  let port = null;
  for (let attempt = 0; attempt < 120 && port === null; attempt += 1) {
    await wait(100);
    if (child.exitCode !== null) {
      throw new Error(`Chrome exited ${child.exitCode}\n${stderr}`);
    }
    try {
      port = Number((await readFile(portFile, "utf8")).split("\n")[0]);
    } catch {
      /* the port file is not written yet */
    }
  }
  if (!port) throw new Error(`Chrome never exposed a DevTools port\n${stderr}`);

  return {
    port,
    async close() {
      child.kill("SIGTERM");
      await rm(profile, { recursive: true, force: true }).catch(() => {});
    },
  };
}

/** Minimal Chrome DevTools Protocol client bound to one page target. */
class Devtools {
  #socket;
  #nextId = 1;
  #pending = new Map();

  constructor(socket) {
    this.#socket = socket;
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      const entry = this.#pending.get(message.id);
      if (!entry) return;
      this.#pending.delete(message.id);
      if (message.error) entry.reject(new Error(message.error.message));
      else entry.resolve(message.result);
    });
    socket.addEventListener("close", () => {
      for (const entry of this.#pending.values()) {
        entry.reject(new Error("DevTools socket closed"));
      }
      this.#pending.clear();
    });
  }

  static async attach(port) {
    for (let attempt = 0; attempt < 60; attempt += 1) {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const target = (await response.json()).find((entry) => entry.type === "page");
      if (target?.webSocketDebuggerUrl) {
        const socket = new WebSocket(target.webSocketDebuggerUrl);
        await once(socket, "open");
        return new Devtools(socket);
      }
      await wait(100);
    }
    throw new Error("No page target became available.");
  }

  send(method, params = {}) {
    const id = this.#nextId++;
    return new Promise((resolve, reject) => {
      this.#pending.set(id, { resolve, reject });
      this.#socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression, awaitPromise = false) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      const { exception, text } = result.exceptionDetails;
      throw new Error(exception?.description ?? text ?? "evaluation failed");
    }
    return result.result.value;
  }

  close() {
    this.#socket.close();
  }
}

/* ---------------------------------------------------------------- encoding */

function runFfmpeg(args) {
  const ffmpeg = spawn("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
  let log = "";
  ffmpeg.stderr.on("data", (chunk) => {
    log = `${log}${chunk}`.slice(-4000);
  });
  return once(ffmpeg, "close").then(([code]) => {
    if (code !== 0) throw new Error(`ffmpeg exited ${code}\n${log}`);
  });
}

const encode = (options) =>
  runFfmpeg([
    "-y",
    "-framerate", String(options.fps),
    "-i", path.join(options.frames, "f-%05d.png"),
    "-c:v", "libx264",
    "-preset", options.preset,
    "-crf", String(options.crf),
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    options.out,
  ]);

/**
 * Tile stills into one review grid. Inputs are concatenated in the order given
 * rather than globbed, because glob order is lexicographic and would scramble
 * timestamps such as 5.9 and 13.1.
 */
async function contactSheet(files, options) {
  const columns = options.columns ?? Math.min(4, Math.ceil(Math.sqrt(files.length)));
  const rows = Math.ceil(files.length / columns);
  const streams = files.map((_, i) => `[${i}:v]`).join("");
  const sheet = path.join(path.dirname(files[0]), "sheet.png");
  await runFfmpeg([
    "-y",
    "-loglevel", "error",
    ...files.flatMap((file) => ["-i", file]),
    "-filter_complex",
    `${streams}concat=n=${files.length}:v=1:a=0,scale=640:-2,` +
      `tile=${columns}x${rows}:padding=6:color=0x2c2c2c`,
    "-frames:v", "1",
    sheet,
  ]);
  return sheet;
}

/* -------------------------------------------------------------------- main */

async function capture(options) {
  const { server, port: httpPort } = await serveDirectory(options.dir);
  const chrome = await launchChrome(options);
  const cdp = await Devtools.attach(chrome.port);

  try {
    await cdp.send("Page.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: options.width,
      height: options.height,
      deviceScaleFactor: options.scale,
      mobile: false,
    });

    const query = [
      "chrome=0",
      "play=0",
      options.frameMarks ? null : "frame=0",
      options.query || null,
    ]
      .filter(Boolean)
      .join("&");
    await cdp.send("Page.navigate", {
      url: `http://127.0.0.1:${httpPort}/${options.page}?${query}`,
    });

    let ready = false;
    for (let attempt = 0; attempt < 300 && !ready; attempt += 1) {
      await wait(100);
      ready = Boolean(
        await cdp.evaluate("window.__ready === true").catch(() => false),
      );
    }
    if (!ready) {
      throw new Error(
        `${options.page} never set window.__ready. Check the seek harness.`,
      );
    }
    // Give webfonts a beat to paint before the first capture.
    await wait(400);

    const duration = await cdp.evaluate("window.__duration");
    const shoot = async (t) => {
      await cdp.evaluate(`window.__seek(${t})`, true);
      const { data } = await cdp.send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: false,
      });
      return Buffer.from(data, "base64");
    };

    const stills =
      options.stills ?? (options.still === null ? null : [options.still]);

    if (stills) {
      const written = [];
      for (const at of stills) {
        const file = path.join(options.dir, "stills", `t-${at}.png`);
        await mkdir(path.dirname(file), { recursive: true });
        await writeFile(file, await shoot(at));
        written.push(file);
        process.stdout.write(`${file}\n`);
      }
      if (options.sheet && written.length > 1) {
        process.stdout.write(`${await contactSheet(written, options)}\n`);
      }
      return;
    }

    const to = options.to ?? duration;
    const total = Math.round((to - options.from) * options.fps);
    if (total < 1) throw new Error("Nothing to render: check --from and --to.");

    await rm(options.frames, { recursive: true, force: true });
    await mkdir(options.frames, { recursive: true });

    const started = Date.now();
    for (let index = 0; index < total; index += 1) {
      const png = await shoot(options.from + index / options.fps);
      await writeFile(
        path.join(options.frames, `f-${String(index).padStart(5, "0")}.png`),
        png,
      );
      if (index % 20 === 0 || index === total - 1) {
        const done = index + 1;
        const rate = done / ((Date.now() - started) / 1000);
        const eta = Math.round((total - done) / Math.max(rate, 0.01));
        process.stderr.write(
          `\r  capture ${done}/${total}  ${rate.toFixed(1)} fps  eta ${eta}s   `,
        );
      }
    }
    process.stderr.write("\n");
    return true;
  } finally {
    cdp.close();
    await chrome.close();
    server.close();
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.encodeOnly) {
    await encode(options);
    process.stdout.write(`${options.out}\n`);
    return;
  }

  const captured = await capture(options);
  if (!captured) return;

  process.stderr.write("  encoding…\n");
  await encode(options);
  if (!options.keepFrames) {
    await rm(options.frames, { recursive: true, force: true });
  }
  process.stdout.write(`${options.out}\n`);
}

await main();

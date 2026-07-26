/*
 * engine.js — deterministic timeline runtime.
 *
 * Boilerplate: copy it as-is and author shots in sequence.js. The one rule it
 * enforces by construction is that a frame depends only on t, so render.mjs can
 * ask for any frame in any order and always get the same pixels.
 */

const stage = document.getElementById("stage");
const params = new URLSearchParams(location.search);

/**
 * Crossfade length at each end of a shot, in seconds. The last shot's outgoing
 * fade is the film's fade to black, so leave a hold before it.
 */
export const FADE = 0.4;

/* ------------------------------------------------------------------- maths */

export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a, b, k) => a + (b - a) * k;
export const mix = (a, b, k) => lerp(a, b, clamp01(k));

/** Progress through a window that opens at `start` and lasts `dur`. */
export const p = (t, start, dur) => clamp01((t - start) / dur);

export const outCubic = (k) => 1 - (1 - k) ** 3;
export const outQuint = (k) => 1 - (1 - k) ** 5;
export const inOut = (k) => (k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2);
export const outBack = (k) => 1 + 2.2 * (k - 1) ** 3 + 1.2 * (k - 1) ** 2;

/** Eased progress for item `i` of a staggered group. */
export const stag = (t, start, dur, i, step, ease = outQuint) =>
  ease(p(t, start + i * step, dur));

/* --------------------------------------------------------------------- dom */

export const O = (node, v) => {
  node.style.opacity = String(v);
};

export const T = (node, x = 0, y = 0, s = 1, extra = "") => {
  node.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s}) ${extra}`;
};

export const make = (tag, cls, html) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (html !== undefined) node.innerHTML = html;
  return node;
};

export const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Position of a node inside #stage, unaffected by preview scaling. */
export function stagePos(node) {
  let x = 0;
  let y = 0;
  let n = node;
  while (n && n !== stage) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent;
  }
  return { x, y, w: node.offsetWidth, h: node.offsetHeight };
}

/** Width of a node's rendered text, in stage units. */
export function textWidth(node) {
  const range = document.createRange();
  range.selectNodeContents(node);
  const scale = node.getBoundingClientRect().width / node.offsetWidth;
  return range.getBoundingClientRect().width / scale;
}

/* ------------------------------------------------------------------- shots */

const shots = [];

/**
 * Register a shot. `build` receives its section element and a role lookup, and
 * returns the per-frame draw function, called with time local to the shot.
 */
export function shot(name, start, end, build) {
  const root = stage.querySelector(`[data-shot="${name}"]`);
  if (!root) throw new Error(`No [data-shot="${name}"] element in the stage.`);
  const q = (role) => root.querySelector(`[data-role="${role}"]`);
  shots.push({ name, start, end, root, draw: build(root, q) });
}

/* ----------------------------------------------------------------- runtime */

let duration = 0;
let time = 0;
let playing = false;
let last = 0;

const furniture = {
  frame: stage.querySelector('[data-role="frame"]'),
  timecode: stage.querySelector('[data-role="timecode"]'),
  shotName: stage.querySelector('[data-role="shotname"]'),
};

const transport = {
  toggle: document.querySelector('[data-role="toggle"]'),
  scrub: document.querySelector('[data-role="scrub"]'),
  readout: document.querySelector('[data-role="readout"]'),
};

function timecode(t) {
  const whole = Math.floor(t);
  const mm = String(Math.floor(whole / 60)).padStart(2, "0");
  const ss = String(whole % 60).padStart(2, "0");
  const ff = String(Math.floor((t - whole) * 30)).padStart(2, "0");
  return `${mm}:${ss}:${ff}`;
}

function render(t) {
  for (const s of shots) {
    if (t < s.start - 0.001 || t > s.end + 0.001) {
      if (s.root.style.visibility !== "hidden") {
        O(s.root, 0);
        s.root.style.visibility = "hidden";
      }
      continue;
    }
    s.root.style.visibility = "visible";
    O(s.root, Math.min(p(t, s.start, FADE), 1 - p(t, s.end - FADE, FADE)));
    s.draw(t - s.start);
  }

  const index = Math.max(
    shots.findLastIndex((s) => t >= s.start),
    0,
  );
  if (furniture.frame) {
    O(furniture.frame, p(t, 0.6, 1.0) * (1 - p(t, duration - 1.4, 1.2)));
  }
  if (furniture.timecode) furniture.timecode.textContent = timecode(t);
  if (furniture.shotName) {
    furniture.shotName.textContent = `${String(index + 1).padStart(2, "0")} / ${String(
      shots.length,
    ).padStart(2, "0")} · ${shots[index].name}`;
  }
}

function fit() {
  stage.style.transform = `scale(${Math.min(
    window.innerWidth / stage.offsetWidth,
    window.innerHeight / stage.offsetHeight,
  )})`;
}

function syncTransport() {
  if (!transport.scrub) return;
  transport.scrub.value = String(Math.round((time / duration) * 1000));
  transport.readout.textContent = `${time.toFixed(2)} / ${duration.toFixed(2)}`;
  transport.toggle.textContent = playing ? "❚❚" : "▶";
}

function seek(next) {
  time = Math.max(0, Math.min(duration, next));
  render(time);
  syncTransport();
}

function tick(now) {
  if (playing) {
    time = Math.min(duration, time + (now - last) / 1000);
    if (time >= duration) playing = false;
    render(time);
    syncTransport();
  }
  last = now;
  requestAnimationFrame(tick);
}

function wireTransport() {
  if (!transport.toggle) return;
  transport.toggle.addEventListener("click", () => {
    if (time >= duration) time = 0;
    playing = !playing;
    syncTransport();
  });
  transport.scrub.addEventListener("input", () => {
    playing = false;
    seek((Number(transport.scrub.value) / 1000) * duration);
  });
  window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      event.preventDefault();
      transport.toggle.click();
    }
    if (event.code === "ArrowRight") seek(time + (event.shiftKey ? 5 : 1));
    if (event.code === "ArrowLeft") seek(time - (event.shiftKey ? 5 : 1));
  });
}

function startTime() {
  const named = params.get("shot");
  const found = named && shots.find((s) => s.name === named);
  return found ? found.start + 0.01 : Number(params.get("t") || 0);
}

/** Call once, after every shot is registered. */
export function start() {
  duration = shots.reduce((max, s) => Math.max(max, s.end), 0);
  if (params.get("chrome") === "0") document.body.dataset.chrome = "0";
  if (params.get("frame") === "0") document.body.dataset.frame = "0";

  fit();
  window.addEventListener("resize", fit);
  wireTransport();

  window.__duration = duration;
  window.__seek = (t) => {
    playing = false;
    time = t;
    render(t);
    return new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
  };

  document.fonts.ready.then(() => {
    fit();
    seek(startTime());
    playing = params.get("play") !== "0" && params.get("chrome") !== "0";
    requestAnimationFrame(tick);
    window.__ready = true;
  });
}

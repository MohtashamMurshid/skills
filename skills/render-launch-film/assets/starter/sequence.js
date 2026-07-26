/*
 * sequence.js — the film. Replace these three shots with your own.
 *
 * Rules that keep it renderable:
 *   1. Every animated value is written from t on every frame.
 *   2. No CSS transitions or animations anywhere inside #stage.
 *   3. Nothing reads the previous frame's state.
 */

import {
  esc,
  inOut,
  make,
  mix,
  O,
  outBack,
  outCubic,
  outQuint,
  p,
  shot,
  stag,
  start,
  T,
} from "./engine.js";

/* 01 ---------------------------------------------------------------- title */

shot("title", 0, 6.6, (root, q) => {
  const bloom = root.querySelector(".bloom");
  const eyebrow = q("eyebrow");
  const lines = [q("line1"), q("line2")];
  const rule = q("rule");
  const lede = q("lede");

  return (t) => {
    O(bloom, mix(0.2, 1, outCubic(p(t, 0, 2.2))));

    const eb = outCubic(p(t, 0.25, 0.9));
    O(eyebrow, eb);
    T(eyebrow, 0, mix(16, 0, eb));

    // A masked line rises from below its own overflow box.
    lines.forEach((line, i) => {
      const k = stag(t, 0.5, 1.2, i, 0.14);
      line.style.transform = `translateY(${mix(118, 0, k)}%)`;
    });

    const ruleIn = outQuint(p(t, 1.35, 1.1));
    rule.style.transform = `scaleX(${ruleIn})`;
    O(rule, ruleIn);

    const ledeIn = outCubic(p(t, 1.6, 1.1));
    O(lede, ledeIn);
    T(lede, 0, mix(20, 0, ledeIn));
  };
});

/* 02 --------------------------------------------------------------- pillars */

const PILLARS = [
  ["[01]", "First pillar", "One sentence that earns its place on screen."],
  ["[02]", "Second pillar", "Concrete, specific, and true."],
  ["[03]", "Third pillar", "No adjectives doing the work of facts."],
];

shot("pillars", 6.2, 14.0, (root, q) => {
  const label = q("label");
  const host = q("cards");
  const foot = q("foot");

  const cards = PILLARS.map(([number, title, body]) => {
    const card = make(
      "article",
      "card",
      `<p>${esc(number)}</p><h3>${esc(title)}</h3><span>${esc(body)}</span>`,
    );
    host.append(card);
    return card;
  });

  return (t) => {
    const labelIn = outCubic(p(t, 0.1, 0.8));
    O(label, labelIn);
    T(label, mix(-18, 0, labelIn), 0);

    cards.forEach((card, i) => {
      const k = stag(t, 0.5, 1.1, i, 0.16);
      O(card, k);
      T(card, 0, mix(44, 0, k), mix(0.94, 1, k));
    });

    const footIn = outCubic(p(t, 2.6, 1.0));
    O(foot, footIn * (1 - p(t, 7.0, 0.6)));
    T(foot, 0, mix(14, 0, footIn));
  };
});

/* 03 -------------------------------------------------------------- endcard */

shot("end", 13.6, 19.0, (root, q) => {
  const bloom = root.querySelector(".bloom");
  const badge = q("badge");
  const word = q("word");
  const rule = q("rule");
  const url = q("url");

  const letters = [...word.textContent].map((ch) => {
    const span = make("span", null, esc(ch));
    span.style.display = "inline-block";
    return span;
  });
  word.textContent = "";
  word.append(...letters);

  return (t) => {
    O(bloom, mix(0.1, 1, outCubic(p(t, 0, 1.8))) * (1 - p(t, 4.2, 1.2)));

    const badgeIn = outBack(p(t, 0.15, 1.1));
    O(badge, p(t, 0.15, 0.6));
    badge.style.transform = `scale(${Math.max(badgeIn, 0)})`;

    letters.forEach((letter, i) => {
      const k = stag(t, 0.7, 0.8, i, 0.055, outCubic);
      O(letter, k);
      letter.style.transform = `translateY(${mix(30, 0, k)}px)`;
    });

    const ruleIn = outQuint(p(t, 1.5, 1.1));
    rule.style.transform = `scaleX(${ruleIn})`;
    O(rule, ruleIn);

    const urlIn = inOut(p(t, 2.0, 1.0));
    O(url, urlIn);
    T(url, 0, mix(12, 0, urlIn));
  };
});

start();

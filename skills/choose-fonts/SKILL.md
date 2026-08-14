---
name: choose-fonts
description: Choose and pair fonts for visual design.
---

# Choose Fonts

Treat typography as a system of roles, not a list of fashionable names. Select the smallest set of typefaces that creates the intended voice, reads well in the target medium, and can actually ship.

## Start with the brief

Before naming fonts, establish:

- **Medium:** product UI, editorial page, identity, deck, social graphic, captions, or motion title.
- **Voice:** choose three useful adjectives, such as precise, warm, institutional, playful, cinematic, technical, or luxurious.
- **Text conditions:** headline length, body density, data, code, numerals, captions, and smallest size.
- **Language and script:** verify every required glyph, diacritic, punctuation mark, shaping behavior, and weight.
- **Constraints:** webfont budget, variable-font support, available licenses, brand rules, and editable-deliverable requirements.

If these facts are missing, state assumptions and recommend a reversible default.

## Assign roles before families

Define the jobs the type system must perform:

1. **Display:** expressive headlines, title cards, campaign moments.
2. **Text:** paragraphs, labels, subtitles, documentation.
3. **Utility:** UI controls, tables, dense metadata, numerals.
4. **Mono:** code or technical identifiers only when the content needs it.

One family can cover several roles. Default to one family with varied weight, width, size, and case. Add a second family only when the contrast clarifies hierarchy or creates a deliberate voice.

## Choose by structure

Describe useful traits before searching by name:

- serif or sans;
- humanist, grotesk, geometric, neo-grotesk, old-style, transitional, slab, or display;
- narrow or wide proportions;
- low or high stroke contrast;
- small or large x-height;
- soft or sharp terminals;
- restrained or distinctive construction.

Match structure to use. Large x-height and open counters usually help small UI text. Moderate proportions and calm texture help long reading. Condensed or high-contrast faces are better reserved for large, short display copy unless proven readable at body sizes.

## Pair by controlled contrast

Pair typefaces that differ clearly on one or two axes while sharing enough rhythm to coexist:

- serif display + neutral sans text;
- heavy grotesk display + restrained sans text;
- geometric sans display + humanist sans text;
- expressive script or display + quiet utility sans;
- wide display + compact text face.

Avoid near-duplicates. Two similar neo-grotesks usually look accidental. Do not combine two loud display faces, use scripts for paragraphs, or force a font into a role its available weights and glyphs cannot support.

Read [references/font-pairings.md](references/font-pairings.md) for pairing recipes, reference combinations, practical alternatives, and use cases.

## Set the system, not only the names

Specify:

- family and fallback stack for each role;
- exact style, weight, and variable axes;
- size, line-height, tracking, and casing by role;
- maximum body measure and minimum rendered size;
- numeral style for data-heavy work;
- loading strategy and acceptable substitutions.

Start with these ranges, then adjust optically:

- body line-height: `1.4–1.7`;
- body measure: `45–75ch`;
- all-caps tracking: usually positive;
- large display tracking: often neutral to slightly negative;
- small text tracking: avoid negative tracking when glyphs begin to crowd or apertures lose clarity.

Do not compensate for a poor font choice with extreme tracking, artificial bold, fake italics, outlines, or excessive effects.

## Verify with real content

Create a proof using the actual longest headline, a paragraph, buttons, labels, numerals, punctuation, and every required language. Compare at least two viable directions in the final medium—not in an isolated specimen.

Check:

- hierarchy at a glance;
- body readability and line texture;
- ambiguous characters such as `I/l/1`, `O/0`, and `8/B` where relevant;
- wrapping, clipping, accents, shaping, and fallback behavior;
- font loading, layout shift, and file weight on the web;
- licensing for the exact distribution method.

If the preferred face is unavailable or unlicensed, choose a metrically and stylistically reasonable substitute and explain the trade-off. Never imply that a font is free, bundled, or licensed without verification.

## Return a decision

Provide:

1. **Direction:** one sentence connecting the typography to the desired voice.
2. **Primary choice:** display and text/utility roles with exact styles.
3. **Why it works:** contrast, shared traits, and medium fit.
4. **Typescale:** representative sizes, leading, tracking, and casing.
5. **Fallbacks:** practical system or open alternatives.
6. **Risks:** license, performance, coverage, or readability concerns.
7. **Proof:** a rendered specimen or implementation when tools permit; otherwise a copy-ready specimen brief.

Do not dump ten unranked options. Recommend one direction, provide one credible alternative, and make the decision testable.

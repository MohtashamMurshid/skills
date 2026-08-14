# Font pairing recipes

Use these as structural recipes, not immutable rules. Verify the exact font name, files, license, styles, and language coverage before shipping.

## Pair by effect

| Desired effect | Display role | Text / utility role | Why it works | Watch for |
| --- | --- | --- | --- | --- |
| Premium editorial | high-contrast serif | restrained neo-grotesk sans | dramatic stroke contrast against quiet utility | delicate serifs at small sizes |
| Technical editorial | sturdy serif or slab | neutral grotesk | authority plus clean annotation | overly mechanical body texture |
| Modern product | same variable sans in bold and regular styles | same family | coherent, fast, and easy to maintain | hierarchy that relies on weight alone |
| Distinctive product | geometric or wide sans | humanist sans | designed headline voice with readable controls | similar x-heights but conflicting shapes |
| Friendly consumer | soft display serif or rounded sans | open humanist sans | warmth without sacrificing utility | childish tone from excessive roundness |
| Culture / fashion | narrow or high-contrast display | plain grotesk | expressive silhouette grounded by neutral copy | unreadable long or animated headlines |
| Cinematic title | expressive serif, script, or condensed display | compact neutral sans | emotional title against stable credits and captions | scripts, thin strokes, and motion blur |
| Data / research | restrained sans or serif | sans with strong numerals; optional mono for identifiers | hierarchy remains legible under density | using mono for all body copy |

## Reference combinations

These combinations demonstrate contrast patterns seen in contemporary design references. They are inspiration, not proof of licensing or suitability:

- **Tempting + Switzer** — expressive script against a sturdy modern sans.
- **Inter + Times** — utilitarian interface sans against a familiar editorial serif.
- **Open Sauce + Peace Sans** — neutral support face against a bold, soft display sans.
- **Inter + Tempting** — quiet utility sans against an expressive script accent.
- **Avant Garde + Cooper** — geometric modernism against warm retro softness.

Do not use `Times` merely because it is installed, or use `Inter` merely because it is safe. The contrast must serve the voice and content.

## Open-source starting points

Check the current license and available subsets before use.

| Direction | Candidate pairing | Typical use |
| --- | --- | --- |
| Editorial authority | Newsreader + Inter | reports, essays, research narratives |
| Literary but contemporary | Source Serif 4 + Source Sans 3 | documentation, publications, institutions |
| Sharp product editorial | Instrument Serif + Instrument Sans | launches, portfolios, premium product pages |
| Warm and readable | Fraunces + Public Sans | approachable brands and feature stories |
| Modern geometric | Space Grotesk + Source Sans 3 | technical products and studios |
| Strong display contrast | Archivo Black + Archivo | campaigns, title cards, social graphics |
| Condensed impact | Bebas Neue + Inter | posters and short video titles; not body copy |
| Playful display | Bungee + Atkinson Hyperlegible | youth, events, high-energy graphics |
| Single-family system | IBM Plex Sans + IBM Plex Mono | developer tools and data products |
| Single-superfamily editorial | Roboto Slab + Roboto | practical cross-medium systems |

## Fallback logic

Choose fallbacks by metrics and role, not only by generic class.

```css
:root {
  --font-display: "Newsreader", Georgia, "Times New Roman", serif;
  --font-text: "Inter", "Helvetica Neue", Arial, sans-serif;
  --font-mono: "IBM Plex Mono", "SFMono-Regular", Consolas, monospace;
}
```

For a web implementation:

1. Prefer WOFF2 and only the required styles, or one subsetted variable font when it is smaller in practice.
2. Preload only fonts needed above the fold.
3. Use `font-display` deliberately; do not hide essential text indefinitely.
4. Test the fallback before the webfont arrives and after it loads.
5. Measure layout shift and line-wrap changes with the real copy.

## Proof specimen

A useful proof includes all of the following:

```text
Display: The longest real headline in the project
Deck: Q3 infrastructure review — Malaysia / SEA
Body: 80–120 words of representative prose with punctuation and links.
UI: Create report   Cancel   Updated 12:45 PM
Data: RM 1,234.56   98.7%   0O 1Il   8B
Code: citysage.eval/run_042
Language: every required script, diacritic, and locale-specific mark
```

Render the proof at target sizes and widths. A pairing that looks good as two giant names can still fail in navigation, captions, tables, or subtitles.

# AFTERGLOW — Vice City Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/bayuanwar8/afterglow/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/bayuanwar8/afterglow/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

AFTERGLOW turns your own photos into cinematic cover art in the spirit of
GTA 6's posters: asymmetric multi-panel layouts, a pop-out hero cut-out,
retro chrome lettering and a sunset grade — exported as a PNG to share. It
runs entirely offline in a desktop browser: your photos never leave your
machine.

## What it does

- **Six asymmetric layouts** — Sunset Mosaic (7 panels), Afterglow Hero
  (pop-out cut-out), Vice Triptych, Coast Split, Editorial Four (slanted
  dividers) and Premium Seven (diagonal hero blade). Every layout has its
  own composition and character.
- **Four art directions** — Afterglow Sunset, Midnight District, Coastline
  Stories and Chromatic Heat. One click changes the grade, the type style,
  the frame colour and the background wash together.
- **Character & depth engine** — pop-out hero with drop shadow and golden
  rim light, face-aware focal points, per-photo zoom / pan / rotation.
- **Premium typography** — three styles drawn as artwork: Chrome Stripes
  (extruded metallic gradient with retro stripes), Neon Script and Sunset
  Serif (gold foil). Title, script subtitle, tagline ribbon, quote strip,
  cast role tags and location stickers are all editable.
- **Colour grading** — eight presets (Golden Hour, Coral Sunset, Pink
  Horizon, Electric Vice, Midnight Neon, Tropical Film, Warm Chrome,
  Cinematic Noir) plus nine manual controls: exposure, contrast,
  saturation, temperature, highlights, shadows, vignette, grain, glow.
- **Pro editor** — three-column studio: left rail (photos, layouts,
  directions, type, grades, elements), centre canvas (click a panel to
  select it, drag to pan, scroll to zoom), right inspector (per-panel
  crop, focal point, role, sticker), top bar (undo, redo, reset, export).
- **Export** — real full-resolution PNG re-renders at 1080×1080,
  1080×1350, 1920×1080 or a custom size, identical to the preview.

## How to run

```sh
node serve.ts            # serves app/ on http://localhost:8080
```

Open http://localhost:8080 in a desktop browser. No build step, no
network: the app is plain static files under `app/`.

To build the submission package:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts   # writes out/dossier.json + out/app + out/screenshots
```

## Structure

```
main.ts               Node 22 program: copies app/ + screenshots/ to /output, writes dossier.json
serve.ts              tiny static server for local development
vendor/makefun-app.ts make.fun library, unchanged from the starter kit
app/
  index.html          editor shell (top bar, left rail, canvas, inspector)
  style.css           dark coral-and-violet studio theme
  src/
    main.js           editor wiring: state, undo/redo, upload, export
    render.js         the cover renderer (panels, grade, title, elements)
    layouts.js        six layouts + four art directions
    grade.js          eight presets + manual controls + grain/halftone
    type.js           chrome / neon / serif headline painters
    elements.js       seal, barcode, cast tags, stickers, quote, billing
    state.js          default cover state
    shots.js          fixed ?shot= scenes for screenshots
  fonts/              Anton, Caveat, Playfair Display (SIL OFL, see OFL-*.txt)
  samples/            six original sample photos, made for this entry
screenshots/         1-cover, 2-editor, 3-cover, 4-cover
```

## Licenses

- Code and sample photos: MIT (see LICENSE). The sample photos were
  generated for this entry and are free to use.
- Fonts: Anton, Caveat and Playfair Display, all under the SIL Open Font
  License 1.1 — see `app/fonts/OFL-anton.txt`, `OFL-caveat.txt` and
  `OFL-playfair.txt`.
- No Rockstar Games logo, artwork, characters or fonts are used anywhere.

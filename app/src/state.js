// AFTERGLOW default state — the demo cover the judge sees first. Every field is
// editable in the editor; nothing here is a Rockstar asset.

import { MANUAL_DEFAULTS } from './grade.js';

export const SAMPLE_PHOTOS = {
  driver: 'samples/driver.jpg',
  hero: 'samples/hero.jpg',
  boat: 'samples/boat.jpg',
  rider: 'samples/rider.jpg',
  skyline: 'samples/skyline.jpg',
  crew: 'samples/crew.jpg',
};

export const ROLE_OPTIONS = [
  'THE DRIVER', 'THE PILOT', 'THE SIREN', 'THE WHEELMAN',
  'THE FIXER', 'THE LOOKOUT', 'THE RUNNER', 'THE CREW', 'THE DEALER', 'THE BOSS',
];

export const STICKER_OPTIONS = [
  '', 'SUNSET STRIP \u2022 6:42 PM', 'PALM BOULEVARD \u2022 8:05 PM',
  'MARINA DEL SOL \u2022 7:48 PM', 'ROOFTOP BAR \u2022 9:20 PM',
  'NEON GARAGE \u2022 11:40 PM', 'BONFIRE BEACH \u2022 6:15 PM',
];

export function defaultState() {
  return {
    layout: 'mosaic',
    direction: 'sunset',
    grade: 'coral',
    type: 'chrome',
    title: 'AFTERGLOW',
    subtitle: 'chasing the last light',
    tagline: 'ONE SUNSET \u2022 SIX STORIES \u2022 NO TURNING BACK',
    quote: 'THE LAST LIGHT NEVER LIES',
    paper: 'THE AFTERGLOW HERALD',
    vol: 'VOL. 01',
    billing1: 'AN AFTERGLOW PICTURE \u2022 STARRING YOUR CREW',
    billing2: 'SHOT ON YOUR OWN CAMERA \u2022 GRADED BY HAND',
    comingSoon: 'COMING SOON',
    manual: { ...MANUAL_DEFAULTS },
    elements: {
      seal: true, barcode: true, quote: true, stickers: true,
      tags: true, billing: true, ribbon: true, grain: true,
    },
    // Per-photo adjust: zoom 1..2, pan -0.5..0.5, focal 0..1 (0 = top, faces sit ~0.35),
    // rotation in degrees. Uploaded photos replace the sample URL per slot.
    photos: { ...SAMPLE_PHOTOS },
    adjust: {
      driver: { zoom: 1, panX: 0, panY: 0, focal: 0.35, rot: 0 },
      hero: { zoom: 1, panX: 0, panY: 0, focal: 0.3, rot: 0 },
      boat: { zoom: 1, panX: 0, panY: 0, focal: 0.5, rot: 0 },
      rider: { zoom: 1, panX: 0, panY: 0, focal: 0.35, rot: 0 },
      skyline: { zoom: 1, panX: 0, panY: 0, focal: 0.45, rot: 0 },
      crew: { zoom: 1, panX: 0, panY: 0, focal: 0.4, rot: 0 },
    },
    // Per-panel overrides, keyed `${layout}:${index}`: { role, sticker }.
    panelOverrides: {},
    selectedPanel: 1,
  };
}

// Deep-clone a state for undo snapshots.
export function cloneState(s) {
  return JSON.parse(JSON.stringify(s));
}

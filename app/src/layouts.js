// AFTERGLOW layouts — six asymmetric multi-panel compositions, all in fractions of
// the cover size (x, y, w, h). A panel may carry a cast `role` (people) or a location
// `sticker` (places). `pop` panels are drawn last, overlapping their neighbours with
// a drop shadow + rim light (the pop-out hero cut-out). `slant` cuts one vertical edge
// diagonally for a dynamic divider. `titleY` marks where the title block starts.

export const LAYOUTS = {
  mosaic: {
    name: 'Sunset Mosaic',
    blurb: 'Seven panels, big centre hero, title riding the lower row.',
    titleY: 0.65, titleAlign: 'center', titleH1: 0.14,
    panels: [
      { x: 0.005, y: 0.07, w: 0.2, h: 0.42, photo: 'driver', role: 'THE DRIVER', sticker: null },
      { x: 0.21, y: 0.07, w: 0.3, h: 0.42, photo: 'hero', role: 'THE PILOT', sticker: null },
      { x: 0.515, y: 0.07, w: 0.235, h: 0.42, photo: 'boat', role: null, sticker: 'MARINA DEL SOL \u2022 7:48 PM' },
      { x: 0.755, y: 0.07, w: 0.24, h: 0.42, photo: 'skyline', role: null, sticker: 'PALM BOULEVARD \u2022 8:05 PM' },
      { x: 0.005, y: 0.5, w: 0.24, h: 0.3, photo: 'rider', role: 'THE WHEELMAN', sticker: null },
      { x: 0.25, y: 0.5, w: 0.36, h: 0.3, photo: 'crew', role: 'THE CREW', sticker: null, focal: 1.0, zoom: 1.2, panX: 0.1, tagTop: true },
      { x: 0.615, y: 0.5, w: 0.38, h: 0.3, photo: 'driver', role: 'THE SIREN', sticker: null, focal: 0.3, tagTop: true },
    ],
  },
  hero: {
    name: 'Afterglow Hero',
    blurb: 'Pop-out hero cut-out on a painted sky, four small panels right.',
    titleY: 0.68, titleAlign: 'left', titleShiftX: 0.05,
    panels: [
      { x: 0.0, y: 0.06, w: 0.52, h: 0.78, photo: 'hero', role: 'THE PILOT', sticker: null, pop: true },
      { x: 0.53, y: 0.06, w: 0.23, h: 0.385, photo: 'driver', role: 'THE DRIVER', sticker: null },
      { x: 0.765, y: 0.06, w: 0.23, h: 0.385, photo: 'rider', role: 'THE WHEELMAN', sticker: null },
      { x: 0.53, y: 0.455, w: 0.23, h: 0.385, photo: 'boat', role: null, sticker: 'MARINA DEL SOL \u2022 7:48 PM' },
      { x: 0.765, y: 0.455, w: 0.23, h: 0.385, photo: 'crew', role: 'THE CREW', sticker: null },
    ],
  },
  triptych: {
    name: 'Vice Triptych',
    blurb: 'Three tall panels, centre hero rising above the pair.',
    titleY: 0.58, titleAlign: 'center',
    panels: [
      { x: 0.005, y: 0.07, w: 0.28, h: 0.52, photo: 'driver', role: 'THE DRIVER', sticker: null },
      { x: 0.29, y: 0.04, w: 0.42, h: 0.56, photo: 'hero', role: 'THE PILOT', sticker: null },
      { x: 0.715, y: 0.07, w: 0.28, h: 0.52, photo: 'rider', role: 'THE WHEELMAN', sticker: null },
    ],
  },
  split: {
    name: 'Coast Split',
    blurb: 'Full-height portrait hero left, stacked scenes right.',
    titleY: 0.66, titleAlign: 'left',
    panels: [
      { x: 0.005, y: 0.07, w: 0.44, h: 0.72, photo: 'hero', role: 'THE PILOT', sticker: null },
      { x: 0.455, y: 0.07, w: 0.54, h: 0.35, photo: 'boat', role: null, sticker: 'MARINA DEL SOL \u2022 7:48 PM' },
      { x: 0.455, y: 0.43, w: 0.54, h: 0.36, photo: 'crew', role: 'THE CREW', sticker: null },
    ],
  },
  editorial: {
    name: 'Editorial Four',
    blurb: 'Four panels with slanted dividers, title across the seam.',
    titleY: 0.44, titleAlign: 'center',
    panels: [
      { x: 0.005, y: 0.07, w: 0.49, h: 0.36, photo: 'driver', role: 'THE DRIVER', sticker: null, slant: 'r' },
      { x: 0.505, y: 0.07, w: 0.49, h: 0.36, photo: 'hero', role: 'THE PILOT', sticker: null, slant: 'l' },
      { x: 0.005, y: 0.44, w: 0.49, h: 0.36, photo: 'rider', role: 'THE WHEELMAN', sticker: null, slant: 'r' },
      { x: 0.505, y: 0.44, w: 0.49, h: 0.36, photo: 'skyline', role: null, sticker: 'SUNSET STRIP \u2022 6:42 PM', slant: 'l' },
    ],
  },
  premium: {
    name: 'Premium Seven',
    blurb: 'Diagonal hero blade, six small panels packed right.',
    titleY: 0.62, titleAlign: 'center',
    panels: [
      { x: 0.0, y: 0.06, w: 0.5, h: 0.76, photo: 'hero', role: 'THE PILOT', sticker: null, slant: 'r', pop: true },
      { x: 0.51, y: 0.06, w: 0.24, h: 0.25, photo: 'driver', role: 'THE DRIVER', sticker: null },
      { x: 0.755, y: 0.06, w: 0.24, h: 0.25, photo: 'boat', role: null, sticker: 'MARINA DEL SOL \u2022 7:48 PM' },
      { x: 0.51, y: 0.315, w: 0.24, h: 0.25, photo: 'rider', role: 'THE WHEELMAN', sticker: null },
      { x: 0.755, y: 0.315, w: 0.24, h: 0.25, photo: 'skyline', role: null, sticker: 'PALM BOULEVARD \u2022 8:05 PM' },
      { x: 0.51, y: 0.57, w: 0.24, h: 0.25, photo: 'crew', role: 'THE CREW', sticker: null },
      { x: 0.755, y: 0.57, w: 0.24, h: 0.25, photo: 'driver', role: 'THE SIREN', sticker: null, focal: 0.3 },
    ],
  },
};

export const LAYOUT_ORDER = ['mosaic', 'hero', 'triptych', 'split', 'editorial', 'premium'];

// Four original art directions: each picks a grade, a type style, a frame colour and
// a background wash so the whole poster shifts mood at one click.
export const DIRECTIONS = {
  sunset: {
    name: 'Afterglow Sunset', grade: 'coral', type: 'chrome', frame: '#e8b25a',
    bg: ['#2a1030', '#ff7a3d'], wash: 'rgba(255, 110, 60, 0.10)',
    blurb: 'Warm tropical sunset, golden rim light, palm silhouettes.',
  },
  midnight: {
    name: 'Midnight District', grade: 'midnight', type: 'neon', frame: '#8f7bff',
    bg: ['#0a0618', '#1c0f3d'], wash: 'rgba(90, 60, 255, 0.12)',
    blurb: 'Neon cyan and violet, wet streets, deep contrast.',
  },
  coast: {
    name: 'Coastline Stories', grade: 'tropical', type: 'serif', frame: '#f2e3c6',
    bg: ['#12303a', '#e8833a'], wash: 'rgba(255, 200, 120, 0.08)',
    blurb: 'Coastal city, luxury lifestyle, natural cinematic light.',
  },
  chromatic: {
    name: 'Chromatic Heat', grade: 'noir', type: 'chrome', frame: '#ff2e88',
    bg: ['#16060f', '#3d0a2e'], wash: 'rgba(255, 46, 136, 0.10)',
    blurb: 'Retro illustration, halftone dots, rich colour separation.',
  },
};

export const DIRECTION_ORDER = ['sunset', 'midnight', 'coast', 'chromatic'];

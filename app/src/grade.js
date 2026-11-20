// AFTERGLOW colour grading — eight presets plus nine manual controls. A grade is a
// CSS filter string for the photo plus a colour wash drawn over it (blend mode) so the
// whole cover reads as one graded print, never as a flat filter.

// filter: applied to the photo via ctx.filter. wash: [colour, globalCompositeOperation,
// alpha] drawn over the photo. sky: background gradient behind panels (unused sky
// behind the pop-out hero).
export const GRADES = {
  golden: {
    name: 'Golden Hour', filter: 'saturate(1.25) contrast(1.08) brightness(1.06) sepia(0.22)',
    wash: ['#ffb347', 'soft-light', 0.28], sky: ['#ff9a3d', '#ffd97a'],
  },
  coral: {
    name: 'Coral Sunset', filter: 'saturate(1.35) contrast(1.1) brightness(1.04) sepia(0.18) hue-rotate(-8deg)',
    wash: ['#ff5e78', 'soft-light', 0.26], sky: ['#ff6b4a', '#ff9e7d'],
  },
  pink: {
    name: 'Pink Horizon', filter: 'saturate(1.3) contrast(1.06) brightness(1.05) hue-rotate(-18deg)',
    wash: ['#ff7ad9', 'soft-light', 0.24], sky: ['#c86dd7', '#ff9ecf'],
  },
  electric: {
    name: 'Electric Vice', filter: 'saturate(1.5) contrast(1.14) brightness(1.02) hue-rotate(12deg)',
    wash: ['#7a5cff', 'overlay', 0.22], sky: ['#5b2ee5', '#ff5e9c'],
  },
  midnight: {
    name: 'Midnight Neon', filter: 'saturate(1.35) contrast(1.18) brightness(0.92) hue-rotate(18deg)',
    wash: ['#2e4bff', 'overlay', 0.26], sky: ['#0b1030', '#3b1d6e'],
  },
  tropical: {
    name: 'Tropical Film', filter: 'saturate(1.18) contrast(1.05) brightness(1.07) sepia(0.3)',
    wash: ['#ffd9a0', 'soft-light', 0.3], sky: ['#ffb35c', '#7ec8c0'],
  },
  chrome: {
    name: 'Warm Chrome', filter: 'saturate(1.15) contrast(1.16) brightness(1.08) sepia(0.12)',
    wash: ['#ffe9b0', 'soft-light', 0.26], sky: ['#f7c873', '#ff8a5c'],
  },
  noir: {
    name: 'Cinematic Noir', filter: 'saturate(0.85) contrast(1.28) brightness(0.94) sepia(0.08)',
    wash: ['#1a1a2e', 'multiply', 0.22], sky: ['#1a0f22', '#4a1030'],
  },
};

export const GRADE_ORDER = ['golden', 'coral', 'pink', 'electric', 'midnight', 'tropical', 'chrome', 'noir'];

// Manual controls, merged on top of the preset. Values are centred at 0 except
// vignette/grain/glow which start at their preset defaults.
export const MANUAL_DEFAULTS = {
  exposure: 0, contrast: 0, saturation: 0, temperature: 0,
  highlights: 0, shadows: 0, vignette: 0.32, grain: 0.5, glow: 0.5,
};

export function manualFilter(m) {
  const parts = [];
  const b = 1 + m.exposure * 0.35 + m.highlights * 0.1 - m.shadows * 0.06;
  const c = 1 + m.contrast * 0.3;
  const s = 1 + m.saturation * 0.45;
  parts.push(`brightness(${b.toFixed(3)})`);
  parts.push(`contrast(${c.toFixed(3)})`);
  parts.push(`saturate(${s.toFixed(3)})`);
  if (m.temperature !== 0) parts.push(`sepia(${Math.abs(m.temperature * 0.25).toFixed(3)}) hue-rotate(${(m.temperature * -12).toFixed(1)}deg)`);
  return parts.join(' ');
}

// Deterministic grain tile, generated once and tiled over the cover at low alpha.
let grainTile = null;
export function getGrainTile() {
  if (grainTile) return grainTile;
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  const img = g.createImageData(128, 128);
  let seed = 1337;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(rnd() * 255);
    img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  grainTile = c;
  return c;
}

// Halftone dot tile for the Chromatic Heat direction.
let halftoneTile = null;
export function getHalftoneTile() {
  if (halftoneTile) return halftoneTile;
  const c = document.createElement('canvas');
  c.width = 12; c.height = 12;
  const g = c.getContext('2d');
  g.fillStyle = '#000';
  g.beginPath(); g.arc(6, 6, 2.1, 0, Math.PI * 2); g.fill();
  halftoneTile = c;
  return c;
}

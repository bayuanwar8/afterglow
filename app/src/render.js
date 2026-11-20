// AFTERGLOW cover renderer — draws the whole poster on any canvas at any size.
// Photos come from `images` (photo key -> HTMLImageElement or null). Everything is
// drawn: panels, grade, pop-out hero, chrome title, script subtitle, ribbon, quote
// strip, seal, barcode, billing, vignette and grain.

import { LAYOUTS, DIRECTIONS } from './layouts.js';
import { GRADES, manualFilter, getGrainTile, getHalftoneTile } from './grade.js';
import { TYPE_STYLES, drawChromeTitle, drawNeonTitle, drawSerifTitle, drawScriptSubtitle } from './type.js';
import {
  drawBarcode, drawSeal, drawCastTag, drawSticker, drawQuoteStrip,
  drawBilling, drawRibbon, drawVolBadge, roundRect,
} from './elements.js';

// Lower skyline fill for the Vice Triptych cover: the three tall panels end
// around y 0.60H and the title is centred, so the lower half's flanks are
// empty gradient. A dim city silhouette + soft neon glows fill that void
// without touching any face (faces sit in the panels above 0.60H) or the
// billing/barcode row below 0.88H. Drawn before the title block.
function drawLowerSkyline(ctx, W, H, dir) {
  const baseY = H * 0.875;
  const glow = (x, y, r, color) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };
  glow(W * 0.10, H * 0.80, W * 0.12, 'rgba(103, 232, 249, 0.18)');
  glow(W * 0.90, H * 0.77, W * 0.12, 'rgba(255, 94, 196, 0.16)');
  // Deterministic skyline (fixed seed, so the dossier stays byte-identical).
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  let x = 0;
  while (x < W) {
    const bw = W * (0.03 + rnd() * 0.045);
    const bh = H * (0.09 + rnd() * 0.17);
    const bx = x, by = baseY - bh;
    ctx.fillStyle = 'rgba(10, 5, 26, 0.72)';
    ctx.fillRect(bx, by, bw, bh);
    if (rnd() > 0.6) {
      ctx.fillRect(bx + bw / 2 - 1, by - H * 0.03, 2, H * 0.03);
    }
    const wins = 3 + Math.floor(rnd() * 5);
    for (let i = 0; i < wins; i++) {
      ctx.fillStyle = rnd() > 0.5 ? 'rgba(103, 232, 249, 0.6)' : 'rgba(255, 94, 196, 0.55)';
      ctx.fillRect(bx + bw * (0.15 + rnd() * 0.7), by + bh * (0.15 + rnd() * 0.7), Math.max(2, W * 0.003), Math.max(2, W * 0.003));
    }
    x += bw + W * 0.004;
  }
  // Faint horizon light just above the skyline base.
  const horizon = ctx.createLinearGradient(0, baseY - H * 0.02, 0, baseY);
  horizon.addColorStop(0, 'rgba(143, 123, 255, 0)');
  horizon.addColorStop(1, 'rgba(143, 123, 255, 0.16)');
  ctx.fillStyle = horizon;
  ctx.fillRect(0, baseY - H * 0.02, W, H * 0.02);
}

function drawBottomBand(ctx, W, H, dir) {
  const top = H * 0.885, bot = H * 0.99;
  const bandH = bot - top;
  if (bandH < H * 0.04) return;
  ctx.save();
  // Palm silhouettes rising from the bottom edge: a long curved trunk and a
  // crown of fronds that arc out and droop well below the crown, so each tree
  // reads as a palm (not a starburst). Kept clear of the billing line
  // (centred) and of COMING SOON (bottom-left) and the barcode (bottom-right).
  ctx.strokeStyle = 'rgba(12, 4, 18, 0.85)';
  ctx.fillStyle = 'rgba(12, 4, 18, 0.85)';
  ctx.lineCap = 'round';
  const palm = (x, s, lean) => {
    ctx.save();
    ctx.translate(x, bot + 2);
    ctx.scale(s, s);
    // Long trunk, clearly curved, leaning slightly.
    const topX = lean * 26, topY = -78;
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(lean * 14, -42, topX, topY); ctx.stroke();
    // Crown: 8 fronds, each a long arc that rises then droops below the
    // crown — varied lengths and angles, never a symmetric star.
    ctx.lineWidth = 4;
    const fronds = [
      { a: -0.12, L: 46 }, { a: -0.5, L: 55 }, { a: -0.9, L: 60 },
      { a: -1.3, L: 58 }, { a: -1.7, L: 54 }, { a: -2.1, L: 50 },
      { a: -2.5, L: 44 }, { a: -2.9, L: 37 },
    ];
    for (const { a, L } of fronds) {
      const dx = Math.cos(a), dy = -Math.sin(a);
      const cxp = topX + dx * L * 0.55, cyp = topY - Math.abs(dy) * L * 0.8 - 8;
      const ex = topX + dx * L, ey = topY + L * 0.42;
      ctx.beginPath(); ctx.moveTo(topX, topY);
      ctx.quadraticCurveTo(cxp, cyp, ex, ey); ctx.stroke();
    }
    ctx.restore();
  };
  palm(W * 0.24, Math.min(bandH / 88, 1.3), 0.4);
  palm(W * 0.78, Math.min(bandH / 98, 1.2), -0.4);
  // Birds.
  ctx.lineWidth = Math.max(1.5, H * 0.002);
  [[0.44, 0.9], [0.5, 0.925], [0.56, 0.895]].forEach(([fx, fy]) => {
    const bx = fx * W, by = fy * H, b = H * 0.008;
    ctx.beginPath();
    ctx.moveTo(bx - b, by); ctx.quadraticCurveTo(bx - b * 0.4, by - b, bx, by);
    ctx.quadraticCurveTo(bx + b * 0.4, by - b, bx + b, by);
    ctx.stroke();
  });
  ctx.restore();
}

function panelPath(ctx, x, y, w, h, slant) {
  const s = w * 0.07;
  ctx.beginPath();
  if (slant === 'r') {
    ctx.moveTo(x, y); ctx.lineTo(x + w - s, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h);
  } else if (slant === 'l') {
    ctx.moveTo(x + s, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.closePath();
}

// Cover-fit draw of one photo inside a rect, with focal point, zoom, pan and rotation.
function drawPhotoInto(ctx, img, x, y, w, h, adj, filter) {
  if (!img) return;
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const scale = Math.max(w / iw, h / ih) * (adj.zoom || 1);
  const dw = iw * scale, dh = ih * scale;
  const ox = x + (w - dw) / 2 + (adj.panX || 0) * w;
  const oy = y + (h - dh) / 2 + (0.5 - (adj.focal ?? 0.35)) * (dh - h) + (adj.panY || 0) * h;
  ctx.save();
  ctx.filter = filter;
  if (adj.rot) {
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate((adj.rot * Math.PI) / 180);
    ctx.drawImage(img, ox - (x + w / 2), oy - (y + h / 2), dw, dh);
  } else {
    ctx.drawImage(img, ox, oy, dw, dh);
  }
  ctx.restore();
}

function splitTitle(title) {
  const words = title.trim().split(/\s+/);
  if (words.length <= 1 || title.length <= 10) return [title.toUpperCase()];
  let best = null;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ');
    const b = words.slice(i).join(' ');
    const diff = Math.abs(a.length - b.length);
    if (!best || diff < best.diff) best = { diff, lines: [a.toUpperCase(), b.toUpperCase()] };
  }
  return best.lines;
}

export function drawCover(canvas, state, images) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const layout = LAYOUTS[state.layout] || LAYOUTS.mosaic;
  const dir = DIRECTIONS[state.direction] || DIRECTIONS.sunset;
  const grade = GRADES[state.grade] || GRADES.coral;
  const type = TYPE_STYLES[state.type] || TYPE_STYLES.chrome;
  const filter = `${grade.filter} ${manualFilter(state.manual)}`;
  const el = state.elements;

  // Background: directional gradient + a painted sunset sky behind the panels.
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, dir.bg[0]);
  bg.addColorStop(1, dir.bg[1]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.5);
  sky.addColorStop(0, grade.sky[0]);
  sky.addColorStop(1, grade.sky[1]);
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.5);
  ctx.globalAlpha = 1;

  const rectOf = (p) => ({ x: p.x * W, y: p.y * H, w: p.w * W, h: p.h * H });

  const drawPanel = (p, idx) => {
    const r = rectOf(p);
    const img = images[p.photo] || null;
    const adj = { ...(state.adjust[p.photo] || { zoom: 1, panX: 0, panY: 0, focal: 0.35, rot: 0 }) };
    if (p.focal !== undefined) adj.focal = p.focal;
    if (p.zoom !== undefined) adj.zoom = p.zoom;
    if (p.panX !== undefined) adj.panX = p.panX;
    const over = state.panelOverrides[`${state.layout}:${idx}`] || {};
    const role = over.role !== undefined ? over.role : p.role;
    const sticker = over.sticker !== undefined ? over.sticker : p.sticker;
    ctx.save();
    if (p.pop) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = H * 0.025;
      ctx.shadowOffsetY = H * 0.01;
    }
    panelPath(ctx, r.x, r.y, r.w, r.h, p.slant);
    ctx.fillStyle = '#1a0f22';
    ctx.fill();
    ctx.clip();
    drawPhotoInto(ctx, img, r.x, r.y, r.w, r.h, adj, filter);
    // Colour wash over the photo so the grade reads as one print.
    ctx.globalCompositeOperation = grade.wash[1];
    ctx.globalAlpha = grade.wash[2];
    ctx.fillStyle = grade.wash[0];
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
    // Frame + rim light for the pop-out hero.
    ctx.save();
    panelPath(ctx, r.x, r.y, r.w, r.h, p.slant);
    ctx.lineWidth = Math.max(1.5, W * 0.0035);
    ctx.strokeStyle = p.pop ? dir.frame : 'rgba(20, 8, 24, 0.9)';
    ctx.stroke();
    if (p.pop) {
      const rim = ctx.createLinearGradient(r.x + r.w * 0.6, r.y, r.x + r.w, r.y);
      rim.addColorStop(0, 'rgba(255, 210, 110, 0)');
      rim.addColorStop(1, 'rgba(255, 210, 110, 0.85)');
      ctx.lineWidth = Math.max(2, W * 0.005);
      ctx.strokeStyle = rim;
      ctx.beginPath();
      ctx.moveTo(r.x + r.w, r.y + r.h * 0.05);
      ctx.lineTo(r.x + r.w, r.y + r.h * 0.95);
      ctx.stroke();
    }
    ctx.restore();
    // Cast tag (bottom-left, or top-left when the title now rides over the
    // panel bottom) and location sticker (top of the panel).
    const tagSize = Math.max(9, H * 0.02);
    if (el.tags && role) {
      const tagY = p.tagTop ? r.y + r.h * 0.04 : r.y + r.h - tagSize * 2.1;
      drawCastTag(ctx, r.x + r.w * 0.03, tagY, role, tagSize);
    }
    if (el.stickers && sticker) {
      drawSticker(ctx, r.x + r.w * 0.04, r.y + r.h * 0.045, sticker, Math.max(8, H * 0.016), r.w * 0.92);
    }
  };

  // Normal panels first, pop-out heroes last so they overlap the grid.
  layout.panels.forEach((p, i) => { if (!p.pop) drawPanel(p, i); });
  layout.panels.forEach((p, i) => { if (p.pop) drawPanel(p, i); });

  // Bottom band: a painted sunset horizon (sun disc, palm silhouettes, birds)
  // filling the strip below the panels so no cover ends on empty gradient.
  drawBottomBand(ctx, W, H, dir);

  // Triptych only: fill the empty lower flanks with a dim city skyline.
  if (state.layout === 'triptych') drawLowerSkyline(ctx, W, H, dir);

  // Halftone print texture for the Chromatic Heat direction.
  if (state.direction === 'chromatic') {
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = ctx.createPattern(getHalftoneTile(), 'repeat');
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // Quote strip + volume badge at the top.
  if (el.quote) {
    drawQuoteStrip(ctx, W * 0.015, H * 0.032, W, Math.max(11, H * 0.019), state.quote, state.paper);
  }
  drawVolBadge(ctx, W * 0.885, H * 0.012, state.vol, Math.max(10, H * 0.016));

  // Title block: headline + script subtitle + tagline ribbon. The block is
  // clamped so the ribbon always ends above the billing line (a two-line
  // headline on a tall cover must not push the subtitle into the billing).
  const lines = splitTitle(state.title);
  const titleH = (lines.length > 1 ? 0.24 : (layout.titleH1 || 0.17)) * H;
  const titleTop = Math.min(layout.titleY * H, H * 0.915 - titleH - H * 0.098);
  const titleMaxW = layout.titleAlign === 'left' ? W * 0.78 : W * 0.94;
  const titleCx = (layout.titleAlign === 'left' ? W * 0.02 + titleMaxW / 2 : W / 2) + (layout.titleShiftX || 0) * W;
  if (state.type === 'chrome') drawChromeTitle(ctx, lines, titleCx, titleTop, titleMaxW, titleH);
  else if (state.type === 'neon') drawNeonTitle(ctx, lines, titleCx, titleTop, titleMaxW, titleH);
  else drawSerifTitle(ctx, lines, titleCx, titleTop, titleMaxW, titleH);
  const subY = titleTop + titleH + H * 0.028;
  drawScriptSubtitle(ctx, state.subtitle, titleCx, subY, Math.max(16, H * 0.042));
  if (el.ribbon) {
    drawRibbon(ctx, 0, subY + H * 0.032, W, H * 0.038, state.tagline, Math.max(10, H * 0.017), 'rgba(10, 4, 16, 0.85)', '#ffd76a');
  }

  // Seal overlapping a panel corner, barcode, billing, COMING SOON.
  if (el.seal) {
    const sy = state.layout === 'editorial' ? 0.28 : 0.55;
    drawSeal(ctx, W * 0.955, H * sy, H * 0.048);
  }
  if (el.barcode) drawBarcode(ctx, W * 0.895, H * 0.925, W * 0.095, H * 0.055, 7);
  if (el.billing) {
    drawBilling(ctx, W / 2, H * 0.955, W, Math.max(9, H * 0.0155), state.billing1, state.billing2);
  }
  ctx.save();
  ctx.font = `700 ${Math.max(11, H * 0.02)}px Anton, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ff6a4d';
  ctx.fillText(state.comingSoon.toUpperCase(), W * 0.015, H * 0.95);
  ctx.fillRect(W * 0.015, H * 0.962, ctx.measureText(state.comingSoon.toUpperCase()).width, Math.max(1.5, H * 0.003));
  ctx.restore();

  // Vignette + grain over everything photographic.
  const vig = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, `rgba(0,0,0,${(state.manual.vignette * 0.55).toFixed(2)})`);
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
  if (el.grain && state.manual.grain > 0) {
    ctx.save();
    ctx.globalAlpha = 0.05 * state.manual.grain;
    ctx.fillStyle = ctx.createPattern(getGrainTile(), 'repeat');
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  // Outer hairline frame.
  ctx.save();
  ctx.strokeStyle = dir.frame;
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = Math.max(1.5, W * 0.002);
  ctx.strokeRect(W * 0.006, H * 0.01, W * 0.988, H * 0.98);
  ctx.restore();
}

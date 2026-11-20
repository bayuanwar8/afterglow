// AFTERGLOW premium typography — the headline is drawn as artwork, not text on top
// of a photo: extrusion, metallic gradient, retro stripes, outline and glow, all on
// an offscreen canvas so the stripes only ever touch the letters themselves.

export const TYPE_STYLES = {
  chrome: {
    name: 'Chrome Stripes', font: 'Anton', upper: true,
    blurb: 'Retro chrome 3D with sunset stripes and hard extrusion.',
  },
  neon: {
    name: 'Neon Script', font: 'Caveat', upper: false,
    blurb: 'Glowing hand-lettered script, pink neon on the night.',
  },
  serif: {
    name: 'Sunset Serif', font: 'Playfair Display', upper: true,
    blurb: 'Editorial serif in gold foil with a hairline outline.',
  },
};

export const TYPE_ORDER = ['chrome', 'neon', 'serif'];

// Fits `lines` (array of strings) into maxW by shrinking size. Returns the size used.
function fitSize(ctx, lines, font, maxW, start) {
  let size = start;
  const set = () => { ctx.font = `${font === 'Anton' || font === 'Playfair Display' ? '700 ' : ''}${size}px ${font}, sans-serif`; };
  set();
  while (size > 14 && lines.some((t) => ctx.measureText(t).width > maxW)) {
    size -= 2; set();
  }
  return size;
}

// Draws a chrome-striped headline (Anton) onto ctx at (cx, top), centred on cx.
export function drawChromeTitle(ctx, lines, cx, top, maxW, maxH) {
  const pad = Math.ceil(maxH * 0.18);
  const off = document.createElement('canvas');
  off.width = Math.ceil(maxW) + pad * 2;
  off.height = Math.ceil(maxH) + pad * 2;
  const o = off.getContext('2d');
  const lineH = maxH / lines.length;
  const size = fitSize(o, lines, 'Anton', maxW, lineH * 0.98);
  o.textAlign = 'center';
  o.textBaseline = 'middle';
  const lh = size * 1.02;
  const totalH = lh * lines.length;
  const startY = off.height / 2 - totalH / 2 + lh / 2;
  // Extrusion: stacked dark copies stepping down-right.
  const ex = Math.max(2, size * 0.055);
  o.fillStyle = '#1c0a24';
  for (let i = 7; i >= 1; i--) {
    lines.forEach((t, li) => o.fillText(t.toUpperCase(), off.width / 2 + (ex * i) / 7, startY + li * lh + (ex * i) / 7));
  }
  // Metallic gradient fill.
  const grad = o.createLinearGradient(0, startY - lh / 2, 0, startY + totalH - lh / 2);
  grad.addColorStop(0, '#fff7d6');
  grad.addColorStop(0.28, '#ffd76a');
  grad.addColorStop(0.52, '#ff8a3d');
  grad.addColorStop(0.74, '#ff2e88');
  grad.addColorStop(1, '#c81d7a');
  o.fillStyle = grad;
  lines.forEach((t, li) => o.fillText(t.toUpperCase(), off.width / 2, startY + li * lh));
  // Retro horizontal stripes, clipped to the letters only.
  o.globalCompositeOperation = 'source-atop';
  o.fillStyle = 'rgba(90, 10, 70, 0.5)';
  const stripeH = Math.max(2, size * 0.045);
  for (let y = startY - lh / 2; y < startY + totalH; y += stripeH * 2.6) {
    o.fillRect(0, y, off.width, stripeH);
  }
  o.globalCompositeOperation = 'source-over';
  // Outline + sparkle glow.
  o.lineWidth = Math.max(1.5, size * 0.028);
  o.strokeStyle = 'rgba(20, 4, 26, 0.9)';
  lines.forEach((t, li) => o.strokeText(t.toUpperCase(), off.width / 2, startY + li * lh));
  ctx.save();
  ctx.shadowColor = 'rgba(255, 90, 140, 0.55)';
  ctx.shadowBlur = maxH * 0.09;
  ctx.drawImage(off, cx - off.width / 2, top - pad / 2);
  ctx.restore();
}

// Draws a glowing neon script headline (Caveat) onto ctx at (cx, top), centred on cx.
export function drawNeonTitle(ctx, lines, cx, top, maxW, maxH) {
  const off = document.createElement('canvas');
  off.width = Math.ceil(maxW) + 40;
  off.height = Math.ceil(maxH) + 40;
  const o = off.getContext('2d');
  const lineH = maxH / lines.length;
  const size = fitSize(o, lines, 'Caveat', maxW, lineH * 1.15);
  o.textAlign = 'center';
  o.textBaseline = 'middle';
  const lh = size * 0.92;
  const totalH = lh * lines.length;
  const startY = off.height / 2 - totalH / 2 + lh / 2;
  o.shadowColor = '#ff5ec4';
  o.shadowBlur = size * 0.35;
  o.fillStyle = '#ffe9f6';
  lines.forEach((t, li) => o.fillText(t, off.width / 2, startY + li * lh));
  o.shadowBlur = size * 0.12;
  o.fillStyle = '#ffffff';
  lines.forEach((t, li) => o.fillText(t, off.width / 2, startY + li * lh));
  ctx.drawImage(off, cx - off.width / 2, top - 20);
}

// Draws a gold-foil serif headline (Playfair Display) onto ctx at (cx, top).
export function drawSerifTitle(ctx, lines, cx, top, maxW, maxH) {
  const off = document.createElement('canvas');
  off.width = Math.ceil(maxW) + 40;
  off.height = Math.ceil(maxH) + 40;
  const o = off.getContext('2d');
  const lineH = maxH / lines.length;
  const size = fitSize(o, lines, 'Playfair Display', maxW, lineH * 0.95);
  o.textAlign = 'center';
  o.textBaseline = 'middle';
  const lh = size * 1.04;
  const totalH = lh * lines.length;
  const startY = off.height / 2 - totalH / 2 + lh / 2;
  const grad = o.createLinearGradient(0, startY - lh / 2, 0, startY + totalH);
  grad.addColorStop(0, '#fdf3c4');
  grad.addColorStop(0.5, '#e3b959');
  grad.addColorStop(1, '#a87c22');
  o.fillStyle = grad;
  lines.forEach((t, li) => o.fillText(t.toUpperCase(), off.width / 2, startY + li * lh));
  o.lineWidth = Math.max(1, size * 0.012);
  o.strokeStyle = 'rgba(60, 30, 0, 0.55)';
  lines.forEach((t, li) => o.strokeText(t.toUpperCase(), off.width / 2, startY + li * lh));
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = maxH * 0.06;
  ctx.drawImage(off, cx - off.width / 2, top - 20);
  ctx.restore();
}

// Script subtitle in Caveat with a soft neon glow, centred on cx at y.
export function drawScriptSubtitle(ctx, text, cx, y, size, colour = '#ff9ed2') {
  ctx.save();
  ctx.font = `700 ${size}px Caveat, cursive`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = colour;
  ctx.shadowBlur = size * 0.4;
  ctx.fillStyle = '#fff4fa';
  ctx.fillText(text, cx, y);
  ctx.restore();
}

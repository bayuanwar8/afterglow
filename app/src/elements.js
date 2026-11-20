// AFTERGLOW editorial elements — seal, barcode, cast tags, stickers, quote strip,
// billing block and ribbons. Everything is drawn, nothing is an image asset.

// Deterministic barcode: the same seed always draws the same bars.
export function drawBarcode(ctx, x, y, w, h, seed = 7) {
  ctx.save();
  ctx.fillStyle = '#f4efe4';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#111';
  let s = seed * 2654435761 % 4294967296;
  const rnd = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  let bx = x + w * 0.06;
  while (bx < x + w * 0.94) {
    const bw = (1 + Math.floor(rnd() * 4)) * (w * 0.008);
    if (rnd() > 0.42) ctx.fillRect(bx, y + h * 0.1, bw, h * 0.62);
    bx += bw + w * 0.008;
  }
  ctx.fillStyle = '#111';
  ctx.font = `700 ${Math.max(7, h * 0.13)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('0 10472 85991 8', x + w / 2, y + h * 0.88);
  ctx.restore();
}

// Gold starburst seal with circular text.
export function drawSeal(ctx, cx, cy, r, label = 'ORIGINAL COVER ART') {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = '#f5b81e';
  ctx.beginPath();
  const spikes = 16;
  for (let i = 0; i < spikes * 2; i++) {
    const ang = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.82;
    const px = Math.cos(ang) * rr, py = Math.sin(ang) * rr;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#7a1e00';
  ctx.beginPath(); ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffd76a';
  ctx.font = `700 ${r * 0.16}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const chars = label.split('');
  const step = (Math.PI * 2) / chars.length;
  chars.forEach((ch, i) => {
    const a = -Math.PI / 2 + i * step;
    ctx.save();
    ctx.rotate(a);
    ctx.translate(0, -r * 0.52);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });
  ctx.font = `700 ${r * 0.42}px Anton, sans-serif`;
  ctx.fillStyle = '#ffe9a8';
  ctx.fillText('AG', 0, r * 0.06);
  ctx.restore();
}

// Cast role tag: black slanted label with a coral slash, bottom-left of a panel.
export function drawCastTag(ctx, x, y, text, size) {
  ctx.save();
  ctx.font = `700 ${size}px Anton, sans-serif`;
  const tw = ctx.measureText(text).width;
  const pad = size * 0.55;
  const h = size * 1.7;
  ctx.fillStyle = 'rgba(8, 4, 14, 0.88)';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + tw + pad * 2, y);
  ctx.lineTo(x + tw + pad * 2 - size * 0.5, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ff5e3d';
  ctx.fillRect(x, y, size * 0.22, h);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + pad, y + h / 2 + size * 0.04);
  ctx.restore();
}

// Location/time sticker: premium dark pill, gold hairline, small-caps serif text
// (the NORTHLIGHT lesson: no white box, no bold black text). `maxW` shrinks the
// font until the pill fits inside its panel.
export function drawSticker(ctx, x, y, text, size, maxW) {
  ctx.save();
  let s = size;
  const measure = () => {
    ctx.font = `700 ${s}px "Playfair Display", serif`;
    return ctx.measureText(text).width + s * 1.1;
  };
  while (maxW && measure() > maxW && s > 7) s -= 0.5;
  ctx.font = `700 ${s}px "Playfair Display", serif`;
  const parts = text.split(' \u2022 ');
  const tw = ctx.measureText(text).width + s * 1.1;
  const h = s * 1.9;
  ctx.fillStyle = 'rgba(5, 12, 24, 0.72)';
  ctx.strokeStyle = 'rgba(227, 192, 122, 0.9)';
  ctx.lineWidth = Math.max(1, s * 0.06);
  roundRect(ctx, x, y, tw, h, h / 2);
  ctx.fill();
  ctx.stroke();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  let tx = x + s * 0.55;
  ctx.fillStyle = '#eef4fa';
  ctx.fillText(parts[0], tx, y + h / 2 + s * 0.03);
  if (parts[1]) {
    const w0 = ctx.measureText(parts[0]).width;
    ctx.fillStyle = '#e3c07a';
    ctx.beginPath(); ctx.arc(tx + w0 + s * 0.32, y + h / 2, s * 0.09, 0, Math.PI * 2); ctx.fill();
    ctx.fillText(parts[1], tx + w0 + s * 0.62, y + h / 2 + s * 0.03);
  }
  ctx.restore();
}

// Quote strip: five gold stars + italic serif quote + newspaper name.
export function drawQuoteStrip(ctx, x, y, w, size, quote, paper) {
  ctx.save();
  ctx.textBaseline = 'middle';
  let tx = x;
  ctx.fillStyle = '#f5b81e';
  ctx.font = `${size}px sans-serif`;
  const stars = '\u2605\u2605\u2605\u2605\u2605';
  ctx.fillText(stars, tx, y);
  tx += ctx.measureText(stars).width + size * 0.6;
  ctx.font = `italic 700 ${size}px "Playfair Display", serif`;
  ctx.fillStyle = '#fdf6e8';
  ctx.fillText(`\u201C${quote}\u201D`, tx, y);
  tx += ctx.measureText(`\u201C${quote}\u201D`).width + size * 0.6;
  ctx.font = `700 ${size * 0.72}px Anton, sans-serif`;
  ctx.fillStyle = '#e8b25a';
  ctx.fillText(`\u2014 ${paper}`, tx, y);
  ctx.restore();
}

// Bottom billing block, centred.
export function drawBilling(ctx, cx, y, w, size, line1, line2) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#e8e0d0';
  ctx.font = `700 ${size}px Anton, sans-serif`;
  ctx.fillText(line1, cx, y);
  if (line2) {
    ctx.font = `${size * 0.92}px sans-serif`;
    ctx.fillStyle = '#b8b0a4';
    ctx.fillText(line2, cx, y + size * 1.5);
  }
  ctx.restore();
}

// Ribbon: a full-width band with centred small-caps text and side rules.
export function drawRibbon(ctx, x, y, w, h, text, size, bg, fg) {
  ctx.save();
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = fg;
  ctx.font = `700 ${size}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, y + h / 2 + size * 0.05);
  ctx.restore();
}

// Volume / season badge, top-right corner.
export function drawVolBadge(ctx, x, y, text, size) {
  ctx.save();
  ctx.font = `700 ${size}px Anton, sans-serif`;
  const tw = ctx.measureText(text).width;
  const pad = size * 0.7;
  ctx.fillStyle = '#f5b81e';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + tw + pad * 2, y);
  ctx.lineTo(x + tw + pad * 2 - size * 0.45, y + size * 1.8);
  ctx.lineTo(x, y + size * 1.8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#2a1200';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + (tw + pad * 2) / 2, y + size * 0.92);
  ctx.restore();
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

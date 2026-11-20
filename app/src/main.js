// AFTERGLOW editor — wires the three-column studio: left rail (photos, layouts,
// directions, type, grades, elements), centre canvas, right inspector, top bar.
// All photos stay local: uploads become object URLs, never leave the machine.
import { drawCover } from './render.js';
import { LAYOUTS, LAYOUT_ORDER, DIRECTIONS, DIRECTION_ORDER } from './layouts.js';
import { GRADES, GRADE_ORDER, MANUAL_DEFAULTS } from './grade.js';
import { TYPE_STYLES, TYPE_ORDER } from './type.js';
import { defaultState, cloneState, SAMPLE_PHOTOS, ROLE_OPTIONS, STICKER_OPTIONS } from './state.js';
import { sceneFor, applyScene, markShotReady } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('cover');
let state = defaultState();
let images = {}; // photo key -> HTMLImageElement
let undoStack = [];
let redoStack = [];
let exportSize = '1080x1080';

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadAllPhotos() {
  for (const [key, url] of Object.entries(state.photos)) {
    try { images[key] = await loadImage(url); } catch { images[key] = null; }
  }
}

function snapshot() {
  undoStack.push(cloneState(state));
  if (undoStack.length > 50) undoStack.shift();
  redoStack = [];
  updateUndoButtons();
}

function undo() {
  if (!undoStack.length) return;
  redoStack.push(cloneState(state));
  state = undoStack.pop();
  syncAll();
  updateUndoButtons();
}

function redo() {
  if (!redoStack.length) return;
  undoStack.push(cloneState(state));
  state = redoStack.pop();
  syncAll();
  updateUndoButtons();
}

function updateUndoButtons() {
  $('undoBtn').disabled = !undoStack.length;
  $('redoBtn').disabled = !redoStack.length;
}

function render() {
  drawCover(canvas, state, images);
}

function sizeForExport() {
  if (exportSize === 'custom') {
    const w = Math.max(320, Math.min(4000, parseInt($('customW').value, 10) || 1080));
    const h = Math.max(320, Math.min(4000, parseInt($('customH').value, 10) || 1080));
    return [w, h];
  }
  return exportSize.split('x').map(Number);
}

function applyExportSizeToPreview() {
  const [w, h] = sizeForExport();
  const scale = Math.min(960 / w, 620 / h, 1.4);
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  canvas.style.aspectRatio = `${w} / ${h}`;
  render();
}

async function exportPNG() {
  const [w, h] = sizeForExport();
  const off = document.createElement('canvas');
  off.width = w; off.height = h;
  drawCover(off, state, images);
  $('status').textContent = `Exporting ${w}x${h}...`;
  off.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${($('projectTitle').value || 'afterglow').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${w}x${h}.png`;
    a.click();
    $('status').textContent = `Saved ${w}x${h} PNG`;
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }, 'image/png');
}

// Panel hit-test: pop panels are on top, so test them first.
function panelAt(cx, cy) {
  const rect = canvas.getBoundingClientRect();
  const fx = (cx - rect.left) / rect.width;
  const fy = (cy - rect.top) / rect.height;
  const layout = LAYOUTS[state.layout];
  const ordered = layout.panels.map((p, i) => [p, i]).sort((a, b) => (b[0].pop ? 1 : 0) - (a[0].pop ? 1 : 0));
  for (const [p, i] of ordered) {
    if (fx >= p.x && fx <= p.x + p.w && fy >= p.y && fy <= p.y + p.h) return i;
  }
  return -1;
}
// ---- Left rail builders ----
function buildList(el, items, active, onPick, label) {
  el.innerHTML = '';
  items.forEach(([key, item]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'card' + (key === active ? ' active' : '');
    b.innerHTML = `<b>${item.name}</b><span>${item.blurb || ''}</span>`;
    b.addEventListener('click', () => { snapshot(); onPick(key); syncAll(); });
    el.appendChild(b);
  });
}

function buildGradeSliders() {
  const box = $('manualSliders');
  box.innerHTML = '';
  const defs = [
    ['exposure', 'Exposure', -1, 1, 0.05], ['contrast', 'Contrast', -1, 1, 0.05],
    ['saturation', 'Saturation', -1, 1, 0.05], ['temperature', 'Temperature', -1, 1, 0.05],
    ['highlights', 'Highlights', -1, 1, 0.05], ['shadows', 'Shadows', -1, 1, 0.05],
    ['vignette', 'Vignette', 0, 1, 0.05], ['grain', 'Grain', 0, 1, 0.05], ['glow', 'Glow', 0, 1, 0.05],
  ];
  defs.forEach(([key, name, min, max, step]) => {
    const row = document.createElement('label');
    row.className = 'slider';
    row.innerHTML = `<span>${name} <em>${state.manual[key].toFixed(2)}</em></span>
      <input type="range" min="${min}" max="${max}" step="${step}" value="${state.manual[key]}">`;
    const input = row.querySelector('input');
    input.addEventListener('input', () => {
      state.manual[key] = parseFloat(input.value);
      row.querySelector('em').textContent = state.manual[key].toFixed(2);
      render();
    });
    input.addEventListener('change', snapshot);
    box.appendChild(row);
  });
}

function buildFilmstrip() {
  const strip = $('filmstrip');
  strip.innerHTML = '';
  Object.entries(state.photos).forEach(([key, url]) => {
    const d = document.createElement('div');
    d.className = 'thumb';
    d.innerHTML = `<img src="${url}" alt="${key}"><span>${key}</span>`;
    d.addEventListener('click', () => {
      const layout = LAYOUTS[state.layout];
      const p = layout.panels[state.selectedPanel];
      if (p) { snapshot(); p.photo = key; syncAll(); }
    });
    strip.appendChild(d);
  });
}

// ---- Right inspector ----
function syncInspector() {
  const layout = LAYOUTS[state.layout];
  const p = layout.panels[state.selectedPanel];
  const adj = p ? (state.adjust[p.photo] || {}) : {};
  const over = state.panelOverrides[`${state.layout}:${state.selectedPanel}`] || {};
  $('inspInfo').textContent = p
    ? `Panel ${state.selectedPanel + 1} of ${layout.panels.length} — ${layout.name} — photo: ${p.photo}`
    : 'No panel selected';
  const setRange = (id, v) => { const e = $(id); if (e) e.value = v ?? 0; };
  setRange('inspZoom', adj.zoom); setRange('inspPanX', adj.panX);
  setRange('inspPanY', adj.panY); setRange('inspFocal', adj.focal); setRange('inspRot', adj.rot);
  const roleSel = $('inspRole');
  roleSel.innerHTML = '<option value="">(layout default)</option>' + ROLE_OPTIONS.map((r) => `<option>${r}</option>`).join('');
  roleSel.value = over.role || '';
  const stSel = $('inspSticker');
  stSel.innerHTML = STICKER_OPTIONS.map((s) => `<option value="${s}">${s || '(none)'}</option>`).join('');
  stSel.value = over.sticker !== undefined ? over.sticker : (p ? p.sticker || '' : '');
}

function bindInspector() {
  const layout = () => LAYOUTS[state.layout];
  const adjOf = () => {
    const p = layout().panels[state.selectedPanel];
    return p ? state.adjust[p.photo] : null;
  };
  const bind = (id, key, parse = parseFloat) => {
    $(id).addEventListener('input', (e) => {
      const adj = adjOf();
      if (!adj) return;
      adj[key] = parse(e.target.value);
      render();
    });
    $(id).addEventListener('change', snapshot);
  };
  bind('inspZoom', 'zoom'); bind('inspPanX', 'panX'); bind('inspPanY', 'panY');
  bind('inspFocal', 'focal'); bind('inspRot', 'rot');
  $('inspRole').addEventListener('change', (e) => {
    const k = `${state.layout}:${state.selectedPanel}`;
    snapshot();
    state.panelOverrides[k] = { ...(state.panelOverrides[k] || {}), role: e.target.value || undefined };
    if (!e.target.value) delete state.panelOverrides[k].role;
    syncAll();
  });
  $('inspSticker').addEventListener('change', (e) => {
    const k = `${state.layout}:${state.selectedPanel}`;
    snapshot();
    state.panelOverrides[k] = { ...(state.panelOverrides[k] || {}), sticker: e.target.value };
    syncAll();
  });
}

// ---- Sync everything from state ----
function syncAll() {
  buildList($('layoutList'), LAYOUT_ORDER.map((k) => [k, LAYOUTS[k]]), state.layout, (k) => { state.layout = k; });
  buildList($('directionList'), DIRECTION_ORDER.map((k) => [k, DIRECTIONS[k]]), state.direction, (k) => {
    state.direction = k;
    state.grade = DIRECTIONS[k].grade;
    state.type = DIRECTIONS[k].type;
  });
  buildList($('typeList'), TYPE_ORDER.map((k) => [k, TYPE_STYLES[k]]), state.type, (k) => { state.type = k; });
  buildList($('gradeList'), GRADE_ORDER.map((k) => [k, GRADES[k]]), state.grade, (k) => { state.grade = k; });
  buildFilmstrip();
  buildGradeSliders();
  $('titleInput').value = state.title;
  $('subtitleInput').value = state.subtitle;
  $('taglineInput').value = state.tagline;
  $('quoteInput').value = state.quote;
  $('paperInput').value = state.paper;
  Object.entries(state.elements).forEach(([k, v]) => { const c = $(`el-${k}`); if (c) c.checked = v; });
  applyExportSizeToPreview();
  syncInspector();
}

// ---- Events ----
function bindEvents() {
  document.querySelectorAll('.tab').forEach((t) => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('active', x === t));
      document.querySelectorAll('.tabpanel').forEach((x) => x.classList.toggle('active', x.id === `tab-${t.dataset.tab}`));
    });
  });
  $('undoBtn').addEventListener('click', undo);
  $('redoBtn').addEventListener('click', redo);
  $('resetBtn').addEventListener('click', () => { snapshot(); state = defaultState(); loadAllPhotos().then(syncAll); });
  $('sizeSelect').addEventListener('change', () => {
    exportSize = $('sizeSelect').value;
    $('customSize').style.display = exportSize === 'custom' ? 'flex' : 'none';
    applyExportSizeToPreview();
  });
  $('exportBtn').addEventListener('click', exportPNG);
  const bindText = (id, key) => {
    $(id).addEventListener('input', (e) => { state[key] = e.target.value; render(); });
    $(id).addEventListener('change', snapshot);
  };
  bindText('titleInput', 'title'); bindText('subtitleInput', 'subtitle');
  bindText('taglineInput', 'tagline'); bindText('quoteInput', 'quote'); bindText('paperInput', 'paper');
  Object.keys(state.elements).forEach((k) => {
    $(`el-${k}`).addEventListener('change', (e) => { snapshot(); state.elements[k] = e.target.checked; render(); });
  });
  $('uploadInput').addEventListener('change', async (e) => {
    const files = [...e.target.files].slice(0, 6);
    for (const f of files) {
      const key = `up${Date.now() % 100000}`;
      state.photos[key] = URL.createObjectURL(f);
      state.adjust[key] = { zoom: 1, panX: 0, panY: 0, focal: 0.35, rot: 0 };
      images[key] = await loadImage(state.photos[key]);
    }
    snapshot();
    syncAll();
  });
  const dz = $('dropZone');
  dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('over'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('over'));
  dz.addEventListener('drop', async (e) => {
    e.preventDefault();
    dz.classList.remove('over');
    const files = [...e.dataTransfer.files].filter((f) => f.type.startsWith('image/')).slice(0, 6);
    for (const f of files) {
      const key = `up${Date.now() % 100000}`;
      state.photos[key] = URL.createObjectURL(f);
      state.adjust[key] = { zoom: 1, panX: 0, panY: 0, focal: 0.35, rot: 0 };
      images[key] = await loadImage(state.photos[key]);
    }
    snapshot();
    syncAll();
  });
  // Canvas: click selects a panel, drag pans its photo, wheel zooms it.
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => {
    const i = panelAt(e.clientX, e.clientY);
    if (i >= 0) {
      state.selectedPanel = i;
      syncInspector();
      const p = LAYOUTS[state.layout].panels[i];
      drag = { x: e.clientX, y: e.clientY, panX: state.adjust[p.photo].panX, panY: state.adjust[p.photo].panY, photo: p.photo };
      canvas.setPointerCapture(e.pointerId);
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const rect = canvas.getBoundingClientRect();
    const adj = state.adjust[drag.photo];
    adj.panX = drag.panX + (e.clientX - drag.x) / rect.width;
    adj.panY = drag.panY + (e.clientY - drag.y) / rect.height;
    render();
  });
  canvas.addEventListener('pointerup', () => { if (drag) { snapshot(); drag = null; } });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const p = LAYOUTS[state.layout].panels[state.selectedPanel];
    if (!p) return;
    const adj = state.adjust[p.photo];
    adj.zoom = Math.max(1, Math.min(2.5, adj.zoom + (e.deltaY < 0 ? 0.08 : -0.08)));
    $('inspZoom').value = adj.zoom;
    render();
  }, { passive: false });
}

// ---- Boot ----
async function boot() {
  const query = new URLSearchParams(location.search);
  const shot = query.get('shot');
  await Promise.all([
    document.fonts.load('700 40px Anton'),
    document.fonts.load('700 40px Caveat'),
    document.fonts.load('700 40px "Playfair Display"'),
  ]);
  await loadAllPhotos();
  bindEvents();
  bindInspector();
  if (shot && shot.startsWith('cover')) {
    document.body.classList.add('shot-cover');
    state = applyScene(state, shot);
    const scene = sceneFor(shot);
    canvas.width = scene.w; canvas.height = scene.h;
    render();
    markShotReady();
    return;
  }
  syncAll();
  if (shot === 'editor') markShotReady();
}

boot();

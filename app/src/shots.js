// Fixed scenes for screenshots: ?shot=cover1|cover2|cover3 shows one cover alone,
// ?shot=editor shows the full editor with a photo loaded.
// window.__shotReady is set once the cover is painted.
import { defaultState } from './state.js';

const SCENES = {
  cover1: { layout: 'mosaic', direction: 'sunset', grade: 'coral', type: 'chrome', w: 1080, h: 1080 },
  cover2: { layout: 'hero', direction: 'sunset', grade: 'golden', type: 'chrome', w: 1080, h: 1350 },
  cover3: { layout: 'triptych', direction: 'midnight', grade: 'midnight', type: 'neon', w: 1920, h: 1080 },
};

export function sceneFor(shot) {
  return SCENES[shot] || null;
}

export function applyScene(state, shot) {
  const s = SCENES[shot];
  if (!s) return state;
  const next = { ...state, layout: s.layout, direction: s.direction, grade: s.grade, type: s.type };
  if (shot === 'cover2') {
    next.title = 'LAST LIGHT RUN';
    next.subtitle = 'one last job before dawn';
    next.tagline = 'ONE LAST JOB \u2022 SIX STORIES \u2022 NO TURNING BACK';
    next.quote = 'THE LAST LIGHT NEVER LIES';
    next.paper = 'THE AFTERGLOW HERALD';
  }
  if (shot === 'cover3') {
    next.title = 'NEON AFTERGLOW';
    next.subtitle = 'the city never sleeps';
    next.tagline = 'ONE NIGHT \u2022 SIX STORIES \u2022 NO CURFEW';
    next.quote = 'BRIGHTER THAN THE BOULEVARD';
    next.paper = 'THE NEON LEDGER';
  }
  return next;
}

export function markShotReady() {
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}

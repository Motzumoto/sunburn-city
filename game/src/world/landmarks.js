// SUNBURN CITY - Places named Costa Vela landmarks and signature props.
// Named landmarks: Vela Tower, Costa Trust, the Flamingo Hotel, Pier 9 and Marina Bay.
import { SIDEWALK_W, GROUND } from '../core/config.js';
import { DISTRICT_BY_ID } from './districts.js';
import { createBuilding } from './buildingGen.js';
import { makeProp } from './propsGen.js';
import { shoreY } from './shoreline.js';

function nearestBlock(city, id, x, y, taken) {
  let best = null;
  let bd = Infinity;
  for (const b of city.blocks) {
    if (b.district.id !== id || b.kind === 'landmark' || taken.has(b)) continue;
    const d = Math.hypot((b.x0 + b.x1) / 2 - x, (b.y0 + b.y1) / 2 - y);
    if (d < bd) { bd = d; best = b; }
  }
  return best;
}

function nearestAny(city, x, y, taken, rowFilter) {
  let best = null;
  let bd = Infinity;
  for (const b of city.blocks) {
    if (b.kind === 'landmark' || taken.has(b) || (rowFilter && !rowFilter(b))) continue;
    const d = Math.hypot((b.x0 + b.x1) / 2 - x, (b.y0 + b.y1) / 2 - y);
    if (d < bd) { bd = d; best = b; }
  }
  return best;
}

function inner(b) {
  return { x0: b.x0 + SIDEWALK_W, y0: b.y0 + SIDEWALK_W, x1: b.x1 - SIDEWALK_W, y1: b.y1 - SIDEWALK_W };
}

function mark(city, block, id, name, type) {
  block.kind = 'landmark';
  block.landmark = id;
  block.ground = GROUND.PLAZA;
  const lm = { id, name, type, x: (block.x0 + block.x1) / 2, y: (block.y0 + block.y1) / 2, block };
  city.landmarks.push(lm);
  return lm;
}

function ringOfPalms(city, r, rng, inset) {
  for (let x = r.x0 + inset; x <= r.x1 - inset; x += 108) {
    city.addProp(makeProp('palm', x, r.y0 + 8, rng, { side: 'top' }));
    city.addProp(makeProp('palm', x, r.y1 - 8, rng, { side: 'bottom' }));
  }
}

// Reserves landmark blocks and builds their signature structures. Call before regular block layout.
export function buildLandmarks(city, rng) {
  const taken = new Set();
  const dt = DISTRICT_BY_ID.downtown;

  const tower = nearestBlock(city, 'downtown', 2350, 3250, taken);
  if (tower) {
    taken.add(tower);
    const lm = mark(city, tower, 'vela_tower', 'Vela Tower', 'tower');
    const r = inner(tower);
    const w = (r.x1 - r.x0) * 0.5;
    const h = (r.y1 - r.y0) * 0.46;
    const rect = { x: (r.x0 + r.x1) / 2 - w / 2, y: r.y0 + (r.y1 - r.y0) * 0.22, w, h };
    const b = createBuilding(rng, rect, dt, 'tower', { H: 560, wall: '#4bb3c4', roof: '#d8f1f0', accent: '#ffb347', sign: false, name: 'Vela Tower', landmark: 'vela_tower' });
    b.roof = [{ t: 'helipad', u: 0.5, v: 0.5, r: Math.min(w, h) * 0.26 }, { t: 'antenna', u: 0.15, v: 0.15, hh: 70 }];
    b.crown = true;
    city.addBuilding(b);
    lm.building = b;
    ringOfPalms(city, r, rng, 44);
    city.addProp(makeProp('fountain', (r.x0 + r.x1) / 2, r.y0 + (r.y1 - r.y0) * 0.86, rng));
    city.addProp(makeProp('bench', r.x0 + 40, r.y1 - 30, rng));
    city.addProp(makeProp('bench', r.x1 - 40, r.y1 - 30, rng));
  }

  const bank = nearestBlock(city, 'downtown', 2350, 3550, taken) || nearestAny(city, 2350, 3550, taken);
  if (bank) {
    taken.add(bank);
    const lm = mark(city, bank, 'costa_trust', 'Costa Vela Trust', 'bank');
    const r = inner(bank);
    const w = (r.x1 - r.x0) * 0.72;
    const rect = { x: (r.x0 + r.x1) / 2 - w / 2, y: r.y0 + 8, w, h: (r.y1 - r.y0) * 0.5 };
    const b = createBuilding(rng, rect, dt, 'midrise', { H: 230, wall: '#f4ead6', roof: '#c9bfae', accent: '#18b6a8', sign: true, signText: 'COSTA TRUST', name: 'Costa Vela Trust', landmark: 'costa_trust' });
    b.roof = [{ t: 'ac', u: 0.2, v: 0.3, w: 0.14, h: 0.12, hh: 8 }, { t: 'ac', u: 0.6, v: 0.5, w: 0.14, h: 0.12, hh: 8 }, { t: 'tank', u: 0.5, v: 0.2, r: 11 }];
    b.bank = true;
    city.addBuilding(b);
    lm.building = b;
    lm.plaza = { x0: r.x0, y0: rect.y + rect.h + 6, x1: r.x1, y1: r.y1 };
    bank.decals.push({ t: 'steps', x0: rect.x + w * 0.2, y0: rect.y + rect.h, x1: rect.x + w * 0.8, y1: rect.y + rect.h + 22 });
    for (let k = 0; k < 4; k++) city.addProp(makeProp('shrub', r.x0 + 30 + k * ((r.x1 - r.x0 - 60) / 3), r.y1 - 12, rng));
    city.addProp(makeProp('fountain', (r.x0 + r.x1) / 2, rect.y + rect.h + 78, rng));
    ringOfPalms(city, { x0: r.x0, y0: rect.y + rect.h + 26, x1: r.x1, y1: r.y1 }, rng, 48);
  }

  const lastRow = city.grid.rows - 1;
  const fla = nearestAny(city, 2850, 3900, taken, (b) => b.j === lastRow && b.district.id === 'beach');
  if (fla) {
    taken.add(fla);
    const lm = mark(city, fla, 'flamingo', 'The Flamingo Hotel', 'hotel');
    const r = inner(fla);
    const w = (r.x1 - r.x0) * 0.86;
    const rect = { x: (r.x0 + r.x1) / 2 - w / 2, y: r.y0 + 10, w, h: (r.y1 - r.y0) * 0.44 };
    const b = createBuilding(rng, rect, DISTRICT_BY_ID.beach, 'deco', { H: 138, wall: '#ff9a8a', roof: '#fff1d6', accent: '#ff3d9a', sign: true, signText: 'THE FLAMINGO', name: 'The Flamingo Hotel', landmark: 'flamingo' });
    b.glass = false;
    b.deco = true;
    city.addBuilding(b);
    lm.building = b;
    fla.decals.push({ t: 'pool', x0: r.x0 + (r.x1 - r.x0) * 0.25, y0: rect.y + rect.h + 24, x1: r.x0 + (r.x1 - r.x0) * 0.75, y1: r.y1 - 14 });
    for (let x = r.x0 + 24; x < r.x1 - 10; x += 40) city.addProp(makeProp(((x / 40) | 0) % 2 ? 'palm' : 'umbrella', x, rect.y + rect.h + 14, rng));
    ringOfPalms(city, r, rng, 44);
  }

  const mercado = nearestBlock(city, 'oldtown', 1500, 2500, taken);
  if (mercado) {
    taken.add(mercado);
    mercado.kind = 'plaza';
    city.landmarks.push({ id: 'mercado', name: 'Plaza Mercado', type: 'plaza', x: (mercado.x0 + mercado.x1) / 2, y: (mercado.y0 + mercado.y1) / 2, block: mercado });
  }

  // Pier 9 and Marina Bay hang off the shore strips (filled afterwards by the caller).
  city.pendingLandmarks = ['pier9', 'marina'];
}

export function buildShoreLandmarks(city, rng) {
  let yardStrip = null;
  let bestD = Infinity;
  for (const s of city.strips) {
    if (s.kind !== 'quay') continue;
    const d = Math.abs((s.x0 + s.x1) / 2 - 800);
    if (d < bestD) { bestD = d; yardStrip = s; }
  }
  if (yardStrip) {
    const cx = (yardStrip.x0 + yardStrip.x1) / 2;
    const top = shoreY(cx) - 40;
    city.addPier({ x0: cx - 14, x1: cx + 14, y0: top, y1: top + 330 });
    city.addPier({ x0: cx - 40, x1: cx + 40, y0: top + 240, y1: top + 330 });
    for (let y = top + 30; y < top + 320; y += 60) {
      city.addProp(makeProp('lamp', cx - 12, y, rng, { side: 'left' }));
      city.addProp(makeProp('bollard', cx + 12, y + 20, rng));
    }
    const shed = createBuilding(rng, { x: cx - 30, y: top + 250, w: 60, h: 66 }, DISTRICT_BY_ID.yards, 'warehouse', { H: 44, sign: true, signText: 'PIER 9', wall: '#8a9aa0', roof: '#6f7a7d', name: 'Pier 9' });
    shed.overWater = true;
    city.addBuilding(shed);
    city.landmarks.push({ id: 'pier9', name: 'Pier 9', type: 'pier', x: cx, y: top + 180 });
  }
  let marinaX = 0;
  let n = 0;
  for (const s of city.strips) if (s.kind === 'marina') { marinaX += (s.x0 + s.x1) / 2; n++; }
  if (n) city.landmarks.push({ id: 'marina', name: 'Marina Bay', type: 'marina', x: marinaX / n, y: 4330 });
}

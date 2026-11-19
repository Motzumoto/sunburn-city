// SUNBURN CITY - Generates city blocks, lots, buildings and ground decals.
// City blocks between roads: assigns uses, lots, buildings and ground decals.
import { SIDEWALK_W, GROUND } from '../core/config.js';
import { createBuilding, pickBuildingType } from './buildingGen.js';
import { makeProp } from './propsGen.js';

export function createBlocks(grid, districtMap) {
  const blocks = [];
  for (let j = 0; j < grid.rows; j++) {
    for (let i = 0; i < grid.cols; i++) {
      const x0 = grid.xs[i] + grid.vLines[i].width / 2;
      const x1 = grid.xs[i + 1] - grid.vLines[i + 1].width / 2;
      const y0 = grid.ys[j] + grid.hLines[j].width / 2;
      const y1 = grid.ys[j + 1] - grid.hLines[j + 1].width / 2;
      blocks.push({
        id: blocks.length, i, j, x0, y0, x1, y1,
        district: districtMap.at((x0 + x1) / 2, (y0 + y1) / 2), kind: 'buildings',
        alley: null, decals: [], landmark: null,
      });
    }
  }
  return blocks;
}

export function blockGround(block, x, y) {
  const sw = SIDEWALK_W;
  if (x < block.x0 + sw || x > block.x1 - sw || y < block.y0 + sw || y > block.y1 - sw) return GROUND.SIDEWALK;
  const a = block.alley;
  if (a && x >= a.x0 && x <= a.x1 && y >= a.y0 && y <= a.y1) return GROUND.LOT;
  switch (block.kind) {
    case 'park': return GROUND.GRASS;
    case 'plaza': return GROUND.PLAZA;
    case 'parking': return GROUND.PARKING;
    case 'containers': return GROUND.CONCRETE;
    case 'landmark': return block.ground || GROUND.LOT;
    default: return GROUND.LOT;
  }
}

function inset(r, d) {
  return { x0: r.x0 + d, y0: r.y0 + d, x1: r.x1 - d, y1: r.y1 - d };
}

function splitLots(rng, r, minS, maxS, out) {
  const w = r.x1 - r.x0;
  const h = r.y1 - r.y0;
  const long = Math.max(w, h);
  const canSplit = long * 0.38 >= minS;
  if (!canSplit || (long <= maxS && !(long > minS * 1.9 && rng.chance(0.3)))) { out.push(r); return; }
  const t = rng.range(0.4, 0.6);
  if (w >= h) {
    const m = r.x0 + w * t;
    splitLots(rng, { x0: r.x0, y0: r.y0, x1: m, y1: r.y1 }, minS, maxS, out);
    splitLots(rng, { x0: m, y0: r.y0, x1: r.x1, y1: r.y1 }, minS, maxS, out);
  } else {
    const m = r.y0 + h * t;
    splitLots(rng, { x0: r.x0, y0: r.y0, x1: r.x1, y1: m }, minS, maxS, out);
    splitLots(rng, { x0: r.x0, y0: m, x1: r.x1, y1: r.y1 }, minS, maxS, out);
  }
}

// Fills one block according to its kind. `city` collects buildings, props and decals.
export function layoutBlock(city, block, rng) {
  if (block.kind === 'landmark') return;
  const d = block.district;
  const inner = inset(block, SIDEWALK_W);
  const w = inner.x1 - inner.x0;
  const h = inner.y1 - inner.y0;
  if (block.kind === 'park') return layoutPark(city, block, inner, rng);
  if (block.kind === 'plaza') return layoutPlaza(city, block, inner, rng);
  if (block.kind === 'parking') return layoutParking(city, block, inner, rng);
  if (block.kind === 'containers') return layoutContainers(city, block, inner, rng);

  const parts = [];
  if (Math.min(w, h) > 300 && rng.chance(0.55) && d.id !== 'palms') {
    const horizontal = w >= h;
    const aw = 26;
    if (horizontal) {
      const m = inner.x0 + w * rng.range(0.4, 0.6);
      block.alley = { x0: m - aw / 2, x1: m + aw / 2, y0: inner.y0, y1: inner.y1, axis: 'v' };
      parts.push({ x0: inner.x0, y0: inner.y0, x1: m - aw / 2, y1: inner.y1 }, { x0: m + aw / 2, y0: inner.y0, x1: inner.x1, y1: inner.y1 });
    } else {
      const m = inner.y0 + h * rng.range(0.4, 0.6);
      block.alley = { x0: inner.x0, x1: inner.x1, y0: m - aw / 2, y1: m + aw / 2, axis: 'h' };
      parts.push({ x0: inner.x0, y0: inner.y0, x1: inner.x1, y1: m - aw / 2 }, { x0: inner.x0, y0: m + aw / 2, x1: inner.x1, y1: inner.y1 });
    }
  } else parts.push(inner);

  const lots = [];
  for (const p of parts) splitLots(rng, p, d.lot[0], d.lot[1], lots);
  for (const lot of lots) buildOnLot(city, block, lot, rng);
}

function buildOnLot(city, block, lot, rng) {
  const d = block.district;
  const gap = rng.range(d.gap[0], d.gap[1]);
  const rect = { x: lot.x0 + gap, y: lot.y0 + gap, w: lot.x1 - lot.x0 - gap * 2, h: lot.y1 - lot.y0 - gap * 2 };
  if (rect.w < 22 || rect.h < 22) return;
  if (rng.chance(0.05) && d.id !== 'palms') { // vacant lot: a bit of greenery
    city.addProp(makeProp(rng.chance(0.5) ? 'tree' : 'shrub', lot.x0 + (lot.x1 - lot.x0) / 2, lot.y0 + (lot.y1 - lot.y0) / 2, rng));
    return;
  }
  const type = pickBuildingType(rng, d, rect);
  if (type === 'house') {
    block.decals.push({ t: 'lawn', x0: lot.x0 + 2, y0: lot.y0 + 2, x1: lot.x1 - 2, y1: lot.y1 - 2 });
    const hw = Math.min(rect.w * 0.78, 54);
    const hh = Math.min(rect.h * 0.7, 46);
    rect.x += rng.range(0, rect.w - hw); rect.y += rng.range(0, Math.max(0, rect.h - hh)); rect.w = hw; rect.h = hh;
    if (rng.chance(0.28) && lot.x1 - lot.x0 > 76) {
      block.decals.push({ t: 'pool', x0: lot.x0 + 8, y0: lot.y1 - 30, x1: lot.x0 + 8 + 30, y1: lot.y1 - 10 });
    }
    const tx = lot.x0 + rng.range(8, lot.x1 - lot.x0 - 8);
    city.addProp(makeProp(rng.chance(0.6) ? 'palm' : 'tree', tx, lot.y0 + 10 + rng.range(0, 10), rng));
  } else if (type === 'warehouse') {
    block.decals.push({ t: 'apron', x0: lot.x0, y0: lot.y0, x1: lot.x1, y1: lot.y1 });
  }
  city.addBuilding(createBuilding(rng, rect, d, type));
}

function layoutPark(city, block, inner, rng) {
  const w = inner.x1 - inner.x0;
  const h = inner.y1 - inner.y0;
  block.decals.push({ t: 'paths', x0: inner.x0, y0: inner.y0, x1: inner.x1, y1: inner.y1 });
  if (rng.chance(0.6)) {
    const pr = Math.min(w, h) * 0.18;
    block.decals.push({ t: 'pond', cx: inner.x0 + w * rng.range(0.3, 0.7), cy: inner.y0 + h * rng.range(0.3, 0.7), rx: pr * 1.3, ry: pr });
  }
  const n = Math.floor((w * h) / 2600);
  for (let k = 0; k < n; k++) {
    const x = inner.x0 + 14 + rng.next() * (w - 28);
    const y = inner.y0 + 14 + rng.next() * (h - 28);
    if (nearDecalPond(block, x, y)) continue;
    city.addProp(makeProp(rng.chance(0.55) ? 'palm' : 'tree', x, y, rng));
  }
  for (let k = 0; k < 4; k++) city.addProp(makeProp('bench', inner.x0 + 30 + rng.next() * (w - 60), inner.y0 + h / 2 + (rng.chance(0.5) ? -10 : 10), rng));
}

function nearDecalPond(block, x, y) {
  for (const d of block.decals) {
    if (d.t === 'pond' && Math.abs(x - d.cx) < d.rx + 10 && Math.abs(y - d.cy) < d.ry + 10) return true;
  }
  return false;
}

function layoutPlaza(city, block, inner, rng) {
  const cx = (inner.x0 + inner.x1) / 2;
  const cy = (inner.y0 + inner.y1) / 2;
  city.addProp(makeProp('fountain', cx, cy, rng));
  const w = inner.x1 - inner.x0;
  const h = inner.y1 - inner.y0;
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    city.addProp(makeProp(k % 2 ? 'palm' : 'shrub', cx + Math.cos(a) * w * 0.38, cy + Math.sin(a) * h * 0.38, rng));
  }
  for (let k = 0; k < 6; k++) city.addProp(makeProp('bench', cx + (k < 3 ? -1 : 1) * 60, cy - 40 + (k % 3) * 40, rng));
}

function layoutParking(city, block, inner, rng) {
  block.decals.push({ t: 'stalls', x0: inner.x0 + 6, y0: inner.y0 + 6, x1: inner.x1 - 6, y1: inner.y1 - 6 });
  const rowH = 46;
  const stallW = 24;
  for (let y = inner.y0 + 12; y + rowH < inner.y1 - 12; y += rowH * 2 + 26) {
    for (let x = inner.x0 + 14; x + stallW < inner.x1 - 12; x += stallW) {
      for (const dy of [0, rowH]) {
        if (y + dy + rowH > inner.y1 - 8) continue;
        if (!rng.chance(0.5)) continue;
        city.addParkedCar(rng, x + stallW / 2, y + dy + rowH / 2, Math.PI / 2, 0.6);
      }
    }
  }
  const lx = (inner.x0 + inner.x1) / 2;
  for (const y of [inner.y0 + 4, inner.y1 - 4]) city.addProp(makeProp('lamp', lx, y, rng));
}

function layoutContainers(city, block, inner, rng) {
  block.decals.push({ t: 'apron', x0: inner.x0, y0: inner.y0, x1: inner.x1, y1: inner.y1 });
  const cols = ['#d94f30', '#2a7f9e', '#ffb300', '#3d8f5a', '#8e5ea2', '#c9c2b2', '#c0392b'];
  const d = block.district;
  for (let y = inner.y0 + 14; y + 24 < inner.y1 - 10; y += 62) {
    for (let x = inner.x0 + 14; x + 52 < inner.x1 - 10; x += 74) {
      if (rng.chance(0.28)) continue;
      const stack = rng.int(1, 3);
      const rect = { x, y, w: 52, h: 22 };
      const b = createBuilding(rng, rect, d, 'container', { H: 11 * stack, wall: rng.pick(cols), sign: false });
      b.type = 'container';
      b.roof = [];
      city.addBuilding(b);
    }
  }
}

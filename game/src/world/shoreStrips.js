// SUNBURN CITY — Builds the beach, promenade and docks shoreline.
// The beachfront strip: sand beaches, the marina promenade and the docks quay.
import { SIDEWALK_W, GROUND } from '../core/config.js';
import { shoreY } from './shoreline.js';
import { createBuilding } from './buildingGen.js';
import { makeProp } from './propsGen.js';
import { DISTRICT_BY_ID } from './districts.js';

export const BOARDWALK_TOP = SIDEWALK_W;
export const BOARDWALK_BOTTOM = SIDEWALK_W + 30;

export function stripGround(strip, x, y) {
  const dy = y - strip.y0;
  if (dy < BOARDWALK_TOP) return GROUND.SIDEWALK;
  if (strip.kind === 'quay') return GROUND.CONCRETE;
  if (dy < BOARDWALK_BOTTOM) return GROUND.BOARDWALK;
  return strip.kind === 'marina' ? GROUND.CONCRETE : GROUND.SAND;
}

export function buildShoreStrips(city, grid, rng) {
  const lastJ = grid.ys.length - 1;
  const y0 = grid.ys[lastJ] + grid.hLines[lastJ].width / 2;
  for (let i = 0; i < grid.cols; i++) {
    const x0 = grid.xs[i] + grid.vLines[i].width / 2;
    const x1 = grid.xs[i + 1] - grid.vLines[i + 1].width / 2;
    const cx = (x0 + x1) / 2;
    const d = city.districtAt(cx, y0 + 80);
    const kind = d.id === 'yards' ? 'quay' : d.id === 'marina' ? 'marina' : 'beach';
    const strip = { i, x0, x1, y0, kind, district: d, decals: [] };
    city.strips.push(strip);
    if (kind === 'beach') fillBeach(city, strip, rng);
    else if (kind === 'marina') fillMarina(city, strip, rng);
    else fillQuay(city, strip, rng);
  }
}

function fillBeach(city, s, rng) {
  const beach = DISTRICT_BY_ID.beach;
  const w = s.x1 - s.x0;
  for (let x = s.x0 + 48; x < s.x1 - 30; x += 96) city.addProp(makeProp('palm', x + rng.range(-6, 6), s.y0 + 12, rng, { side: 'top' }));
  for (let x = s.x0 + 70; x < s.x1 - 50; x += 150) city.addProp(makeProp('lamp', x, s.y0 + BOARDWALK_BOTTOM - 4, rng, { side: 'top' }));
  if (rng.chance(0.65)) {
    const bw = 56;
    const bx = s.x0 + rng.range(40, w - bw - 40);
    const rect = { x: bx, y: s.y0 + BOARDWALK_BOTTOM + 8, w: bw, h: 34 };
    city.addBuilding(createBuilding(rng, rect, beach, 'shop', { H: 26, sign: true, wall: rng.pick(['#ffb4a2', '#9fe0d6', '#fff1d6']), roof: '#d9a86a' }));
  }
  const rows = [s.y0 + 108, s.y0 + 140];
  for (const ry of rows) {
    for (let x = s.x0 + 30; x < s.x1 - 20; x += rng.range(46, 78)) {
      if (ry + 20 > shoreY(x) - 36) continue;
      if (!rng.chance(0.7)) continue;
      const y = ry + rng.range(-6, 6);
      city.addProp(makeProp('towel', x + 12, y + 8, rng));
      city.addProp(makeProp('umbrella', x, y, rng));
    }
  }
  if (rng.chance(0.4)) city.addProp(makeProp('lifeguard', s.x0 + w * rng.range(0.3, 0.7), s.y0 + 180, rng));
  if (rng.chance(0.35)) city.addProp(makeProp('net', s.x0 + w * 0.5, s.y0 + 170, rng, { len: 64 }));
}

function fillMarina(city, s, rng) {
  const d = DISTRICT_BY_ID.marina;
  for (let x = s.x0 + 30; x < s.x1 - 20; x += 96) city.addProp(makeProp('palm', x, s.y0 + 12, rng, { side: 'top' }));
  for (let x = s.x0 + 60; x < s.x1 - 40; x += 130) city.addProp(makeProp('lamp', x, s.y0 + BOARDWALK_BOTTOM + 4, rng, { side: 'top' }));
  // Finger piers into the water with yachts moored between them.
  const pitch = 82;
  for (let x = s.x0 + 46; x < s.x1 - 46; x += pitch) {
    const top = shoreY(x) - 20;
    const len = 150 + rng.next() * 70;
    city.addPier({ x0: x - 6, x1: x + 6, y0: top, y1: top + len });
    for (let y = top + 24; y < top + len; y += 62) city.addProp(makeProp('bollard', x + 8, y, rng));
    const berthX = x + pitch / 2;
    if (berthX < s.x1 - 36 && rng.chance(0.78)) {
      const len2 = rng.range(54, 84);
      const y = top + 30 + len2 / 2 + rng.range(0, 30);
      city.addProp(makeProp('yacht', berthX, y, rng, { len: len2, beam: rng.range(20, 28), hull: rng.pick(['#f6f3ea', '#e9f1ee', '#2b5d7a', '#f7e9d0', '#34b7b0']), rot: Math.PI / 2 }));
    }
  }
  if (rng.chance(0.5)) {
    const rect = { x: s.x0 + (s.x1 - s.x0) * 0.4, y: s.y0 + BOARDWALK_BOTTOM + 6, w: 70, h: 40 };
    city.addBuilding(createBuilding(rng, rect, d, 'lowrise', { H: 40, sign: true, signText: 'HARBOR CAFE' }));
  }
}

function fillQuay(city, s, rng) {
  const d = DISTRICT_BY_ID.yards;
  const w = s.x1 - s.x0;
  s.decals.push({ t: 'apron' });
  const cols = ['#d94f30', '#2a7f9e', '#ffb300', '#3d8f5a', '#8e5ea2', '#c9c2b2', '#c0392b'];
  for (let row = 0; row < 3; row++) {
    for (let x = s.x0 + 16; x + 52 < s.x1 - 12; x += 70) {
      if (rng.chance(0.3)) continue;
      const y = s.y0 + 40 + row * 40;
      if (y + 22 > shoreY(x) - 70) continue;
      const stack = rng.int(1, 3);
      const b = createBuilding(rng, { x, y, w: 52, h: 22 }, d, 'container', { H: 11 * stack, wall: rng.pick(cols), sign: false });
      b.roof = [];
      city.addBuilding(b);
    }
  }
  const cx = s.x0 + w / 2;
  city.addProp(makeProp('crane', cx, shoreY(cx) - 24, rng));
  for (let x = s.x0 + 40; x < s.x1 - 20; x += 110) city.addProp(makeProp('lamp', x, s.y0 + 20, rng, { side: 'top' }));
}

// Street furniture: prop factory plus sidewalk palms, trees, lamps, signals, benches and parked street cars.
import { SIDEWALK_W } from '../core/config.js';

// Collider radius (r) or rect (cw, ch), and visual height h in world units.
const PROP_DEFS = {
  palm: { r: 3.5, h: 74 },
  tree: { r: 4, h: 42 },
  shrub: { r: 7, h: 9 },
  lamp: { r: 2.5, h: 46 },
  bench: { cw: 22, ch: 8, h: 7 },
  bin: { r: 4, h: 9 },
  hydrant: { r: 3, h: 7 },
  signal: { r: 2.5, h: 44 },
  umbrella: { r: 3, h: 28 },
  towel: { r: 0, h: 0 },
  fountain: { r: 28, h: 12 },
  lifeguard: { cw: 26, ch: 20, h: 34 },
  bollard: { r: 3, h: 8 },
  yacht: { r: 0, h: 20 },
  crane: { cw: 16, ch: 16, h: 170 },
  busstop: { cw: 34, ch: 10, h: 24 },
  net: { r: 0, h: 22 },
  stall: { cw: 24, ch: 16, h: 22 },
};

export function makeProp(type, x, y, rng, extra) {
  const def = PROP_DEFS[type];
  const p = {
    kind: 'prop', drawKind: 1, type, x, y, r: def.r || 0, cw: def.cw || 0, ch: def.ch || 0, h: def.h,
    v: rng ? Math.floor(rng.next() * 6) : 0, rot: 0, s: rng ? rng.range(0.9, 1.15) : 1, sortY: y, _q: 0,
  };
  if (type === 'palm' || type === 'tree') p.sortY = y - 24;
  if (extra) Object.assign(p, extra);
  return p;
}

function nextTo(grid, block, side) {
  if (side === 'top') return grid.hLines[block.j];
  if (side === 'bottom') return grid.hLines[block.j + 1];
  if (side === 'left') return grid.vLines[block.i];
  return grid.vLines[block.i + 1];
}

// Walks one sidewalk edge, dropping props every `step` units.
function alongEdge(block, side, from, to, step, fn) {
  const horizontal = side === 'top' || side === 'bottom';
  const a = horizontal ? block.x0 : block.y0;
  const b = horizontal ? block.x1 : block.y1;
  for (let t = a + from; t <= b - to; t += step) {
    const fixed = side === 'top' ? block.y0 + 7 : side === 'bottom' ? block.y1 - 7
      : side === 'left' ? block.x0 + 7 : block.x1 - 7;
    if (horizontal) fn(t, fixed); else fn(fixed, t);
  }
}

export function scatterStreetProps(city, grid, rng) {
  for (const block of city.blocks) {
    const tropical = block.district.id === 'beach' || block.district.id === 'marina';
    for (const side of ['top', 'bottom', 'left', 'right']) {
      const line = nextTo(grid, block, side);
      const avenue = line.kind === 'avenue';
      const type = tropical && (avenue || side === 'top' || side === 'left') ? 'palm' : 'tree';
      if (type === 'palm') alongEdge(block, side, 48 + rng.next() * 14, 48, avenue ? 110 : 96, (x, y) => {
        if (rng.chance(0.62)) city.addProp(makeProp('palm', x, y, rng, { side }));
      });
      else if (block.district.id !== 'yards') alongEdge(block, side, 48 + rng.next() * 14, 48, avenue ? 100 : 112, (x, y) => {
        if (rng.chance(0.58)) city.addProp(makeProp('tree', x, y, rng, { side }));
      });
      alongEdge(block, side, 80, 60, 150, (x, y) => {
        const off = side === 'top' ? -3 : side === 'bottom' ? 3 : 0;
        const offx = side === 'left' ? -3 : side === 'right' ? 3 : 0;
        city.addProp(makeProp('lamp', x + offx, y + off, rng, { side }));
      });
      alongEdge(block, side, 120, 90, 240, (x, y) => {
        const r = rng.next();
        if (r < 0.26) city.addProp(makeProp('bench', x, y + (side === 'top' ? 6 : side === 'bottom' ? -6 : 0), rng, { vertical: side === 'left' || side === 'right' }));
        else if (r < 0.46) city.addProp(makeProp('bin', x, y, rng));
        else if (r < 0.6) city.addProp(makeProp('hydrant', x, y, rng));
        else if (r < 0.78) city.addProp(makeProp('shrub', x, y, rng));
        else if (r < 0.9 && avenue) city.addProp(makeProp('busstop', x, y + (side === 'top' ? 2 : side === 'bottom' ? -2 : 0), rng, { vertical: side === 'left' || side === 'right' }));
      });
    }
  }
}

export function scatterMedianProps(city, segments, rng) {
  for (const seg of segments) {
    if (seg.median <= 0) continue;
    if (seg.axis === 'h') {
      for (let x = seg.x0 + 60; x < seg.x1 - 60; x += 126) city.addProp(makeProp('palm', x, seg.center, rng, { median: true }));
    } else {
      for (let y = seg.y0 + 60; y < seg.y1 - 60; y += 126) city.addProp(makeProp('palm', seg.center, y, rng, { median: true }));
    }
  }
}

export function scatterSignals(city, intersections, rng) {
  for (const it of intersections) {
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        const x = it.x + sx * (it.w / 2 + 6);
        const y = it.y + sy * (it.h / 2 + 6);
        if (x < 40 || y < 40) continue;
        city.addProp(makeProp('signal', x, y, rng, { corner: sx + ',' + sy, phase: (it.id % 2) }));
      }
    }
  }
}

export function parkStreetCars(city, segments, rng) {
  for (const seg of segments) {
    if (seg.parking <= 0) continue;
    const off = seg.width / 2 - seg.parking / 2;
    for (const side of [-1, 1]) {
      const len = seg.axis === 'h' ? seg.x1 - seg.x0 : seg.y1 - seg.y0;
      for (let t = 70; t < len - 70; t += 56 + rng.next() * 16) {
        if (!rng.chance(0.45)) continue;
        let x, y, heading;
        if (seg.axis === 'h') {
          x = seg.x0 + t; y = seg.center + side * off; heading = side > 0 ? 0 : Math.PI;
        } else {
          x = seg.center + side * off; y = seg.y0 + t; heading = side > 0 ? -Math.PI / 2 : Math.PI / 2;
        }
        city.addParkedCar(rng, x, y, heading, 1);
      }
    }
  }
}

export const SIDEWALK_PROP_INSET = SIDEWALK_W;

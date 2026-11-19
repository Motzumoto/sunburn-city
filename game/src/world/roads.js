// Road grid generation: irregularly spaced named avenues and streets, their segments and intersections.
import { LANE_W } from '../core/config.js';
import { BEACH_ROAD_Y } from './shoreline.js';

const V_NAMES = ['Tamarind Street', 'Coral Avenue', 'Marlin Street', 'Vela Avenue', 'Jacaranda Street', 'Sandpiper Street',
  'Meridian Avenue', 'Hibiscus Street', 'Tide Street', 'Lantern Avenue', 'Gull Street'];
const H_NAMES = ['Cinder Street', 'Mango Street', 'Alba Street', 'Palmetto Boulevard', 'Fennel Street', 'Marigold Street',
  'Solano Boulevard', 'Driftwood Street', 'Anchor Street', 'Sunset Promenade'];
const AVENUE_V = new Set([1, 3, 6, 9]);
const AVENUE_H = new Set([3, 6, 9]);

export const ROAD_KINDS = {
  avenue: { lanes: 2, median: 20, parking: 0, width: LANE_W * 4 + 20, speed: 190 },
  street: { lanes: 1, median: 0, parking: 20, width: LANE_W * 2 + 40, speed: 140 },
};

function spacedLines(rng, count, start, end) {
  const weights = [];
  let total = 0;
  for (let i = 0; i < count - 1; i++) { const w = rng.range(0.72, 1.32); weights.push(w); total += w; }
  const out = [start];
  let acc = 0;
  for (let i = 0; i < weights.length; i++) { acc += weights[i]; out.push(start + (end - start) * (acc / total)); }
  return out;
}

function makeLine(pos, isAvenue, name) {
  const spec = isAvenue ? ROAD_KINDS.avenue : ROAD_KINDS.street;
  return {
    pos, name, kind: isAvenue ? 'avenue' : 'street', width: spec.width, lanes: spec.lanes,
    median: spec.median, parking: spec.parking, speed: spec.speed,
  };
}

// Returns the grid: xs/ys line coordinates and the vertical/horizontal line descriptors.
export function buildRoadGrid(rng, size) {
  const xs = spacedLines(rng, V_NAMES.length, 170, size - 170);
  const ys = spacedLines(rng, H_NAMES.length, 170, BEACH_ROAD_Y);
  const vLines = xs.map((x, i) => makeLine(x, AVENUE_V.has(i), V_NAMES[i]));
  const hLines = ys.map((y, j) => makeLine(y, AVENUE_H.has(j), H_NAMES[j]));
  return { xs, ys, vLines, hLines, cols: xs.length - 1, rows: ys.length - 1 };
}

// Splits every grid line into segments between intersections and creates the intersection boxes.
export function buildRoadSegments(grid) {
  const { xs, ys, vLines, hLines } = grid;
  const intersections = [];
  const index = [];
  for (let i = 0; i < xs.length; i++) {
    index.push([]);
    for (let j = 0; j < ys.length; j++) {
      const it = { id: intersections.length, i, j, x: xs[i], y: ys[j], w: vLines[i].width, h: hLines[j].width, segs: [] };
      index[i].push(it);
      intersections.push(it);
    }
  }
  const segments = [];
  for (let j = 0; j < ys.length; j++) {
    const line = hLines[j];
    for (let k = 0; k < xs.length - 1; k++) {
      const a = index[k][j];
      const b = index[k + 1][j];
      const seg = {
        id: segments.length, axis: 'h', line: j, line_k: k, a: a.id, b: b.id,
        x0: a.x + a.w / 2, x1: b.x - b.w / 2, y0: line.pos - line.width / 2, y1: line.pos + line.width / 2,
        center: line.pos, width: line.width, lanes: line.lanes, median: line.median, parking: line.parking,
        kind: line.kind, name: line.name, speed: line.speed,
      };
      segments.push(seg);
      a.segs.push(seg.id);
      b.segs.push(seg.id);
    }
  }
  for (let i = 0; i < xs.length; i++) {
    const line = vLines[i];
    for (let k = 0; k < ys.length - 1; k++) {
      const a = index[i][k];
      const b = index[i][k + 1];
      const seg = {
        id: segments.length, axis: 'v', line: i, line_k: k, a: a.id, b: b.id,
        x0: line.pos - line.width / 2, x1: line.pos + line.width / 2, y0: a.y + a.h / 2, y1: b.y - b.h / 2,
        center: line.pos, width: line.width, lanes: line.lanes, median: line.median, parking: line.parking,
        kind: line.kind, name: line.name, speed: line.speed,
      };
      segments.push(seg);
      a.segs.push(seg.id);
      b.segs.push(seg.id);
    }
  }
  return { segments, intersections, index };
}

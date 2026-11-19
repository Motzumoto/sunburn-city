// SUNBURN CITY — Defines the coastal shore curve and beach-road placement.
// The southern coastline: a wavy shore curve, sea tests and beach-road placement.
import { WORLD_SIZE } from '../core/config.js';

export const SHORE_BASE = 4400;
export const BEACH_ROAD_Y = 4120;

export function shoreY(x) {
  return SHORE_BASE + 38 * Math.sin(x * 0.0041 + 0.6) + 22 * Math.sin(x * 0.0113 + 1.9);
}

export function isSea(x, y) {
  return y > shoreY(x);
}

// Depth of the water at a point: 0 on the shoreline, growing seaward.
export function seaDepth(x, y) {
  return Math.max(0, y - shoreY(x));
}

export function shorePoints(x0, x1, step, out) {
  out.length = 0;
  for (let x = x0; x <= x1 + step; x += step) out.push(x, shoreY(x));
  return out;
}

export const SEA_BOTTOM = WORLD_SIZE;

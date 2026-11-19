// SUNBURN CITY - Renders animated turquoise water, foam and sunlight.
// Animated turquoise water: sun glitter, rolling foam lines and a moving sea sheen.
import { hash2 } from '../core/math.js';
import { shoreY, SHORE_BASE } from '../world/shoreline.js';

const CELL = 36;

export function drawWater(ctx, city, view, time, night) {
  if (view.bottom < SHORE_BASE - 80) return;
  const top = Math.max(view.top, SHORE_BASE - 80);
  const x0 = Math.floor(view.left / CELL);
  const x1 = Math.floor(view.right / CELL);
  const y0 = Math.floor(top / CELL);
  const y1 = Math.floor(view.bottom / CELL);
  const glitter = 1 - night * 0.6;
  for (let cy = y0; cy <= y1; cy++) {
    for (let cx = x0; cx <= x1; cx++) {
      if (hash2(cx, cy, 7) > 0.34) continue;
      const phase = hash2(cx, cy, 8) * 6.283;
      const s = Math.sin(time * 2.1 + phase);
      if (s < 0.25) continue;
      const a = s * s * s;
      const x = (cx + hash2(cx, cy, 9)) * CELL;
      const y = (cy + hash2(cx, cy, 10)) * CELL;
      if (y < shoreY(x) + 8 || onPier(city, x, y)) continue;
      ctx.fillStyle = 'rgba(255,252,235,' + (a * 0.85 * glitter).toFixed(3) + ')';
      ctx.fillRect(x, y, 3 + a * 5, 1.3);
    }
  }
  // Foam lines rolling toward the beach.
  const xa = Math.max(0, view.left - 20);
  const xb = view.right + 20;
  ctx.lineWidth = 1.8;
  for (let k = 0; k < 3; k++) {
    const depth = 46 - ((time * 6 + k * 15) % 46);
    ctx.strokeStyle = 'rgba(255,255,255,' + (0.05 + 0.3 * (1 - depth / 46) * (depth / 46) * 2).toFixed(3) + ')';
    ctx.beginPath();
    let first = true;
    for (let x = xa; x <= xb; x += 18) {
      const y = shoreY(x) + 8 + depth + Math.sin(x * 0.05 + time * 1.3 + k) * 2.2;
      if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function onPier(city, x, y) {
  const piers = city.piers;
  for (let i = 0; i < piers.length; i++) {
    const p = piers[i];
    if (x >= p.x0 - 2 && x <= p.x1 + 2 && y >= p.y0 - 2 && y <= p.y1 + 2) return true;
  }
  return false;
}

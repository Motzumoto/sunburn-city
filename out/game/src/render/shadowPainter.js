// SUNBURN CITY — Bakes directional shadows into terrain chunks.
// Bakes long directional sun shadows of buildings, trees, poles and parked cars into terrain.
import { SHADOW_DIR, SHADOW_LEN } from '../core/config.js';

const scratch = [];
const SHADOW = 'rgba(30,24,72,0.30)';
const PENUMBRA = 'rgba(30,24,72,0.07)';

function hull(ctx, x, y, w, h, vx, vy) {
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w + vx, y + vy);
  ctx.lineTo(x + w + vx, y + h + vy);
  ctx.lineTo(x + vx, y + h + vy);
  ctx.lineTo(x, y + h);
  ctx.closePath();
}

function ellipse(ctx, cx, cy, rx, ry) {
  ctx.moveTo(cx + rx, cy);
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
}

function pole(ctx, x, y, vx, vy, hw) {
  ctx.moveTo(x - hw, y);
  ctx.lineTo(x + hw, y);
  ctx.lineTo(x + hw + vx, y + vy);
  ctx.lineTo(x - hw + vx, y + vy);
  ctx.closePath();
}

// All shadows share one path so overlapping shadows never darken twice.
export function paintShadows(ctx, city, r) {
  const list = city.queryRect(r.x0 - 380, r.y0 - 470, r.x1 + 10, r.y1 + 10, scratch);
  const dx = SHADOW_DIR.x;
  const dy = SHADOW_DIR.y;
  ctx.beginPath();
  for (let i = 0; i < list.length; i++) {
    const it = list[i];
    if (it.kind === 'building') {
      const L = it.H * SHADOW_LEN;
      hull(ctx, it.x, it.y, it.w, it.h, dx * L, dy * L);
    } else if (it.kind === 'prop') {
      propShadow(ctx, it, dx, dy);
    } else if (it.parked) {
      const e = it.halfExtents();
      ctx.rect(it.x - e.hx + 2, it.y - e.hy + 3, e.hx * 2 + 6, e.hy * 2 + 7);
    }
  }
  ctx.fillStyle = SHADOW;
  ctx.fill();
  ctx.lineJoin = 'round';
  ctx.lineWidth = 5;
  ctx.strokeStyle = PENUMBRA;
  ctx.stroke();
}

function propShadow(ctx, p, dx, dy) {
  switch (p.type) {
    case 'palm': pole(ctx, p.x, p.y, dx * p.h * 0.32, dy * p.h * 0.32, 1.1); ellipse(ctx, p.x + dx * p.h * 0.36, p.y + dy * p.h * 0.36, 8, 5); break;
    case 'tree': pole(ctx, p.x, p.y, dx * p.h * 0.3, dy * p.h * 0.3, 1.4); ellipse(ctx, p.x + dx * p.h * 0.38, p.y + dy * p.h * 0.38, 11, 8); break;
    case 'lamp': case 'signal': pole(ctx, p.x, p.y, dx * p.h * 0.8, dy * p.h * 0.8, 1.2); break;
    case 'umbrella': ellipse(ctx, p.x + dx * 14, p.y + dy * 14, 14, 9); break;
    case 'bench': case 'busstop': ctx.rect(p.x - 11, p.y - 4, p.cw + 3, p.ch + 5); break;
    case 'lifeguard': hull(ctx, p.x - 13, p.y - 10, 26, 20, dx * 30, dy * 30); break;
    case 'crane': pole(ctx, p.x, p.y, dx * 120, dy * 120, 5); break;
    case 'shrub': ellipse(ctx, p.x + 3, p.y + 3, 8, 6); break;
    default: break;
  }
}

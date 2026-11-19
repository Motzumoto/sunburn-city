// SUNBURN CITY - Draws pooled visual effects and combat feedback.
// Pooled visual effects: dust, tyre smoke, sparks, shell casings, muzzle flashes, tracers and skid marks.
import { mulberry32 } from '../core/rng.js';
import { LIGHT } from './lightSprites.js';

export const FX = { DUST: 0, SMOKE: 1, SPARK: 2, CASING: 3, FLASH: 4, TRACER: 5, BEAM: 6, GLOW: 7 };
const MAX_PARTICLES = 700;
const MAX_SKIDS = 2600;

export class Effects {
  constructor(seed = 1) {
    this.rnd = mulberry32(seed);
    this.pool = [];
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.pool.push({ alive: false, kind: 0, x: 0, y: 0, vx: 0, vy: 0, t: 0, life: 1, size: 1, grow: 0, rot: 0, vr: 0, x2: 0, y2: 0, color: 0 });
    }
    this.cursor = 0;
    this.skidData = new Float32Array(MAX_SKIDS * 5);
    this.skidCount = 0;
    this.skidHead = 0;
    this.shake = 0;
  }

  reseed(seed) {
    this.rnd = mulberry32(seed);
  }

  clear() {
    for (const p of this.pool) p.alive = false;
    this.skidCount = 0;
    this.skidHead = 0;
    this.shake = 0;
  }

  addShake(amount) {
    this.shake = Math.min(1, this.shake + amount);
  }

  spawn(kind, x, y, vx, vy, life, size, grow) {
    // Reuse the oldest slot when the pool is full (ring allocation, no GC).
    const p = this.pool[this.cursor];
    this.cursor = (this.cursor + 1) % MAX_PARTICLES;
    p.alive = true; p.kind = kind; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.t = 0; p.life = life; p.size = size; p.grow = grow;
    p.rot = 0; p.vr = 0;
    return p;
  }

  dust(x, y, vx, vy) {
    const r = this.rnd;
    this.spawn(FX.DUST, x + (r() - 0.5) * 4, y + (r() - 0.5) * 4, vx * 0.2 + (r() - 0.5) * 18, vy * 0.2 + (r() - 0.5) * 18, 0.7 + r() * 0.5, 3 + r() * 3, 2.6);
  }

  smoke(x, y, vx, vy, size = 7) {
    const r = this.rnd;
    this.spawn(FX.SMOKE, x + (r() - 0.5) * 3, y + (r() - 0.5) * 3, vx * 0.15 + (r() - 0.5) * 14, vy * 0.15 + (r() - 0.5) * 14 - 4, 1.4 + r() * 0.9, size, 2.4);
  }

  spark(x, y, angle, speed = 150) {
    const r = this.rnd;
    const a = angle + (r() - 0.5) * 1.5;
    const s = speed * (0.4 + r() * 0.8);
    this.spawn(FX.SPARK, x, y, Math.cos(a) * s, Math.sin(a) * s, 0.18 + r() * 0.22, 1.5, 0);
  }

  casing(x, y, angle) {
    const r = this.rnd;
    const a = angle + Math.PI / 2 + (r() - 0.5) * 0.9;
    const p = this.spawn(FX.CASING, x, y, Math.cos(a) * (50 + r() * 40), Math.sin(a) * (50 + r() * 40), 4.5, 1, 0);
    p.rot = r() * 6.28;
    p.vr = (r() - 0.5) * 30;
  }

  muzzleFlash(x, y, angle) {
    const p = this.spawn(FX.FLASH, x, y, 0, 0, 0.07, 9 + this.rnd() * 5, 0);
    p.rot = angle;
  }

  tracer(x0, y0, x1, y1) {
    const p = this.spawn(FX.TRACER, x0, y0, 0, 0, 0.09, 1, 0);
    p.x2 = x1;
    p.y2 = y1;
  }

  beam(x0, y0, x1, y1, width = 32, life = 8) {
    const p = this.spawn(FX.BEAM, x0, y0, 0, 0, life, width, 0);
    p.x2 = x1;
    p.y2 = y1;
  }

  glow(x, y, size, color = LIGHT.AMBER, life = 8) {
    const p = this.spawn(FX.GLOW, x, y, 0, 0, life, size, 0);
    p.color = color;
  }

  skid(x0, y0, x1, y1, w = 2.6) {
    const i = this.skidHead;
    const d = this.skidData;
    d[i * 5] = x0; d[i * 5 + 1] = y0; d[i * 5 + 2] = x1; d[i * 5 + 3] = y1; d[i * 5 + 4] = w;
    this.skidHead = (i + 1) % MAX_SKIDS;
    if (this.skidCount < MAX_SKIDS) this.skidCount++;
  }

  update(dt) {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this.pool[i];
      if (!p.alive) continue;
      p.t += dt;
      if (p.t >= p.life) { p.alive = false; continue; }
      if (p.kind === FX.FLASH || p.kind === FX.TRACER || p.kind === FX.BEAM || p.kind === FX.GLOW) continue;
      const drag = p.kind === FX.CASING ? 4 : p.kind === FX.SPARK ? 1.2 : 2.2;
      const k = Math.max(0, 1 - drag * dt);
      p.vx *= k;
      p.vy *= k;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.vr *= 0.96;
    }
  }

  drawSkids(ctx, view) {
    const d = this.skidData;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(12,12,18,0.5)';
    let w = -1;
    for (let n = 0; n < this.skidCount; n++) {
      const x0 = d[n * 5];
      const y0 = d[n * 5 + 1];
      const x1 = d[n * 5 + 2];
      const y1 = d[n * 5 + 3];
      if ((x0 < view.left - 20 && x1 < view.left - 20) || (x0 > view.right + 20 && x1 > view.right + 20) ||
        (y0 < view.top - 20 && y1 < view.top - 20) || (y0 > view.bottom + 20 && y1 > view.bottom + 20)) continue;
      if (d[n * 5 + 4] !== w) { w = d[n * 5 + 4]; ctx.lineWidth = w; }
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
    ctx.lineCap = 'butt';
  }

  // Ground-level particles (casings) go under the sorted objects.
  drawGround(ctx, view) {
    this.drawSkids(ctx, view);
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this.pool[i];
      if (!p.alive || p.kind !== FX.CASING) continue;
      if (p.x < view.left || p.x > view.right || p.y < view.top || p.y > view.bottom) continue;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = '#e0b84e';
      ctx.fillRect(-1.6, -0.9, 3.2, 1.8);
      ctx.fillStyle = '#fff3b0';
      ctx.fillRect(-1.6, -0.9, 1.2, 0.8);
      ctx.restore();
    }
  }

  drawAir(ctx, view) {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this.pool[i];
      if (!p.alive || p.kind === FX.CASING) continue;
      if (p.x < view.left - 40 || p.x > view.right + 40 || p.y < view.top - 40 || p.y > view.bottom + 40) {
        if (p.kind !== FX.TRACER) continue;
      }
      const f = p.t / p.life;
      switch (p.kind) {
        case FX.DUST:
          ctx.globalAlpha = (1 - f) * 0.42;
          ctx.fillStyle = '#dccba4';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size + p.grow * f * 6, 0, 6.3); ctx.fill();
          break;
        case FX.SMOKE:
          ctx.globalAlpha = (1 - f) * (1 - f) * 0.55;
          ctx.fillStyle = '#eceaf0';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size + p.grow * f * 9, 0, 6.3); ctx.fill();
          ctx.globalAlpha *= 0.6;
          ctx.fillStyle = '#b9b7c4';
          ctx.beginPath(); ctx.arc(p.x + 1.5, p.y + 1.5, (p.size + p.grow * f * 9) * 0.65, 0, 6.3); ctx.fill();
          break;
        case FX.SPARK:
          ctx.globalAlpha = 1 - f;
          ctx.strokeStyle = f < 0.5 ? '#fff2b8' : '#ff9a3c';
          ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.045, p.y - p.vy * 0.045); ctx.stroke();
          break;
        case FX.FLASH: drawFlash(ctx, p); break;
        case FX.TRACER:
          ctx.globalAlpha = (1 - f) * 0.9;
          ctx.strokeStyle = '#fff0a8';
          ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x2, p.y2); ctx.stroke();
          break;
        case FX.BEAM: {
          ctx.globalAlpha = (1 - f) * 0.34;
          ctx.fillStyle = 'rgba(255,244,190,0.28)';
          const dx = p.x2 - p.x;
          const dy = p.y2 - p.y;
          const len = Math.hypot(dx, dy) || 1;
          const half = p.size * (0.32 + f * 0.15);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x2 - dy / len * half, p.y2 + dx / len * half);
          ctx.lineTo(p.x2 + dy / len * half, p.y2 - dx / len * half);
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = (1 - f) * 0.75;
          ctx.strokeStyle = '#fff4ce';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x2, p.y2);
          ctx.stroke();
          break;
        }
        case FX.GLOW:
          ctx.globalAlpha = (1 - f) * 0.52;
          ctx.fillStyle = p.color === LIGHT.RED ? '#ff4c54' : p.color === LIGHT.BLUE ? '#5b9cff' : '#ffc36b';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (0.72 + f * 0.28), 0, 6.3);
          ctx.fill();
          if (p.color === LIGHT.AMBER) {
            const ray = p.size * 1.65;
            ctx.globalAlpha = (1 - f) * 0.82;
            ctx.strokeStyle = '#fff0cf';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(p.x - ray, p.y); ctx.lineTo(p.x + ray, p.y);
            ctx.moveTo(p.x, p.y - ray); ctx.lineTo(p.x, p.y + ray);
            ctx.moveTo(p.x - ray * 0.55, p.y - ray * 0.55); ctx.lineTo(p.x + ray * 0.55, p.y + ray * 0.55);
            ctx.moveTo(p.x - ray * 0.55, p.y + ray * 0.55); ctx.lineTo(p.x + ray * 0.55, p.y - ray * 0.55);
            ctx.stroke();
          }
          break;
        default: break;
      }
    }
    ctx.globalAlpha = 1;
  }

  // Muzzle flashes and sparks light their surroundings at any time of day.
  collectLights(lights, view) {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this.pool[i];
      if (!p.alive) continue;
      if (p.kind === FX.FLASH) lights.add(p.x, p.y, 58, LIGHT.AMBER, 0.9 * (1 - p.t / p.life));
      else if (p.kind === FX.SPARK && (i & 3) === 0) lights.add(p.x, p.y, 14, LIGHT.AMBER, 0.6 * (1 - p.t / p.life));
      else if (p.kind === FX.GLOW && (i & 1) === 0) lights.add(p.x, p.y, p.size * 1.8, p.color, 0.24 * (1 - p.t / p.life));
    }
  }
}

function drawFlash(ctx, p) {
  const f = p.t / p.life;
  const s = p.size * (1 - f * 0.4);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.globalAlpha = 1 - f * 0.5;
  ctx.fillStyle = '#ffc94a';
  ctx.beginPath();
  ctx.moveTo(-1, 0);
  ctx.lineTo(s * 0.35, -s * 0.28);
  ctx.lineTo(s * 1.1, 0);
  ctx.lineTo(s * 0.35, s * 0.28);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fffbe0';
  ctx.beginPath();
  ctx.moveTo(-1, 0);
  ctx.lineTo(s * 0.3, -s * 0.13);
  ctx.lineTo(s * 0.72, 0);
  ctx.lineTo(s * 0.3, s * 0.13);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffa63a';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-s * 0.1, -s * 0.5); ctx.lineTo(s * 0.15, -s * 0.05); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-s * 0.1, s * 0.5); ctx.lineTo(s * 0.15, s * 0.05); ctx.closePath(); ctx.fill();
  ctx.restore();
}

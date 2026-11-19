// Cached additive light sprites (radial glows and headlight cones) and the per-frame light list that draws them.

export const LIGHT = { WARM: 0, PINK: 1, CYAN: 2, PURPLE: 3, RED: 4, WHITE: 5, BLUE: 6, AMBER: 7, GREEN: 8, TEAL: 9 };
const COLORS = [[255, 196, 120], [255, 70, 170], [40, 220, 255], [170, 100, 255], [255, 50, 40], [255, 248, 230],
  [60, 110, 255], [255, 170, 40], [70, 255, 130], [40, 220, 190]];

const glow = [];
const cone = [];

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function glowSprite(idx) {
  if (glow[idx]) return glow[idx];
  const c = makeCanvas(128, 128);
  const g = c.getContext('2d');
  const [r, gr, b] = COLORS[idx];
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(' + r + ',' + gr + ',' + b + ',0.95)');
  grad.addColorStop(0.22, 'rgba(' + r + ',' + gr + ',' + b + ',0.5)');
  grad.addColorStop(0.55, 'rgba(' + r + ',' + gr + ',' + b + ',0.14)');
  grad.addColorStop(1, 'rgba(' + r + ',' + gr + ',' + b + ',0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  glow[idx] = c;
  return c;
}

// Cone pointing along +x, widening and fading with distance.
function coneSprite(idx) {
  if (cone[idx]) return cone[idx];
  const c = makeCanvas(160, 96);
  const g = c.getContext('2d');
  const [r, gr, b] = COLORS[idx];
  const grad = g.createLinearGradient(0, 0, 160, 0);
  grad.addColorStop(0, 'rgba(' + r + ',' + gr + ',' + b + ',0.85)');
  grad.addColorStop(0.35, 'rgba(' + r + ',' + gr + ',' + b + ',0.34)');
  grad.addColorStop(1, 'rgba(' + r + ',' + gr + ',' + b + ',0)');
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(0, 44);
  g.lineTo(160, 0);
  g.lineTo(160, 96);
  g.lineTo(0, 52);
  g.closePath();
  g.fill();
  cone[idx] = c;
  return c;
}

export class LightList {
  constructor(cap = 1400) {
    this.cap = cap;
    this.x = new Float32Array(cap);
    this.y = new Float32Array(cap);
    this.r = new Float32Array(cap);
    this.a = new Float32Array(cap);
    this.c = new Uint8Array(cap);
    this.ang = new Float32Array(cap); // NaN-free: 0 for glows, angle for cones
    this.isCone = new Uint8Array(cap);
    this.count = 0;
  }

  clear() {
    this.count = 0;
  }

  add(x, y, r, color, a) {
    if (this.count >= this.cap || a <= 0.01) return;
    const i = this.count++;
    this.x[i] = x; this.y[i] = y; this.r[i] = r; this.a[i] = a; this.c[i] = color; this.isCone[i] = 0;
  }

  addCone(x, y, angle, len, color, a) {
    if (this.count >= this.cap || a <= 0.01) return;
    const i = this.count++;
    this.x[i] = x; this.y[i] = y; this.r[i] = len; this.a[i] = a; this.c[i] = color; this.isCone[i] = 1; this.ang[i] = angle;
  }

  // Draws everything additively; (k, tx, ty) is the active world-to-device transform.
  draw(ctx, k, tx, ty) {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < this.count; i++) {
      ctx.globalAlpha = this.a[i] > 1 ? 1 : this.a[i];
      const r = this.r[i];
      if (this.isCone[i]) {
        const ca = Math.cos(this.ang[i]);
        const sa = Math.sin(this.ang[i]);
        ctx.setTransform(k * ca, k * sa, -k * sa, k * ca, k * this.x[i] + tx, k * this.y[i] + ty);
        ctx.drawImage(coneSprite(this.c[i]), 0, -r * 0.3, r, r * 0.6);
        ctx.setTransform(k, 0, 0, k, tx, ty);
      } else {
        ctx.drawImage(glowSprite(this.c[i]), this.x[i] - r, this.y[i] - r, r * 2, r * 2);
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
}

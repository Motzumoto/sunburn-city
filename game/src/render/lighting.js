// SUNBURN CITY — Applies time-of-day tint, glow, grade and film grain.
// Time-of-day lighting: world tint, golden-hour bloom, additive light pass, vignette and colour grade.
import { LightList } from './lightSprites.js';
import { hash2 } from '../core/math.js';

export class Lighting {
  constructor() {
    this.lights = new LightList();
    this.vignette = null;
    this.gradeGradient = null;
    this.grain = null;
    this.sizeKey = '';
  }

  // Rebuild size-dependent cached layers when the canvas size changes.
  prepare(w, h) {
    const key = w + 'x' + h;
    if (key === this.sizeKey) return;
    this.sizeKey = key;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d');
    const r = Math.hypot(w, h) / 2;
    const grad = g.createRadialGradient(w / 2, h / 2, r * 0.45, w / 2, h / 2, r * 1.02);
    grad.addColorStop(0, 'rgba(18,10,40,0)');
    grad.addColorStop(0.7, 'rgba(18,10,40,0.2)');
    grad.addColorStop(1, 'rgba(12,6,30,0.55)');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    this.vignette = c;
    const grain = document.createElement('canvas');
    grain.width = 128;
    grain.height = 128;
    const grainCtx = grain.getContext('2d');
    const pixels = grainCtx.createImageData(128, 128);
    for (let i = 0; i < pixels.data.length; i += 4) {
      const value = hash2(i, i >> 4, 1986) < 0.5 ? 0 : 255;
      pixels.data[i] = value;
      pixels.data[i + 1] = value;
      pixels.data[i + 2] = value;
      pixels.data[i + 3] = 255;
    }
    grainCtx.putImageData(pixels, 0, 0);
    this.grain = grainCtx.createPattern(grain, 'repeat');
    const cg = document.createElement('canvas').getContext('2d');
    const lg = cg.createLinearGradient(0, 0, 0, h);
    lg.addColorStop(0, 'rgba(40,190,200,0.5)');
    lg.addColorStop(0.5, 'rgba(255,255,255,0)');
    lg.addColorStop(1, 'rgba(255,120,90,0.5)');
    this.gradeGradient = lg;
  }

  // Multiply the whole frame by the sky tint (screen space, identity transform).
  applyTint(ctx, w, h, sky) {
    if (sky.r >= 0.995 && sky.g >= 0.995 && sky.b >= 0.995) return;
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgb(' + Math.round(sky.r * 255) + ',' + Math.round(sky.g * 255) + ',' + Math.round(sky.b * 255) + ')';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
  }

  // Warm sun bloom from the upper left during dawn and golden hour.
  applyGlow(ctx, w, h, sky) {
    if (sky.glow < 0.02) return;
    ctx.globalCompositeOperation = 'screen';
    const r = Math.hypot(w, h) * 0.95;
    const g = ctx.createRadialGradient(w * 0.05, -h * 0.05, 0, w * 0.05, -h * 0.05, r);
    g.addColorStop(0, 'rgba(255,184,96,' + (0.5 * sky.glow).toFixed(3) + ')');
    g.addColorStop(0.45, 'rgba(255,140,80,' + (0.14 * sky.glow).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(255,120,70,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    if (sky.glow > 0.4) {
      ctx.globalAlpha = Math.min(1, sky.glow);
      ctx.fillStyle = '#ffe3a0';
      ctx.beginPath();
      ctx.arc(w * 0.16, h * 0.28, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  applyVignette(ctx, w, h, sky) {
    ctx.globalAlpha = 0.75 + sky.night * 0.25;
    ctx.drawImage(this.vignette, 0, 0, w, h);
    ctx.globalAlpha = 1;
  }

  // Gentle teal-and-coral split tone, the final colour grade.
  applyGrade(ctx, w, h) {
    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = 0.32;
    ctx.fillStyle = this.gradeGradient;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  applyFilmGrain(ctx, w, h) {
    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = 0.045;
    ctx.fillStyle = this.grain;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
}

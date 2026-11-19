// SUNBURN CITY - Draws cars, player highlights, lights and shadows.
// Draws extruded top-down cars: shadows, stacked body layers, glass, lights, police light bars and night glow.
import { EXTRUDE, SHADOW_DIR } from '../core/config.js';
import { shade, mix, roundRectPath } from './palette.js';
import { LIGHT } from './lightSprites.js';

const colorCache = new Map();

function carColors(hex) {
  let c = colorCache.get(hex);
  if (!c) {
    c = { dark: shade(hex, -0.5), mid: mix(shade(hex, -0.5), hex, 0.45), top: hex, light: shade(hex, 0.28), roof: shade(hex, 0.14) };
    colorCache.set(hex, c);
  }
  return c;
}

export function drawVehicleShadow(ctx, v) {
  const s = v.spec;
  ctx.save();
  ctx.translate(v.x + SHADOW_DIR.x * s.h * 1.5, v.y + SHADOW_DIR.y * s.h * 1.5);
  ctx.rotate(v.heading + v.slip);
  ctx.fillStyle = 'rgba(29,51,64,0.12)';
  ctx.beginPath();
  ctx.ellipse(1, 2, s.l * 0.62, s.w * 0.78, 0, 0, Math.PI * 2);
  ctx.fill();
  roundRectPath(ctx, -s.l / 2, -s.w / 2, s.l, s.w, 6);
  ctx.fillStyle = 'rgba(29,51,64,0.27)';
  ctx.fill();
  ctx.restore();
}

function layer(ctx, v, f, color) {
  const s = v.spec;
  ctx.save();
  ctx.translate(v.x + EXTRUDE.x * s.h * f, v.y + EXTRUDE.y * s.h * f);
  ctx.rotate(v.heading + v.slip);
  roundRectPath(ctx, -s.l / 2, -s.w / 2, s.l, s.w, 6.5);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

export function drawVehicle(ctx, v, time) {
  const s = v.spec;
  const c = v._c || (v._c = carColors(v.color));
  const L = s.l;
  const W = s.w;
  if (v.isPlayerCar) {
    ctx.save();
    ctx.translate(v.x, v.y);
    ctx.rotate(v.heading + v.slip);
    ctx.fillStyle = 'rgba(255,246,225,0.55)';
    ctx.shadowColor = 'rgba(255,246,225,0.7)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.ellipse(0, 0, 26, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Wheels peek out below the body.
  ctx.save();
  ctx.translate(v.x, v.y);
  ctx.rotate(v.heading + v.slip);
  ctx.fillStyle = '#121419';
  ctx.fillRect(L * 0.2, -W / 2 - 1, 9, 3.2);
  ctx.fillRect(L * 0.2, W / 2 - 2.2, 9, 3.2);
  ctx.fillRect(-L * 0.4, -W / 2 - 1, 9, 3.2);
  ctx.fillRect(-L * 0.4, W / 2 - 2.2, 9, 3.2);
  ctx.restore();
  layer(ctx, v, 0, c.dark);
  layer(ctx, v, 0.34, c.dark);
  layer(ctx, v, 0.67, c.mid);
  // Top surface.
  ctx.save();
  ctx.translate(v.x + EXTRUDE.x * s.h, v.y + EXTRUDE.y * s.h);
  ctx.rotate(v.heading + v.slip);
  roundRectPath(ctx, -L / 2, -W / 2, L, W, 6.5);
  ctx.fillStyle = v.type === 'police' ? '#f4f4f1' : c.top;
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  roundRectPath(ctx, L * 0.1, -W / 2 + 1.5, L * 0.38, W - 3, 4);
  ctx.fill();
  const xr = -L / 2 + s.cabin[0] * L;
  const xf = -L / 2 + s.cabin[1] * L;
  ctx.fillStyle = '#16212d';
  roundRectPath(ctx, xr - 1, -W * 0.42, xf - xr + 2, W * 0.84, 4);
  ctx.fill();
  ctx.fillStyle = v.type === 'police' ? '#e9e9e6' : c.roof;
  roundRectPath(ctx, xr + L * 0.1, -W * 0.37, xf - xr - L * 0.2, W * 0.74, 3);
  ctx.fill();
  ctx.fillStyle = 'rgba(120,190,230,0.28)';
  ctx.fillRect(xf - L * 0.08, -W * 0.34, L * 0.06, W * 0.68);
  decorate(ctx, v, L, W, time);
  // Head and tail lamps.
  ctx.fillStyle = v.headlights ? '#fffbe0' : '#e9e2c2';
  ctx.fillRect(L / 2 - 3, -W / 2 + 1.4, 2.8, 3.6);
  ctx.fillRect(L / 2 - 3, W / 2 - 5, 2.8, 3.6);
  ctx.fillStyle = v.brakeLights ? '#ff4a3c' : '#9e2b25';
  ctx.fillRect(-L / 2, -W / 2 + 1.4, 2.4, 3.8);
  ctx.fillRect(-L / 2, W / 2 - 5.2, 2.4, 3.8);
  if (v.isPlayerCar) {
    ctx.strokeStyle = '#fff6e2';
    ctx.lineWidth = 2;
    roundRectPath(ctx, -L / 2, -W / 2, L, W, 6.5);
    ctx.stroke();
  }
  ctx.restore();
  if (v.isPlayerCar) {
    ctx.save();
    ctx.translate(v.x + EXTRUDE.x * s.h, v.y + EXTRUDE.y * s.h - W / 2 - 16);
    ctx.strokeStyle = 'rgba(20,25,32,0.75)';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-4, 2);
    ctx.lineTo(0, -2);
    ctx.lineTo(4, 2);
    ctx.stroke();
    ctx.strokeStyle = '#ff4d3d';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-4, 2);
    ctx.lineTo(0, -2);
    ctx.lineTo(4, 2);
    ctx.stroke();
    ctx.restore();
  }
}

function decorate(ctx, v, L, W, time) {
  switch (v.type) {
    case 'police': {
      ctx.fillStyle = '#15181f';
      ctx.fillRect(-L * 0.22, -W / 2, L * 0.36, 3.6);
      ctx.fillRect(-L * 0.22, W / 2 - 3.6, L * 0.36, 3.6);
      ctx.fillRect(-L / 2 + 1, -W * 0.3, L * 0.14, W * 0.6);
      ctx.fillStyle = '#2b6fd6';
      ctx.fillRect(L * 0.18, -1.4, L * 0.3, 2.8);
      const flash = v.siren ? (Math.floor(time * 7 + v.siren) % 2) : -1;
      ctx.fillStyle = flash === 0 ? '#ff2a2a' : '#7a1515';
      ctx.fillRect(-3, -W * 0.38, 6, W * 0.38);
      ctx.fillStyle = flash === 1 ? '#3d7bff' : '#16307a';
      ctx.fillRect(-3, 0, 6, W * 0.38);
      break;
    }
    case 'taxi':
      ctx.fillStyle = '#fffbe8';
      ctx.fillRect(-3, -4, 6, 8);
      ctx.fillStyle = '#16212d';
      ctx.fillRect(-1.5, -2.5, 3, 5);
      break;
    case 'sport':
      ctx.fillStyle = 'rgba(250,246,230,0.8)';
      ctx.fillRect(-L * 0.45, -2.6, L * 0.9, 1.7);
      ctx.fillRect(-L * 0.45, 0.9, L * 0.9, 1.7);
      break;
    case 'van':
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(-L * 0.1, -W / 2 + 2, 1, W - 4);
      break;
    default: break;
  }
}

// Headlight cones, tail glow and flashing sirens. `night` is 0..1 darkness.
export function drawVehicleNight(ctx, v, night, time, lights) {
  const s = v.spec;
  const ang = v.heading + v.slip;
  const ca = Math.cos(ang);
  const sa = Math.sin(ang);
  const ox = EXTRUDE.x * s.h;
  const oy = EXTRUDE.y * s.h;
  if (v.siren) {
    const flash = Math.floor(time * 7 + v.siren) % 2;
    const a = 0.45 + night * 0.5;
    lights.add(v.x + ox, v.y + oy, 78, flash ? LIGHT.BLUE : LIGHT.RED, a);
    lights.add(v.x + ox - ca * 10, v.y + oy - sa * 10, 54, flash ? LIGHT.RED : LIGHT.BLUE, a * 0.5);
  }
  if (night < 0.12) return;
  const hx = v.x + ox + ca * s.l * 0.5;
  const hy = v.y + oy + sa * s.l * 0.5;
  if (v.headlights) {
    lights.addCone(hx - sa * s.w * 0.28, hy + ca * s.w * 0.28, ang, 120, LIGHT.WHITE, 0.5 * night);
    lights.addCone(hx + sa * s.w * 0.28, hy - ca * s.w * 0.28, ang, 120, LIGHT.WHITE, 0.5 * night);
    lights.add(hx, hy, 18, LIGHT.WHITE, 0.45 * night);
  }
  const tx = v.x + ox - ca * s.l * 0.5;
  const ty = v.y + oy - sa * s.l * 0.5;
  lights.add(tx, ty, v.brakeLights ? 28 : 16, LIGHT.RED, (v.brakeLights ? 0.9 : 0.5) * night);
}

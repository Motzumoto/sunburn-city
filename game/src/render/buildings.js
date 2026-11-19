// Draws extruded buildings: lit west face, shaded south face, windows, roofs, awnings, crowns and night lights.
import { EXTRUDE } from '../core/config.js';
import { drawBoxFaces } from './boxes.js';
import { drawRoofDetails } from './roofDetails.js';
import { drawRoofSign, drawRoofSignLit } from './signs.js';
import { LIGHT } from './lightSprites.js';

const LIT_A = [5, 11, 3, 8, 6, 13, 4, 9];
const LIT_B = [3, 9, 7, 12, 2, 10, 5, 8];
const CROWN_TIERS = [[0.78, 0.1], [0.52, 0.09]];

export function drawBuilding(ctx, b) {
  if (b.type === 'container') { drawContainer(ctx, b); return; }
  const H = b.H;
  drawBoxFaces(ctx, b.x, b.y, b.w, b.h, 0, H, b.litCss, b.darkCss);
  drawFacade(ctx, b, b.x, b.y, b.w, b.h, 0, H);
  // Ambient occlusion where the walls meet the ground.
  ctx.fillStyle = 'rgba(20,30,42,0.16)';
  ctx.fillRect(b.x + 2, b.y + b.h - 2, b.w - 4, 2);
  ctx.strokeStyle = 'rgba(255,245,222,0.72)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(b.rx, b.ry + b.h);
  ctx.lineTo(b.rx + b.w, b.ry + b.h);
  ctx.stroke();
  if (b.awning) drawAwning(ctx, b);
  let topX = b.rx;
  let topY = b.ry;
  let topW = b.w;
  let topH = b.h;
  drawRoof(ctx, b, topX, topY, topW, topH);
  if (b.crown) {
    let z = H;
    for (const t of CROWN_TIERS) {
      const nw = b.w * t[0];
      const nh = b.h * t[0];
      const nx = b.x + (b.w - nw) / 2;
      const ny = b.y + (b.h - nh) / 2;
      const dz = H * t[1];
      drawBoxFaces(ctx, nx, ny, nw, nh, z, z + dz, b.litCss, b.darkCss);
      drawFacade(ctx, b, nx, ny, nw, nh, z, z + dz);
      z += dz;
      topX = nx + EXTRUDE.x * z;
      topY = ny + EXTRUDE.y * z;
      topW = nw;
      topH = nh;
      drawRoof(ctx, b, topX, topY, topW, topH);
    }
    drawSpire(ctx, topX + topW / 2, topY + topH / 2, 70);
  }
  if (b.roof.length) drawRoofDetails(ctx, b.roof, topX, topY, topW, topH);
  if (b.sign) drawRoofSign(ctx, b, topX, topY, topW);
}

function drawRoof(ctx, b, x, y, w, h) {
  if (b.type === 'house') { drawHouseRoof(ctx, b, x, y, w, h); return; }
  ctx.fillStyle = b.roofEdge;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = b.roofCss;
  ctx.fillRect(x + 2.5, y + 2.5, w - 5, h - 5);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(x, y, w, 1.2);
  ctx.fillRect(x, y, 1.2, h);
  if (b.type === 'warehouse') {
    ctx.strokeStyle = 'rgba(0,0,0,0.13)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let k = 7; k < w - 3; k += 7) { ctx.moveTo(x + k, y + 3); ctx.lineTo(x + k, y + h - 3); }
    ctx.stroke();
  }
  if (b.type === 'club') {
    ctx.strokeStyle = b.accent;
    ctx.lineWidth = 1.6;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  }
}

function drawHouseRoof(ctx, b, x, y, w, h) {
  ctx.fillStyle = b.roofEdge;
  ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
  ctx.fillStyle = b.roofCss;
  ctx.fillRect(x - 1, y - 1, w + 2, h / 2 + 1);
  ctx.fillStyle = 'rgba(40,10,0,0.28)';
  ctx.fillRect(x - 1, y + h / 2, w + 2, h / 2 + 1);
  ctx.strokeStyle = 'rgba(255,230,200,0.5)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - 1, y + h / 2); ctx.lineTo(x + w + 1, y + h / 2);
  ctx.stroke();
  if (b.roof.length) {
    ctx.fillStyle = '#27407a';
    ctx.fillRect(x + w * 0.15, y + h * 0.6, w * 0.5, h * 0.32);
  }
}

function drawSpire(ctx, x, y, hh) {
  ctx.strokeStyle = '#cfd6dc';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + EXTRUDE.x * hh, y + EXTRUDE.y * hh);
  ctx.stroke();
}

function floorCount(z0, z1, pitch) {
  return Math.max(0, Math.floor((z1 - z0) / pitch));
}

// Window rows on both visible faces of a box section between heights z0 and z1.
function drawFacade(ctx, b, x, y, w, h, z0, z1) {
  if (b.pitchX === 0) { warehouseFace(ctx, x, y, w, h, z0, z1); return; }
  const pitch = b.pitchY;
  const n = floorCount(z0 + 6, z1 - 3, pitch);
  if (n < 1) return;
  const glass = b.glass;
  const col = glass ? 'rgba(170,225,240,0.62)' : 'rgba(26,52,74,0.78)';
  const dash = glass ? [b.pitchX * 0.92, 1.6] : [b.pitchX * 0.58, b.pitchX * 0.42];
  // South face: horizontal rows.
  ctx.strokeStyle = col;
  ctx.lineWidth = Math.max(1.3, -EXTRUDE.y * pitch * 0.55);
  ctx.setLineDash(dash);
  ctx.beginPath();
  for (let k = 0; k < n; k++) {
    const z = z0 + 6 + k * pitch + pitch * 0.5;
    const sx = x + EXTRUDE.x * z;
    const sy = y + h + EXTRUDE.y * z;
    ctx.moveTo(sx + 4, sy);
    ctx.lineTo(sx + w - 3, sy);
  }
  ctx.stroke();
  // West face: slim vertical strips seen at a steep angle.
  ctx.strokeStyle = glass ? 'rgba(200,240,250,0.55)' : 'rgba(40,70,92,0.7)';
  ctx.lineWidth = Math.max(0.9, EXTRUDE.x * pitch * 0.7);
  ctx.beginPath();
  for (let k = 0; k < n; k++) {
    const z = z0 + 6 + k * pitch + pitch * 0.5;
    const sx = x + EXTRUDE.x * z;
    const sy = y + EXTRUDE.y * z;
    ctx.moveTo(sx, sy + 3);
    ctx.lineTo(sx, sy + h - 3);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  const topX = x + EXTRUDE.x * z1;
  const topY = y + EXTRUDE.y * z1;
  if (glass) {
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.moveTo(x + EXTRUDE.x * z0 + w * 0.15, y + h + EXTRUDE.y * z0);
    ctx.lineTo(x + EXTRUDE.x * z0 + w * 0.4, y + h + EXTRUDE.y * z0);
    ctx.lineTo(topX + w * 0.55, topY + h);
    ctx.lineTo(topX + w * 0.3, topY + h);
    ctx.closePath();
    ctx.fill();
  }
  if (b.deco || b.type === 'deco') {
    ctx.fillStyle = b.accent;
    ctx.fillRect(topX, topY + h - 3.2, w, 3.2);
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let fx = 10; fx < w - 4; fx += 14) {
      ctx.moveTo(x + EXTRUDE.x * z0 + fx, y + h + EXTRUDE.y * z0);
      ctx.lineTo(topX + fx, topY + h);
    }
    ctx.stroke();
  }
  if (b.bank && z0 === 0) bankColumns(ctx, b, x, y, w, h, z1);
}

function bankColumns(ctx, b, x, y, w, h, z1) {
  ctx.strokeStyle = 'rgba(255,250,235,0.7)';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  const n = Math.max(4, Math.floor(w / 18));
  for (let k = 0; k <= n; k++) {
    const fx = 6 + (k * (w - 12)) / n;
    ctx.moveTo(x + fx, y + h);
    ctx.lineTo(x + EXTRUDE.x * z1 * 0.55 + fx, y + h + EXTRUDE.y * z1 * 0.55);
  }
  ctx.stroke();
  ctx.fillStyle = '#d9cdb4';
  ctx.fillRect(x + EXTRUDE.x * z1 * 0.55 - 1, y + h + EXTRUDE.y * z1 * 0.55 - 5, w + 2, 5);
}

function warehouseFace(ctx, x, y, w, h, z0, z1) {
  const sx0 = x + EXTRUDE.x * z0;
  const sy0 = y + h + EXTRUDE.y * z0;
  const sx1 = x + EXTRUDE.x * z1;
  const sy1 = y + h + EXTRUDE.y * z1;
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(sx0, sy0 + (sy1 - sy0) * 0.55, w, 1.5);
  ctx.fillStyle = 'rgba(255,245,220,0.18)';
  ctx.fillRect(sx0, sy0 + (sy1 - sy0) * 0.55, w, 2);
  ctx.strokeStyle = 'rgba(49,62,70,0.28)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (let k = 8; k < w; k += 12) { ctx.moveTo(sx0 + k, sy0); ctx.lineTo(sx1 + k, sy1); }
  ctx.stroke();
}

function drawAwning(ctx, b) {
  const z = 16;
  const x = b.x + EXTRUDE.x * z + 3;
  const y = b.y + b.h + EXTRUDE.y * z;
  const w = b.w - 6;
  for (let k = 0, sx = 0; sx < w; k++, sx += 6) {
    ctx.fillStyle = k % 2 ? '#fdf7ea' : b.awning;
    ctx.fillRect(x + sx, y, Math.min(6, w - sx), 7);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect(x, y + 7, w, 2);
  ctx.fillStyle = 'rgba(20,40,60,0.55)';
  ctx.fillRect(x, y - 4, w, 4);
}

function drawContainer(ctx, b) {
  drawBoxFaces(ctx, b.x, b.y, b.w, b.h, 0, b.H, b.litCss, b.darkCss);
  const sy = b.y + b.h;
  ctx.strokeStyle = 'rgba(0,0,0,0.22)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let k = 3; k < b.w; k += 4) { ctx.moveTo(b.x + EXTRUDE.x * 0 + k, sy); ctx.lineTo(b.x + EXTRUDE.x * b.H + k, sy + EXTRUDE.y * b.H); }
  ctx.stroke();
  ctx.fillStyle = b.roofCss;
  ctx.fillRect(b.rx, b.ry, b.w, b.h);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(b.rx, b.ry, b.w, 1.2);
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(b.rx + 0.5, b.ry + 0.5, b.w - 1, b.h - 1);
}

// ---- night pass: lit windows, neon and beacons drawn after the darkness tint ----
export function drawBuildingNight(ctx, b, night, time, lights) {
  if (b.type === 'container') return;
  if (b.pitchX !== 0) litWindows(ctx, b, b.x, b.y, b.w, b.h, 0, b.H, night);
  if (b.crown) {
    let z = b.H;
    for (const t of CROWN_TIERS) {
      const nw = b.w * t[0];
      const nh = b.h * t[0];
      const dz = b.H * t[1];
      litWindows(ctx, b, b.x + (b.w - nw) / 2, b.y + (b.h - nh) / 2, nw, nh, z, z + dz, night);
      z += dz;
    }
    const sx = b.x + b.w / 2 + EXTRUDE.x * (z + 70);
    const sy = b.y + b.h / 2 + EXTRUDE.y * (z + 70);
    const blink = (Math.floor(time * 1.4) % 2) === 0 ? 1 : 0.35;
    lights.add(sx, sy, 34, LIGHT.RED, 0.9 * blink * night);
  }
  if (b.sign && b.sign.px !== undefined) {
    ctx.globalAlpha = Math.min(1, night * 1.3);
    drawRoofSignLit(ctx, b);
    ctx.globalAlpha = 1;
    const s = b.sign;
    lights.add(s.px, s.py, Math.max(48, s.pw * 0.8), s.neon ? LIGHT.PINK : LIGHT.WARM, 0.6 * night);
    if (s.neon) lights.add(b.x + b.w / 2, b.y + b.h + 16, 78, LIGHT.PINK, 0.28 * night);
  }
  if (b.type === 'club') lights.add(b.x + b.w / 2, b.y + b.h + 18, 90, b.lightSeed % 2 ? LIGHT.CYAN : LIGHT.PURPLE, 0.34 * night);
  if (b.type === 'shop' || b.type === 'club') lights.add(b.x + b.w / 2, b.y + b.h + 10, 56, LIGHT.WARM, 0.22 * night);
}

function litWindows(ctx, b, x, y, w, h, z0, z1, night) {
  const pitch = b.pitchY;
  const n = floorCount(z0 + 6, z1 - 3, pitch);
  if (n < 1) return;
  const bright = b.glass ? '#c9f3ff' : b.type === 'club' ? '#ff9ad8' : '#ffd890';
  ctx.globalAlpha = Math.min(0.95, night * 1.15);
  ctx.fillStyle = bright;
  ctx.strokeStyle = bright;
  for (let parity = 0; parity < 2; parity++) {
    const pat = parity ? LIT_B : LIT_A;
    const scale = b.pitchX / 12;
    ctx.setLineDash(scaleDash(pat, scale));
    ctx.lineDashOffset = (b.lightSeed % 17) + parity * 5;
    ctx.lineWidth = Math.max(1.3, -EXTRUDE.y * pitch * 0.55);
    ctx.beginPath();
    for (let k = parity; k < n; k += 2) {
      const z = z0 + 6 + k * pitch + pitch * 0.5;
      const sx = x + EXTRUDE.x * z;
      const sy = y + h + EXTRUDE.y * z;
      ctx.moveTo(sx + 4, sy);
      ctx.lineTo(sx + w - 3, sy);
    }
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;
  ctx.globalAlpha = 1;
}

const dashCache = new Map();
function scaleDash(pat, scale) {
  const key = pat === LIT_A ? 'a' + scale : 'b' + scale;
  let d = dashCache.get(key);
  if (!d) { d = pat.map((v) => v * scale); dashCache.set(key, d); }
  return d;
}

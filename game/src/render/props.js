// SUNBURN CITY - Renders street, beach and waterfront props.
// Draws street and beach props: palms, trees, lamps, signals, benches, umbrellas, fountains, yachts and cranes.
import { EXTRUDE } from '../core/config.js';
import { palmCrown, treeCanopy, umbrellaSprite, SPRITE_SCALE, TOWEL_COLORS } from './spriteCache.js';
import { drawBoxFaces } from './boxes.js';
import { roundRectPath } from './palette.js';
import { LIGHT } from './lightSprites.js';

const ARM = { top: [0, -7], bottom: [0, 7], left: [-7, 0], right: [7, 0] };

export function drawProp(ctx, p, time) {
  switch (p.type) {
    case 'palm': drawPalm(ctx, p, time); break;
    case 'tree': drawTree(ctx, p, time); break;
    case 'shrub': drawPlanter(ctx, p); break;
    case 'lamp': drawLamp(ctx, p); break;
    case 'signal': drawSignal(ctx, p, time); break;
    case 'bench': drawBench(ctx, p); break;
    case 'bin': drawBin(ctx, p); break;
    case 'hydrant': drawHydrant(ctx, p); break;
    case 'bollard': drawBollard(ctx, p); break;
    case 'umbrella': drawUmbrella(ctx, p); break;
    case 'towel': drawTowel(ctx, p); break;
    case 'fountain': drawFountain(ctx, p, time); break;
    case 'lifeguard': drawLifeguard(ctx, p); break;
    case 'net': drawNet(ctx, p); break;
    case 'yacht': drawYacht(ctx, p, time); break;
    case 'crane': drawCrane(ctx, p); break;
    case 'busstop': drawBusStop(ctx, p); break;
    case 'cafeTable': drawCafeTable(ctx, p); break;
    case 'marketStall': drawMarketStall(ctx, p); break;
    case 'scooter': drawScooter(ctx, p); break;
    case 'stringLights': drawStringLights(ctx, p, time); break;
    case 'billboard': drawBillboard(ctx, p); break;
    default: break;
  }
}

function drawPalm(ctx, p, time) {
  const hx = EXTRUDE.x * p.h * 0.45 + (p.side === 'left' ? 24 : p.side === 'right' ? -24 : 0);
  const hy = p.side === 'top' || !p.side ? 24 : p.side === 'bottom' ? -24 : 0;
  const tx = p.x + hx;
  const ty = p.y + hy;
  const bend = ((p.v % 3) - 1) * 4;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#6f5030';
  ctx.lineWidth = 4 * p.s;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.quadraticCurveTo(p.x + hx * 0.5 + bend, p.y + hy * 0.5, tx, ty);
  ctx.stroke();
  ctx.strokeStyle = '#a98457';
  ctx.lineWidth = 1.5 * p.s;
  ctx.beginPath();
  ctx.moveTo(p.x - 0.8, p.y);
  ctx.quadraticCurveTo(p.x + hx * 0.5 + bend - 0.8, p.y + hy * 0.5, tx - 0.8, ty);
  ctx.stroke();
  ctx.lineCap = 'butt';
  const spr = palmCrown(p.v);
  const size = (spr.canvas.width / SPRITE_SCALE) * p.s * (p.median ? 0.3 : 0.55);
  ctx.save();
  ctx.translate(tx, ty);
  ctx.rotate(Math.sin(time * 1.2 + p.x * 0.013 + p.y * 0.007) * 0.05 + p.v * 1.1);
  ctx.drawImage(spr.canvas, -size / 2, -size / 2, size, size);
  ctx.restore();
}

function drawTree(ctx, p, time) {
  const hx = EXTRUDE.x * p.h * 0.85 + (p.side === 'left' ? 24 : p.side === 'right' ? -24 : 0);
  const hy = p.side === 'top' ? 22 : p.side === 'bottom' ? -22 : 0;
  ctx.strokeStyle = '#5b4026';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + hx * 0.6, p.y + hy * 0.6);
  ctx.stroke();
  const spr = treeCanopy(p.v);
  const size = (spr.canvas.width / SPRITE_SCALE) * p.s * 0.68;
  ctx.save();
  ctx.translate(p.x + hx, p.y + hy);
  ctx.rotate(Math.sin(time * 0.9 + p.x * 0.02) * 0.025);
  ctx.drawImage(spr.canvas, -size / 2, -size / 2, size, size);
  ctx.restore();
}

function drawPlanter(ctx, p) {
  roundRectPath(ctx, p.x - 7, p.y - 6, 14, 12, 2);
  ctx.fillStyle = '#c9774f';
  ctx.fill();
  ctx.fillStyle = '#e2926a';
  ctx.fillRect(p.x - 7, p.y - 6, 14, 2.4);
  ctx.fillStyle = '#3f9a4c';
  ctx.beginPath(); ctx.arc(p.x, p.y - 7, 7.5, 0, 6.3); ctx.fill();
  ctx.fillStyle = '#76cf67';
  ctx.beginPath(); ctx.arc(p.x - 2, p.y - 9, 4, 0, 6.3); ctx.fill();
  if (p.v % 2) { ctx.fillStyle = '#ff6f91'; ctx.fillRect(p.x + 2, p.y - 9, 2.2, 2.2); ctx.fillRect(p.x - 4, p.y - 6, 2.2, 2.2); }
}

const HEAD = { x: 0, y: 0 }; // reused to avoid per-frame allocation
function lampHead(p) {
  const a = ARM[p.side] || ARM.top;
  HEAD.x = p.x + EXTRUDE.x * p.h + a[0];
  HEAD.y = p.y + EXTRUDE.y * p.h + a[1];
  return HEAD;
}

function drawLamp(ctx, p) {
  const top = lampHead(p);
  const px = p.x + EXTRUDE.x * p.h;
  const py = p.y + EXTRUDE.y * p.h;
  ctx.strokeStyle = '#3d4350';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(px, py);
  ctx.lineTo(top.x, top.y);
  ctx.stroke();
  ctx.fillStyle = '#dfe6ea';
  ctx.beginPath(); ctx.ellipse(top.x, top.y, 3.4, 2.4, 0, 0, 6.3); ctx.fill();
  ctx.fillStyle = '#2f3440';
  ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, 6.3); ctx.fill();
}

function drawSignal(ctx, p, time) {
  const px = p.x + EXTRUDE.x * p.h;
  const py = p.y + EXTRUDE.y * p.h;
  ctx.strokeStyle = '#363b46';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(px, py); ctx.stroke();
  ctx.fillStyle = '#20242c';
  ctx.fillRect(px - 3, py - 11, 6, 12);
  const cyc = (time + (p.phase || 0) * 7) % 14;
  const state = cyc < 6 ? 2 : cyc < 7 ? 1 : 0;
  const cols = ['#ff3b30', '#ffb020', '#2ee86b'];
  for (let k = 0; k < 3; k++) {
    ctx.fillStyle = k === state ? cols[k] : '#3a3f48';
    ctx.beginPath(); ctx.arc(px, py - 8.2 + k * 3.8, 1.35, 0, 6.3); ctx.fill();
  }
  ctx.fillStyle = '#2f3440';
  ctx.beginPath(); ctx.arc(p.x, p.y, 2.4, 0, 6.3); ctx.fill();
}

function drawBench(ctx, p) {
  const w = p.vertical ? 8 : 22;
  const h = p.vertical ? 22 : 8;
  ctx.fillStyle = '#6b4a2e';
  ctx.fillRect(p.x - w / 2 + 1, p.y - h / 2 + 2, w, h);
  ctx.fillStyle = '#c29260';
  ctx.fillRect(p.x - w / 2, p.y - h / 2 - 1, w, h);
  ctx.strokeStyle = 'rgba(70,40,20,0.5)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  if (p.vertical) { ctx.moveTo(p.x - 1.5, p.y - h / 2); ctx.lineTo(p.x - 1.5, p.y + h / 2); ctx.moveTo(p.x + 1.5, p.y - h / 2); ctx.lineTo(p.x + 1.5, p.y + h / 2); } else { ctx.moveTo(p.x - w / 2, p.y - 1.5 - 1); ctx.lineTo(p.x + w / 2, p.y - 1.5 - 1); ctx.moveTo(p.x - w / 2, p.y + 1.5 - 1); ctx.lineTo(p.x + w / 2, p.y + 1.5 - 1); }
  ctx.stroke();
}

function drawBin(ctx, p) {
  ctx.fillStyle = '#2f4550';
  ctx.beginPath(); ctx.arc(p.x + 1, p.y - 1, 4, 0, 6.3); ctx.fill();
  ctx.fillStyle = '#4f7a86';
  ctx.beginPath(); ctx.arc(p.x + 1.5, p.y - 3, 4, 0, 6.3); ctx.fill();
  ctx.fillStyle = '#1e2c33';
  ctx.beginPath(); ctx.arc(p.x + 1.5, p.y - 3, 2.2, 0, 6.3); ctx.fill();
}

function drawHydrant(ctx, p) {
  ctx.fillStyle = '#d6372b';
  ctx.beginPath(); ctx.arc(p.x, p.y - 2, 2.8, 0, 6.3); ctx.fill();
  ctx.fillStyle = '#f2c230';
  ctx.fillRect(p.x - 3.6, p.y - 3, 7.2, 1.4);
}

function drawBollard(ctx, p) {
  ctx.fillStyle = '#58606c';
  ctx.beginPath(); ctx.arc(p.x, p.y - 2, 2.6, 0, 6.3); ctx.fill();
  ctx.fillStyle = '#ffd24a';
  ctx.fillRect(p.x - 2.4, p.y - 3.6, 4.8, 1.2);
}

function drawUmbrella(ctx, p) {
  const top = { x: p.x + EXTRUDE.x * p.h, y: p.y + EXTRUDE.y * p.h };
  ctx.strokeStyle = '#eee7d6';
  ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(top.x, top.y); ctx.stroke();
  const spr = umbrellaSprite(p.v);
  const size = spr.canvas.width / SPRITE_SCALE;
  ctx.save();
  ctx.translate(top.x, top.y);
  ctx.rotate(p.v * 0.7);
  ctx.drawImage(spr.canvas, -size / 2, -size / 2, size, size);
  ctx.restore();
}

function drawTowel(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate((p.v - 3) * 0.2);
  ctx.fillStyle = TOWEL_COLORS[p.v % 6];
  ctx.fillRect(-4, -7, 8, 14);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillRect(-4, -2, 8, 2);
  ctx.restore();
}

function drawFountain(ctx, p, time) {
  ctx.fillStyle = '#e8e0cb';
  ctx.beginPath(); ctx.arc(p.x, p.y, 28, 0, 6.3); ctx.fill();
  ctx.strokeStyle = 'rgba(80,70,50,0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#5fd3e6';
  ctx.beginPath(); ctx.arc(p.x, p.y, 23, 0, 6.3); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 1.2;
  for (let k = 0; k < 3; k++) {
    const rr = 7 + ((time * 7 + k * 5.5) % 16);
    ctx.globalAlpha = 1 - rr / 24;
    ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, 6.3); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#d6cdb5';
  ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, 6.3); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let k = -1; k <= 1; k++) { ctx.moveTo(p.x, p.y - 3); ctx.quadraticCurveTo(p.x + k * 6, p.y - 16, p.x + k * 11, p.y - 5); }
  ctx.stroke();
}

function drawLifeguard(ctx, p) {
  ctx.strokeStyle = '#8a6a48';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  for (const dx of [-10, 10]) { ctx.moveTo(p.x + dx, p.y + 8); ctx.lineTo(p.x + dx + EXTRUDE.x * 14, p.y + 8 + EXTRUDE.y * 14); }
  ctx.stroke();
  drawBoxFaces(ctx, p.x - 11, p.y - 8, 22, 16, 14, 30, '#fff2e0', '#e0705d');
  ctx.fillStyle = '#ff6f61';
  ctx.fillRect(p.x - 12 + EXTRUDE.x * 30, p.y - 9 + EXTRUDE.y * 30, 24, 18);
  ctx.fillStyle = '#fff2e0';
  ctx.fillRect(p.x - 12 + EXTRUDE.x * 30, p.y - 2 + EXTRUDE.y * 30, 24, 4);
}

function drawNet(ctx, p) {
  const half = (p.len || 60) / 2;
  const t = EXTRUDE.y * 22;
  ctx.strokeStyle = '#f5f0e6';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(p.x - half, p.y); ctx.lineTo(p.x - half + 3, p.y + t);
  ctx.moveTo(p.x + half, p.y); ctx.lineTo(p.x + half + 3, p.y + t);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (let k = 0; k <= 4; k++) { const yy = p.y + (t * k) / 4; ctx.moveTo(p.x - half + 3 * (k / 4 || 0), yy); ctx.lineTo(p.x + half + 3 * (k / 4 || 0), yy); }
  ctx.stroke();
}

function drawYacht(ctx, p, time) {
  const L = p.len;
  const B = p.beam;
  const bob = Math.sin(time * 1.6 + p.x * 0.05) * 0.8;
  ctx.save();
  ctx.translate(p.x + 4, p.y + 5 + bob);
  ctx.rotate(p.rot);
  ctx.fillStyle = 'rgba(4,40,70,0.3)';
  hullPath(ctx, L, B);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(p.x, p.y + bob);
  ctx.rotate(p.rot);
  hullPath(ctx, L, B);
  ctx.fillStyle = p.hull;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#d6b27c';
  hullPath(ctx, L - 8, B - 7);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(p.x + 2, p.y + bob - 5);
  ctx.rotate(p.rot);
  ctx.fillStyle = '#f9f7f1';
  roundRectPath(ctx, -L * 0.28, -B * 0.3, L * 0.5, B * 0.6, 4);
  ctx.fill();
  ctx.fillStyle = '#26445a';
  ctx.fillRect(L * 0.1, -B * 0.22, L * 0.08, B * 0.44);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillRect(-L * 0.28, -B * 0.3, L * 0.5, 1.4);
  ctx.restore();
}

function hullPath(ctx, L, B) {
  ctx.beginPath();
  ctx.moveTo(-L / 2, -B / 2);
  ctx.lineTo(L * 0.18, -B / 2);
  ctx.quadraticCurveTo(L * 0.44, -B * 0.3, L / 2, 0);
  ctx.quadraticCurveTo(L * 0.44, B * 0.3, L * 0.18, B / 2);
  ctx.lineTo(-L / 2, B / 2);
  ctx.closePath();
}

function drawCrane(ctx, p) {
  const hx = EXTRUDE.x * p.h;
  const hy = EXTRUDE.y * p.h;
  ctx.strokeStyle = '#e8b030';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (const [dx, dy] of [[-8, -8], [8, -8], [-8, 8], [8, 8]]) { ctx.moveTo(p.x + dx, p.y + dy); ctx.lineTo(p.x + dx * 0.6 + hx, p.y + dy * 0.6 + hy); }
  ctx.stroke();
  ctx.strokeStyle = '#a97a14';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let k = 1; k < 6; k++) { const f = k / 6; ctx.moveTo(p.x - 8 + hx * f, p.y + 8 + hy * f); ctx.lineTo(p.x + 8 + hx * f, p.y + 8 + hy * f); }
  ctx.stroke();
  ctx.strokeStyle = '#e8b030';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(p.x - 30 + hx, p.y + hy); ctx.lineTo(p.x + 30 + hx, p.y + hy);
  ctx.moveTo(p.x + hx, p.y + hy); ctx.lineTo(p.x + hx, p.y + hy + 90);
  ctx.stroke();
  ctx.fillStyle = '#d94f30';
  ctx.fillRect(p.x + hx - 6, p.y + hy - 4, 12, 8);
}

function drawBusStop(ctx, p) {
  const w = p.vertical ? 10 : 34;
  const h = p.vertical ? 34 : 10;
  ctx.fillStyle = '#7a8a8c';
  ctx.fillRect(p.x - w / 2, p.y - h / 2, w, h);
  ctx.fillStyle = 'rgba(40,150,150,0.85)';
  ctx.fillRect(p.x - w / 2 + EXTRUDE.x * 24, p.y - h / 2 + EXTRUDE.y * 24, w, h);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(p.x - w / 2 + EXTRUDE.x * 24, p.y - h / 2 + EXTRUDE.y * 24, w, 1.5);
}

function drawCafeTable(ctx, p) {
  const topX = p.x + EXTRUDE.x * 18;
  const topY = p.y + EXTRUDE.y * 18;
  ctx.fillStyle = 'rgba(25,34,41,0.2)';
  ctx.beginPath(); ctx.ellipse(p.x + 4, p.y + 5, 15, 8, 0, 0, 6.3); ctx.fill();
  ctx.strokeStyle = '#584736';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(topX, topY + 9); ctx.stroke();
  ctx.fillStyle = '#f6e8cd';
  ctx.beginPath(); ctx.ellipse(topX, topY, 12, 8, 0, 0, 6.3); ctx.fill();
  ctx.strokeStyle = '#9b6447';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(topX, topY, 12, 8, 0, 0, 6.3); ctx.stroke();
  ctx.fillStyle = p.accent || '#ef7d63';
  ctx.fillRect(topX - 2, topY - 5, 4, 10);
  ctx.fillStyle = '#fff0cf';
  ctx.fillRect(topX - 2, topY - 1, 4, 2);
}

function drawMarketStall(ctx, p) {
  const w = p.len || 42;
  const x = p.x - w / 2;
  const y = p.y - 13;
  ctx.fillStyle = 'rgba(20,30,40,0.24)';
  ctx.fillRect(x + 4, p.y + 3, w, 9);
  ctx.fillStyle = '#76543b';
  ctx.fillRect(x + 2, y + 9, w - 4, 15);
  ctx.fillStyle = '#b77c48';
  ctx.fillRect(x, y + 8, w, 3);
  for (let i = 0; i < w; i += 8) {
    ctx.fillStyle = ((i / 8) | 0) % 2 ? '#fff0cf' : (p.accent || '#ef7d63');
    ctx.beginPath();
    ctx.moveTo(x + i, y + 8);
    ctx.lineTo(x + i + 2, y);
    ctx.lineTo(Math.min(x + i + 8, x + w), y);
    ctx.lineTo(Math.min(x + i + 8, x + w), y + 8);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#f6d69d';
  ctx.fillRect(x + 5, y + 13, w - 10, 2);
  ctx.fillStyle = '#29434a';
  ctx.fillRect(x + 6, y + 18, w - 12, 2);
}

function drawScooter(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot || 0);
  ctx.fillStyle = 'rgba(16,25,32,0.3)';
  ctx.beginPath(); ctx.ellipse(2, 4, 14, 5, 0, 0, 6.3); ctx.fill();
  ctx.fillStyle = '#1b2931';
  ctx.beginPath(); ctx.arc(-9, 1, 3.2, 0, 6.3); ctx.arc(9, 1, 3.2, 0, 6.3); ctx.fill();
  ctx.strokeStyle = p.accent || '#ef7d63';
  ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-2, -3); ctx.lineTo(5, -2); ctx.lineTo(9, 0); ctx.stroke();
  ctx.fillStyle = '#fff0cf';
  ctx.fillRect(7, -4, 3, 2);
  ctx.restore();
}

function drawStringLights(ctx, p, time) {
  const length = p.len || 160;
  const sag = p.sag || 16;
  const count = Math.max(4, Math.floor(length / 24));
  ctx.strokeStyle = 'rgba(35,42,45,0.8)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.quadraticCurveTo(p.x + length / 2, p.y + sag, p.x + length, p.y);
  ctx.stroke();
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const x = p.x + length * t;
    const y = p.y + sag * 2 * t * (1 - t);
    ctx.strokeStyle = '#303d42';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 5); ctx.stroke();
    ctx.fillStyle = Math.sin(time * 2 + i * 0.8) > -0.75 ? (i % 2 ? '#ffd78c' : '#ff9878') : '#9a7958';
    ctx.beginPath(); ctx.arc(x, y + 7, 2, 0, 6.3); ctx.fill();
  }
}

function drawBillboard(ctx, p) {
  const w = p.len || 66;
  const h = p.boardHeight || 20;
  const x = p.x - w / 2 + EXTRUDE.x * p.h;
  const y = p.y - h - 4 + EXTRUDE.y * p.h;
  ctx.strokeStyle = '#39434b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p.x - w * 0.34, p.y); ctx.lineTo(p.x - w * 0.34, y + h);
  ctx.moveTo(p.x + w * 0.34, p.y); ctx.lineTo(p.x + w * 0.34, y + h);
  ctx.stroke();
  ctx.fillStyle = '#172831';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = p.accent || '#ef7d63';
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
  ctx.fillStyle = '#fff0cf';
  ctx.font = '900 ' + Math.max(7, Math.min(12, h * 0.48)) + 'px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(p.text || 'COSTA VELA', p.x + EXTRUDE.x * p.h, y + h / 2, w - 5);
  ctx.textBaseline = 'alphabetic';
}

// ---- night pass ----
export function drawPropNight(ctx, p, night, time, lights) {
  switch (p.type) {
    case 'lamp': {
      const a = lampHead(p);
      lights.add(a.x, a.y + 6, 62, LIGHT.WARM, 0.55 * night);
      lights.add(a.x, a.y, 14, LIGHT.WHITE, 0.55 * night);
      break;
    }
    case 'signal': {
      const cyc = (time + (p.phase || 0) * 7) % 14;
      const col = cyc < 6 ? LIGHT.GREEN : cyc < 7 ? LIGHT.AMBER : LIGHT.RED;
      lights.add(p.x + EXTRUDE.x * p.h, p.y + EXTRUDE.y * p.h - 4, 12, col, 0.75 * night);
      break;
    }
    case 'fountain': lights.add(p.x, p.y, 44, LIGHT.TEAL, 0.3 * night); break;
    case 'yacht': lights.add(p.x, p.y - 8, 20, LIGHT.WARM, 0.5 * night); break;
    case 'crane': lights.add(p.x + EXTRUDE.x * p.h, p.y + EXTRUDE.y * p.h, 24, LIGHT.RED, (0.5 + 0.5 * Math.sin(time * 3)) * night); break;
    case 'stringLights': {
      const length = p.len || 160;
      for (let i = 0; i <= Math.floor(length / 24); i++) {
        const t = i / Math.floor(length / 24);
        const y = p.y + (p.sag || 16) * 2 * t * (1 - t);
        lights.add(p.x + length * t, y + 7, 20, i % 2 ? LIGHT.WARM : LIGHT.PINK, 0.38 * night);
      }
      break;
    }
    case 'billboard': lights.add(p.x, p.y - 10, 66, p.accent === '#2f8f8f' ? LIGHT.CYAN : LIGHT.PINK, 0.65 * night); break;
    default: break;
  }
}

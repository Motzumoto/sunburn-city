// Rooftop clutter: AC units, water tanks, helipads, pools, solar panels, antennas and roof gardens.
import { EXTRUDE } from '../core/config.js';
import { drawSolidBox } from './boxes.js';
import { roundRectPath } from './palette.js';

// (bx, by, bw, bh) is the projected roof rectangle of the box the details sit on.
export function drawRoofDetails(ctx, details, bx, by, bw, bh) {
  for (let i = 0; i < details.length; i++) {
    const d = details[i];
    switch (d.t) {
      case 'ac': drawAc(ctx, d, bx, by, bw, bh); break;
      case 'tank': drawTank(ctx, bx + d.u * bw, by + d.v * bh, d.r); break;
      case 'helipad': drawHelipad(ctx, bx + d.u * bw, by + d.v * bh, d.r); break;
      case 'pool': drawRoofPool(ctx, bx + d.u * bw, by + d.v * bh, d.w * bw, d.h * bh); break;
      case 'solar': drawSolar(ctx, bx + d.u * bw, by + d.v * bh, d.w * bw, d.h * bh); break;
      case 'garden': drawGarden(ctx, bx + d.u * bw, by + d.v * bh, d.w * bw, d.h * bh); break;
      case 'antenna': drawAntenna(ctx, bx + d.u * bw, by + d.v * bh, d.hh); break;
      default: break;
    }
  }
}

function drawAc(ctx, d, bx, by, bw, bh) {
  const w = Math.max(9, d.w * bw);
  const h = Math.max(7, d.h * bh);
  const x = bx + d.u * (bw - w);
  const y = by + d.v * (bh - h);
  drawSolidBox(ctx, x, y, w, h, d.hh, '#dfe3e6', '#9ba4ae', '#eef1f3');
  const tx = x + EXTRUDE.x * d.hh + w / 2;
  const ty = y + EXTRUDE.y * d.hh + h / 2;
  ctx.fillStyle = '#566170';
  ctx.beginPath();
  ctx.arc(tx, ty, Math.min(w, h) * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#aeb7c0';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(tx - 3, ty); ctx.lineTo(tx + 3, ty); ctx.moveTo(tx, ty - 3); ctx.lineTo(tx, ty + 3);
  ctx.stroke();
}

function drawTank(ctx, cx, cy, r) {
  const hh = 15;
  ctx.fillStyle = 'rgba(40,28,20,0.3)';
  ctx.beginPath(); ctx.ellipse(cx + 5, cy + 5, r, r * 0.8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#4a3a2c';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.6, cy); ctx.lineTo(cx - r * 0.6 + EXTRUDE.x * 6, cy + EXTRUDE.y * 6);
  ctx.moveTo(cx + r * 0.6, cy); ctx.lineTo(cx + r * 0.6 + EXTRUDE.x * 6, cy + EXTRUDE.y * 6);
  ctx.stroke();
  const tx = cx + EXTRUDE.x * hh;
  const ty = cy + EXTRUDE.y * hh;
  ctx.fillStyle = '#7d5a3a';
  for (let k = 0; k <= 4; k++) {
    ctx.beginPath();
    ctx.arc(cx + (tx - cx) * (k / 4), cy + (ty - cy) * (k / 4), r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#c99259';
  ctx.beginPath(); ctx.arc(tx, ty, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#8e6340';
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(tx, ty, r * 0.62, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#6b4a2e';
  ctx.beginPath(); ctx.arc(tx, ty, r * 0.14, 0, Math.PI * 2); ctx.fill();
}

function drawHelipad(ctx, cx, cy, r) {
  ctx.fillStyle = '#2f3644';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#f4f1e6';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.86, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = Math.max(2, r * 0.12);
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.28, cy - r * 0.38); ctx.lineTo(cx - r * 0.28, cy + r * 0.38);
  ctx.moveTo(cx + r * 0.28, cy - r * 0.38); ctx.lineTo(cx + r * 0.28, cy + r * 0.38);
  ctx.moveTo(cx - r * 0.28, cy); ctx.lineTo(cx + r * 0.28, cy);
  ctx.stroke();
}

function drawRoofPool(ctx, x, y, w, h) {
  roundRectPath(ctx, x - 2, y - 2, w + 4, h + 4, 4);
  ctx.fillStyle = '#f1eee4';
  ctx.fill();
  roundRectPath(ctx, x, y, w, h, 3);
  ctx.fillStyle = '#34c7e8';
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.32)';
  ctx.fillRect(x + 2, y + 2, w * 0.5, 2);
  ctx.fillStyle = '#ff9a8a';
  for (let k = 0; k < 3; k++) ctx.fillRect(x + w + 6, y + 3 + k * 7, 8, 4);
}

function drawSolar(ctx, x, y, w, h) {
  ctx.fillStyle = '#27407a';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(160,190,240,0.55)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (let k = 1; k < 4; k++) { ctx.moveTo(x + (w * k) / 4, y); ctx.lineTo(x + (w * k) / 4, y + h); }
  ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2);
  ctx.stroke();
}

function drawGarden(ctx, x, y, w, h) {
  ctx.fillStyle = '#86c46c';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#4f9d55';
  for (let k = 0; k < 5; k++) {
    ctx.beginPath();
    ctx.arc(x + 6 + (k * (w - 12)) / 4, y + h / 2 + (k % 2 ? 4 : -4), 4.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawAntenna(ctx, x, y, hh) {
  const tx = x + EXTRUDE.x * hh;
  const ty = y + EXTRUDE.y * hh;
  ctx.strokeStyle = '#3b414c';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(tx, ty);
  ctx.moveTo(x + (tx - x) * 0.7 - 4, y + (ty - y) * 0.7); ctx.lineTo(x + (tx - x) * 0.7 + 4, y + (ty - y) * 0.7);
  ctx.stroke();
  ctx.fillStyle = '#d7433a';
  ctx.beginPath(); ctx.arc(tx, ty, 1.8, 0, Math.PI * 2); ctx.fill();
}

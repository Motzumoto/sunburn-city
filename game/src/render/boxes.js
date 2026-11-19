// SUNBURN CITY - Draws extruded box faces for buildings and props.
// Fake-3D box primitive: draws sunlit and shaded faces beneath an extruded roof.
import { EXTRUDE } from '../core/config.js';

// Draws the two visible side faces of a box from height z0 to z1. (x, y, w, h) is the ground footprint.
export function drawBoxFaces(ctx, x, y, w, h, z0, z1, lit, dark) {
  const ax = x + EXTRUDE.x * z0;
  const ay = y + EXTRUDE.y * z0;
  const bx = x + EXTRUDE.x * z1;
  const by = y + EXTRUDE.y * z1;
  ctx.fillStyle = lit;
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(ax, ay + h);
  ctx.lineTo(bx, by + h);
  ctx.lineTo(bx, by);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.moveTo(ax, ay + h);
  ctx.lineTo(ax + w, ay + h);
  ctx.lineTo(bx + w, by + h);
  ctx.lineTo(bx, by + h);
  ctx.closePath();
  ctx.fill();
  // Sunlit vertical corner edge.
  ctx.strokeStyle = 'rgba(255,250,235,0.38)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(ax, ay + h);
  ctx.lineTo(bx, by + h);
  ctx.stroke();
}

// Small complete box (faces plus a flat top), used for rooftop machinery, kiosks and containers.
export function drawSolidBox(ctx, x, y, w, h, hh, lit, dark, top) {
  drawBoxFaces(ctx, x, y, w, h, 0, hh, lit, dark);
  ctx.fillStyle = top;
  ctx.fillRect(x + EXTRUDE.x * hh, y + EXTRUDE.y * hh, w, h);
}

export function projectX(x, z) {
  return x + EXTRUDE.x * z;
}

export function projectY(y, z) {
  return y + EXTRUDE.y * z;
}

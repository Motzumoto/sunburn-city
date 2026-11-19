// SUNBURN CITY — Paints world ground, shorelines, blocks and decals.
// Paints chunk ground: sea and shallows, beach strips, city blocks with sidewalks, parks, plazas and decals.
import { SIDEWALK_W } from '../core/config.js';
import { hash2, overlaps } from '../core/math.js';
import { shoreY, shorePoints, SHORE_BASE } from '../world/shoreline.js';
import { roundRectPath } from './palette.js';
import { BOARDWALK_TOP, BOARDWALK_BOTTOM } from '../world/shoreStrips.js';

const OUTSKIRT = '#a8c47e';
const shoreScratch = [];

export function paintBase(ctx, r) {
  ctx.fillStyle = OUTSKIRT;
  ctx.fillRect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0);
  if (r.y1 < SHORE_BASE - 90) return;
  paintSea(ctx, r);
}

function paintSea(ctx, r) {
  const pts = shorePoints(r.x0 - 24, r.x1 + 24, 16, shoreScratch);
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.lineTo(pts[pts.length - 2], r.y1 + 8);
  ctx.lineTo(pts[0], r.y1 + 8);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, SHORE_BASE - 60, 0, SHORE_BASE + 760);
  g.addColorStop(0, '#62e3d1');
  g.addColorStop(0.07, '#3fcbc9');
  g.addColorStop(0.22, '#1a9fb6');
  g.addColorStop(0.5, '#0d6c95');
  g.addColorStop(1, '#073d68');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.lineJoin = 'round';
  shorePath(ctx, pts, 0);
  const bands = [[74, 'rgba(170,255,236,0.10)'], [50, 'rgba(170,255,236,0.12)'], [30, 'rgba(200,255,240,0.14)'], [14, 'rgba(236,255,246,0.2)']];
  for (const b of bands) { ctx.lineWidth = b[0]; ctx.strokeStyle = b[1]; ctx.stroke(); }
  // Deep-water swell streaks, deterministic per chunk.
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let k = 0; k < 18; k++) {
    const sx = r.x0 + hash2(k, Math.floor(r.x0), 3) * (r.x1 - r.x0);
    const sy = SHORE_BASE + 160 + hash2(k, Math.floor(r.y0), 9) * 600;
    if (sy < r.y0 || sy > r.y1) continue;
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(sx + 30, sy - 5, sx + 64, sy);
  }
  ctx.stroke();
  ctx.restore();
  shorePath(ctx, pts, 5);
  ctx.lineWidth = 3.2;
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.stroke();
  shorePath(ctx, pts, 14);
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.stroke();
}

function shorePath(ctx, pts, dy) {
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1] + dy);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1] + dy);
}

function shoreFill(ctx, x0, x1, yTop) {
  ctx.beginPath();
  ctx.moveTo(x0, yTop);
  ctx.lineTo(x1, yTop);
  for (let x = x1; x >= x0; x -= 16) ctx.lineTo(x, shoreY(x));
  ctx.lineTo(x0, shoreY(x0));
  ctx.closePath();
}

// Beach, boardwalk, marina promenade and quay strips along the south coast.
export function paintStrips(ctx, city, r) {
  if (r.y1 < 4150 || !city.strips.length) return;
  const first = city.strips[0];
  const last = city.strips[city.strips.length - 1];
  const yTop = first.y0;
  // Sand underlay across the whole width, including the gaps under the avenue ends.
  shoreFill(ctx, Math.max(r.x0 - 20, 0), r.x1 + 20, yTop);
  const g = ctx.createLinearGradient(0, yTop + 40, 0, SHORE_BASE + 40);
  g.addColorStop(0, '#f1e3bc');
  g.addColorStop(0.6, '#e6d3a4');
  g.addColorStop(1, '#cdb88a');
  ctx.fillStyle = g;
  ctx.fill();
  for (const s of city.strips) {
    if (!overlaps(r, s.x0, s.y0, s.x1, 4600)) continue;
    paintStrip(ctx, s, r);
  }
  // Wet sand darkening right at the waterline.
  const pts = shorePoints(Math.max(r.x0, first.x0 - 40), Math.min(r.x1, last.x1 + 40), 16, shoreScratch);
  shorePath(ctx, pts, -4);
  ctx.lineWidth = 14;
  ctx.strokeStyle = 'rgba(150,120,70,0.26)';
  ctx.stroke();
}

function paintStrip(ctx, s, r) {
  const kind = s.kind;
  const topY = s.y0;
  if (kind === 'quay' || kind === 'marina') {
    shoreFill(ctx, s.x0, s.x1, topY);
    ctx.fillStyle = kind === 'quay' ? '#b4aea1' : '#dcd2bb';
    ctx.fill();
    ctx.strokeStyle = 'rgba(70,60,50,0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = s.x0 + 30; x < s.x1; x += 36) { ctx.moveTo(x, topY + 40); ctx.lineTo(x, shoreY(x)); }
    for (let y = topY + 60; y < 4450; y += 36) { ctx.moveTo(s.x0, y); ctx.lineTo(s.x1, y); }
    ctx.save();
    shoreFill(ctx, s.x0, s.x1, topY);
    ctx.clip();
    ctx.stroke();
    ctx.restore();
  }
  // Sidewalk along the avenue and planked boardwalk.
  ctx.fillStyle = '#efe6d0';
  ctx.fillRect(s.x0, topY, s.x1 - s.x0, BOARDWALK_TOP);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(s.x0, topY, s.x1 - s.x0, 1.4);
  if (kind !== 'quay') {
    const by = topY + BOARDWALK_TOP;
    ctx.fillStyle = '#c99a62';
    ctx.fillRect(s.x0, by, s.x1 - s.x0, BOARDWALK_BOTTOM - BOARDWALK_TOP);
    ctx.strokeStyle = 'rgba(92,58,28,0.35)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    for (let y = by + 5; y < by + 30; y += 5) { ctx.moveTo(s.x0, y); ctx.lineTo(s.x1, y); }
    for (let x = s.x0 + 14; x < s.x1; x += 22 + (x % 9)) { ctx.moveTo(x, by + 5 * Math.floor((x * 7) % 5)); ctx.lineTo(x, by + 5 * Math.floor((x * 7) % 5) + 5); }
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,230,180,0.18)';
    ctx.fillRect(s.x0, by, s.x1 - s.x0, 2);
    ctx.fillStyle = 'rgba(70,40,20,0.3)';
    ctx.fillRect(s.x0, by + 28, s.x1 - s.x0, 2);
  }
  if (kind === 'beach') paintSandSpecks(ctx, s, r);
}

function paintSandSpecks(ctx, s, r) {
  const x0 = Math.max(s.x0, r.x0);
  const x1 = Math.min(s.x1, r.x1);
  for (let k = 0; k < 160; k++) {
    const x = x0 + hash2(k, Math.floor(x0), 11) * (x1 - x0);
    const y = s.y0 + 60 + hash2(k, Math.floor(x0), 12) * 180;
    if (y > shoreY(x) - 8 || y < r.y0 || y > r.y1) continue;
    ctx.fillStyle = k % 2 ? 'rgba(255,248,226,0.5)' : 'rgba(160,130,80,0.22)';
    ctx.fillRect(x, y, 1.6, 1.2);
  }
}

export function paintBlocks(ctx, city, r) {
  for (const b of city.blocks) {
    if (!overlaps(r, b.x0, b.y0, b.x1, b.y1)) continue;
    paintBlock(ctx, b);
  }
}

function paintBlock(ctx, b) {
  const d = b.district;
  const w = b.x1 - b.x0;
  const h = b.y1 - b.y0;
  roundRectPath(ctx, b.x0, b.y0, w, h, 11);
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(10,14,28,0.35)';
  ctx.stroke();
  ctx.fillStyle = d.sidewalk;
  ctx.fill();
  paintSidewalkJoints(ctx, b);
  roundRectPath(ctx, b.x0, b.y0, w, h, 11);
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = 'rgba(255,255,250,0.55)';
  ctx.stroke();
  const x0 = b.x0 + SIDEWALK_W;
  const y0 = b.y0 + SIDEWALK_W;
  const iw = w - SIDEWALK_W * 2;
  const ih = h - SIDEWALK_W * 2;
  ctx.strokeStyle = 'rgba(94,77,52,0.34)';
  ctx.lineWidth = 2.2;
  ctx.strokeRect(x0 + 1, y0 + 1, iw - 2, ih - 2);
  ctx.strokeStyle = 'rgba(255,240,207,0.65)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x0 + 2, y0 + 2);
  ctx.lineTo(x0 + iw - 2, y0 + 2);
  ctx.moveTo(x0 + 2, y0 + 2);
  ctx.lineTo(x0 + 2, y0 + ih - 2);
  ctx.stroke();
  switch (b.kind) {
    case 'park': paintPark(ctx, b, x0, y0, iw, ih); break;
    case 'plaza': case 'landmark': paintPlaza(ctx, b, x0, y0, iw, ih); break;
    case 'parking': ctx.fillStyle = '#464d59'; ctx.fillRect(x0, y0, iw, ih); break;
    case 'containers': ctx.fillStyle = '#b4aea0'; ctx.fillRect(x0, y0, iw, ih); break;
    default: ctx.fillStyle = d.lotGround; ctx.fillRect(x0, y0, iw, ih);
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.16)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x0, y0, iw, ih);
  if (b.alley) paintAlley(ctx, b.alley);
  for (const dec of b.decals) paintDecal(ctx, b, dec);
}

function paintSidewalkJoints(ctx, b) {
  ctx.strokeStyle = 'rgba(80,66,44,0.13)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (let x = b.x0 + 14; x < b.x1 - 10; x += 14) {
    ctx.moveTo(x, b.y0); ctx.lineTo(x, b.y0 + SIDEWALK_W);
    ctx.moveTo(x, b.y1 - SIDEWALK_W); ctx.lineTo(x, b.y1);
  }
  for (let y = b.y0 + 14; y < b.y1 - 10; y += 14) {
    ctx.moveTo(b.x0, y); ctx.lineTo(b.x0 + SIDEWALK_W, y);
    ctx.moveTo(b.x1 - SIDEWALK_W, y); ctx.lineTo(b.x1, y);
  }
  ctx.stroke();
}

function paintPark(ctx, b, x, y, w, h) {
  ctx.fillStyle = '#88c96b';
  ctx.fillRect(x, y, w, h);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  for (let k = 0; k < 14; k++) {
    const px = x + hash2(k, b.id, 21) * w;
    const py = y + hash2(k, b.id, 22) * h;
    const pr = 24 + hash2(k, b.id, 23) * 56;
    ctx.fillStyle = k % 2 ? 'rgba(190,235,140,0.28)' : 'rgba(60,130,90,0.2)';
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.045)';
  for (let sx = x; sx < x + w; sx += 28) ctx.fillRect(sx, y, 14, h);
  ctx.restore();
}

function paintPlaza(ctx, b, x, y, w, h) {
  ctx.fillStyle = '#eadfc4';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(120,100,70,0.16)';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  for (let tx = x + 26; tx < x + w; tx += 26) { ctx.moveTo(tx, y); ctx.lineTo(tx, y + h); }
  for (let ty = y + 26; ty < y + h; ty += 26) { ctx.moveTo(x, ty); ctx.lineTo(x + w, ty); }
  ctx.stroke();
  const cx = x + w / 2;
  const cy = y + h / 2;
  ctx.setLineDash([9, 9]);
  ctx.strokeStyle = 'rgba(50,170,160,0.55)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(cx, cy, w * 0.34, h * 0.34, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(255,120,100,0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy, w * 0.4, h * 0.4, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function paintAlley(ctx, a) {
  ctx.fillStyle = '#464d59';
  ctx.fillRect(a.x0, a.y0, a.x1 - a.x0, a.y1 - a.y0);
  ctx.strokeStyle = 'rgba(240,220,120,0.35)';
  ctx.setLineDash([10, 12]);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  if (a.axis === 'v') { ctx.moveTo((a.x0 + a.x1) / 2, a.y0); ctx.lineTo((a.x0 + a.x1) / 2, a.y1); } else { ctx.moveTo(a.x0, (a.y0 + a.y1) / 2); ctx.lineTo(a.x1, (a.y0 + a.y1) / 2); }
  ctx.stroke();
  ctx.setLineDash([]);
}

function paintDecal(ctx, b, d) {
  switch (d.t) {
    case 'lawn':
      roundRectPath(ctx, d.x0, d.y0, d.x1 - d.x0, d.y1 - d.y0, 6);
      ctx.fillStyle = '#9fd47a';
      ctx.fill();
      ctx.strokeStyle = 'rgba(70,120,60,0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
      break;
    case 'pool': paintPool(ctx, d); break;
    case 'apron':
      ctx.fillStyle = '#b4aea0';
      ctx.fillRect(d.x0, d.y0, d.x1 - d.x0, d.y1 - d.y0);
      break;
    case 'steps': {
      for (let y = d.y0, k = 0; y < d.y1; y += 4, k++) {
        ctx.fillStyle = k % 2 ? '#d9cfb8' : '#f6eedc';
        ctx.fillRect(d.x0, y, d.x1 - d.x0, 4);
      }
      break;
    }
    case 'paths': paintPaths(ctx, d); break;
    case 'pond':
      ctx.fillStyle = '#2f93ad';
      ctx.beginPath(); ctx.ellipse(d.cx, d.cy, d.rx + 3, d.ry + 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#58cbe0';
      ctx.beginPath(); ctx.ellipse(d.cx, d.cy, d.rx, d.ry, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath(); ctx.ellipse(d.cx - d.rx * 0.3, d.cy - d.ry * 0.3, d.rx * 0.4, d.ry * 0.2, -0.4, 0, Math.PI * 2); ctx.fill();
      break;
    case 'stalls': paintStalls(ctx, d); break;
    default: break;
  }
}

function paintPool(ctx, d) {
  const w = d.x1 - d.x0;
  const h = d.y1 - d.y0;
  roundRectPath(ctx, d.x0 - 3, d.y0 - 3, w + 6, h + 6, 7);
  ctx.fillStyle = '#f3f0e6';
  ctx.fill();
  roundRectPath(ctx, d.x0, d.y0, w, h, 5);
  const g = ctx.createLinearGradient(d.x0, d.y0, d.x1, d.y1);
  g.addColorStop(0, '#6fe3f0');
  g.addColorStop(1, '#1fb5d6');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let k = 1; k < 4; k++) { ctx.moveTo(d.x0 + 4, d.y0 + (h * k) / 4); ctx.quadraticCurveTo(d.x0 + w / 2, d.y0 + (h * k) / 4 - 3, d.x1 - 4, d.y0 + (h * k) / 4); }
  ctx.stroke();
}

function paintPaths(ctx, d) {
  const cx = (d.x0 + d.x1) / 2;
  const cy = (d.y0 + d.y1) / 2;
  ctx.lineCap = 'round';
  for (const [lw, col] of [[10, '#d8cba8'], [7, '#efe3c6']]) {
    ctx.lineWidth = lw;
    ctx.strokeStyle = col;
    ctx.beginPath();
    ctx.moveTo(d.x0, cy); ctx.lineTo(d.x1, cy);
    ctx.moveTo(cx, d.y0); ctx.lineTo(cx, d.y1);
    ctx.moveTo(d.x0 + 8, d.y0 + 8); ctx.quadraticCurveTo(cx + 30, cy - 30, d.x1 - 8, d.y1 - 8);
    ctx.stroke();
  }
  ctx.lineCap = 'butt';
}

// Matches the stall rows laid out by blocks.js layoutParking.
function paintStalls(ctx, d) {
  const x0 = d.x0 - 6;
  const y0 = d.y0 - 6;
  const x1 = d.x1 + 6;
  const y1 = d.y1 + 6;
  ctx.strokeStyle = 'rgba(245,245,235,0.75)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  for (let y = y0 + 12; y + 46 < y1 - 12; y += 118) {
    for (let x = x0 + 14; x + 24 < x1 - 12; x += 24) {
      ctx.moveTo(x, y); ctx.lineTo(x, Math.min(y + 92, y1 - 8));
    }
    ctx.moveTo(x0 + 14, y); ctx.lineTo(x1 - 12, y);
    ctx.moveTo(x0 + 14, y + 92); ctx.lineTo(x1 - 12, y + 92);
  }
  ctx.stroke();
}

export function paintPiers(ctx, city, r) {
  for (const p of city.piers) {
    if (!overlaps(r, p.x0 - 12, p.y0 - 12, p.x1 + 12, p.y1 + 12)) continue;
    ctx.fillStyle = 'rgba(5,40,70,0.28)';
    ctx.fillRect(p.x0 + 5, p.y0 + 7, p.x1 - p.x0, p.y1 - p.y0);
    ctx.fillStyle = '#b98a56';
    ctx.fillRect(p.x0, p.y0, p.x1 - p.x0, p.y1 - p.y0);
    ctx.strokeStyle = 'rgba(90,56,28,0.45)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    for (let y = p.y0 + 4; y < p.y1; y += 4) { ctx.moveTo(p.x0, y); ctx.lineTo(p.x1, y); }
    ctx.stroke();
    ctx.strokeStyle = '#7a5530';
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x0, p.y0, p.x1 - p.x0, p.y1 - p.y0);
    ctx.fillStyle = '#5a3e22';
    for (let y = p.y0 + 6; y < p.y1; y += 22) {
      ctx.fillRect(p.x0 - 1, y, 3, 3);
      ctx.fillRect(p.x1 - 2, y, 3, 3);
    }
  }
}

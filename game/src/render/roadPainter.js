// Paints asphalt with grain, medians, lane markings, stop lines, crosswalks, manholes and patches.
import { LANE_W } from '../core/config.js';
import { hash2, overlaps } from '../core/math.js';

const ASPHALT = { avenue: '#363e4c', street: '#414958' };
const WHITE = 'rgba(246,246,240,0.92)';
let grainPattern = null;

function getGrain() {
  if (grainPattern) return grainPattern;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const g = c.getContext('2d');
  for (let i = 0; i < 900; i++) {
    const x = hash2(i, 1, 5) * 128;
    const y = hash2(i, 2, 5) * 128;
    const v = hash2(i, 3, 5);
    g.fillStyle = v < 0.5 ? 'rgba(255,255,255,' + (0.03 + v * 0.1) + ')' : 'rgba(0,0,10,' + (0.05 + v * 0.1) + ')';
    g.fillRect(x, y, 1.4, 1.4);
  }
  for (let i = 0; i < 18; i++) {
    g.fillStyle = 'rgba(0,0,10,0.05)';
    g.beginPath();
    g.ellipse(hash2(i, 4, 5) * 128, hash2(i, 5, 5) * 128, 10 + hash2(i, 6, 5) * 14, 4 + hash2(i, 7, 5) * 6, hash2(i, 8, 5) * 3, 0, 6.3);
    g.fill();
  }
  grainPattern = g.createPattern(c, 'repeat');
  return grainPattern;
}

function fillAsphalt(ctx, x, y, w, h, kind) {
  ctx.fillStyle = ASPHALT[kind];
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = getGrain();
  ctx.fillRect(x, y, w, h);
}

export function paintAsphalt(ctx, city, r) {
  for (const s of city.segments) {
    if (!overlaps(r, s.x0, s.y0, s.x1, s.y1)) continue;
    fillAsphalt(ctx, s.x0, s.y0, s.x1 - s.x0, s.y1 - s.y0, s.kind);
  }
  for (const it of city.intersections) {
    if (!overlaps(r, it.x - it.w / 2, it.y - it.h / 2, it.x + it.w / 2, it.y + it.h / 2)) continue;
    const kind = it.w > 120 || it.h > 120 ? 'avenue' : 'street';
    fillAsphalt(ctx, it.x - it.w / 2 - 0.5, it.y - it.h / 2 - 0.5, it.w + 1, it.h + 1, kind);
  }
}

export function paintMarkings(ctx, city, r) {
  for (const s of city.segments) {
    if (!overlaps(r, s.x0, s.y0, s.x1, s.y1)) continue;
    paintSegment(ctx, s);
  }
}

function paintSegment(ctx, s) {
  const h = s.axis === 'h';
  const len = h ? s.x1 - s.x0 : s.y1 - s.y0;
  const c = s.center;
  // along: position along the segment (0..len); across: offset from the centre line.
  const line = (across, from, to) => {
    if (h) { ctx.moveTo(s.x0 + from, c + across); ctx.lineTo(s.x0 + to, c + across); } else { ctx.moveTo(c + across, s.y0 + from); ctx.lineTo(c + across, s.y0 + to); }
  };
  const box = (across0, across1, along0, along1) => {
    if (h) ctx.fillRect(s.x0 + along0, c + across0, along1 - along0, across1 - across0);
    else ctx.fillRect(c + across0, s.y0 + along0, across1 - across0, along1 - along0);
  };

  if (s.median > 0) {
    const m = s.median / 2;
    ctx.fillStyle = '#e2d8c0';
    box(-m, m, 0, len);
    ctx.fillStyle = '#7dbb66';
    box(-m + 3, m - 3, 4, len - 4);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    box(-m - 1.2, -m, 0, len);
    box(m, m + 1.2, 0, len);
    ctx.setLineDash([16, 18]);
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    line(-(m + LANE_W), 26, len - 26);
    line(m + LANE_W, 26, len - 26);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    line(-(s.width / 2 - 3), 0, len);
    line(s.width / 2 - 3, 0, len);
    ctx.stroke();
  } else {
    ctx.strokeStyle = '#f0bd2c';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    line(-1.8, 24, len - 24);
    line(1.8, 24, len - 24);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(246,246,240,0.55)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    line(-LANE_W, 0, len);
    line(LANE_W, 0, len);
    ctx.stroke();
  }

  // Crosswalks (zebra bars) and stop lines at both ends.
  ctx.fillStyle = WHITE;
  const edge = s.width / 2 - 5;
  const lanesW = s.lanes * LANE_W;
  const m0 = s.median / 2;
  for (let a = -edge; a <= edge - 4; a += 8) {
    if (a + 4.5 > -m0 - 1 && a < m0 + 1) continue; // keep the planted median clear
    box(a, a + 4.5, 3, 17);
    box(a, a + 4.5, len - 17, len - 3);
  }
  if (h) {
    box(-(m0 + lanesW), -m0, 21, 24);
    box(m0, m0 + lanesW, len - 24, len - 21);
  } else {
    // Northbound arrivals use the +x side, southbound the -x side.
    box(m0, m0 + lanesW, 21, 24);
    box(-(m0 + lanesW), -m0, len - 24, len - 21);
  }

  // Manholes and patches, deterministic per segment.
  for (let k = 0; k < 3; k++) {
    const along = 60 + hash2(s.id, k, 31) * (len - 120);
    const lane = (hash2(s.id, k, 32) - 0.5) * (s.width - 30);
    const px = h ? s.x0 + along : c + lane;
    const py = h ? c + lane : s.y0 + along;
    if (len < 140) break;
    if (k === 2) {
      ctx.fillStyle = 'rgba(8,10,18,0.14)';
      ctx.fillRect(px - 9, py - 6, 18, 12);
      continue;
    }
    ctx.fillStyle = '#2b3039';
    ctx.beginPath(); ctx.arc(px, py, 4.6, 0, 6.3); ctx.fill();
    ctx.strokeStyle = 'rgba(120,128,142,0.7)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px - 3, py); ctx.lineTo(px + 3, py); ctx.moveTo(px, py - 3); ctx.lineTo(px, py + 3);
    ctx.strokeStyle = 'rgba(120,128,142,0.45)';
    ctx.stroke();
  }
}

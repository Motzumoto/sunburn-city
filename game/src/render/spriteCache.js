// SUNBURN CITY — Caches reusable palm, foliage and umbrella sprites.
// Pre-rendered palm, foliage and umbrella sprites reused across every frame.
import { mulberry32 } from '../core/rng.js';

export const SPRITE_SCALE = 2.5; // sprite pixels per world unit
const palms = [];
const trees = [];
const umbrellas = [];

function makeSprite(units) {
  const c = document.createElement('canvas');
  const px = Math.ceil(units * SPRITE_SCALE);
  c.width = px;
  c.height = px;
  const g = c.getContext('2d');
  g.setTransform(SPRITE_SCALE, 0, 0, SPRITE_SCALE, px / 2, px / 2);
  return { canvas: c, g, units };
}

export function palmCrown(v) {
  const i = v % 6;
  if (palms[i]) return palms[i];
  const s = makeSprite(112);
  const g = s.g;
  const rnd = mulberry32(4000 + i * 91);
  const n = 10 + (i % 3);
  const tone = [['#1c6b34', '#3aa14c', '#86d36e'], ['#1f7a3a', '#47b255', '#93dc78'], ['#2a6b30', '#58a63f', '#a6d870']][i % 3];
  const base = rnd() * 6.28;
  for (let f = 0; f < n; f++) {
    const ang = base + (f / n) * 6.283 + (rnd() - 0.5) * 0.3;
    const len = 36 + rnd() * 12;
    const side = rnd() < 0.5 ? -1 : 1;
    const droop = 6 + rnd() * 8;
    const ca = Math.cos(ang);
    const sa = Math.sin(ang);
    const tipx = ca * len;
    const tipy = sa * len;
    const cx = ca * len * 0.5 - sa * droop * side;
    const cy = sa * len * 0.5 + ca * droop * side;
    for (let pass = 0; pass < 3; pass++) {
      g.strokeStyle = tone[pass];
      g.lineWidth = pass === 0 ? 2.6 : pass === 1 ? 1.7 : 0.9;
      const off = pass === 2 ? -1.1 : pass === 1 ? -0.5 : 0;
      g.beginPath();
      for (let t = 0.14; t < 0.97; t += 0.065) {
        const u = 1 - t;
        const px = u * u * 0 + 2 * u * t * cx + t * t * tipx;
        const py = u * u * 0 + 2 * u * t * cy + t * t * tipy;
        const tx = 2 * u * cx + 2 * t * (tipx - cx);
        const ty = 2 * u * cy + 2 * t * (tipy - cy);
        const tl = Math.hypot(tx, ty) || 1;
        const nx = -ty / tl;
        const ny = tx / tl;
        const L = (1 - t * 0.72) * 13;
        g.moveTo(px + off, py + off);
        g.lineTo(px + off + nx * L + (tx / tl) * L * 0.55, py + off + ny * L + (ty / tl) * L * 0.55);
        g.moveTo(px + off, py + off);
        g.lineTo(px + off - nx * L + (tx / tl) * L * 0.55, py + off - ny * L + (ty / tl) * L * 0.55);
      }
      g.stroke();
    }
    g.strokeStyle = '#2c5a2a';
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(0, 0);
    g.quadraticCurveTo(cx, cy, tipx, tipy);
    g.stroke();
  }
  g.fillStyle = '#6d4d28';
  for (let k = 0; k < 3; k++) {
    g.beginPath();
    g.arc(Math.cos(k * 2.1) * 2.6, Math.sin(k * 2.1) * 2.6, 2.6, 0, 6.3);
    g.fill();
  }
  palms[i] = s;
  return s;
}

const TREE_TONES = [
  ['#2a7a3c', '#3e9a4a', '#7fcf6a'], ['#3a8a3a', '#4fa84a', '#92d870'], ['#4d7a2c', '#6b9a3a', '#b0d36a'],
  ['#7a4fb0', '#9a6bd0', '#d2a8f0'], ['#b8452a', '#e8572f', '#ffb06a'], ['#1e6a48', '#2a7a52', '#6cc08a'],
];

export function treeCanopy(v) {
  const i = v % 6;
  if (trees[i]) return trees[i];
  const s = makeSprite(64);
  const g = s.g;
  const rnd = mulberry32(9000 + i * 57);
  const tone = TREE_TONES[i];
  const blobs = [];
  for (let k = 0; k < 17; k++) {
    const a = rnd() * 6.283;
    const d = Math.sqrt(rnd()) * 13;
    blobs.push([Math.cos(a) * d, Math.sin(a) * d, 7 + rnd() * 5]);
  }
  g.fillStyle = tone[0];
  for (const b of blobs) { g.beginPath(); g.arc(b[0] + 1.6, b[1] + 2.4, b[2] + 0.8, 0, 6.3); g.fill(); }
  g.fillStyle = tone[1];
  for (const b of blobs) { g.beginPath(); g.arc(b[0], b[1], b[2], 0, 6.3); g.fill(); }
  g.fillStyle = tone[2];
  g.globalAlpha = 0.75;
  for (const b of blobs) { g.beginPath(); g.arc(b[0] - 2.2, b[1] - 3, b[2] * 0.55, 0, 6.3); g.fill(); }
  g.globalAlpha = 1;
  trees[i] = s;
  return s;
}

const UMBRELLA_COLORS = ['#ff6f61', '#2ec4b6', '#ffd166', '#ff8fab', '#4dabf7', '#f4a261'];

export function umbrellaSprite(v) {
  const i = v % 6;
  if (umbrellas[i]) return umbrellas[i];
  const s = makeSprite(36);
  const g = s.g;
  for (let k = 0; k < 8; k++) {
    g.fillStyle = k % 2 ? '#fff4e0' : UMBRELLA_COLORS[i];
    g.beginPath();
    g.moveTo(0, 0);
    g.arc(0, 0, 15, (k / 8) * 6.283, ((k + 1) / 8) * 6.283);
    g.closePath();
    g.fill();
  }
  g.strokeStyle = 'rgba(0,0,0,0.2)';
  g.lineWidth = 0.7;
  g.beginPath();
  g.arc(0, 0, 15, 0, 6.3);
  g.stroke();
  g.fillStyle = '#ffffff';
  g.beginPath();
  g.arc(0, 0, 1.6, 0, 6.3);
  g.fill();
  umbrellas[i] = s;
  return s;
}

export const TOWEL_COLORS = ['#ff6f61', '#2ec4b6', '#ffd166', '#ff8fab', '#4dabf7', '#f4a261'];

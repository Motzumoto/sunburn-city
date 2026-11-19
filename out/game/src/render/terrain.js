// SUNBURN CITY — Streams and caches static terrain chunks.
// Streams static roads, tiled sidewalks, sand, water and shadows as cached terrain chunks.
import { WORLD_SIZE, CHUNK, CHUNK_SCALE, CHUNK_MARGIN } from '../core/config.js';
import { paintChunk } from './terrainPainter.js';

const MAX_CHUNKS = 72;
const COLS = Math.ceil(WORLD_SIZE / CHUNK);

export class TerrainCache {
  constructor(city) {
    this.city = city;
    this.chunks = new Map();
    this.frame = 0;
    this.baked = 0;
  }

  setCity(city) {
    this.city = city;
    this.chunks.clear();
  }

  bake(cx, cy) {
    const px = Math.ceil((CHUNK + CHUNK_MARGIN * 2) * CHUNK_SCALE);
    const canvas = document.createElement('canvas');
    canvas.width = px;
    canvas.height = px;
    const ctx = canvas.getContext('2d');
    paintChunk(ctx, this.city, cx, cy);
    const entry = { canvas, used: this.frame };
    this.chunks.set(cy * COLS + cx, entry);
    this.baked++;
    return entry;
  }

  // Draws every chunk overlapping the view. Bakes at most `budget` new chunks (Infinity for a full warm-up).
  draw(ctx, view, budget) {
    this.frame++;
    const c0 = Math.max(0, Math.floor(view.left / CHUNK));
    const c1 = Math.min(COLS - 1, Math.floor(view.right / CHUNK));
    const r0 = Math.max(0, Math.floor(view.top / CHUNK));
    const r1 = Math.min(COLS - 1, Math.floor(view.bottom / CHUNK));
    let missing = 0;
    for (let cy = r0; cy <= r1; cy++) {
      for (let cx = c0; cx <= c1; cx++) {
        let e = this.chunks.get(cy * COLS + cx);
        if (!e) {
          if (budget > 0) { e = this.bake(cx, cy); budget--; } else { missing++; this.drawPlaceholder(ctx, cx, cy); continue; }
        }
        e.used = this.frame;
        const o = CHUNK_MARGIN;
        ctx.drawImage(e.canvas, cx * CHUNK - o, cy * CHUNK - o, CHUNK + o * 2, CHUNK + o * 2);
      }
    }
    if (this.chunks.size > MAX_CHUNKS) this.evict();
    return missing;
  }

  drawPlaceholder(ctx, cx, cy) {
    ctx.fillStyle = '#c9bca2';
    ctx.fillRect(cx * CHUNK, cy * CHUNK, CHUNK, CHUNK);
  }

  evict() {
    let oldestKey = -1;
    let oldest = Infinity;
    for (const [k, e] of this.chunks) if (e.used < oldest) { oldest = e.used; oldestKey = k; }
    if (oldestKey >= 0 && oldest < this.frame - 2) this.chunks.delete(oldestKey);
  }

  // Bakes every chunk the view needs so the very next frame has no placeholders.
  prewarm(ctx, view) {
    return this.draw(ctx, view, Infinity);
  }
}

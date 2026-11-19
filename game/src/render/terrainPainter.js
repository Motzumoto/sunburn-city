// Paints one terrain chunk canvas by running the ground, road and shadow painters in order.
import { CHUNK, CHUNK_SCALE, CHUNK_MARGIN } from '../core/config.js';
import { paintBase, paintBlocks, paintStrips, paintPiers } from './groundPainter.js';
import { paintAsphalt, paintMarkings } from './roadPainter.js';
import { paintShadows } from './shadowPainter.js';

export function paintChunk(ctx, city, cx, cy) {
  const x0 = cx * CHUNK - CHUNK_MARGIN;
  const y0 = cy * CHUNK - CHUNK_MARGIN;
  const rect = { x0, y0, x1: x0 + CHUNK + CHUNK_MARGIN * 2, y1: y0 + CHUNK + CHUNK_MARGIN * 2 };
  ctx.setTransform(CHUNK_SCALE, 0, 0, CHUNK_SCALE, -x0 * CHUNK_SCALE, -y0 * CHUNK_SCALE);
  paintBase(ctx, rect);
  paintStrips(ctx, city, rect);
  paintAsphalt(ctx, city, rect);
  paintBlocks(ctx, city, rect);
  paintMarkings(ctx, city, rect);
  paintPiers(ctx, city, rect);
  paintShadows(ctx, city, rect);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

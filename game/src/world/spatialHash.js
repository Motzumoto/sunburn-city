// Uniform-grid spatial hash for fast rectangle queries over buildings, props and parked cars.

export class SpatialHash {
  constructor(worldSize, cellSize = 256) {
    this.cell = cellSize;
    this.cols = Math.ceil(worldSize / cellSize) + 1;
    this.cells = new Array(this.cols * this.cols);
    this.stamp = 1;
  }

  insert(item, x0, y0, x1, y1) {
    const c = this.cell;
    const i0 = Math.max(0, Math.floor(x0 / c));
    const i1 = Math.min(this.cols - 1, Math.floor(x1 / c));
    const j0 = Math.max(0, Math.floor(y0 / c));
    const j1 = Math.min(this.cols - 1, Math.floor(y1 / c));
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const k = j * this.cols + i;
        (this.cells[k] || (this.cells[k] = [])).push(item);
      }
    }
  }

  // Fills `out` (cleared first) with unique items whose cells overlap the rectangle.
  query(x0, y0, x1, y1, out) {
    out.length = 0;
    const c = this.cell;
    const i0 = Math.max(0, Math.floor(x0 / c));
    const i1 = Math.min(this.cols - 1, Math.floor(x1 / c));
    const j0 = Math.max(0, Math.floor(y0 / c));
    const j1 = Math.min(this.cols - 1, Math.floor(y1 / c));
    const stamp = ++this.stamp;
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const bucket = this.cells[j * this.cols + i];
        if (!bucket) continue;
        for (let n = 0; n < bucket.length; n++) {
          const item = bucket[n];
          if (item._q !== stamp) {
            item._q = stamp;
            out.push(item);
          }
        }
      }
    }
    return out;
  }
}

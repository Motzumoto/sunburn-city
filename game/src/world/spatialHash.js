// Lightweight uniform spatial index for nearby collision and visibility queries.
export class SpatialHash {
  constructor(size = 180) { this.size = size; this.cells = new Map(); }
  clear() { this.cells.clear(); }
  insert(item) { const key = `${Math.floor(item.x / this.size)},${Math.floor(item.y / this.size)}`; if (!this.cells.has(key)) this.cells.set(key, []); this.cells.get(key).push(item); }
  near(x, y, radius) {
    const found = [];
    for (let cy = Math.floor((y-radius)/this.size); cy <= Math.floor((y+radius)/this.size); cy++)
      for (let cx = Math.floor((x-radius)/this.size); cx <= Math.floor((x+radius)/this.size); cx++) found.push(...(this.cells.get(`${cx},${cy}`) || []));
    return found;
  }
}

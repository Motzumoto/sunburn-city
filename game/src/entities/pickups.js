// SUNBURN CITY - Places seeded health and armour pickups.
// Seeded health and armour pickups are placed at walkable points in parks and plazas.
export function createPickups(city, seed) {
  let state = (seed ^ 0x4c3a97b1) >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const blocks = city.blocks.filter((b) => b.kind === 'park' || b.kind === 'plaza');
  const pickups = [];
  if (!blocks.length) return pickups;
  for (let i = 0; i < Math.min(18, blocks.length); i++) {
    const block = blocks[Math.floor(random() * blocks.length)];
    const x = block.x0 + (block.x1 - block.x0) * (0.25 + random() * 0.5);
    const y = block.y0 + (block.y1 - block.y0) * (0.25 + random() * 0.5);
    const spot = city.findWalkableNear(x, y, 5);
    pickups.push({ kind: 'pickup', x: spot.x, y: spot.y, type: i % 2 ? 'armour' : 'health', active: true, sortY: spot.y + 2 });
  }
  return pickups;
}

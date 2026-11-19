// Deterministic building footprints and signature rooftops arranged between avenues.
import { DISTRICTS } from './districts.js';
import { ROAD_X, ROAD_Y } from './roads.js';
export function makeBlocks(random) {
  const blocks = [];
  for (let row = 0; row < ROAD_Y.length - 1; row++) for (let col = 0; col < ROAD_X.length - 1; col++) {
    const x = ROAD_X[col] + 48, y = ROAD_Y[row] + 48, w = ROAD_X[col + 1] - ROAD_X[col] - 96, h = ROAD_Y[row + 1] - ROAD_Y[row] - 96;
    if (random() < 0.1 || (x > 2150 && y > 3200)) continue;
    const district = DISTRICTS.find(d => x >= d.x && x < d.x + d.w && y >= d.y && y < d.y + d.h) || DISTRICTS[4];
    const count = w > 260 && h > 260 && random() > 0.42 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const insetX = 12 + random() * 32, insetY = 12 + random() * 32;
      blocks.push({ x: x + insetX + (count > 1 ? i * w * 0.42 : 0), y: y + insetY, w: (w - insetX * 2) / count, h: h - insetY * 2,
        color: district.color, height: district.style === 'glass' ? 45 + random() * 110 : 20 + random() * 65,
        style: district.style, seed: random(), label: random() > 0.965 ? ['VELA TOWER', 'FLAMINGO', 'HOTEL AZUL', 'MARÉ'][Math.floor(random() * 4)] : '' });
    }
  }
  blocks.push({ x: 1370, y: 550, w: 180, h: 180, color: '#96bbb6', height: 245, style: 'glass', seed: .4, label: 'VELA TOWER' });
  blocks.push({ x: 2750, y: 1680, w: 180, h: 96, color: '#ed8f81', height: 35, style: 'deco', seed: .7, label: 'FLAMINGO HOTEL' });
  blocks.push({ x: 3240, y: 3500, w: 260, h: 70, color: '#edcda0', height: 22, style: 'lowrise', seed: .8, label: 'PIER 9' });
  blocks.push({ x: 3470, y: 900, w: 105, h: 62, color: '#78b6a8', height: 18, style: 'deco', seed: .6, label: 'SUNSPRAY' });
  return blocks;
}

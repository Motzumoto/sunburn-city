// Named neighborhood regions and their distinct architectural moods.
export const DISTRICTS = [
  { name: 'DOWNTOWN', x: 900, y: 450, w: 1320, h: 1150, color: '#91b7b3', style: 'glass' },
  { name: 'MARINA', x: 2500, y: 350, w: 1450, h: 1050, color: '#8ec6b5', style: 'deco' },
  { name: 'NEON ROW', x: 2350, y: 1450, w: 1400, h: 850, color: '#ef9e93', style: 'neon' },
  { name: 'THE YARDS', x: 100, y: 2700, w: 1100, h: 1050, color: '#c58e72', style: 'industrial' },
  { name: 'OLD TOWN', x: 1200, y: 2550, w: 1000, h: 1300, color: '#d9ae87', style: 'lowrise' },
  { name: 'BREEZY PALMS', x: 120, y: 450, w: 780, h: 1800, color: '#d8b98d', style: 'residential' },
  { name: 'SOUTH BEACH', x: 2200, y: 3100, w: 1850, h: 700, color: '#eac99b', style: 'beach' },
];
export function districtAt(x, y) { return DISTRICTS.find(d => x >= d.x && x <= d.x + d.w && y >= d.y && y <= d.y + d.h) || DISTRICTS[4]; }

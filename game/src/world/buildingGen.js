// SUNBURN CITY - Builds building facades, roofs, details and signs.
// Turns each lot into a facade, extruded roof, rooftop detail and optional sign.
import { EXTRUDE } from '../core/config.js';
import { wallColors, shade, mix } from '../render/palette.js';

const SIGN_WORDS = {
  downtown: ['COSTA TRUST', 'HELIOS', 'NOVA CORP', 'MERIDIAN', 'VELA BANK', 'AURORA'],
  marina: ['BLUE CAIMAN', 'DOCKSIDE', 'SEA GLASS', 'MARLIN CLUB', 'HARBOR CAFE'],
  neon: ['VELVET', 'ULTRAVIOLET', 'CLUB MIRAGE', 'CHROME ROSE', 'SIREN', 'ZERO G', 'LA LUNA', 'KARAOKE'],
  beach: ['SEA SALT', 'COCONUT JOE', 'SURF & TACO', 'SOL BAR', 'TIDE SHOP', 'GELATO'],
  palms: ['PALM CAFE', 'CORNER MKT'],
  yards: ['CARGO 9', 'RUSTY ANCHOR', 'FREIGHT CO'],
  oldtown: ['TACOS EL SOL', 'VELA VINYL', 'LA PANADERIA', 'BOTICA', 'CAFE NEGRO', 'LIBROS'],
};

let nextBuildingId = 1;

function roofDetails(rng, type, w, h) {
  const out = [];
  const area = w * h;
  if (type === 'house') {
    if (rng.chance(0.5)) out.push({ t: 'solar', u: 0.15, v: 0.2, w: 0.5, h: 0.4 });
    return out;
  }
  const acCount = Math.min(6, Math.floor(area / 1400) + rng.int(0, 2));
  for (let i = 0; i < acCount; i++) {
    out.push({ t: 'ac', u: rng.range(0.1, 0.8), v: rng.range(0.1, 0.8), w: rng.range(0.1, 0.18), h: rng.range(0.08, 0.14), hh: rng.range(5, 9) });
  }
  if (area > 2200 && rng.chance(0.45)) out.push({ t: 'tank', u: rng.range(0.15, 0.75), v: rng.range(0.15, 0.7), r: rng.range(9, 14) });
  if ((type === 'tower' || type === 'midrise') && area > 4000 && rng.chance(0.3)) out.push({ t: 'helipad', u: 0.5, v: 0.5, r: Math.min(w, h) * 0.3 });
  if ((type === 'deco' || type === 'midrise') && area > 3000 && rng.chance(0.4)) out.push({ t: 'pool', u: 0.18, v: 0.55, w: 0.45, h: 0.28 });
  if (type === 'tower') out.push({ t: 'antenna', u: rng.range(0.3, 0.7), v: rng.range(0.3, 0.7), hh: rng.range(26, 54) });
  if (type === 'lowrise' && rng.chance(0.4)) out.push({ t: 'garden', u: 0.12, v: 0.12, w: 0.5, h: 0.35 });
  return out;
}

// rect: {x, y, w, h} footprint. opts may override type, height, name, wall, sign.
export function createBuilding(rng, rect, district, type, opts = {}) {
  const range = district.height[type] || [40, 80];
  const H = opts.H || Math.round(rng.range(range[0], range[1]));
  const wallHex = opts.wall || rng.pick(type === 'tower' ? district.glass : district.walls);
  const walls = wallColors(wallHex);
  const roofHex = opts.roof || rng.pick(district.roofs);
  const accent = opts.accent || rng.pick(district.accents);
  const words = SIGN_WORDS[district.id];
  const wantsSign = opts.sign !== undefined ? opts.sign : (type === 'club' ? rng.chance(0.95)
    : type === 'shop' ? rng.chance(0.75) : type === 'deco' ? rng.chance(0.5) : type === 'warehouse' ? rng.chance(0.4)
      : type === 'tower' ? rng.chance(0.35) : false);
  const b = {
    kind: 'building', drawKind: 0, id: nextBuildingId++, type, district: district.id,
    x: rect.x, y: rect.y, w: rect.w, h: rect.h, H,
    rx: rect.x + EXTRUDE.x * H, ry: rect.y + EXTRUDE.y * H,
    wallHex, accent, glass: type === 'tower' || type === 'deco' && rng.chance(0.3),
    litCss: walls.lit, darkCss: walls.dark, roofCss: roofHex, roofEdge: shade(roofHex, -0.28), roofHi: shade(roofHex, 0.12),
    trim: mix(wallHex, '#ffffff', 0.55), glassCss: mix(rng.pick(district.glass), '#1d3a55', 0.35),
    pitchX: type === 'tower' ? 9 : type === 'warehouse' ? 0 : rng.pick([13, 15, 17]),
    pitchY: type === 'tower' ? 10 : rng.pick([13, 15]),
    roof: roofDetails(rng, type, rect.w, rect.h),
    sign: wantsSign && words ? { text: opts.signText || rng.pick(words), color: accent, neon: district.id === 'neon' || district.id === 'beach' || type === 'club' } : null,
    awning: type === 'shop' ? accent : null,
    lightSeed: rng.int(1, 99999),
    name: opts.name || null, landmark: opts.landmark || null,
    sortY: rect.y + rect.h, _q: 0,
    // Collider footprint (axis aligned).
    cx0: rect.x, cy0: rect.y, cx1: rect.x + rect.w, cy1: rect.y + rect.h,
  };
  if (type === 'warehouse') { b.roofCss = shade(roofHex, 0.04); }
  return b;
}

export function pickBuildingType(rng, district, rect) {
  const small = Math.min(rect.w, rect.h) < 52;
  const t = rng.weighted(district.mix);
  if (t === 'tower' && Math.min(rect.w, rect.h) < 70) return 'midrise';
  if (small && (t === 'midrise' || t === 'deco')) return 'lowrise';
  return t;
}

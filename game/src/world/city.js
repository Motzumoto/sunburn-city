// The generated city of Costa Vela: owns roads, blocks, buildings, props, parked cars and all spatial queries.
import { WORLD_SIZE, GROUND, SIDEWALK_W } from '../core/config.js';
import { Random } from '../core/rng.js';
import { SpatialHash } from './spatialHash.js';
import { DistrictMap } from './districts.js';
import { buildRoadGrid, buildRoadSegments } from './roads.js';
import { LaneGraph } from './laneGraph.js';
import { createBlocks, layoutBlock, blockGround } from './blocks.js';
import { buildLandmarks, buildShoreLandmarks } from './landmarks.js';
import { buildShoreStrips, stripGround } from './shoreStrips.js';
import { scatterStreetProps, scatterMedianProps, scatterSignals, parkStreetCars } from './propsGen.js';
import { shoreY } from './shoreline.js';
import { Vehicle, CAR_COLORS } from '../entities/vehicle.js';

const WALKABLE = new Set([GROUND.SIDEWALK, GROUND.LOT, GROUND.GRASS, GROUND.SAND, GROUND.CONCRETE, GROUND.PLAZA, GROUND.BOARDWALK, GROUND.PARKING, GROUND.PIER]);

export class City {
  constructor(seed) {
    this.seed = seed >>> 0;
    this.size = WORLD_SIZE;
    const rng = new Random(this.seed);
    this.districtMap = new DistrictMap();
    this.grid = buildRoadGrid(rng.fork('roads'), WORLD_SIZE);
    const net = buildRoadSegments(this.grid);
    this.segments = net.segments;
    this.intersections = net.intersections;
    this.lanes = new LaneGraph(this.segments, this.intersections);
    this.blocks = createBlocks(this.grid, this.districtMap);
    this.buildings = [];
    this.props = [];
    this.parked = [];
    this.piers = [];
    this.strips = [];
    this.landmarks = [];
    this.hash = new SpatialHash(WORLD_SIZE, 256);
    this.scratch = [];

    const kindRng = rng.fork('kinds');
    for (const b of this.blocks) b.kind = kindRng.weighted(b.district.blockKinds);
    buildLandmarks(this, rng.fork('landmarks'));
    const lotRng = rng.fork('lots');
    for (const b of this.blocks) layoutBlock(this, b, lotRng);
    buildShoreStrips(this, this.grid, rng.fork('shore'));
    buildShoreLandmarks(this, rng.fork('shorelm'));
    scatterStreetProps(this, this.grid, rng.fork('props'));
    scatterMedianProps(this, this.segments, rng.fork('median'));
    scatterSignals(this, this.intersections, rng.fork('signals'));
    parkStreetCars(this, this.segments, rng.fork('parked'));
    this.buildings.sort((a, b) => a.sortY - b.sortY || a.x - b.x);
    this.spawn = this.findSpawn();
  }

  // ---- generation hooks used by the generators ----
  addBuilding(b) {
    this.buildings.push(b);
    this.hash.insert(b, b.x, b.y, b.x + b.w, b.y + b.h);
  }

  addProp(p) {
    this.props.push(p);
    const e = Math.max(p.r, p.cw, p.ch) + 2;
    this.hash.insert(p, p.x - e, p.y - e, p.x + e, p.y + e);
  }

  addPier(rect) {
    this.piers.push(rect);
  }

  addParkedCar(rng, x, y, heading) {
    const type = rng.weighted([['sedan', 4], ['hatch', 2.4], ['suv', 2.2], ['coupe', 1.4], ['van', 1], ['sport', 0.6], ['taxi', 0.5]]);
    const v = new Vehicle(type, type === 'taxi' ? '#f7c531' : rng.pick(CAR_COLORS));
    v.place(x, y, heading);
    v.parked = true;
    v.inCityHash = true;
    this.parked.push(v);
    const e = v.halfExtents();
    this.hash.insert(v, x - e.hx, y - e.hy, x + e.hx, y + e.hy);
  }

  // ---- queries ----
  districtAt(x, y) {
    return this.districtMap.at(x, y);
  }

  onPier(x, y) {
    for (const p of this.piers) if (x >= p.x0 && x <= p.x1 && y >= p.y0 && y <= p.y1) return true;
    return false;
  }

  lineHit(coords, lines, v) {
    for (let k = 0; k < coords.length; k++) if (Math.abs(v - coords[k]) <= lines[k].width / 2) return k;
    return -1;
  }

  groundAt(x, y) {
    if (x < 0 || y < 0 || x > WORLD_SIZE || y > WORLD_SIZE) return GROUND.OUT;
    if (y > shoreY(x)) return this.onPier(x, y) ? GROUND.PIER : GROUND.WATER;
    const g = this.grid;
    const last = g.xs.length - 1;
    const lastY = g.ys.length - 1;
    const left = g.xs[0] - g.vLines[0].width / 2;
    const right = g.xs[last] + g.vLines[last].width / 2;
    const top = g.ys[0] - g.hLines[0].width / 2;
    const bottom = g.ys[lastY] + g.hLines[lastY].width / 2;
    if (x < left || x > right || y < top) return GROUND.GRASS;
    if (y <= bottom) {
      if (this.lineHit(g.xs, g.vLines, x) >= 0 || this.lineHit(g.ys, g.hLines, y) >= 0) return GROUND.ROAD;
      let i = 0;
      while (i < g.cols - 1 && x > g.xs[i + 1] - g.vLines[i + 1].width / 2) i++;
      let j = 0;
      while (j < g.rows - 1 && y > g.ys[j + 1] - g.hLines[j + 1].width / 2) j++;
      return blockGround(this.blocks[j * g.cols + i], x, y);
    }
    for (const s of this.strips) if (x >= s.x0 && x <= s.x1) return stripGround(s, x, y);
    return GROUND.CONCRETE; // under the vertical roads' extension: shore strip gaps
  }

  isWalkable(x, y) {
    return WALKABLE.has(this.groundAt(x, y));
  }

  streetAt(x, y) {
    const g = this.grid;
    const iv = this.lineHit(g.xs, g.vLines, x);
    const ih = this.lineHit(g.ys, g.hLines, y);
    if (ih >= 0) return g.hLines[ih].name;
    if (iv >= 0) return g.vLines[iv].name;
    return null;
  }

  queryRect(x0, y0, x1, y1, out) {
    return this.hash.query(x0, y0, x1, y1, out);
  }

  // True when a circle of radius r at (x, y) overlaps a solid object or open water.
  blockedAt(x, y, r, ignore = null) {
    const list = this.hash.query(x - r - 1, y - r - 1, x + r + 1, y + r + 1, this.scratch);
    for (let n = 0; n < list.length; n++) {
      if (list[n] !== ignore && circleHitsItem(list[n], x, y, r)) return true;
    }
    return this.groundAt(x, y) === GROUND.WATER || this.groundAt(x + r, y) === GROUND.WATER ||
      this.groundAt(x - r, y) === GROUND.WATER || this.groundAt(x, y + r) === GROUND.WATER || this.groundAt(x, y - r) === GROUND.WATER;
  }

  solidAt(x, y) {
    const list = this.hash.query(x - 1, y - 1, x + 1, y + 1, this.scratch);
    for (let n = 0; n < list.length; n++) if (circleHitsItem(list[n], x, y, 0.5)) return true;
    return false;
  }

  // Marches a ray; returns distance to the first solid within maxDist, or maxDist.
  raycast(x, y, angle, maxDist) {
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    for (let d = 8; d < maxDist; d += 6) {
      if (this.solidAt(x + dx * d, y + dy * d)) return d;
    }
    return maxDist;
  }

  // Lane edge (not connector) nearest to a point, optionally filtered. Returns {edge, t, x, y}.
  nearestLane(x, y, filter) {
    let best = null;
    let bd = Infinity;
    for (const e of this.lanes.edges) {
      if (e.kind !== 'lane' || (filter && !filter(e))) continue;
      const vx = e.x1 - e.x0;
      const vy = e.y1 - e.y0;
      const t = Math.max(0, Math.min(1, ((x - e.x0) * vx + (y - e.y0) * vy) / (e.len * e.len)));
      const px = e.x0 + vx * t;
      const py = e.y0 + vy * t;
      const d = Math.hypot(px - x, py - y);
      if (d < bd) { bd = d; best = { edge: e, t, x: px, y: py }; }
    }
    return best;
  }

  landmark(id) {
    for (const l of this.landmarks) if (l.id === id) return l;
    return null;
  }

  findWalkableNear(x, y, r = 8) {
    for (let ring = 0; ring < 40; ring++) {
      for (let a = 0; a < 16; a++) {
        const px = x + Math.cos(a * 0.3927) * ring * 8;
        const py = y + Math.sin(a * 0.3927) * ring * 8;
        if (this.isWalkable(px, py) && !this.blockedAt(px, py, r)) return { x: px, y: py };
      }
    }
    return { x, y };
  }

  findSpawn() {
    const t = this.landmark('vela_tower');
    if (t) return this.findWalkableNear(t.x, t.block.y1 - SIDEWALK_W - 6);
    return this.findWalkableNear(2400, 3300);
  }
}

function circleHitsItem(it, x, y, r) {
  let hx, hy, cx, cy;
  if (it.kind === 'building') {
    cx = (it.cx0 + it.cx1) / 2; cy = (it.cy0 + it.cy1) / 2; hx = (it.cx1 - it.cx0) / 2; hy = (it.cy1 - it.cy0) / 2;
  } else if (it.kind === 'prop') {
    if (it.r > 0) { const d = Math.hypot(x - it.x, y - it.y); return d < r + it.r; }
    if (it.cw <= 0) return false;
    cx = it.x; cy = it.y;
    hx = (it.vertical ? it.ch : it.cw) / 2; hy = (it.vertical ? it.cw : it.ch) / 2;
  } else {
    const e = it.halfExtents();
    cx = it.x; cy = it.y; hx = e.hx; hy = e.hy;
  }
  const nx = Math.max(cx - hx, Math.min(x, cx + hx));
  const ny = Math.max(cy - hy, Math.min(y, cy + hy));
  const dx = x - nx;
  const dy = y - ny;
  return dx * dx + dy * dy < r * r;
}

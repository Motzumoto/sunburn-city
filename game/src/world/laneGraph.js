// The lane network: one directed edge per lane per segment, plus connector edges through every intersection.
import { LANE_W } from '../core/config.js';

export class LaneGraph {
  constructor(segments, intersections) {
    this.edges = [];
    this.arrivals = intersections.map(() => []);
    this.departures = intersections.map(() => []);
    this.addLaneEdges(segments);
    this.addConnectors(intersections);
  }

  addEdge(e) {
    e.id = this.edges.length;
    e.next = [];
    this.edges.push(e);
    return e;
  }

  addLaneEdges(segments) {
    for (const seg of segments) {
      for (const dir of [1, -1]) {
        for (let lane = 0; lane < seg.lanes; lane++) {
          const off = seg.median / 2 + (lane + 0.5) * LANE_W;
          let x0, y0, x1, y1, dx, dy;
          if (seg.axis === 'h') {
            dx = dir; dy = 0;
            y0 = y1 = seg.center + dir * off;
            x0 = dir > 0 ? seg.x0 : seg.x1;
            x1 = dir > 0 ? seg.x1 : seg.x0;
          } else {
            dx = 0; dy = dir;
            x0 = x1 = seg.center - dir * off;
            y0 = dir > 0 ? seg.y0 : seg.y1;
            y1 = dir > 0 ? seg.y1 : seg.y0;
          }
          const e = this.addEdge({
            kind: 'lane', seg: seg.id, segKind: seg.kind, name: seg.name, lane, lanes: seg.lanes, dx, dy,
            x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, len: Math.hypot(x1 - x0, y1 - y0),
            speed: seg.speed, from: dir > 0 ? seg.a : seg.b, to: dir > 0 ? seg.b : seg.a, turn: 'straight',
          });
          this.arrivals[e.to].push(e);
          this.departures[e.from].push(e);
        }
      }
    }
  }

  addConnectors(intersections) {
    for (const it of intersections) {
      for (const a of this.arrivals[it.id]) {
        let made = this.connectFrom(a, true);
        if (!made) made = this.connectFrom(a, false);
        if (!made) this.connect(a, a, 'straight'); // last resort keeps every edge alive
      }
    }
  }

  connectFrom(a, strictLanes) {
    let made = 0;
    for (const d of this.departures[a.to]) {
      if (d.seg === a.seg) continue; // no U-turns
      const cross = a.dx * d.dy - a.dy * d.dx;
      const turn = cross > 0.5 ? 'right' : cross < -0.5 ? 'left' : 'straight';
      if (strictLanes) {
        if (turn === 'straight' && d.lane !== Math.min(a.lane, d.lanes - 1)) continue;
        if (turn === 'right' && !(a.lane === a.lanes - 1 && d.lane === d.lanes - 1)) continue;
        if (turn === 'left' && !(a.lane === 0 && d.lane === 0)) continue;
      } else if (d.lane !== Math.min(a.lane, d.lanes - 1)) continue;
      this.connect(a, d, turn);
      made++;
    }
    return made;
  }

  connect(a, d, turn) {
    const x0 = a.x1, y0 = a.y1, x1 = d.x0, y1 = d.y0;
    let cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    if (turn !== 'straight') {
      if (Math.abs(a.dx) > 0.5) { cx = x1; cy = y0; } else { cx = x0; cy = y1; }
    }
    const chord = Math.hypot(x1 - x0, y1 - y0);
    const len = (chord + Math.hypot(cx - x0, cy - y0) + Math.hypot(x1 - cx, y1 - cy)) / 2;
    const c = this.addEdge({
      kind: 'connector', seg: -1, segKind: a.segKind, name: a.name, lane: a.lane, lanes: a.lanes, dx: a.dx, dy: a.dy,
      x0, y0, x1, y1, cx, cy, len: Math.max(len, 1), speed: Math.min(a.speed, d.speed) * 0.55,
      from: a.to, to: a.to, turn,
    });
    a.next.push(c.id);
    c.next.push(d.id);
  }

  edge(id) {
    return this.edges[id];
  }

  // Fills `out` with lane (not connector) edges whose midpoint is within r of (x, y).
  laneEdgesNear(x, y, r, out) {
    out.length = 0;
    for (const e of this.edges) {
      if (e.kind !== 'lane') continue;
      if (Math.abs(e.cx - x) < r + e.len / 2 && Math.abs(e.cy - y) < r + e.len / 2) out.push(e);
    }
    return out;
  }
}

// Position and heading at parameter t (0..1) along an edge; connectors are quadratic curves.
export function edgePoint(e, t, out) {
  const u = 1 - t;
  out.x = u * u * e.x0 + 2 * u * t * e.cx + t * t * e.x1;
  out.y = u * u * e.y0 + 2 * u * t * e.cy + t * t * e.y1;
  const dx = 2 * u * (e.cx - e.x0) + 2 * t * (e.x1 - e.cx);
  const dy = 2 * u * (e.cy - e.y0) + 2 * t * (e.y1 - e.cy);
  out.angle = Math.atan2(dy, dx);
  return out;
}

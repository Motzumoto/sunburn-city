// SUNBURN CITY — Manages lane-following and staged traffic.
// Ambient lane-following traffic with distance keeping and deterministic staged traffic support.
import { mulberry32 } from '../core/rng.js';
import { clamp, dist } from '../core/math.js';
import { Vehicle, CAR_COLORS } from './vehicle.js';
import { edgePoint } from '../world/laneGraph.js';

const TYPES = ['sedan', 'coupe', 'hatch', 'suv', 'taxi', 'sport', 'van'];
const point = { x: 0, y: 0, angle: 0 };

export class Traffic {
  constructor(city, seed) {
    this.city = city;
    this.rnd = mulberry32((seed ^ 0x7f4a7c15) >>> 0);
    this.cars = [];
    this.clock = 0;
    this.spawnClock = 0;
    this.scratch = [];
  }

  addCar(type, x, y, heading, color, options = {}) {
    const v = new Vehicle(type, color || CAR_COLORS[Math.floor(this.rnd() * CAR_COLORS.length)]);
    v.place(x, y, heading);
    v.parked = !!options.parked;
    v.staged = !!options.staged;
    v.siren = options.siren || 0;
    v.headlights = !!options.headlights;
    this.cars.push(v);
    if (!v.parked && !v.staged) {
      const lane = this.city.nearestLane(x, y);
      this.resetRoute(v, lane ? lane.edge.id : -1, lane ? lane.t : 0);
      if (lane) v.route.desired = lane.edge.speed * (0.62 + this.rnd() * 0.23);
    }
    return v;
  }

  resetRoute(vehicle, edgeId, t) {
    vehicle.route = { edgeId, t, stuck: 0, desired: 0 };
  }

  fillScene(player, count = 24, radius = 900) {
    let attempts = 0;
    while (this.cars.filter((v) => !v.parked && !v.staged && !v.destroyed).length < count && attempts++ < count * 20) {
      if (!this.spawnNear(player.x, player.y, radius, 0.38, 0.88)) break;
    }
  }

  update(dt, player, day, effects, playerCar = null) {
    this.clock += dt;
    this.spawnClock -= dt;
    const district = this.city.districtAt(player.x, player.y);
    const timeDensity = day.hour >= 7 && day.hour < 19 ? 1 : 0.62;
    const districtDensity = district.id === 'downtown' || district.id === 'neon' ? 1.18
      : district.id === 'yards' ? 0.68 : 0.86;
    const target = Math.round(44 * timeDensity * districtDensity);
    for (let i = this.cars.length - 1; i >= 0; i--) {
      const v = this.cars[i];
      if (v.destroyed && !v.isPlayerCar) {
        if (v.exploded) this.cars.splice(i, 1);
        continue;
      }
      if (v.staged || v.parked || v.isPlayerCar || v.policeUnit) continue;
      if (dist(v.x, v.y, player.x, player.y) > 1600) {
        this.cars.splice(i, 1);
        continue;
      }
      this.driveCar(v, dt, day, effects, playerCar);
    }
    const live = this.cars.filter((v) => !v.parked && !v.staged && !v.destroyed && !v.isPlayerCar).length;
    if (live < target && this.spawnClock <= 0) {
      this.spawnClock = 0.22;
      this.spawnNear(player.x, player.y, 1000, 0.5, 0.95);
    }
    if (live > target + 12) {
      for (let i = this.cars.length - 1; i >= 0 && this.cars.length > target + 4; i--) {
        const v = this.cars[i];
        if (!v.parked && !v.staged && !v.policeUnit && dist(v.x, v.y, player.x, player.y) > 850) this.cars.splice(i, 1);
      }
    }
  }

  spawnNear(x, y, radius, minT, maxT) {
    const edges = this.city.lanes.laneEdgesNear(x, y, radius, this.scratch);
    if (!edges.length) return false;
    for (let attempt = 0; attempt < 18; attempt++) {
      const edge = edges[Math.floor(this.rnd() * edges.length)];
      const t = minT + this.rnd() * (maxT - minT);
      edgePoint(edge, t, point);
      if (this.city.blockedAt(point.x, point.y, 7)) continue;
      let clear = true;
      for (const other of this.cars) {
        if (!other.destroyed && dist(other.x, other.y, point.x, point.y) < 70) { clear = false; break; }
      }
      if (!clear || dist(x, y, point.x, point.y) > radius) continue;
      const v = new Vehicle(TYPES[Math.floor(this.rnd() * TYPES.length)], CAR_COLORS[Math.floor(this.rnd() * CAR_COLORS.length)]);
      v.place(point.x, point.y, point.angle);
      v.route = { edgeId: edge.id, t, stuck: 0, desired: edge.speed * (0.62 + this.rnd() * 0.23) };
      v.trafficCar = true;
      this.cars.push(v);
      return true;
    }
    return false;
  }

  driveCar(v, dt, day, effects, playerCar) {
    const route = v.route;
    if (!route || route.edgeId < 0) return;
    let edge = this.city.lanes.edge(route.edgeId);
    let desired = route.desired * (day.hour >= 22 || day.hour < 6 ? 0.9 : 1);
    const heading = Math.atan2(edge.dy, edge.dx);
    const frontX = v.x + Math.cos(heading) * 38;
    const frontY = v.y + Math.sin(heading) * 38;
    if (this.city.blockedAt(frontX, frontY, 8, v)) desired = 0;
    for (const other of this.cars) {
      if (other === v || other.destroyed || other.parked) continue;
      const dx = other.x - v.x;
      const dy = other.y - v.y;
      const along = dx * Math.cos(heading) + dy * Math.sin(heading);
      const across = Math.abs(-dx * Math.sin(heading) + dy * Math.cos(heading));
      if (along > 0 && along < 76 && across < 26) desired = Math.min(desired, Math.max(0, other.speed - 12));
    }
    if (playerCar && playerCar !== v) {
      const dx = playerCar.x - v.x;
      const dy = playerCar.y - v.y;
      const ahead = dx * Math.cos(heading) + dy * Math.sin(heading);
      const across = Math.abs(-dx * Math.sin(heading) + dy * Math.cos(heading));
      if (ahead > 0 && ahead < 90 && across < 34) desired = Math.min(desired, Math.max(0, playerCar.speed - 18));
    }
    v.speed = approach(v.speed, desired, (desired < v.speed ? 360 : 100) * dt);
    route.stuck = v.speed < 4 ? route.stuck + dt : Math.max(0, route.stuck - dt * 2);
    if (route.stuck > 6) {
      const next = this.city.nearestLane(v.x, v.y, (candidate) => candidate.id !== edge.id);
      if (next && next.edge) {
        route.edgeId = next.edge.id;
        route.t = next.t;
        edge = next.edge;
      } else {
        route.t = Math.min(0.94, route.t + 0.08);
      }
      route.stuck = 0;
    }
    route.t += Math.max(0, v.speed) * dt / edge.len;
    if (route.t >= 1) {
      const nextIds = edge.next;
      if (nextIds.length) {
        const options = nextIds.map((id) => this.city.lanes.edge(id));
        const chosen = options[Math.floor(this.rnd() * options.length)];
        route.edgeId = chosen.id;
        route.t = 0;
        route.desired = chosen.speed * (0.62 + this.rnd() * 0.23);
        edge = chosen;
      } else route.t = 0.98;
    }
    edgePoint(edge, clamp(route.t, 0, 1), point);
    v.x = point.x;
    v.y = point.y;
    v.heading = point.angle;
    v.sortY = v.y + v.spec.l * 0.35;
    v.brakeLights = desired < 30;
    v.headlights = day.sky.night > 0.35;
    if (v.health < 55 && Math.floor(this.clock * 4) % 4 === 0) effects.smoke(v.x, v.y, 0, 0, 5);
  }
}

function approach(value, target, amount) {
  return value < target ? Math.min(value + amount, target) : Math.max(value - amount, target);
}

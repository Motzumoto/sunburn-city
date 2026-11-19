// SUNBURN CITY — Spawns and updates sidewalk crowds and pedestrians.
// Sidewalk crowds, beachgoers, idle pairs and deterministic scene-ready pedestrians.
import { mulberry32 } from '../core/rng.js';
import { dist } from '../core/math.js';
import { SIDEWALK_W } from '../core/config.js';

const SHIRTS = ['#e85e58', '#25a9a0', '#f2b632', '#5b6fc7', '#f4eee0', '#c55f9a', '#74a85b', '#e88d54'];
const PANTS = ['#263348', '#d2c6af', '#435065', '#5e493e', '#e5e0d1'];
const SKIN = ['#f0c49d', '#dca47c', '#a96f51', '#79513f', '#edb89c'];
const HAIR = ['#30231f', '#1d2027', '#68432c', '#c99445', '#d4c6a9'];

export class Pedestrians {
  constructor(city, seed) {
    this.city = city;
    this.rnd = mulberry32((seed ^ 0x31c3a5d7) >>> 0);
    this.people = [];
    this.cash = [];
    this.timer = 0;
    this.nextId = 1;
  }

  populate(player, count = 34, radius = 700) {
    let attempts = 0;
    while (this.people.length < count && attempts++ < count * 18) this.spawnNear(player.x, player.y, radius);
    this.pairIdlePeople();
  }

  spawnNear(x, y, radius) {
    for (let attempt = 0; attempt < 28; attempt++) {
      const px = x + (this.rnd() - 0.5) * radius * 2;
      const py = y + (this.rnd() - 0.5) * radius * 2;
      if (dist(px, py, x, y) > radius || !this.city.isWalkable(px, py) || this.city.blockedAt(px, py, 6)) continue;
      const look = { shirt: pick(this.rnd, SHIRTS), sleeve: pick(this.rnd, SHIRTS), pants: pick(this.rnd, PANTS),
        shoes: this.rnd() < 0.3 ? '#f0e6cf' : '#24252d', skin: pick(this.rnd, SKIN), hair: pick(this.rnd, HAIR),
        shades: this.rnd() < 0.22 ? '#161b25' : null,
        hat: this.rnd() < 0.1 ? pick(this.rnd, ['#e74f41', '#233b53', '#f0c24e']) : null };
      const beach = this.city.districtAt(px, py).id === 'beach';
      const person = { id: this.nextId++, x: px, y: py, face: this.rnd() * Math.PI * 2, aim: 0, walk: this.rnd() * 6.28,
        speed: 0, look, armed: false, punch: 0, targetX: px, targetY: py, state: 'walk',
        idle: this.rnd() < (beach ? 0.32 : 0.19) ? 2 + this.rnd() * 6 : 0, flee: 0, sortY: py + 2, beach,
        health: 100, down: false, hitFlash: 0 };
      this.people.push(person);
      return person;
    }
    return null;
  }

  pairIdlePeople() {
    for (let i = 0; i + 1 < this.people.length; i++) {
      const a = this.people[i];
      if (a.idle <= 0 || a.paired || this.rnd() > 0.22) continue;
      let nearest = null;
      let best = 72;
      for (let j = i + 1; j < this.people.length; j++) {
        const b = this.people[j];
        const d = dist(a.x, a.y, b.x, b.y);
        if (b.idle > 0 && !b.paired && d < best) { best = d; nearest = b; }
      }
      if (nearest) {
        a.paired = nearest;
        nearest.paired = a;
      }
    }
  }

  fleeFrom(x, y, radius, gunfire = false) {
    for (const p of this.people) {
      const d = dist(x, y, p.x, p.y);
      if (d > radius || d < 1) continue;
      const away = Math.atan2(p.y - y, p.x - x);
      p.targetX = p.x + Math.cos(away) * (170 + this.rnd() * 130);
      p.targetY = p.y + Math.sin(away) * (170 + this.rnd() * 130);
      p.flee = gunfire ? 3.2 : 2.4;
      p.state = 'flee';
      p.idle = 0;
      p.waypoints = null;
      if (gunfire && this.rnd() < 0.08) this.cash.push({ x: p.x, y: p.y, amount: 5 + Math.floor(this.rnd() * 16), life: 22, phase: this.rnd() * 6.28 });
    }
  }

  update(dt, player, day, cars = [], wantedSystem = null) {
    this.timer -= dt;
    const district = this.city.districtAt(player.x, player.y);
    const daytime = day.hour > 7 && day.hour < 20;
    const districtFactor = district.id === 'beach' ? 1.65 : district.id === 'downtown' || district.id === 'neon' ? 1.2 : 0.9;
    const wanted = Math.min(80, Math.round((daytime ? 62 : 44) * districtFactor));
    if (this.timer <= 0) {
      this.timer = 0.75;
      const count = this.people.filter((p) => dist(player.x, player.y, p.x, p.y) < 950).length;
      if (count < wanted) {
        this.spawnNear(player.x, player.y, 650);
        if (count + 1 < wanted) this.spawnNear(player.x, player.y, 650);
      }
    }
    for (let i = this.people.length - 1; i >= 0; i--) {
      const p = this.people[i];
      if (dist(player.x, player.y, p.x, p.y) > 1250) { this.people.splice(i, 1); continue; }
      if (p.down) { p.speed = 0; p.sortY = p.y + 2; continue; }
      for (const car of cars) {
        if (car.destroyed || Math.abs(car.speed) < 35) continue;
        const d = dist(car.x, car.y, p.x, p.y);
        if (d < 19 && !p.hitByCar) {
          p.hitByCar = true;
          p.health -= Math.max(35, (Math.abs(car.speed) - 70) * 0.48);
          p.hitFlash = 0.22;
          if (wantedSystem && car.isPlayerCar) wantedSystem.crime('pedestrian');
          if (p.health <= 0) p.down = true;
          else this.fleeOne(p, car.x, car.y, 2.4);
        } else if (d < 85) this.fleeOne(p, car.x, car.y, 2.4);
      }
      p.hitFlash = Math.max(0, p.hitFlash - dt);
      p.flee = Math.max(0, p.flee - dt);
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      const d = Math.hypot(dx, dy);
      if (d < 12 && p.waypoints && p.waypoints.length) {
        const next = p.waypoints.shift();
        p.targetX = next.x;
        p.targetY = next.y;
        p.speed = 0;
      } else if (d < 12 || (p.idle > 0 && p.flee <= 0)) {
        p.speed = 0;
        p.idle = Math.max(0, p.idle - dt);
        p.state = 'idle';
        if (p.idle === 0) this.chooseTarget(p);
      } else {
        p.state = p.flee > 0 ? 'flee' : 'walk';
        p.speed = p.flee > 0 ? 135 : 38 + (p.id % 5) * 4;
        p.face = Math.atan2(dy, dx);
        const nx = p.x + (dx / d) * p.speed * dt;
        const ny = p.y + (dy / d) * p.speed * dt;
        if (!this.city.blockedAt(nx, p.y, 5)) p.x = nx;
        else p.targetX = p.x;
        if (!this.city.blockedAt(p.x, ny, 5)) p.y = ny;
        else p.targetY = p.y;
        p.walk += dt * p.speed * 0.12;
      }
      p.sortY = p.y + 2;
    }
    for (let i = this.cash.length - 1; i >= 0; i--) {
      const drop = this.cash[i];
      drop.life -= dt;
      drop.phase += dt * 4;
      if (drop.life <= 0) { this.cash.splice(i, 1); continue; }
      if (dist(player.x, player.y, drop.x, drop.y) < 16) {
        player.money += drop.amount;
        this.cash.splice(i, 1);
      }
    }
  }

  fleeOne(person, x, y, duration) {
    const d = dist(x, y, person.x, person.y);
    if (d < 1) return;
    const a = Math.atan2(person.y - y, person.x - x);
    person.targetX = person.x + Math.cos(a) * 230;
    person.targetY = person.y + Math.sin(a) * 230;
    person.flee = Math.max(person.flee, duration);
    person.idle = 0;
    person.state = 'flee';
    person.waypoints = null;
  }

  chooseTarget(person) {
    if (this.rnd() < 0.24) {
      const crossing = this.crosswalkRoute(person);
      if (crossing) {
        person.targetX = crossing.start.x;
        person.targetY = crossing.start.y;
        person.waypoints = [crossing.end];
        person.idle = 0;
        return;
      }
    }
    person.waypoints = null;
    for (let i = 0; i < 16; i++) {
      const angle = this.rnd() * Math.PI * 2;
      const radius = 65 + this.rnd() * 165;
      const x = person.x + Math.cos(angle) * radius;
      const y = person.y + Math.sin(angle) * radius;
      if (this.city.isWalkable(x, y) && !this.city.blockedAt(x, y, 5)) {
        person.targetX = x;
        person.targetY = y;
        person.state = 'walk';
        person.idle = this.rnd() < 0.2 ? 1.5 + this.rnd() * 3 : 0;
        return;
      }
    }
    person.targetX = person.x;
    person.targetY = person.y;
    person.idle = 1;
  }

  crosswalkRoute(person) {
    let nearest = null;
    let best = 270;
    for (const crossing of this.city.intersections) {
      const d = dist(person.x, person.y, crossing.x, crossing.y);
      if (d < best) { best = d; nearest = crossing; }
    }
    if (!nearest) return null;
    if (this.rnd() < 0.5) {
      const side = person.y < nearest.y ? -1 : 1;
      const offset = (this.rnd() - 0.5) * 12;
      const start = { x: nearest.x + offset, y: nearest.y + side * (nearest.h / 2 + SIDEWALK_W + 5) };
      const end = { x: nearest.x + offset, y: nearest.y - side * (nearest.h / 2 + SIDEWALK_W + 5) };
      if (this.city.isWalkable(start.x, start.y) && this.city.isWalkable(end.x, end.y)) return { start, end };
    } else {
      const side = person.x < nearest.x ? -1 : 1;
      const offset = (this.rnd() - 0.5) * 12;
      const start = { x: nearest.x + side * (nearest.w / 2 + SIDEWALK_W + 5), y: nearest.y + offset };
      const end = { x: nearest.x - side * (nearest.w / 2 + SIDEWALK_W + 5), y: nearest.y + offset };
      if (this.city.isWalkable(start.x, start.y) && this.city.isWalkable(end.x, end.y)) return { start, end };
    }
    return null;
  }
}

function pick(rng, values) {
  return values[Math.floor(rng() * values.length)];
}
